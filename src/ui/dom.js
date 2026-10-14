import { S } from '../core/state.js';
import { drawLog } from '../ui/render.js';

export const el = id => document.getElementById(id);

/** Write innerHTML only when it changed, so hover, focus and text selection survive the redraw timers. */
export function setHTML(node, html){
  if(node.__html !== html){ node.innerHTML = html; node.__html = html }
}

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
