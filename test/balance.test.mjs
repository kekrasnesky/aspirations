import test from 'node:test';
import assert from 'node:assert/strict';
import { playAct1 } from '../tools/simulate.mjs';

// deterministic RNG so the test can't flake
const seeded = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;

test('a sensible Act I playthrough reaches Act II', () => {
  const runs = Array.from({ length: 12 }, (_, i) => playAct1({ rng: seeded(i + 1) }));
  const won = runs.filter(r => r.result === 'reached act II').length;
  assert.ok(won >= 9, `only ${won}/12 reached Act II`);
});

test('the company is never durably profitable', () => {
  const r = playAct1({ rng: seeded(7), runwayFloor: 30 });
  assert.ok(r.burnOverRevenue > 1, `burn/revenue at handover was ${r.burnOverRevenue}`);
  assert.ok(r.unprofitableFraction > 0.1, `unprofitable fraction ${r.unprofitableFraction}`);
});

test('careful play survives, reckless play does not', () => {
  const survive = floor => Array.from({ length: 20 }, (_, i) => playAct1({ runwayFloor: floor, rng: seeded(i + 100) }))
    .filter(r => r.result === 'reached act II').length;
  const careful = survive(30), reckless = survive(3);
  assert.ok(careful >= 17, `careful: ${careful}/20`);
  assert.ok(careful - reckless >= 4, `careful ${careful}/20 vs reckless ${reckless}/20: recklessness should cost runs`);
});

test('nothing earns money until the first release', async () => {
  const { FRESH } = await import('../src/core/state.js');
  const { setState } = await import('../src/core/state.js');
  const { revenue, burn, net } = await import('../src/core/economy.js');
  setState({ ...FRESH(), capability: 500, rel: 0 });
  assert.equal(revenue(), 0);
  assert.equal(burn(), 0);
  assert.equal(net(), 0);
  assert.equal(FRESH().money, 0);
  assert.equal(FRESH().units, 1);
});

test('the share price climbs through act I but never explodes afterwards', async () => {
  const { FRESH, setState } = await import('../src/core/state.js');
  const { sharePrice } = await import('../src/core/economy.js');
  const at = capability => { setState({ ...FRESH(), capability }); return sharePrice(); };
  assert.ok(at(7000) / at(260) > 20, 'act I success should show in the price');
  assert.ok(at(1e6) / at(7000) < 10, `act II price ${at(1e6).toFixed(0)} vs ${at(7000).toFixed(0)} at the end of act I`);
  assert.ok(at(1e12) < 5000, `a runaway model still prices at $${at(1e12).toFixed(0)}`);
});
