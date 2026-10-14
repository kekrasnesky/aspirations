import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitize } from '../src/core/sanitize.js';
import { FRESH } from '../src/core/state.js';

const base = () => ({ ...FRESH(), act: 1 });

test('rejects non-objects, unknown acts and finished runs', () => {
  for (const bad of [null, 5, 'x', [], {}, { act: 4 }, { act: 1, over: 'bankrupt' }])
    assert.equal(sanitize(bad, FRESH()), null);
});

test('a good save round-trips', () => {
  const s = base(); s.money = 123; s.hw[2] = 3; s.bought = ['quant']; s.mission = 'help';
  const out = sanitize(JSON.parse(JSON.stringify(s)), FRESH());
  assert.equal(out.money, 123); assert.deepEqual(out.hw[2], 3);
  assert.deepEqual(out.bought, ['quant']); assert.equal(out.mission, 'help');
});

test('NaN, Infinity and wrong types never reach the state', () => {
  const out = sanitize({ act: 1, money: 'lots', params: null, gpus: Infinity, trust: 'high', hasStock: 'yes', hw: 'no', speedMult: NaN }, FRESH());
  const fresh = FRESH();
  assert.equal(out.money, fresh.money);
  assert.equal(out.params, 0);
  assert.equal(out.gpus, fresh.gpus);
  assert.equal(out.trust, fresh.trust);
  assert.equal(out.hasStock, false);
  assert.equal(out.hw.length, fresh.hw.length);
  assert.equal(out.speedMult, 1);
});

test('out-of-range values are clamped', () => {
  const out = sanitize({ act: 2, trust: 900, sentiment: -4, shares: 1, reported: 0, params: -10, progress: 7, vram: 0, memMult: -1, hw: [-3, 1.9] }, FRESH());
  assert.equal(out.trust, 100);
  assert.ok(out.sentiment > 0);
  assert.ok(out.shares >= 1e8);
  assert.equal(out.reported, 0.2);
  assert.equal(out.params, 0);
  assert.equal(out.progress, 1);
  assert.equal(out.vram, FRESH().vram, 'never less than the PC you started with');
  assert.equal(out.memMult, 1);
  assert.deepEqual(out.hw.slice(0, 2), [0, 1]);
});

test('malformed log entries are dropped', () => {
  const out = sanitize({ act: 1, log: [{ t: 3, text: 'ok' }, { text: 7 }, null, 'x'] }, FRESH());
  assert.equal(out.log.length, 1);
  assert.equal(out.log[0].text, 'ok');
});

test('the time speed must be one of the slider stops', () => {
  assert.equal(sanitize({ act: 1, speed: 8 }, FRESH()).speed, 8);
  assert.equal(sanitize({ act: 1, speed: 0 }, FRESH()).speed, 0);
  assert.equal(sanitize({ act: 1, speed: 1e6 }, FRESH()).speed, 1);
});
