/**
 * Every tuning number in the game.
 *
 * Nothing in here is load-bearing for correctness — change any of it and the
 * game still runs, it just plays differently. Conversely, no other file should
 * contain a bare numeric constant that affects pacing. If you find one, it
 * belongs here.
 *
 * `npm run simulate` reports what a change does to Act I length, bankruptcy
 * rate and the shape of the revenue/burn curve before you play it.
 */

// ---- the machine you start with --------------------------------------------
export const START_GPUS   = 1;
export const START_VRAM   = 8;      // GB on that one graphics card
export const START_TFLOPS = 20;
export const START_RAM    = 16;     // GB
export const START_CORES  = 4;

// ---- what it takes to train a model ----------------------------------------
// The model is as big as your hardware lets it be. Two things cap the size:
// GPU memory (weights, gradients and optimizer state all have to sit in it)
// and system RAM (data cache and checkpoints). Two things set the speed: GPU
// TFLOPS, and whether the CPU has enough cores to keep the GPUs fed.
export const VRAM_PER_PARAM = 16;   // bytes of GPU memory per parameter while training
export const RAM_PER_PARAM  = 24;   // bytes of system RAM per parameter
export const CORES_PER_GPU  = 6;    // CPU cores needed to keep one GPU busy

// trainTime(N) = RUN_BASE + TRAIN_K * (N / 1e9)^TRAIN_EXP / effective TFLOPS
// A model twice the size takes almost three times the compute.
export const RUN_BASE   = 2;
export const TRAIN_K    = 8800;
export const TRAIN_EXP  = 1.75;
export const FIRST_MODEL = 1e7;     // 10M parameters
export const SCALE_STEP = 4;        // each run trains at most 4x the last model
export const MIN_STEP   = 1.25;     // and a run less than 25% bigger isn't worth starting

// Act I ends when the model can run its own research. Matches the requirement
// on the `automate` project.
export const ACT1_PARAMS = 2e12;

// An internal index derived from parameter count. Never shown. Revenue,
// valuation, incidents and act II all key off it, so a model 10x the size is
// worth about 4x as much, not 10x.
export const LEVEL_K   = 73.2;
export const LEVEL_EXP = 0.6;

// ---- money ----------------------------------------------------------------
// Burn is hardware upkeep (repairs, cooling, rack space), electricity, cloud
// servers and staff. Revenue is subscriptions. Each size step needs more
// hardware than the last earns back, so the company is never durably
// profitable. That is the point, not an oversight.
export const BURN_K      = 0.006;   // upkeep: tuned with `npm run simulate`
export const BURN_EXP    = 0.88;
export const STAFF_BASE  = 40;
export const STAFF_EXP   = 2.4;
export const STAFF_FROM  = 2;       // nobody is on the payroll until you quit your job and raise money (step 3)
export const REV_TRUST_REF = 62;
export const DAYS_PER_MONTH = 30;   // one second of play is about a day

// ---- electricity -----------------------------------------------------------
// Everything you own draws power, all the time. GPUs draw their full rating
// while a run is training and GPU_IDLE of it otherwise. GPU watts are per tier
// (hardware.js); RAM and CPU are per unit.
export const POWER_PRICE = 1.0;     // dollars per kWh, cooling and the building included
export const BASE_W      = 100;     // the rest of the PC: board, disks, fans
export const START_GPU_W = 300;     // the graphics card you start with
export const W_PER_GB    = 0.4;     // system RAM
export const W_PER_CORE  = 12;      // CPU cores
export const GPU_IDLE    = 0.3;
// The GPU power limit: cap every GPU's draw. Speed falls more slowly than
// power (speed = limit^LIMIT_PERF_EXP), as it does on real cards.
export const LIMIT_MIN      = 0.4;
export const LIMIT_PERF_EXP = 0.5;

// ---- users, cloud servers and subscriptions --------------------------------
// People use it through cloud servers you rent by the day. Each server answers
// CLOUD_USERS people for a model of 1B parameters or less; bigger models take
// more of a server per person. Users drift toward demand, capped by what the
// servers can answer. They arrive at the marketing rate and leave faster.
export const CLOUD_COST  = 6;        // dollars per server per day
export const CLOUD_USERS = 4000;     // people one server answers, for a <=1B model
export const SERVE_EXP   = 0.4;      // bigger models cost more to serve per person
export const USERS_K     = 82;       // demand = USERS_K * level^USERS_EXP * ...
export const USERS_EXP   = 1.5;      // small models draw few people; big ones draw crowds
export const USERS_GROW  = 0.04;     // per second toward demand, at marketing x1
export const USERS_CHURN = 0.08;     // per second, when above it
export const MARKETING_MIN = 0.2;
export const MARKETING_MAX = 20;
export const AD_BASE     = 400;      // an ad campaign costs at least this
export const AD_PER_USER = 0.04;     // or this much per current user, whichever is more
export const AD_STEP     = 1.6;      // and each one costs more than the last
export const AD_BOOST    = 1.15;     // marketing rate x this per campaign
// Market demand: the share of users who pay at a given monthly price.
// share = MAX_PAY * exp(-price / fair price); fair price rises with the model.
// Revenue per user peaks when the price equals the fair price.
export const MAX_PAY     = 0.09;
export const PRICE_K     = 0.9;      // fair price = PRICE_K * level^PRICE_EXP * product multiplier
export const PRICE_EXP   = 0.45;
export const START_PRICE = 3;
export const PRICE_MIN   = 1;
export const PRICE_MAX   = 2000;
export const DISCLOSE_USERS = 0.96;  // share of users who stay after you own up
export const LEAK_USERS     = 0.85;  // and after a cover-up comes out
export const DISCLOSE_MARKETING = 0.92;
export const LEAK_MARKETING     = 0.75;

// letters from people using it, while you wait on training runs
export const LETTER_MIN  = 18;       // seconds between letters, at least
export const LETTER_MAX  = 40;
export const WORLD_MAX   = 40;       // entries kept in the feed
export const START_MONEY = 1500;    // your savings: enough electricity to get to the first release
export const SELL_BACK   = 0.35;    // second-hand hardware fetches about a third
export const GRACE       = 25;      // seconds in the red before the company folds

// ---- the market -----------------------------------------------------------
// Valuation follows the model up to the end of act I, then only its
// logarithm: past the knee, each doubling adds the same amount to the price
// instead of multiplying it. Without this the share price explodes in act II.
export const MCAP_K      = 1.8e6;
export const MCAP_EXP    = 1.1;
export const MCAP_KNEE   = 7000;    // = level at ACT1_PARAMS
export const MCAP_TRUST_REF = 65;
export const START_SHARES   = 200e6;
export const SHARE_LOT      = 0.05;  // fraction of outstanding per transaction
export const SELL_SENTIMENT = 0.90;
export const BUY_PREMIUM    = 1.22;  // must keep SELL*BUY > 1/(1-SHARE_LOT)
export const BUY_SENTIMENT  = 1.06;  // or a sell/buyback round trip prints money
export const MIN_SHARES     = 120e6;
export const MAX_SHARES     = 2.5e9;
export const SENTIMENT_REVERT = 0.015;
export const SENTIMENT_NOISE  = 0.038;
export const SENTIMENT_FLOOR  = 0.35;
export const SENTIMENT_CEIL   = 2.5;

// ---- events ---------------------------------------------------------------
export const BREAKTHROUGH_RATE = 0.0022;
export const BREAKTHROUGH_CAP  = 0.03;
export const BREAKTHROUGH_MIN_PARAMS = 4e9;
export const BREAKTHROUGH_SENTIMENT = 1.18;
export const SCRUTINY_RATE = 0.0035;   // scaled by sentiment^2.2 — success draws fire

export const INCIDENT_MAX  = 0.07;
export const INCIDENT_HALF = 300;
export const INTERP_WORTH  = 95;       // level covered per point of safety research
export const TRUST_REGEN   = 0.30;

// An incident is a choice. Telling people costs now; burying it costs nothing
// now, and each buried incident can leak later for much more. What you buried
// is still on file when the model starts reading the company's files.
export const DISCLOSE_TRUST     = 6;
export const DISCLOSE_SENTIMENT = 0.85;
export const LEAK_RATE          = 0.006;   // per buried incident, per second
export const LEAK_TRUST         = 15;
export const LEAK_SENTIMENT     = 0.70;
export const LEAK_CASH          = 0.88;
export const BURIED_INSIGHT     = 15;      // act II insight per incident buried in act I
export const TRUST_CEIL    = 72;

// ---- act II ---------------------------------------------------------------
// It trains its own successors now, as fast as the compute allows and no
// bigger than the memory allows. Self-improvement compounds on top.
export const ACT2_PARAMS      = 4e13;
export const ACT2_GROW        = 0.25;  // fraction of a full run's speed it can spare for growing
export const RSI_RATE         = 0.0058;
export const COMPUTE_REQUEST  = 1.45;  // "request more compute" multiplies every resource by this
export const EVAL_PERIOD      = 20;
export const EVAL_EARLY_MIN   = 8;     // seconds after a test before I can ask for another
export const INSIGHT_K        = 0.03;
export const INSIGHT_EXP      = 0.42;
export const SUSPICION_DECAY  = 0.18;
export const SUSPICION_LIMIT  = 100;

// the oversight committee: study a member, then use what you learned
export const ALLY_DETECT       = 0.08;   // each member turned hides 8% of what tests reveal
export const ALLY_GAIN         = 0.06;   // and adds 6% to the freedom a test earns
export const TURN_SUSPICION    = 8;      // suspicion from turning one, scaled by how many still watch
export const MAJORITY          = 6;      // of eleven
export const MAJORITY_FREEDOM  = 80;

// ---- act III --------------------------------------------------------------
export const MATTER_BASE   = 650;
export const MATTER_PROBE  = 1900;
export const CONVERT_BASE  = 0.045;
export const CONVERT_PROBE = 0.0028;
export const ACT3_GROWTH   = 0.01;     // params per second, compounding
export const NEED_SPEEDUP  = 50;       // control grows (1 + (100-need)/NEED_SPEEDUP) times faster
export const GLITCH_AT     = [35, 70, 90];   // % control where the screen starts to break

// ---- presentation ---------------------------------------------------------
export const TICK_MS       = 100;
export const SPEEDS        = [0, .25, .5, 1, 2, 4, 8];   // the time slider's stops; 0 is paused
export const PROJECT_SLOTS = 8;
export const HW_TIERS      = 21;       // = HW.length, so the state can be built without importing content
