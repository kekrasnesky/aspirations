import { sharePrice } from './core/economy.js';
import { clock } from './core/format.js';
import { FRESH, S, setState } from './core/state.js';
import { tick } from './game/loop.js';
import { load, save } from './game/persist.js';
import { el, log } from './ui/dom.js';
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
    log("<b>You switch it on.</b> In the notebook, at the top of the page: "+S.mission);
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
el("again").onclick=()=>el("reset").click();
if(load()){el("intro").classList.add("hidden");startGame()}

setInterval(()=>{tick();if(!S.over){applyWarmth();drawBar();drawGuide();drawPlot();el("clock").textContent=clock(S.t)}},100);
setInterval(()=>{if(!S.over){drawActions();drawProjects();drawStock();drawSliderRead()}},400);
setInterval(()=>{if(!S.over){S.samples.push(S.capability);if(S.samples.length>120)S.samples.shift()}},1000);
setInterval(()=>{if(!S.over&&S.hasStock)S.lastPx=sharePrice()},60000);
setInterval(()=>{if(!S.over)save()},5000);
