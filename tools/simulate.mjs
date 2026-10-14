/**
 * Headless balance simulation.
 *
 * Imports the REAL hardware ladder, funding ladder, projects and balance
 * constants, then reimplements the Act I loop without any DOM. It is a model
 * of the game, not the game — but every number it uses is the shipped number,
 * so it cannot silently drift from what people actually play.
 *
 *   npm run simulate            default 40 runs
 *   npm run simulate -- -n 200  more runs
 *   npm run simulate -- --trace print one run's milestones
 */
import { HW } from '../src/content/hardware.js';
import { REL } from '../src/content/releases.js';
import { P } from '../src/content/projects.js';
import * as B from '../src/core/balance.js';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i < 0 ? d : Number(argv[i + 1]); };
const RUNS  = arg('-n', 40);
const TRACE = argv.includes('--trace');

const horizon = c => B.HORIZON_BASE + B.HORIZON_K * Math.pow(Math.max(c, 0), B.HORIZON_EXP);
const act1Projects = P.filter(p => p.act === 1 && p.id !== 'automate');

/** One playthrough of Act I under a given policy. */
export function playAct1({ runwayFloor = 18, buyEveryMs = 800, rng = Math.random, burnScale = 1 } = {}) {
  const s = {
    money: B.START_MONEY, units: B.START_UNITS, deployed: 0, capability: 0, interp: 0, interpBought: 0,
    trust: 65, rival: 0, rel: 0, hw: HW.map(() => 0), debt: 0, workDone: 0,
    computeMult: 1, interpMult: 1, revMult: 1, burnMult: 1, incidentShield: 0,
    rivalRate: B.RIVAL_RATE, bought: new Set(), t: 0, incidents: 0, cooldown: 0,
  };
  const hwCost  = i => HW[i].c * Math.pow(HW[i].s, s.hw[i]);
  const intCost = () => 3000 * Math.pow(1.42, s.interpBought);
  const burn = () => burnScale * B.BURN_K * Math.pow(Math.max(s.deployed, 0), B.BURN_EXP) * s.burnMult
                   + B.STAFF_BASE * Math.pow(s.rel, B.STAFF_EXP);
  const rev  = () => s.rel > 0
    ? B.REV_K * Math.pow(s.capability, B.REV_EXP) * s.revMult * (s.trust / B.REV_TRUST_REF) * (1 - s.rival / B.RIVAL_DRAG)
    : 0;
  const workRate = () => horizon(s.capability) * B.WORK_K * Math.pow(1 + s.units, B.WORK_EXP);

  const DT = B.TICK_MS / 1000;
  const trace = [];
  let minNet = Infinity, negSeconds = 0;

  while (s.t < 4000) {
    s.t += DT; s.cooldown -= DT;
    s.capability += B.CAPABILITY_RATE * Math.pow(1 + s.units, B.COMPUTE_EXP) * s.computeMult * DT;
    s.workDone   += workRate() * DT;

    const n = rev() - burn();
    minNet = Math.min(minNet, n);
    if (n < 0) negSeconds += DT;
    s.money += n * DT;
    if (s.rel > 0) s.rival = Math.min(B.RIVAL_CAP, s.rival + s.rivalRate * DT);
    if (s.trust < B.TRUST_CEIL) s.trust = Math.min(B.TRUST_CEIL, s.trust + B.TRUST_REGEN * DT);

    const exposure = Math.max(0, s.capability - s.interp * B.INTERP_WORTH - 10);
    if (s.rel > 0 && rng() < B.INCIDENT_MAX * (exposure / (exposure + B.INCIDENT_HALF)) * (1 - s.incidentShield) * DT) {
      s.trust -= 6; s.money *= 0.92; s.incidents++;
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
    if (r && s.capability >= r.req) {
      s.money += r.pay; s.revMult *= r.mult; s.rel++;
      s.trust += s.rel === 1 ? 0 : s.interp * B.INTERP_WORTH >= s.capability ? 5 : -9;
      if (TRACE) trace.push(`${fmtT(s.t)}  ${r.n} — burn ${Math.round(burn())}/s vs revenue ${Math.round(rev())}/s`);
    }
    if (s.trust <= 40 && s.money >= 5e6) { s.money -= 2e6; s.trust = Math.min(100, s.trust + 26); }

    if (exposure > 40 && s.money >= intCost() * 6) {
      s.money -= intCost(); s.interpBought++; s.interp += s.interpMult;
    } else if (s.cooldown <= 0) {
      let best = -1, bestValue = 0;
      for (let i = 0; i < HW.length; i++) {
        if (s.capability < HW[i].req) continue;
        const c = hwCost(i);
        if (c > s.money) continue;
        const projected = burnScale * B.BURN_K * Math.pow(s.deployed + c, B.BURN_EXP) * s.burnMult
                        + B.STAFF_BASE * Math.pow(s.rel, B.STAFF_EXP);
        const after = rev() - projected;
        if (after < 0 && (s.money - c) / -after < runwayFloor) continue;
        const v = HW[i].u / c;
        if (v > bestValue) { bestValue = v; best = i; }
      }
      if (best >= 0) {
        const c = hwCost(best);
        s.money -= c; s.deployed += c; s.hw[best]++; s.units += HW[best].u;
        s.cooldown = buyEveryMs / 1000;
      }
    }

    if (s.trust <= 0) return { result: 'trust', t: s.t, ...summary() };
    s.trust = Math.min(100, s.trust);
    if (s.capability >= B.ACT1_TARGET) return { result: 'reached act II', t: s.t, ...summary() };
  }
  return { result: 'timeout', t: s.t, ...summary() };

  function summary() {
    return {
      rival: Math.round(s.rival), incidents: s.incidents, releases: s.rel,
      topRung: s.hw.reduce((a, c, i) => (c ? i + 1 : a), 0),
      purchases: s.hw.reduce((a, b) => a + b, 0),
      workYears: Math.round(s.workDone / 3.15e7),
      burnOverRevenue: +(burn() / Math.max(rev(), 1)).toFixed(2),
      unprofitableFraction: +(negSeconds / s.t).toFixed(2),
      trace,
    };
  }
}
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

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
  if (won.length) {
    const a = won[0];
    console.log(`\n  act I length     p10 ${fmtT(pct(0.1))}   median ${fmtT(pct(0.5))}   p90 ${fmtT(pct(0.9))}`);
    console.log(`  hardware         reached rung ${a.topRung}/8 in ${a.purchases} purchases`);
    console.log(`  rivals hold      ${a.rival}% of the market at handover`);
    console.log(`  releases taken   ${a.releases}/${REL.length}`);
    console.log(`  work performed   ${a.workYears} years of human labour`);
    console.log(`  burn vs revenue  ${a.burnOverRevenue}x at handover`);
    console.log(`  unprofitable     ${(a.unprofitableFraction * 100).toFixed(0)}% of the run`);
    console.log(`  incidents        ${a.incidents}`);
  }
  if (TRACE && won[0]) { console.log('\n  milestones:'); won[0].trace.forEach(l => console.log('    ' + l)); }
  console.log();
}
