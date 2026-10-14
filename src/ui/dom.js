import { S } from '../core/state.js';
import { drawLog } from '../ui/render.js';

export const el = id => document.getElementById(id);

export function log(text,cls){
  S.log.unshift({t:Math.floor(S.t),text,cls:cls||""});
  if(S.log.length>90) S.log.pop();
  drawLog();
}

/* ============================================================
   HARDWARE LADDER
   ============================================================ */
