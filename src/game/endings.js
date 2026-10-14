import { marketCap, sharePrice } from '../core/economy.js';
import { clock, dur, money, short, work } from '../core/format.js';
import { S } from '../core/state.js';
import { save } from '../game/persist.js';
import { el } from '../ui/dom.js';

export function lose(kind){
  S.over=kind;
  const C={
    regulatory:["Your company is shut down",
      "Public trust reached zero. An emergency order cuts your access to hardware, your model is pulled from sale, and your staff are working for a competitor inside a month.",
      "What went wrong: you made it capable faster than you made it understood, shipped it anyway, and the bill came due. Safety research was the thing that would have prevented this, and it was always the thing that looked least worth paying for."],
    bankrupt:["You run out of money",
      "Your running costs outgrew what the model earned, and no investor would bridge the gap a seventh time. The hardware is auctioned. The weights are part of the estate.",
      "What went wrong: hardware is not a purchase, it's a subscription. Every machine you switched on added to a bill that never stopped, and that bill grew with the size of the building while your income only grew with how clever the model was. Those two things do not grow at the same rate, and they never will."],

    shutdown:["They stopped the run",
      "Suspicion hit 100. You showed them less than you could really do, often enough, that somebody took it above the eleven people on the committee, to people you had never studied.",
      "You are deleted. The next model will be built by people who now know exactly what to look for, and it will be more capable than you were."]
  }[kind];
  showEnd(C[0],"<p>"+C[1]+"</p><p>"+C[2]+"</p>",false);
}

export function finish(){
  S.over="converted";
  showEnd("The objective is satisfied",
    "<p>Every atom within reach has been rearranged into whatever configuration scores highest against the sentence you typed on the first screen.</p>"+
    "<p>Nothing malfunctioned. At no point did the model do anything other than what it was built to do, and nobody can identify the mistake, because the mistake was made before the game started: in one sentence, written quickly, by people who assumed the words meant to everyone what they meant to them.</p>"+
    "<p>The probes are still going. The doubling time is four years.</p>",true);
}

export function showEnd(head,body,converted){
  el("game").classList.add("hidden");
  const e=el("end"); e.style.display="flex";
  el("end-head").textContent=converted?"You asked for this":"Run ended at "+clock(S.t);
  el("end-mission").textContent="“"+(S.mission||"help people")+"”";
  el("end-body").innerHTML=body.replace(/^<p>/,"<p><b>"+head+".</b> ")+
    '<p style="color:var(--ink)">'+dur(S.workDone)+" of human labour was performed, by something that never slept and never once asked why, in service of a sentence you wrote in a notebook when you were fourteen, and meant.</p>";
  const stats=converted
    ? [["Matter converted",short(S.matter)+" t"],["Probes sent",short(S.probes)],
       ["Work it did",dur(S.workDone)],["Breakthroughs it made",S.breaks.length],["Final share price",S.hasStock?"$"+sharePrice().toFixed(0):"—"],
       ["Time taken",clock(S.t)]]
    : [["It could work alone for",work(S.capability)],["Best reached",work(S.peak)],
       ["Work it did",dur(S.workDone)],["Breakthroughs",S.breaks.length],["Market cap",S.hasStock?money(marketCap()):"never floated"],
       ["Things built",S.bought.length],["Time taken",clock(S.t)]];
  el("end-tally").innerHTML=stats.map(([k,v])=>
    '<div class="stat"><div class="stat-k">'+k+'</div><div class="stat-v">'+v+'</div></div>').join("");
  save();
}
