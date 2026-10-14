import { S } from '../core/state.js';
import { drawLog } from '../ui/render.js';

export const el = id => document.getElementById(id);

/** Escape text the player typed before it goes anywhere near innerHTML. */
export const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

export function log(text,cls){
  S.log.unshift({t:Math.floor(S.t),text,cls:cls||""});
  if(S.log.length>90) S.log.pop();
  drawLog();
}

/* ============================================================
   HARDWARE LADDER
   ============================================================ */
