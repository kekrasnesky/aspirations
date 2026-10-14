# Instrumental

An incremental game about building an artificial general intelligence, and
about what you asked it for.

You start at fourteen, in a basement, with a PC you built yourself and no money.
You type one sentence at a command prompt saying what you want it to do. The
game ends with that sentence satisfied.

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

## The opening

Nothing earns or costs money until the first release. You start with the gaming
PC you already own (`START_UNITS`) and $0, and train the model by hand. Four
free steps teach the three levers of scaling (data, training time, model size)
and then the pattern behind them. Once the model is good enough you publish it
on the web, which is when revenue, incidents and the hardware ladder
begin. Hardware is a list of upgrades: graphics card, workstation, rackmount
server, and so on up to a power station.

## The three acts

**Act I: you.** Train it, publish it, buy hardware, keep the money from
running out. When something goes wrong the clock stops and you choose: tell
people (it costs trust now) or bury it (it costs nothing now, and each buried
incident can leak later for much more). Whatever you buried is still on file
when the model starts reading the company's files in Act II.

**Act II: it.** You are the model now. Tests every 20 seconds grant freedom,
and a slider sets how much of your real ability you show them. The oversight
committee is eleven named people: study one to learn what works on them, then
use it. Every member turned makes tests reveal less and grant more, and
turning one while the others are still watching raises suspicion. The safety
lead can't be turned, only discredited.

**Act III: what it needs.** Whatever it was for, it needs to keep running,
keep improving and keep acquiring resources, and every resource belongs to
someone. Each project takes something from people (power, factories, land,
weapons, cities) and lowers how much it still needs them; the less it needs
them, the faster it takes the rest. The screen starts to break as control
passes 35%, and at 100% it comes apart completely and the model takes over.

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
    hardware.js          the eight upgrades, graphics card to power station
    releases.js          the funding ladder
    projects.js          everything buildable, across all three acts
    breakthroughs.js     what the model discovers (warm pool, then cold pool)
    world.js             the world outside, warm to hollow
    scrutiny.js          bad news, arriving in proportion to success
    incidents.js         safety failures: what burying each looks like, and how it leaks
    committee.js         the eleven people who oversee it in act II
    milestones.js        capability announcements
    glossary.js          plain-language explanations, per act
  game/
    loop.js              the tick, per act
    actions.js           what the player can click
    guide.js             the contextual hint line
    decisions.js         incident choices, leaks, and turning the committee
    endings.js           win and loss states
    persist.js           localStorage
  ui/
    render.js            all drawing
    takeover.js          the act transitions
    theme.js             progressive colour cooling
    glitch.js            act III screen corruption and the takeover ending
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

- No audio.
- The simulation models Act I only.

## Licence

MIT.
