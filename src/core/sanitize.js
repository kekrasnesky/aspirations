import { MIN_SHARES, MAX_SHARES, SENTIMENT_FLOOR, SENTIMENT_CEIL } from './balance.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Merge a parsed save onto a fresh state, keeping only values of the right
 * type. A save can be hand-edited, truncated, or written by an older build, and
 * one NaN in the state object turns every number on screen into "NaN".
 * Returns null when the save is not usable at all.
 */
export function sanitize(raw, fresh){
  if(!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if(![1,2,3].includes(raw.act) || raw.over) return null;
  const out = fresh;
  for(const k of Object.keys(fresh)){
    if(!(k in raw)) continue;
    const f = fresh[k], v = raw[k];
    if(Array.isArray(f)){
      if(!Array.isArray(v)) continue;
      if(k === "hw") out.hw = f.map((_, i) => Number.isFinite(v[i]) && v[i] >= 0 ? Math.floor(v[i]) : 0);
      else if(k === "samples") out.samples = v.filter(Number.isFinite);
      else if(k === "bought") out.bought = v.filter(x => typeof x === "string");
      else if(k === "log") out.log = v.filter(x => x && typeof x.text === "string").map(x => ({t:Number(x.t)||0, text:x.text, cls:typeof x.cls === "string" ? x.cls : ""}));
      else out[k] = v;
    }
    else if(typeof f === "number"){ if(Number.isFinite(v)) out[k] = v }
    else if(typeof f === "boolean"){ if(typeof v === "boolean") out[k] = v }
    else if(typeof f === "string"){ if(typeof v === "string") out[k] = v }
  }
  out.t = Math.max(0, out.t);
  out.trust = clamp(out.trust, 0, 100);
  out.sentiment = clamp(out.sentiment, SENTIMENT_FLOOR, SENTIMENT_CEIL);
  out.shares = clamp(out.shares, MIN_SHARES, MAX_SHARES);
  out.reported = clamp(out.reported, .2, 1);
  out.rival = clamp(out.rival, 0, 100);
  out.converted = clamp(out.converted, 0, 100);
  for(const k of ["units","deployed","debt","capability","interp","workDone","rel","insight","autonomy","suspicion","matter","probes","milestone"])
    out[k] = Math.max(0, out[k]);
  return out;
}
