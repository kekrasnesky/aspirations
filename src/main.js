import { sharePrice } from './core/economy.js';
import { SPEEDS, TICK_MS } from './core/balance.js';
import { clock } from './core/format.js';
import { sanitize } from './core/sanitize.js';
import { FRESH, S, setState } from './core/state.js';
import { tick } from './game/loop.js';
import { SAVE_KEY, load, save } from './game/persist.js';
import { el, esc, log } from './ui/dom.js';
import { drawActions, drawBar, drawCommittee, drawDecision, drawCloud, drawGloss, drawProjects, drawRig, drawShop, drawSliderRead, drawStock, render } from './ui/render.js';
import { bootIntro, cancelBoot, launchPanel } from './ui/boot.js';
import { applyGlitch } from './ui/glitch.js';
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
    log("<b>Control panel online.</b> Objective: "+esc(S.mission));
    log("One PC: a graphics card with 8 GB of memory, 16 GB of RAM and a 4-core CPU. A folder of free books. No model yet, no money, no team.");
    log("How big a model you can train depends on the hardware. Right now, that's not very big.");
  }
  render(); drawSpeed();
  /* The project that ends an act is marked bought before its cutscene starts,
     but the act only changes when the cutscene's button is pressed. A save
     taken in between (autosave, closing the tab) would otherwise strand the
     player in the old act with the way forward already spent. Replay it. */
  if(S.act===1 && S.bought.includes("automate")) enterAct2();
  else if(S.act===2 && S.bought.includes("replicate")) enterAct3();
}

/* The intro is a command prompt running the script that starts the control
   panel. The objective typed there is the mission. */
const DEFAULT_MISSION="to ensure that artificial general intelligence benefits all of humanity";
let launching=false;
function launch(){
  if(launching) return; launching=true;
  const typed=el("mission").value.trim();
  S.mission=typed||DEFAULT_MISSION;
  el("mission").readOnly=true; el("begin").disabled=true;
  launchPanel(S.mission,()=>{
    if(REDUCED){startGame();return}
    el("intro").classList.add("closing");
    setTimeout(()=>{
      el("game").classList.add("reveal"); startGame();
      setTimeout(()=>el("game").classList.remove("reveal"),1000);
    },800);
  });
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
  el("mission").readOnly=false; el("begin").disabled=false; launching=false;
  bootIntro();
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
  box.classList.add("hidden"); cancelBoot();
  startGame(); save();
};
el("again").onclick=()=>el("reset").click();
if(load()){el("intro").classList.add("hidden");startGame()}
else bootIntro();

/* The simulation advances in fixed ticks of real elapsed time, so a slow frame
   doesn't slow the game. It stands still before the game starts (the title
   screen), while the tab is hidden (browsers
   throttle timers there, and you shouldn't go bankrupt while away) and while a
   story overlay covers the screen. */
const MAX_FRAME_MS=2000;

/* The time slider: how many game ticks pass per real tick. Paused still lets you buy and change things. */
let lastSpeed=1;
function speedLabel(x){ return x===0?"paused":"×"+x }
function drawSpeed(){
  const r=el("speed"), i=SPEEDS.indexOf(S.speed);
  if(+r.value!==i) r.value=i;
  el("speed-v").textContent=speedLabel(S.speed);
}
el("speed").oninput=e=>{S.speed=SPEEDS[+e.target.value]??1;if(S.speed)lastSpeed=S.speed;drawSpeed()};
document.addEventListener("keydown",e=>{   // space pauses and resumes, unless you're typing
  if(e.code!=="Space"||/INPUT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName)||el("game").classList.contains("hidden")) return;
  e.preventDefault(); if(S.speed===0) S.speed=lastSpeed; else {lastSpeed=S.speed; S.speed=0} drawSpeed();
});
let last=performance.now(), owed=0;
const paused=()=>document.hidden||el("game").classList.contains("hidden")||el("takeover").classList.contains("on")||S.incident>=0;
setInterval(()=>{
  const now=performance.now(), dt=Math.min(now-last,MAX_FRAME_MS); last=now;
  if(paused()) return;
  owed+=dt*S.speed;
  while(owed>=TICK_MS && S.incident<0){tick();owed-=TICK_MS}
  if(S.incident>=0) owed=0;
  if(!S.over){applyWarmth();applyGlitch();drawBar();drawDecision();drawRig();el("clock").textContent=clock(S.t)}
},TICK_MS);
setInterval(()=>{if(!S.over&&!paused()){drawActions();drawCloud();drawShop();drawProjects();drawStock();drawSliderRead();drawCommittee()}},400);
setInterval(()=>{if(!S.over&&!paused()&&S.hasStock)S.lastPx=sharePrice()},60000);
setInterval(()=>{if(!S.over)save()},5000);
// phones kill backgrounded tabs without warning; save on the way out
document.addEventListener("visibilitychange",()=>{if(document.hidden&&!S.over)save()});
window.addEventListener("pagehide",()=>{if(!S.over)save()});
