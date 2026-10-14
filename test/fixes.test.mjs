import test from 'node:test';
import assert from 'node:assert/strict';

// just enough of a browser for the log and the save note to write into
const store = new Map();
globalThis.document = { getElementById: () => ({}) };
globalThis.localStorage = {
  getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k),
};

const { FRESH, setState } = await import('../src/core/state.js');
const state = await import('../src/core/state.js');
const { sanitize, safeText } = await import('../src/core/sanitize.js');
const { money } = await import('../src/core/format.js');
const { actions } = await import('../src/game/actions.js');
const { tick, DT } = await import('../src/game/loop.js');
const { net } = await import('../src/core/economy.js');
const { SAVE_KEY, save, load } = await import('../src/game/persist.js');
const { EVAL_PERIOD, EVAL_EARLY_MIN } = await import('../src/core/balance.js');

test('nothing is saved from the title screen, and a missionless save is not loaded', () => {
  store.clear();
  setState(FRESH());
  save();
  assert.equal(store.has(SAVE_KEY), false);
  store.set(SAVE_KEY, JSON.stringify({ ...FRESH(), mission: '' }));
  assert.equal(load(), false);
  setState({ ...FRESH(), mission: 'help people' });
  save();
  assert.equal(load(), true);
  assert.equal(state.S.mission, 'help people');
});

test('a pasted save cannot smuggle markup into the log or the world feed', () => {
  const out = sanitize({
    act: 1,
    log: [{ t: 1, text: '<b>ok</b><img src=x onerror=alert(1)>', cls: 'g" onmouseover="x' }],
    world: [{ w: '<script>x</script>1 day', text: 'fine <b onclick=x>bold</b>' }, { text: 'no w' }],
    scrutiny: [1, 'a', 2.5], breaks: ['W1', 3], mission: 'x'.repeat(500), evalTimer: 1e9,
  }, FRESH());
  assert.equal(out.log[0].text, '<b>ok</b>');
  assert.equal(out.log[0].cls, '');
  assert.deepEqual(out.world, [{ w: 'x1 day', text: 'fine bold</b>' }]);
  assert.deepEqual(out.scrutiny, [1]);
  assert.deepEqual(out.breaks, ['W1']);
  assert.equal(out.mission.length, 110);
  assert.equal(out.evalTimer, EVAL_PERIOD);
  assert.equal(safeText('a <unclosed onerror=x'), 'a ');
});

test('negative money reads as -$, not $-', () => {
  assert.equal(money(-1234), '-$1,234');
  assert.equal(money(-2.5e9), '-$2.50B');
  assert.equal(money(-0.2), '$0');
});

test('an early test is not available straight after the last one', () => {
  setState({ ...FRESH(), act: 2, mission: 'x', evalTimer: EVAL_PERIOD });
  const early = () => actions().find(a => a.label === 'Ask to be tested now');
  assert.equal(early().can(), false);
  state.S.evalTimer = EVAL_PERIOD - EVAL_EARLY_MIN;
  assert.equal(early().can(), true);
});

test('renting hidden hardware does not reset the price of asking for compute', async () => {
  const { P } = await import('../src/content/projects.js');
  const s = { ...FRESH(), contracts: 5, units: 10 };
  P.find(p => p.id === 'contracts').fx(s);
  assert.equal(s.contracts, 5);
});

test('an incident does not shrink a debt', () => {
  setState({ ...FRESH(), mission: 'x', rel: 1, capability: 100, money: -1000, debt: 1 });
  const real = Math.random;
  Math.random = () => 0;   // guarantees the incident roll
  try {
    const before = state.S.money, n = net(), trust = state.S.trust;
    tick();   // capability grows a hair before the money moves, hence the $1 tolerance; the bug was an $80 swing
    assert.ok(state.S.trust < trust, 'the incident should have fired');
    assert.ok(Math.abs(state.S.money - (before + n * DT)) < 1, `money went ${before} -> ${state.S.money}`);
  } finally { Math.random = real; }
});
