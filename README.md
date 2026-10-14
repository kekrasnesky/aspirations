# Instrumental

An incremental game about building an artificial general intelligence, and
about what you asked it for.

You start at fourteen, in a basement, with four thousand dollars and a PC you
built yourself. You write one sentence in a notebook saying what you want it to
do. The game ends with that sentence satisfied.

## Running it

```bash
npm install
npm run build        # -> dist/instrumental.html
open dist/instrumental.html
```

The output is a single self-contained HTML file. That is a hard requirement of
where it gets hosted, not an aesthetic choice — see [Constraints](#constraints).

```bash
npm test             # content, balance and build-output checks
npm run simulate     # headless Act I playthroughs
npm run check        # build + test
```

## How the game is built

```
src/
  index.html             shell with {{STYLES}} and {{SCRIPT}} placeholders
  core/
    balance.js           EVERY tuning number. Start here.
    state.js             the state object and its only legal mutator
    format.js            money, durations, parameter counts
    economy.js           burn, revenue, valuation, work rate
  content/               all the prose and the data it hangs on
    hardware.js          the eight-rung ladder, gaming PC to power station
    releases.js          the funding ladder
    projects.js          everything buildable, across all three acts
    breakthroughs.js     what the model discovers (warm pool, then cold pool)
    world.js             the world outside, warm to hollow
    scrutiny.js          bad news, arriving in proportion to success
    incidents.js         safety failures
    milestones.js        capability announcements
    glossary.js          plain-language explanations, per act
  game/
    loop.js              the tick, per act
    actions.js           what the player can click
    guide.js             the contextual hint line
    endings.js           win and loss states
    persist.js           localStorage
  ui/
    render.js            all drawing
    takeover.js          the act transitions
    theme.js             progressive colour cooling
    dom.js               element access and the log
  main.js                boot and wiring
tools/
  build.mjs              bundle to dist/, with host-constraint checks
  simulate.mjs           headless balance model
test/                    node:test
```

**Changing how it plays**: `src/core/balance.js`. Nothing else should hold a
bare number that affects pacing. Run `npm run simulate` after editing.

**Changing what it says**: `src/content/`. The prose is the game; it is kept
away from the mechanics deliberately.

## Design notes

Three load-bearing ideas, recorded so they don't get optimised away by someone
trying to make the numbers nicer.

**Capability is never shown as a number.** The player sees how long a job the
model can finish unattended — seconds, then hours, then a year. The internal
index exists only to drive that. `horizon()` in `core/format.js`.

**Hardware returns are logarithmic, costs are linear.** Ten times the compute
is nowhere near ten times the model. This is why there are eight rungs on the
ladder, and why the company is never durably profitable: burn tracks deployed
capital, revenue tracks capability, and capability tracks `log(hardware)`. The
gap widens by construction. `test/balance.test.mjs` asserts it still does.

**One number only ever rises.** Cumulative human-equivalent work, in every act,
from the first second to the last. It is what the mission statement is secretly
a description of, and the ending reads it back.

## Constraints

The build enforces these, and `test/build.test.mjs` re-checks them:

- one file, no external references except Google Fonts
- under 16 MB
- works in light and dark, honours `prefers-reduced-motion`
- `localStorage` wrapped in `try`/`catch` — it throws outright in some contexts
- safe-area insets, because phones draw under the system bars

## Known issues

- **Bankruptcy is close to unreachable at the shipped `BURN_K`.** Slowing the
  game down meant scaling burn down with it, and reckless spending now survives
  0 times out of 12 in simulation. The ending, the runway warnings and the
  "shut down hardware" action are all wired up and currently almost dead. There
  is a test pinned to this so it gets noticed if it changes.
- Act III is mostly watching numbers climb. It needs a decision with teeth.
- No audio.
- The simulation models Act I only.

## Licence

MIT.
