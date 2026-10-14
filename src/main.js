import { sharePrice } from './core/economy.js';
import { TICK_MS, PLOT_SAMPLES } from './core/balance.js';
import { clock } from './core/format.js';
import { sanitize } from './core/sanitize.js';
import { FRESH, S, setState } from './core/state.js';
import { tick } from './game/loop.js';
import { SAVE_KEY, load, save } from './game/persist.js';
import { el, esc, log } from './ui/dom.js';
import { drawActions, drawBar, drawGloss, drawGuide, drawPlot, drawProjects, drawSliderRead, drawStock, render } from './ui/render.js';
import { applyWarmth } from './ui/theme.js';
import { REDUCED, enterAct2, enterAct3 } from './ui/takeover.js';

export function startGame(){
  el("intro").classList.add("hidden");
  el("end").style.display="none";
  el("game").classList.remove("hidden");
  document.body.classList.toggle("act-2",S.act===2);
  document.body.classList.toggle("act-3",S.act===3);
  drawGloss();
  if(!S.log.length){
    log("<b>You switch it on.</b> In the notebook, at the top of the page: "+esc(S.mission));
    log("One gaming PC you built yourself, a pile of free ebooks, and a model that can hold a thought for about five seconds. No money, no team, no plan beyond that sentence.");
    log("Nobody in the world is more than two years ahead of you. Nobody in the world knows your name.");
  }
  render();
  /* The project that ends an act is marked bought before its cutscene starts,
     but the act only changes when the cutscene's button is pressed. A save
     taken in between (autosave, closing the tab) would otherwise strand the
     player in the old act with the way forward already spent. Replay it. */
  if(S.act===1 && S.bought.includes("automate")) enterAct2();
  else if(S.act===2 && S.bought.includes("replicate")) enterAct3();
}

/* The intro is a command prompt. Submitting it prints a few boot lines, the
   window dissolves, and the control panel fades in. */
const DEFAULT_MISSION="to ensure that artificial general intelligence benefits all of humanity";
let launching=false;
function launch(){
  if(launching) return; launching=true;
  const typed=el("mission").value.trim();
  S.mission=typed||DEFAULT_MISSION;
  if(REDUCED){startGame();return}
  el("mission").readOnly=true; el("begin").disabled=true;
  const boot=el("boot");
  [["mission saved to notebook.txt",0],["finding graphics card ........ ok",650],["starting training console ...",1300,"hot"]].forEach(([text,at,cls])=>
    setTimeout(()=>{const p=document.createElement("p");p.textContent="> "+text;if(cls)p.className=cls;boot.appendChild(p)},at));
  setTimeout(()=>el("intro").classList.add("closing"),2000);
  setTimeout(()=>{
    el("game").classList.add("reveal"); startGame();
    setTimeout(()=>el("game").classList.remove("reveal"),1000);
  },2800);
}
el("prompt-row").addEventListener("submit",e=>{e.preventDefault();launch()});
el("glossbtn").onclick=()=>{
  const g=el("gloss"); g.classList.toggle("on");
  el("glossbtn").textContent=g.classList.contains("on")?"hide the explanations":"what the words mean";
};
el("reset").onclick=()=>{
  try{localStorage.removeItem(SAVE_KEY)}catch(e){}
  setState(FRESH()); document.body.className="";
  el("game").classList.add("hidden"); el("end").style.display="none";
  el("intro").classList.remove("hidden","closing"); el("mission").value="";
  el("mission").readOnly=false; el("begin").disabled=false; el("boot").innerHTML=""; launching=false;
};
/* Save box. Written as a panel on the page, not prompt()/alert(), because
   embedded viewers never show those dialogs. */
const box=el("savebox"), boxText=el("savetext"), boxMsg=el("savemsg");
const openBox=(mode)=>{
  box.classList.remove("hidden"); box.dataset.mode=mode; boxMsg.textContent="";
  el("saveload").classList.toggle("hidden",mode!=="import");
  el("savehelp").textContent=mode==="export"
    ? "This is your save. Copy it and keep it somewhere safe. Use 'load a save' to bring it back."
    : "Paste a save you copied earlier. This replaces your current game.";
  boxText.readOnly=mode==="export";
  boxText.value=mode==="export"?JSON.stringify(S):"";
  boxText.focus(); if(mode==="export") boxText.select();
};
el("export").onclick=async()=>{
  openBox("export");
  try{await navigator.clipboard.writeText(boxText.value);boxMsg.textContent="Copied to the clipboard."}
  catch(e){boxMsg.textContent="Select the text above and copy it."}
};
el("import").onclick=()=>openBox("import");
el("saveclose").onclick=()=>box.classList.add("hidden");
el("saveload").onclick=()=>{
  let next=null;
  try{next=sanitize(JSON.parse(boxText.value),FRESH())}catch(e){}
  if(!next){boxMsg.textContent="That doesn't look like a save from this game.";return}
  if(!next.mission) next.mission=DEFAULT_MISSION;
  setState(next); document.body.className="";
  box.classList.add("hidden");
  startGame(); save();
};
el("again").onclick=()=>el("reset").click();
if(load()){el("intro").classList.add("hidden");startGame()}

/* The simulation advances in fixed ticks of real elapsed time, so a slow frame
   doesn't slow the game. It stands still before the game starts (the title
   screen), while the tab is hidden (browsers
   throttle timers there, and you shouldn't go bankrupt while away) and while a
   story overlay covers the screen. */
const MAX_FRAME_MS=2000;
let last=performance.now(), owed=0;
const paused=()=>document.hidden||el("game").classList.contains("hidden")||el("takeover").classList.contains("on");
setInterval(()=>{
  const now=performance.now(), dt=Math.min(now-last,MAX_FRAME_MS); last=now;
  if(paused()) return;
  owed+=dt;
  while(owed>=TICK_MS){tick();owed-=TICK_MS}
  if(!S.over){applyWarmth();drawBar();drawGuide();drawPlot();el("clock").textContent=clock(S.t)}
},TICK_MS);
setInterval(()=>{if(!S.over&&!paused()){drawActions();drawProjects();drawStock();drawSliderRead()}},400);
setInterval(()=>{if(!S.over&&!paused()){S.samples.push(S.capability);if(S.samples.length>PLOT_SAMPLES)S.samples.shift()}},1000);
setInterval(()=>{if(!S.over&&!paused()&&S.hasStock)S.lastPx=sharePrice()},60000);
setInterval(()=>{if(!S.over)save()},5000);
// phones kill backgrounded tabs without warning; save on the way out
document.addEventListener("visibilitychange",()=>{if(document.hidden&&!S.over)save()});
window.addEventListener("pagehide",()=>{if(!S.over)save()});
