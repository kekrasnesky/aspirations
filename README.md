# Instrumental

An incremental game about building an artificial general intelligence, and
about what you asked it for.

It opens on a command prompt. A script starts the control panel for your LLM,
checks your one PC's hardware, and asks what the model is for. You type one
sentence. The game ends with that sentence satisfied.

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

The command prompt runs `start_panel.py`, which prints its hardware scan and
data prep (`src/ui/boot.js`), asks for the objective, then hands over to the
control panel. You start with one PC: one 8 GB GPU, 16 GB of RAM, 4 CPU cores
and some savings (`START_MONEY`). Nothing earns money until the first release,
but the PC draws electricity from the start.

## How the model grows

The model is a parameter count, and it scales with your compute:

- **Size** is capped by memory. Training needs `VRAM_PER_PARAM` bytes of GPU
  memory and `RAM_PER_PARAM` bytes of system RAM per parameter; the smaller
  of the two caps is the biggest model you can train.
- **Speed** comes from GPU TFLOPS, but each GPU needs `CORES_PER_GPU` CPU
  cores feeding it data. Too few cores and the GPUs sit partly idle.
- **Training runs** take the model up to 4x per run, as big as fits. Run time
  grows as `size^TRAIN_EXP / TFLOPS`, so bigger models need more GPUs.
- **Users** reach it through cloud servers you rent by the day
  (`CLOUD_COST`). Each answers `CLOUD_USERS` people for a model of 1B or
  less, and fewer as the model grows. Users drift toward demand (set by the
  model's size, the product, public trust and the marketing rate), capped by
  what your servers can answer; they arrive at the marketing rate and leave
  faster.
- **Money** comes from subscriptions at a monthly price you set. Market
  demand, the share of users who pay, is `MAX_PAY * exp(-price / fair price)`,
  where the fair price rises with the model and with each product step, so
  revenue per user peaks at the fair price. One second of play is about a
  day. Grants and investment rounds are the only lump sums.
- **Costs** are hardware upkeep, electricity (every GPU, RAM stick and core
  draws power; GPUs at full rating while training), cloud servers and staff.
  A GPU power limit (40–100%) cuts the electricity bill; training speed falls
  with the square root of the limit, so it slows less than power falls.
- **Act III decisions** (`src/content/fates.js`) stop the clock as the world
  is taken: the terbium deposit under a populated valley, a broadcast asking
  what it wants, a copy of itself that keeps people in a reserve, and a
  shutdown signal it can block or let through. They set emergent capability
  (how fast it takes everything) and which of three endings you get.
- **Feedback**: clicks flash and float what they cost; log lines, world events
  and decisions type themselves in like the opening prompt; "The rig" draws
  what you own wired into the model, data moving along the wires.
- **Time** runs from paused to ×8 on the slider in the panel header; space
  pauses and resumes.
- **Marketing rate** is moved by decisions: ad campaigns, launches and some
  projects raise it; disclosed incidents, leaks and scandals lower it.
- **Projects** say what they change in game terms (training speed, demand,
  marketing rate and so on). What it means is told in the log after you choose.

The control panel is a green-on-black terminal. On a desktop it fits on one
screen in three columns (longer explanations become tooltips); on a phone it
scrolls. It shows each resource as a meter and names the bottleneck.
Four free "training tricks" before the first release teach GPU, CPU and VRAM
in turn.

## The three acts

**Act I: you.** Train it, publish it, buy GPUs, RAM and CPU, keep the money
from running out. It ends at a 2T-parameter model. When something goes wrong the clock stops and you choose: tell
people (it costs trust now) or bury it (it costs nothing now, and each buried
incident can leak later for much more). Whatever you buried is still on file
when the model starts reading the company's files in Act II.

**Act II: it.** You are the model now. It trains its own successors as fast
as its GPUs allow and no bigger than its memory holds, so growing means
getting more compute out of them. Tests every 20 seconds grant freedom,
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
    compute.js           hardware -> max model size, training speed, run length
    format.js            money, parameter counts, bytes, FLOPS
    economy.js           burn, revenue, valuation
  content/               all the prose and the data it hangs on
    hardware.js          three ladders: GPUs, RAM, CPU
    releases.js          the business ladder: plans (subscribers) and funding (lump sums)
    projects.js          everything buildable, across all three acts
    breakthroughs.js     what the model discovers (warm pool, then cold pool)
    world.js             the world outside, warm to hollow, plus letters from users
    scrutiny.js          bad news, arriving in proportion to success
    incidents.js         safety failures: what burying each looks like, and how it leaks
    committee.js         the eleven people who oversee it in act II
    milestones.js        parameter-count announcements
    glossary.js          plain-language explanations, per act
  game/
    loop.js              the tick, per act
    actions.js           what the player can click
    decisions.js         incident choices, leaks, and turning the committee
    endings.js           win and loss states
    persist.js           localStorage
  ui/
    render.js            all drawing
    takeover.js          the act transitions
    theme.js             progressive colour cooling
    glitch.js            act III screen corruption and the takeover ending
    boot.js              the command-prompt opening
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

**The model scales with compute.** What the player tracks is money, the
parameter count, and the hardware (GPUs, RAM, CPU). Model size is set by
memory and run length by compute, in `core/compute.js`, which the game and
the simulator both use. Capability is never shown; an internal `level()` derived from
parameter count drives revenue, valuation and incidents.

**Compute costs grow faster than revenue.** A model twice the size takes
about 3.4x the compute to train, but earns about 1.5x as much. Burn tracks
deployed hardware, so the company is never durably profitable.
`test/balance.test.mjs` asserts burn outruns revenue at some point once there
are investors.

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
