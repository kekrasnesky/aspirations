/**
 * Headless balance simulation.
 *
 * Imports the REAL hardware ladder, funding ladder, projects, balance
 * constants and compute arithmetic (src/core/compute.js), then reimplements
 * the Act I loop without any DOM. It is a model of the game, not the game —
 * but every number it uses is the shipped number, so it cannot silently drift
 * from what people actually play.
 *
 *   npm run simulate            default 40 runs
 *   npm run simulate -- -n 200  more runs
 *   npm run simulate -- --trace print one run's milestones
 */
import { HW } from '../src/content/hardware.js';
import { REL } from '../src/content/releases.js';
import { P } from '../src/content/projects.js';
import * as B from '../src/core/balance.js';
import { FRESH } from '../src/core/state.js';
import { applyHw, bottleneck, feed, fitRam, fitVram, level, nextTarget, trainTime } from '../src/core/compute.js';
import { capacity, demand, revenueOf, staff, stepUsers, takeStep } from '../src/core/economy.js';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i < 0 ? d : Number(argv[i + 1]); };
const RUNS  = arg('-n', 40);
const TRACE = argv.includes('--trace');

const act1Projects = P.filter(p => p.act === 1 && p.id !== 'automate');
const automate = P.find(p => p.id === 'automate');
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const fmtP = n => n >= 1e12 ? (n / 1e12).toFixed(1) + 'T' : n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : (n / 1e6).toFixed(0) + 'M';

/** One playthrough of Act I under a given policy. */
export function playAct1({ runwayFloor = 18, buyEveryMs = 800, rng = Math.random, burnScale = 1, slowRun = 30 } = {}) {
  const s = { ...FRESH(), bought: new Set(), incidents: 0, cooldown: 0 };
  const hwCost  = i => HW[i].c * Math.pow(HW[i].s, s.hw[i]);
  const hwOpen  = i => i === 0 || HW[i - 1].kind !== HW[i].kind || s.hw[i - 1] > 0;
  const intCost = () => 3000 * Math.pow(1.42, s.interpBought);
  const burnAt = deployed => burnScale * B.BURN_K * Math.pow(Math.max(deployed, 0), B.BURN_EXP) * s.burnMult
                           + staff(s.rel);
  const burn = () => burnAt(s.deployed);
  const rev  = () => revenueOf(s);

  const DT = B.TICK_MS / 1000;
  const trace = [];
  let negSeconds = 0, peakRatio = 0;

  // what a purchase is worth, by what is holding training back
  const value = (i, need) => {
    const h = HW[i], c = hwCost(i);
    if (need === 'vram') return h.kind === 'gpu' ? h.g * h.v / c : 0;
    if (need === 'ram')  return h.kind === 'ram' ? h.gb / c : 0;
    if (need === 'cpu')  return h.kind === 'cpu' ? h.cores / c : 0;
    return h.kind === 'gpu' ? h.g * h.tf / c : 0;   // otherwise: speed
  };

  while (s.t < 4000) {
    s.t += DT; s.cooldown -= DT;

    if (!s.target) { const t = nextTarget(s); if (t) { s.target = t; s.progress = 0; } }
    if (s.target) {
      s.progress += DT / trainTime(s, s.target);
      if (s.progress >= 1) {
        s.params = s.target; s.target = 0; s.progress = 0; s.runs++;
        if (TRACE) trace.push(`${fmtT(s.t)}  model ${fmtP(s.params)}  (${s.gpus} GPUs, ${Math.round(s.ram)} GB RAM, ${s.cores} cores)  cash ${Math.round(s.money)}  burn ${Math.round(burn())}/s rev ${Math.round(rev())}/s  users ${Math.round(s.users).toLocaleString()}${demand(s) > capacity(s) ? ' (capped)' : ''}`);
      }
    }

    stepUsers(s, DT);
    const n = rev() - burn();
    if (n < 0) negSeconds += DT;
    if (s.rel >= 3 && s.params < B.ACT1_PARAMS) peakRatio = Math.max(peakRatio, burn() / Math.max(rev(), 1));
    s.money += n * DT;
    if (s.trust < B.TRUST_CEIL) s.trust = Math.min(B.TRUST_CEIL, s.trust + B.TRUST_REGEN * DT);

    const exposure = Math.max(0, level(s.params) - s.interp * B.INTERP_WORTH - 10);
    if (s.rel > 0 && rng() < B.INCIDENT_MAX * (exposure / (exposure + B.INCIDENT_HALF)) * (1 - s.incidentShield) * DT) {
      s.trust -= B.DISCLOSE_TRUST; s.users *= B.DISCLOSE_USERS; s.incidents++;   // this policy always tells people
    }
    if (s.money < 0) { s.debt += DT; if (s.debt > B.GRACE) return { result: 'bankrupt', t: s.t, ...summary() }; }
    else s.debt = 0;

    for (const p of act1Projects) {
      if (s.bought.has(p.id) || !p.req(s)) continue;
      const cost = p.cost.money ?? 0;
      if (s.money < cost * 1.2) continue;
      s.money -= cost; s.bought.add(p.id); p.fx(s);
      if (TRACE) trace.push(`${fmtT(s.t)}  ${p.name}`);
    }

    const r = REL[s.rel];
    if (r && s.params >= r.req) {
      takeStep(s, r);
      s.trust += s.rel === 1 ? 0 : s.interp * B.INTERP_WORTH >= level(s.params) ? 5 : -9;
      if (TRACE) trace.push(`${fmtT(s.t)}  ${r.n} — burn ${Math.round(burn())}/s vs revenue ${Math.round(rev())}/s`);
    }
    if (s.trust <= 40 && s.money >= 5e6) { s.money -= 2e6; s.trust = Math.min(100, s.trust + 26); }

    if (exposure > 40 && s.money >= intCost() * 6) {
      s.money -= intCost(); s.interpBought++; s.interp += s.interpMult;
    } else if (s.cooldown <= 0 && s.rel > 0 && s.params < B.ACT1_PARAMS) {   // at the target, save for the last project
      // fix the bottleneck first: CPU if the GPUs are starved, speed if the run is slow,
      // memory if the next model won't fit, and otherwise more speed
      const run = s.target ? (1 - s.progress) * trainTime(s, s.target) : trainTime(s, nextTarget(s) || s.params);
      const need = feed(s) < 0.95 ? 'cpu' : run > slowRun ? 'speed' : bottleneck(s) || 'speed';
      let best = -1, bestValue = 0;
      for (let i = 0; i < HW.length; i++) {
        if (!hwOpen(i)) continue;
        const c = hwCost(i);
        if (c > s.money) continue;
        // a careful player also wants the cash to outlast the run in progress, since
        // revenue only rises when it finishes; a reckless one looks a few seconds ahead
        const after = rev() - burnAt(s.deployed + c);
        if (after < 0 && (s.money - c) / -after < runwayFloor + (runwayFloor >= 18 ? run : 0)) continue;
        const v = value(i, need);
        if (v > bestValue) { bestValue = v; best = i; }
      }
      if (best >= 0) {
        const c = hwCost(best);
        s.money -= c; s.deployed += c; s.hw[best]++; applyHw(s, HW[best], 1);
        s.cooldown = buyEveryMs / 1000;
      }
    }

    // at the target the GPUs have nothing left to train: sell the dearest until the bill is comfortable
    if (s.params >= B.ACT1_PARAMS && s.cooldown <= 0 && burn() > rev() * 0.5) {
      let i = -1, price = 0;
      HW.forEach((h, j) => { if (s.hw[j]) { const p = hwCost(j) / h.s; if (p > price) { price = p; i = j; } } });
      if (i >= 0) { s.hw[i]--; applyHw(s, HW[i], -1); s.deployed = Math.max(0, s.deployed - price); s.money += price * B.SELL_BACK; s.cooldown = buyEveryMs / 1000; }
    }
    if (s.trust <= 0) return { result: 'trust', t: s.t, ...summary() };
    s.trust = Math.min(100, s.trust);
    if (s.params >= B.ACT1_PARAMS && !s.reachedAt) { s.reachedAt = s.t; if (TRACE) trace.push(`${fmtT(s.t)}  ${fmtP(s.params)} model: saving for the last project`); }
    if (s.params >= B.ACT1_PARAMS && s.money >= automate.cost.money) return { result: 'reached act II', t: s.t, ...summary() };
  }
  return { result: 'timeout', t: s.t, ...summary() };

  function summary() {
    return {
      incidents: s.incidents, releases: s.rel, runs: s.runs, params: s.params, saving: s.reachedAt ? s.t - s.reachedAt : 0,
      gpus: s.gpus, ram: s.ram, cores: s.cores,
      fitVram: fitVram(s), fitRam: fitRam(s),
      purchases: s.hw.reduce((a, b) => a + b, 0),
      burnOverRevenue: +(burn() / Math.max(rev(), 1)).toFixed(2),
      peakBurnOverRevenue: +peakRatio.toFixed(2),
      unprofitableFraction: +(negSeconds / s.t).toFixed(2),
      trace,
    };
  }
}

if (import.meta.filename === process.argv[1]) {
  const runs = Array.from({ length: RUNS }, () => playAct1());
  const won = runs.filter(r => r.result === 'reached act II');
  const times = won.map(r => r.t).sort((a, b) => a - b);
  const pct = p => times[Math.floor(times.length * p)] ?? 0;
  const tally = {};
  for (const r of runs) tally[r.result] = (tally[r.result] || 0) + 1;

  console.log(`\n${RUNS} simulated Act I playthroughs\n`);
  for (const [k, v] of Object.entries(tally)) {
    console.log(`  ${k.padEnd(16)} ${String(v).padStart(3)}  ${(v / RUNS * 100).toFixed(0)}%`);
  }
  const a = won[0] || runs[0];
  if (won.length) console.log(`\n  act I length     p10 ${fmtT(pct(0.1))}   median ${fmtT(pct(0.5))}   p90 ${fmtT(pct(0.9))}`);
  console.log(`  model            ${fmtP(a.params)} after ${a.runs} training runs`);
  console.log(`  hardware         ${a.gpus.toLocaleString()} GPUs, ${Math.round(a.ram).toLocaleString()} GB RAM, ${a.cores.toLocaleString()} cores in ${a.purchases} purchases`);
  console.log(`  releases taken   ${a.releases}/${REL.length}`);
  console.log(`  saving at the end ${fmtT(a.saving)} to afford '${automate.name}'`);
  console.log(`  burn vs revenue  peaked at ${a.peakBurnOverRevenue}x once there were investors, ${a.burnOverRevenue}x at the end`);
  console.log(`  unprofitable     ${(a.unprofitableFraction * 100).toFixed(0)}% of the run`);
  console.log(`  incidents        ${a.incidents}`);
  if (TRACE) { console.log('\n  milestones:'); a.trace.forEach(l => console.log('    ' + l)); }
  console.log();
}
