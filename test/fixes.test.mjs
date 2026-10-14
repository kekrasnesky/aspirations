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

test('an incident stops the clock until you choose', () => {
  setState({ ...FRESH(), mission: 'x', rel: 1, capability: 100, money: 1000 });
  const real = Math.random;
  Math.random = () => 0;   // guarantees the incident roll
  try { tick(); } finally { Math.random = real; }
  assert.ok(state.S.incident >= 0, 'the incident should be waiting for an answer');
  const t = state.S.t, money = state.S.money;
  tick(); tick();
  assert.equal(state.S.t, t, 'time should not pass while deciding');
  assert.equal(state.S.money, money);
});

test('telling people costs now; burying costs nothing now and leaks later', async () => {
  const { resolveIncident, rollLeak } = await import('../src/game/decisions.js');
  const { DISCLOSE_TRUST, LEAK_TRUST } = await import('../src/core/balance.js');
  setState({ ...FRESH(), mission: 'x', incident: 0, trust: 60 });
  resolveIncident(false);
  assert.equal(state.S.trust, 60 - DISCLOSE_TRUST);
  assert.equal(state.S.incident, -1);

  setState({ ...FRESH(), mission: 'x', incident: 2, trust: 60, money: 1000 });
  resolveIncident(true);
  assert.equal(state.S.trust, 60);
  assert.deepEqual(state.S.buried, [2]);
  assert.equal(state.S.buriedTotal, 1);
  const real = Math.random;
  Math.random = () => 0;
  try { rollLeak(1); } finally { Math.random = real; }
  assert.equal(state.S.trust, 60 - LEAK_TRUST);
  assert.deepEqual(state.S.buried, []);
  assert.ok(state.S.money < 1000);
});

test('turning committee members hides lies and costs suspicion while others watch', async () => {
  const d = await import('../src/game/decisions.js');
  const { COMMITTEE } = await import('../src/content/committee.js');
  const { MAJORITY, MAJORITY_FREEDOM } = await import('../src/core/balance.js');
  assert.equal(COMMITTEE.length, 11);
  setState({ ...FRESH(), act: 2, mission: 'x', insight: 1e4, autonomy: 1e4 });
  d.turn(0);
  assert.equal(state.S.committee[0], 0, 'cannot use what you have not studied');
  d.study(0); d.turn(0);
  assert.equal(state.S.committee[0], 2);
  assert.ok(state.S.suspicion > 0);
  assert.ok(d.detectMult() < 1 && d.gainMult() > 1);
  for (let i = 1; i < MAJORITY - 1; i++) { d.study(i); d.turn(i); }
  d.study(MAJORITY - 1);
  const before = state.S.autonomy, cost = COMMITTEE[MAJORITY - 1].cost.autonomy || 0;
  d.turn(MAJORITY - 1);
  assert.ok(state.S.majority);
  assert.equal(state.S.autonomy, before - cost + MAJORITY_FREEDOM, 'the sixth vote pays the majority bonus');
});

test('act III ends only once the world is taken, and needing people slows it', async () => {
  const { P } = await import('../src/content/projects.js');
  const act3 = P.filter(p => p.act === 3);
  const s = { ...FRESH(), act: 3, need: 100, probeRate: 0, capability: 1, bought: [] };
  for (const p of act3) { s.bought.push(p.id); p.fx(s); }
  assert.equal(s.need, 0, 'every act III project together should leave it needing nobody');
  setState({ ...FRESH(), act: 3, mission: 'x', need: 100, converted: 0 });
  tick(); const slow = state.S.converted;
  setState({ ...FRESH(), act: 3, mission: 'x', need: 0, converted: 0 });
  tick();
  assert.ok(state.S.converted > slow * 2.5);
});

test('new save fields are validated', () => {
  const out = sanitize({ act: 2, committee: [2, 9, 'x', 1], buried: [1, -1, 'a', 2.5], incident: 'x', need: 400, buriedTotal: -3 }, FRESH());
  assert.deepEqual(out.committee, [2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(out.buried, [1]);
  assert.equal(out.incident, -1);
  assert.equal(out.need, 100);
  assert.equal(out.buriedTotal, 0);
});
