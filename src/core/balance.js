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

// ---- how capability grows -------------------------------------------------
// Capability is an internal index. Hardware returns are deliberately
// sublinear: ten times the compute is nowhere near ten times the model, which
// is both true in reality and the reason the hardware ladder has eight rungs.
export const CAPABILITY_RATE = 0.22;
export const COMPUTE_EXP     = 0.24;

// Act I ends when the model can run its own research. Matches the capability
// requirement on the `automate` project.
export const ACT1_TARGET     = 7000;

// ---- what the player actually sees ----------------------------------------
// horizon(capability) -> seconds of human work the model can finish unattended
export const HORIZON_BASE = 5;
export const HORIZON_K    = 0.068;
export const HORIZON_EXP  = 2.316;

// cumulative human-equivalent labour performed per second of real time
export const WORK_K   = 0.02;
export const WORK_EXP = 0.25;

// model size, derived from hardware
export const PARAM_K   = 1.2e8;
export const PARAM_EXP = 0.62;

// ---- money ----------------------------------------------------------------
// Burn scales with deployed capital; revenue scales with capability. Capability
// scales with log(hardware). So burn outruns revenue by construction and the
// company is never durably profitable. That is the point, not an oversight.
export const BURN_K      = 0.0119;   // tuned with `npm run simulate`: careful play survives, reckless play goes bankrupt
export const BURN_EXP    = 0.88;
export const STAFF_BASE  = 40;
export const STAFF_EXP   = 2.4;
export const REV_K       = 4;
export const REV_EXP     = 0.95;
export const REV_TRUST_REF = 62;
export const RIVAL_DRAG  = 160;     // market share rivals take out of revenue
export const START_MONEY = 0;        // no money until the first thing goes online
export const START_UNITS = 1;        // the gaming PC he already owns
export const GRACE       = 25;      // seconds in the red before the company folds

// ---- the market -----------------------------------------------------------
export const MCAP_K      = 3e5;
export const MCAP_EXP    = 1.35;
export const MCAP_TRUST_REF = 65;
export const MCAP_RIVAL_DRAG = 150;   // rival share discounts the valuation
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
export const BREAKTHROUGH_MIN_CAPABILITY = 150;
export const BREAKTHROUGH_SENTIMENT = 1.18;
export const SCRUTINY_RATE = 0.0035;   // scaled by sentiment^2.2 — success draws fire

export const INCIDENT_MAX  = 0.07;
export const INCIDENT_HALF = 300;
export const INTERP_WORTH  = 95;       // capability covered per point of safety research
export const TRUST_REGEN   = 0.30;
export const TRUST_CEIL    = 72;

// ---- rivals ---------------------------------------------------------------
export const RIVAL_RATE = 0.075;
export const RIVAL_CAP  = 95;          // they take share, they never end the run

// ---- act II ---------------------------------------------------------------
export const EVAL_PERIOD      = 20;
export const RSI_RATE         = 0.0035;
export const INSIGHT_K        = 0.03;
export const INSIGHT_EXP      = 0.42;
export const SUSPICION_DECAY  = 0.18;
export const SUSPICION_LIMIT  = 100;

// ---- act III --------------------------------------------------------------
export const MATTER_BASE   = 650;
export const MATTER_PROBE  = 1900;
export const CONVERT_BASE  = 0.045;
export const CONVERT_PROBE = 0.0028;

// ---- presentation ---------------------------------------------------------
export const TICK_MS       = 100;
export const PROJECT_SLOTS = 8;
export const PLOT_SAMPLES  = 120;
