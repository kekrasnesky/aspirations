/**
 * How the hardware turns into a model. Every function takes the state as an
 * argument so the headless simulation runs the same arithmetic as the game.
 */
import { VRAM_PER_PARAM, RAM_PER_PARAM, CORES_PER_GPU, RUN_BASE, TRAIN_K, TRAIN_EXP, FIRST_MODEL, SCALE_STEP, MIN_STEP, LEVEL_K, LEVEL_EXP, ACT1_PARAMS, LIMIT_PERF_EXP } from './balance.js';

/** Internal index of how good a model of this size is. Never shown. */
export const level = p => LEVEL_K*Math.pow(Math.max(p,0)/1e9,LEVEL_EXP);

/** The biggest model each kind of memory can hold while training. */
export const fitVram = s => s.vram*1e9/(VRAM_PER_PARAM*s.vramMult*s.memMult);
export const fitRam  = s => s.ram*1e9/(RAM_PER_PARAM*s.memMult);
export const maxFit  = s => Math.min(fitVram(s),fitRam(s));
export const memLimit = s => fitVram(s)<=fitRam(s) ? "vram" : "ram";

/** Share of the GPUs' time they're actually working, rather than waiting on the CPU for data. */
export const coresNeeded = s => s.gpus*CORES_PER_GPU;
export const feed = s => Math.min(1, s.cores*s.coreMult/Math.max(coresNeeded(s),1));

/** Share of full speed the GPU power limit leaves. Only you set a limit; in act II the model runs flat out. */
export const limitPerf = s => s.act===1 ? Math.pow(s.gpuLimit,LIMIT_PERF_EXP) : 1;
export const throughput = s => s.tflops*feed(s)*s.speedMult*limitPerf(s);

export const trainTime = (s,n) => RUN_BASE + TRAIN_K*Math.pow(n/1e9,TRAIN_EXP)/Math.max(throughput(s),1e-9);

/** Round down to two significant figures, so model sizes read like real ones. */
export const tidy = x => { if(x<=0) return 0; const e=Math.pow(10,Math.floor(Math.log10(x))-1); return Math.floor(x/e+1e-9)*e };

/** The size the next run is aiming for: SCALE_STEP times the last. In act I, never
 *  past ACT1_PARAMS: beyond that, the model does the research itself. */
export const wanted = s => Math.min(s.params>0 ? s.params*SCALE_STEP : FIRST_MODEL, s.act===1 ? ACT1_PARAMS : Infinity);

/** The model the next run would train: as close to `wanted` as fits. 0 if nothing worth training fits. */
export function nextTarget(s){
  const want = wanted(s);
  const t = tidy(Math.min(want, maxFit(s)));
  return t >= Math.max(s.params*MIN_STEP, FIRST_MODEL) ? t : 0;
}

/** What is stopping the next model from being bigger: "vram", "ram", or "" if nothing. */
export function bottleneck(s){
  if(s.act===1 && s.params>=ACT1_PARAMS) return "";
  if(maxFit(s) >= wanted(s)) return "";
  return memLimit(s);
}

/** Add (n=1) or remove (n=-1) one purchase of hardware tier h. */
export function applyHw(s,h,n){
  if(h.kind==="gpu"){ s.gpus+=n*h.g; s.gpuW+=n*h.g*h.w; s.vram+=n*h.g*h.v; s.tflops+=n*h.g*h.tf }
  else if(h.kind==="ram") s.ram+=n*h.gb;
  else s.cores+=n*h.cores;
}
