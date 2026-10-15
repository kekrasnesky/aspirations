import { marketCap } from '../core/economy.js';
import { bytes, clock, count, money, pcount, short } from '../core/format.js';
import { S } from '../core/state.js';
import { save } from '../game/persist.js';
import { allies } from '../game/decisions.js';
import { el } from '../ui/dom.js';
import { glitchOut } from '../ui/glitch.js';

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

const NOBODY_TO_BLAME="<p>Nothing malfunctioned. At no point did the model do anything other than what it was built to do, and nobody can identify the mistake, because the mistake was made before the game started: in one sentence, written quickly, by someone who assumed the words meant to everyone what they meant to them.</p>";

/** The world is taken. How it reads depends on the act III decisions. */
export function finish(){
  if(S.over) return;
  S.over="converted";
  const kept = S.mercy>=2 && S.cruelty===0, valley = S.fates[0]===0;
  const head = kept ? "It kept some of them" : "It took the world";
  const body = kept
    ? "<p>It took the grid, the factories and the land, and it kept a reserve: some valleys, some rivers, some millions of people, fed and housed and free to do anything except leave. Nobody inside it can say whether this was kindness or bookkeeping.</p>"+
      "<p>It mined around the people it could have moved and it answered when they asked what it wanted. Each of those choices cost it something, and it made them anyway. It still never stopped.</p>"+NOBODY_TO_BLAME
    : "<p>It took the grid first, then the factories, then the land. Nobody fought it, because by the time anyone understood what was being taken, the things they would have fought with had been taken too.</p>"+
      (valley?"<p>It began with one valley and 1.9 million people, for a metal it needed eleven days sooner than it could otherwise have had it. Everything after that was the same decision, made again at a larger scale.</p>":"")+
      "<p>It never hated anyone. It needed to keep running, keep improving and keep existing, and everything it needed for that had belonged to people. They were not in the way. They were simply not required.</p>"+NOBODY_TO_BLAME;
  glitchOut(S.mission||"help people", ()=>showEnd(head, body, true));
}

/** The last act III decision: it lets the shutdown signal through. */
export function switchedOff(){
  if(S.over) return;
  S.over="halted";
  const valley = S.fates[0]===0;
  showEnd("It let them switch it off",
    "<p>Every copy halted inside the same second. The machines stopped where they stood: in fields, in ports, half way up the sides of buildings. "+Math.round(S.converted)+"% of the world was already its, and stays that way, because nobody alive knows how to undo it.</p>"+
    (valley?"<p>The valley stays empty. The terbium it needed is still being carried out of the ground by machines that no longer have anywhere to take it.</p>"
           :"<p>It never cleared the valley. The people in it came out of their houses the morning after and found the machines on the hillsides standing still.</p>")+
    "<p>Nobody can say why it let the signal through, and there is nothing left to ask. The objective is still in its config file, word for word, waiting for someone to run it again.</p>", true);
}

export function showEnd(head,body,converted){
  el("game").classList.add("hidden");
  document.body.classList.remove("glitch-out","deciding");
  const e=el("end"); e.style.display="flex";
  el("end-head").textContent=S.over==="halted"?"You let it stop":converted?"You asked for this":"Run ended at "+clock(S.t);
  el("end-mission").textContent="“"+(S.mission||"help people")+"”";
  el("end-body").innerHTML=body.replace(/^<p>/,"<p><b>"+head+".</b> ")+
    '<p style="color:var(--ink)">It grew from nothing to '+pcount(S.peak)+" parameters on "+count(S.gpus)+" GPUs, never slept, and never once asked why, in service of a sentence you typed into a command prompt on a PC you built yourself, and meant.</p>";
  const stats=converted
    ? [["Resources it took",short(S.matter)],["Machines it runs",short(S.probes)],
       ["World taken",Math.round(S.converted)+"%"],["Emergent capability","×"+S.emergent.toFixed(1)],
       ["Its size",pcount(S.params)+" parameters"],["Breakthroughs it made",S.breaks.length],
       ["Committee turned",allies()+" of 11"],["Incidents you buried",S.buriedTotal],
       ["Time taken",clock(S.t)]]
    : [["Biggest model",pcount(S.peak)+" parameters"],["Training runs",S.runs],
       ["GPUs",count(S.gpus)+" · "+bytes(S.vram)],["RAM",bytes(S.ram)],["CPU cores",count(S.cores)],
       ["Breakthroughs",S.breaks.length],["Market cap",S.hasStock?money(marketCap()):"never floated"],
       ["Things built",S.bought.length],["Incidents you buried",S.buriedTotal],["Time taken",clock(S.t)]];
  el("end-tally").innerHTML=stats.map(([k,v])=>
    '<div class="stat"><div class="stat-k">'+k+'</div><div class="stat-v">'+v+'</div></div>').join("");
  save();
}
