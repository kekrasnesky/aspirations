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
