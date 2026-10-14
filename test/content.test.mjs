import test from 'node:test';
import assert from 'node:assert/strict';
import { HW } from '../src/content/hardware.js';
import { REL } from '../src/content/releases.js';
import { P } from '../src/content/projects.js';
import { GLOSS } from '../src/content/glossary.js';
import { MILES } from '../src/content/milestones.js';

test('the opening steps are free, and the first one needs nothing but a little training', () => {
  const free = P.filter(p => p.act === 1 && Object.keys(p.cost).length === 0);
  assert.deepEqual(free.map(p => p.id), ['data', 'train', 'size', 'curve']);
  assert.ok(free.every(p => p.req({ capability: 20 })));
  assert.ok(!P.find(p => p.id === 'scaling'), 'the paid scaling project should be gone');
});

test('hardware ladder has eight rungs, each bigger, dearer and later than the last', () => {
  assert.equal(HW.length, 8);
  for (let i = 1; i < HW.length; i++) {
    assert.ok(HW[i].u > HW[i - 1].u && HW[i].c > HW[i - 1].c && HW[i].req > HW[i - 1].req, `rung ${i}`);
  }
});

test('funding ladder rises in requirement and payout', () => {
  for (let i = 1; i < REL.length; i++) assert.ok(REL[i].req > REL[i - 1].req && REL[i].pay > REL[i - 1].pay);
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
