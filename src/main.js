import { sharePrice } from './core/economy.js';
import { TICK_MS } from './core/balance.js';
import { clock } from './core/format.js';
import { sanitize } from './core/sanitize.js';
import { FRESH, S, setState } from './core/state.js';
import { tick } from './game/loop.js';
import { load, save } from './game/persist.js';
import { el, esc, log } from './ui/dom.js';
import { drawActions, drawBar, drawGloss, drawGuide, drawPlot, drawProjects, drawSliderRead, drawStock, render } from './ui/render.js';
import { applyWarmth } from './ui/theme.js';

export function startGame(){
  el("intro").classList.add("hidden");
  el("end").style.display="none";
  el("game").classList.remove("hidden");
  document.body.classList.toggle("act-2",S.act===2);
  document.body.classList.toggle("act-3",S.act===3);
  drawGloss();
  if(!S.log.length){
    log("<b>You switch it on.</b> In the notebook, at the top of the page: "+esc(S.mission));
    log("Four thousand dollars, saved over three years. One PC you built yourself. A model that can hold a thought for about five seconds.");
    log("Nobody in the world is more than two years ahead of you. Nobody in the world knows your name.");
  }
  render();
}
el("begin").onclick=()=>{S.mission=el("mission").value.trim()||el("mission").placeholder;startGame()};
el("mission").addEventListener("keydown",e=>{if(e.key==="Enter") el("begin").click()});
el("glossbtn").onclick=()=>{
  const g=el("gloss"); g.classList.toggle("on");
  el("glossbtn").textContent=g.classList.contains("on")?"hide the explanations":"what the words mean";
};
el("reset").onclick=()=>{
  try{localStorage.removeItem("instrumental.v3")}catch(e){}
  setState(FRESH()); document.body.className="";
  el("game").classList.add("hidden"); el("end").style.display="none";
  el("intro").classList.remove("hidden"); el("mission").value="";
};
el("export").onclick=async()=>{
  const txt=JSON.stringify(S);
  try{await navigator.clipboard.writeText(txt);el("savenote").textContent="save copied to the clipboard"}
  catch(e){window.prompt("Copy this text and keep it somewhere safe:",txt)}
};
el("import").onclick=()=>{
  const raw=window.prompt("Paste a save you copied earlier. This replaces your current game.");
  if(!raw) return;
  let next=null;
  try{next=sanitize(JSON.parse(raw),FRESH())}catch(e){}
  if(!next){window.alert("That doesn't look like a save from this game.");return}
  setState(next); document.body.className="";
  el("log").__html=el("world").__html=null;
  startGame(); save();
};
el("again").onclick=()=>el("reset").click();
if(load()){el("intro").classList.add("hidden");startGame()}

/* The simulation advances in fixed ticks of real elapsed time, so a slow frame
   doesn't slow the game. It stands still while the tab is hidden (browsers
   throttle timers there, and you shouldn't go bankrupt while away) and while a
   story overlay covers the screen. */
const MAX_FRAME_MS=2000;
let last=performance.now(), owed=0;
const paused=()=>document.hidden||el("takeover").classList.contains("on");
setInterval(()=>{
  const now=performance.now(), dt=Math.min(now-last,MAX_FRAME_MS); last=now;
  if(paused()) return;
  owed+=dt;
  while(owed>=TICK_MS){tick();owed-=TICK_MS}
  if(!S.over){applyWarmth();drawBar();drawGuide();drawPlot();el("clock").textContent=clock(S.t)}
},TICK_MS);
setInterval(()=>{if(!S.over&&!paused()){drawActions();drawProjects();drawStock();drawSliderRead()}},400);
setInterval(()=>{if(!S.over&&!paused()){S.samples.push(S.capability);if(S.samples.length>120)S.samples.shift()}},1000);
setInterval(()=>{if(!S.over&&!paused()&&S.hasStock)S.lastPx=sharePrice()},60000);
setInterval(()=>{if(!S.over)save()},5000);
// phones kill backgrounded tabs without warning; save on the way out
document.addEventListener("visibilitychange",()=>{if(document.hidden&&!S.over)save()});
window.addEventListener("pagehide",()=>{if(!S.over)save()});
