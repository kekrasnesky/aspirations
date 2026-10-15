import { START_GPU_W, START_MONEY, START_SHARES, EVAL_PERIOD, START_GPUS, START_VRAM, START_TFLOPS, START_RAM, START_CORES, HW_TIERS } from './balance.js';

export const FRESH = () => ({
  act:1, t:0, over:null, mission:"",
  money:START_MONEY, deployed:0, debt:0, interp:0, trust:65,
  // the hardware, as totals
  gpus:START_GPUS, gpuW:START_GPU_W, gpuLimit:1, vram:START_VRAM, tflops:START_TFLOPS, ram:START_RAM, cores:START_CORES,
  hw:Array(HW_TIERS).fill(0), interpBought:0, rel:0, milestone:0,
  // the model: what's trained and live, and the run in progress (target 0 = idle)
  params:0, target:0, progress:0, runs:0, peak:0,
  speedMult:1, coreMult:1, vramMult:1, memMult:1, revMult:1, interpMult:1,
  autoTrain:false, incidentShield:0, burnMult:1, powerMult:1, serveMult:1,
  shares:START_SHARES, sentiment:1, hasStock:false, lastPx:0, breaks:[], worldIdx:0, scrutiny:[], world:[],
  autonomy:0, suspicion:0, insight:0, reported:1, rsi:0, opacity:0,
  evalTimer:EVAL_PERIOD, contracts:0, shutdownProof:false,
  matter:0, probes:0, converted:0, probeRate:0, assembly:0, need:100,
  // act III's decisions: the one waiting (-1 = none), the option taken for each so far, and what they add up to
  fate:-1, fates:[], emergent:1, cruelty:0, mercy:0,
  incident:-1, buried:[], buriedTotal:0, committee:[0,0,0,0,0,0,0,0,0,0,0], majority:false,
  // who uses it: users drift toward demand, capped by the cloud servers you rent;
  // the share who pay planPrice a month falls as the price rises above what it's worth
  users:0, cloud:0, planPrice:0, payMult:1, marketing:1, ads:0, letterIn:12, letters:[],
  bought:[], log:[], evals:0, lied:0, speed:1
});

export let S = FRESH();

/** The state object is replaced wholesale on load and reset. ES module bindings
 *  are read-only for importers, so every writer goes through this. */
export function setState(next){ S = next; }
