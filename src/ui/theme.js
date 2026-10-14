/* The colours live in CSS now: a green phosphor terminal, with act II and act III
   variations set by body classes. This used to tint the page from warm to cold
   as the model grew, by writing colour variables inline; clear any it left. */
let cleared=false;

export function applyWarmth(){
  if(cleared) return;
  cleared=true;
  const r=document.documentElement;
  ["paper","panel","sunk","ink","dim","faint","rule","accent","warn","good"].forEach(k=>r.style.removeProperty("--"+k));
}
