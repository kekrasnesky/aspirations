import test from 'node:test';
import assert from 'node:assert/strict';
import { HW, KINDS } from '../src/content/hardware.js';
import { FIRST_MODEL, HW_TIERS } from '../src/core/balance.js';
import { REL } from '../src/content/releases.js';
import { P } from '../src/content/projects.js';
import { GLOSS } from '../src/content/glossary.js';
import { MILES } from '../src/content/milestones.js';

test('the opening steps are free, teach GPU, CPU and VRAM, and unlock before the first release', () => {
  const free = P.filter(p => p.act === 1 && Object.keys(p.cost).length === 0);
  assert.deepEqual(free.map(p => p.id), ['mixed', 'workers', 'checkpoint', 'curve']);
  assert.ok(free[0].req({ params: FIRST_MODEL }), 'the first trick opens after the first model');
  assert.ok(free.every(p => p.req({ params: REL[0].req * 2 })));
});

test('three hardware ladders, GPU, RAM and CPU, each bigger and dearer than the last', () => {
  assert.equal(HW.length, HW_TIERS);
  const size = h => h.kind === 'gpu' ? h.g * h.v : h.kind === 'ram' ? h.gb : h.cores;
  for (const [kind] of KINDS) {
    const tiers = HW.filter(h => h.kind === kind);
    assert.ok(tiers.length >= 5, kind);
    for (let i = 1; i < tiers.length; i++) {
      assert.ok(size(tiers[i]) > size(tiers[i - 1]) && tiers[i].c > tiers[i - 1].c, `${kind} tier ${i}`);
    }
  }
  for (const h of HW) for (const f of ['n', 'label', 'why']) assert.equal(typeof h[f], 'string', `${h.label}.${f}`);
});

test('business ladder rises in requirement; plans get dearer and funding rounds bigger', () => {
  for (let i = 1; i < REL.length; i++) assert.ok(REL[i].req > REL[i - 1].req, `step ${i}`);
  const plans = REL.filter(r => r.kind === 'plan'), rounds = REL.filter(r => r.kind === 'funding');
  for (let i = 1; i < plans.length; i++) assert.ok(plans[i].price > plans[i - 1].price && plans[i].conv >= plans[i - 1].conv);
  for (let i = 1; i < rounds.length; i++) assert.ok(rounds[i].pay > rounds[i - 1].pay);
  assert.ok(plans.every(p => !p.pay), 'a plan brings subscribers, not a lump sum');
  assert.ok(plans[0].price <= 5, 'the first plan is a tip jar, not a subscription');
});

test('milestones are in ascending order', () => {
  for (let i = 1; i < MILES.length; i++) assert.ok(MILES[i][0] > MILES[i - 1][0]);
});

test('every project is well formed and ids are unique', () => {
  const ids = new Set();
  for (const p of P) {
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`); ids.add(p.id);
    assert.ok([1, 2, 3].includes(p.act), p.id);
    for (const f of ['name', 'desc', 'out']) assert.equal(typeof p[f], 'string', `${p.id}.${f}`);
    assert.equal(typeof p.req, 'function', p.id);
    assert.equal(typeof p.fx, 'function', p.id);
    assert.equal(typeof p.cost, 'object', `${p.id} needs a cost object ({} means free)`);
  }
});

test('every act has a glossary', () => {
  for (const a of [1, 2, 3]) assert.ok(GLOSS[a].length > 0);
});
