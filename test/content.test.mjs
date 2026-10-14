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

test('business ladder rises in requirement; products add value and funding rounds grow', () => {
  for (let i = 1; i < REL.length; i++) assert.ok(REL[i].req > REL[i - 1].req, `step ${i}`);
  const products = REL.filter(r => r.kind === 'product'), rounds = REL.filter(r => r.kind === 'funding');
  assert.equal(REL[0].kind, 'product', 'the first step puts it online');
  for (const p of products.slice(1)) assert.ok(p.value > 1, p.n);
  for (let i = 1; i < rounds.length; i++) assert.ok(rounds[i].pay > rounds[i - 1].pay);
  assert.ok(products.every(p => !p.pay), 'a product brings subscribers, not a lump sum');
});

test('milestones are in ascending order', () => {
  for (let i = 1; i < MILES.length; i++) assert.ok(MILES[i][0] > MILES[i - 1][0]);
});

test('every project is well formed and ids are unique', () => {
  const ids = new Set();
  for (const p of P) {
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`); ids.add(p.id);
    assert.ok([1, 2, 3].includes(p.act), p.id);
    for (const f of ['name', 'desc', 'out', 'eff']) assert.equal(typeof p[f], 'string', `${p.id}.${f}`);
    assert.ok(p.eff.length > 0, `${p.id} should say what it changes`);
    assert.equal(typeof p.req, 'function', p.id);
    assert.equal(typeof p.fx, 'function', p.id);
    assert.equal(typeof p.cost, 'object', `${p.id} needs a cost object ({} means free)`);
  }
});

test('every act has a glossary', () => {
  for (const a of [1, 2, 3]) assert.ok(GLOSS[a].length > 0);
});
