import { LOG_MAX } from '../core/sanitize.js';
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
  if(S.log.length>LOG_MAX) S.log.pop();
  drawLog();
}

const REDUCED_MOTION = typeof window!=="undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
let typeSeq = 0;

/** Type a node's current contents back out, character by character, behind a
 *  block cursor, like the command prompt at the start. Markup is kept whole. */
export function typeOut(node, maxMs = 900){
  if(!node || REDUCED_MOTION) return;
  const html = node.innerHTML;
  const tokens = html.match(/<[^>]+>|&[a-z#0-9]+;|[^<&]/gi) || [];
  const text = tokens.filter(t => t[0] !== "<").length;
  if(!text) return;
  // about 4 characters a frame, but never longer than maxMs whatever the length
  const perFrame = Math.max(4, Math.ceil(text / (maxMs / 16)));
  const id = node.__type = ++typeSeq;
  let k = 0, shown = 0;
  const step = () => {
    if(node.__type !== id || !node.isConnected) return;
    for(let n = 0; k < tokens.length && n < perFrame; k++) if(tokens[k][0] !== "<") n++, shown++;
    if(k < tokens.length){
      node.innerHTML = tokens.slice(0, k).join("") + '<span class="cur" aria-hidden="true"></span>';
      requestAnimationFrame(step);
    } else node.innerHTML = html;
  };
  node.innerHTML = '<span class="cur" aria-hidden="true"></span>';
  requestAnimationFrame(step);
}
