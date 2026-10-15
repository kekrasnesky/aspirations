/* Feedback that a click landed: the button flashes, and a tag floats up from it
   saying what it cost or gave. Drawn on the page rather than on the button,
   because many buttons are rebuilt the moment they are clicked. */
const REDUCED = typeof window!=="undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

/** What the floating tag says for a button. */
export function tagFor(b){
  if(b.closest(".cl-grid")) return b.textContent.trim()+" server"+(b.textContent.trim().replace(/[^0-9k]/g,"")==="1"?"":"s");
  const cost=(b.querySelector(".btn-cost,.proj-cost")||{}).textContent||"";
  if(/^(recover|raise) /.test(cost)) return "+"+cost.replace(/^(recover|raise) /,"");
  if(/^\$|insight|freedom|resources/.test(cost) && !/^free$/.test(cost)) return "−"+cost;
  return "[ OK ]";
}

function spawn(cls, r, text){
  const n=document.createElement("div");
  n.className=cls;
  if(text){ n.textContent=text; n.style.left=Math.round(r.left+r.width/2)+"px"; n.style.top=Math.round(r.top)+"px" }
  else Object.assign(n.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
  document.body.appendChild(n);
  setTimeout(()=>n.remove(), text?1000:500);
}

export function initClickFx(){
  if(REDUCED) return;
  // capture phase: measure the button before its own handler rebuilds it
  document.addEventListener("click", e=>{
    const b=e.target.closest && e.target.closest("button");
    if(!b || b.disabled || !b.closest("#game")) return;
    if(b.closest("#panelhead")) return;   // header links don't need fanfare
    const r=b.getBoundingClientRect();
    spawn("hitflash", r);
    spawn("hittag", r, tagFor(b));
  }, true);
}
