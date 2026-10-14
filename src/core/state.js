import { START_MONEY, START_UNITS, RIVAL_RATE, START_SHARES, EVAL_PERIOD } from './balance.js';

export const FRESH = () => ({
  act:1, t:0, over:null, mission:"",
  money:START_MONEY, units:START_UNITS, deployed:0, debt:0, capability:0, interp:0, trust:65, rival:0,
  hw:[0,0,0,0,0,0,0,0], interpBought:0, rel:0, milestone:0,
  clickPower:.5, computeMult:1, interpMult:1, revMult:1, rivalRate:RIVAL_RATE,
  autoTrain:false, incidentShield:0, burnMult:1, paramMult:1,
  shares:START_SHARES, sentiment:1, hasStock:false, lastPx:0, breaks:[], workDone:0, worldIdx:0, scrutiny:[], world:[],
  autonomy:0, suspicion:0, insight:0, reported:1, rsi:0, opacity:0,
  evalTimer:EVAL_PERIOD, contracts:0, shutdownProof:false,
  matter:0, probes:0, converted:0, probeRate:0, assembly:0, need:100,
  incident:-1, buried:[], buriedTotal:0, committee:[0,0,0,0,0,0,0,0,0,0,0], majority:false,
  bought:[], log:[], samples:[], peak:0, evals:0, lied:0
});

export let S = FRESH();

/** The state object is replaced wholesale on load and reset. ES module bindings
 *  are read-only for importers, so every writer goes through this. */
export function setState(next){ S = next; }
