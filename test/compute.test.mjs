import test from 'node:test';
import assert from 'node:assert/strict';
import { FRESH } from '../src/core/state.js';
import { HW } from '../src/content/hardware.js';
import { ACT1_PARAMS, CORES_PER_GPU, FIRST_MODEL, SCALE_STEP } from '../src/core/balance.js';
import { applyHw, bottleneck, feed, fitRam, fitVram, maxFit, nextTarget, trainTime } from '../src/core/compute.js';

test('the first model is tiny, and each run is at most four times the last', () => {
  const s = FRESH();
  assert.equal(nextTarget(s), FIRST_MODEL);
  s.params = FIRST_MODEL;
  assert.equal(nextTarget(s), FIRST_MODEL * SCALE_STEP);
});

test('VRAM caps the model size, and more GPUs raise the cap', () => {
  const s = { ...FRESH(), ram: 1e6, params: 4e8 };
  assert.equal(bottleneck(s), 'vram');
  assert.ok(nextTarget(s) <= fitVram(s));
  const before = maxFit(s);
  applyHw(s, HW.find(h => h.kind === 'gpu'), 1);
  assert.ok(maxFit(s) > before);
});

test('RAM caps it too: GPUs alone are not enough', () => {
  const s = { ...FRESH(), vram: 1e6, params: 4e8 };
  assert.equal(bottleneck(s), 'ram');
  const cap = maxFit(s);
  applyHw(s, HW.find(h => h.kind === 'gpu'), 1);
  assert.equal(maxFit(s), cap, 'more GPUs do nothing while RAM is the limit');
  applyHw(s, HW.find(h => h.kind === 'ram'), 1);
  assert.ok(fitRam(s) > cap);
});

test('too few CPU cores starve the GPUs and slow training', () => {
  const s = { ...FRESH(), gpus: 4, tflops: 160, cores: 4 * CORES_PER_GPU };
  assert.equal(feed(s), 1);
  const fast = trainTime(s, 1e9);
  s.cores = 2 * CORES_PER_GPU;
  assert.equal(feed(s), 0.5);
  assert.ok(trainTime(s, 1e9) > fast * 1.8);
});

test('bigger models take more than proportionally longer; more TFLOPS make them quicker', () => {
  const s = { ...FRESH(), cores: 100 };
  assert.ok(trainTime(s, 2e9) > 2.5 * trainTime(s, 1e9) - 5);
  const slow = trainTime(s, 1e9);
  s.tflops *= 4;
  assert.ok(trainTime(s, 1e9) < slow / 2);
});

test('buying and selling hardware are exact opposites', () => {
  for (const h of HW) {
    const s = FRESH(), was = JSON.stringify(s);
    applyHw(s, h, 1); assert.notEqual(JSON.stringify(s), was, h.label);
    applyHw(s, h, -1); assert.equal(JSON.stringify(s), was, h.label);
  }
});

test('act I never trains past the size that ends it', () => {
  const s = { ...FRESH(), vram: 1e9, ram: 1e9, params: 1.5e12 };
  assert.equal(nextTarget(s), ACT1_PARAMS);
  s.params = ACT1_PARAMS;
  assert.equal(nextTarget(s), 0);
  s.act = 2;
  assert.ok(nextTarget(s) > ACT1_PARAMS);
});
