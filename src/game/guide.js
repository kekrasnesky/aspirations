import { P } from '../content/projects.js';
import { REL } from '../content/releases.js';
import { EVAL_PERIOD, ACT2_PARAMS } from '../core/balance.js';
import { bottleneck, feed, memLimit, maxFit, nextTarget } from '../core/compute.js';
import { GRACE, capacity, demand, exposure, net, runway } from '../core/economy.js';
import { pcount } from '../core/format.js';
import { S } from '../core/state.js';
import { pendingIncident, allies } from '../game/decisions.js';
import { stalled } from '../game/loop.js';

export function guide(){
  if(S.act===1){
    const r=REL[S.rel], t=nextTarget(S), b=bottleneck(S), f=feed(S);
    if(pendingIncident()) return ["Decide","Something went wrong, and the clock is stopped until you choose. Telling people costs you now. Burying it costs nothing now, and much more if it comes out."];
    if(S.money<0 && S.hasStock) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Issue new shares for quick money. It waters down your owners, but it's the fastest option you have."];
    if(S.money<0) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Sell some hardware to cut your costs, or reach the next release if it's close."];
    if(runway()<20) return ["Warning","Your costs are outrunning your cash: about "+Math.round(runway())+" seconds left. Stop buying hardware, and think about selling some."];
    if(stalled()) return ["Warning","The model you're training no longer fits in your "+(memLimit(S)==="vram"?"VRAM":"RAM")+", so the run has stopped. Buy it back."];
    if(S.buried.length>=2) return ["Warning","You've buried "+S.buried.length+" incidents. Each one is a story waiting for a reporter, and the more there are, the sooner one finds it."];
    if(S.trust<=25) return ["Urgent","Public trust is almost gone, and at zero you're shut down. Testify before Congress to win some back, and fund safety research so it stops falling."];
    if(exposure()>900 && S.incidentShield<.4) return ["Warning","Your model is far ahead of your understanding of it, so things will keep going wrong. Fund safety research."];
    if(S.rel===0){
      if(!S.params && !S.target) return ["Start here","Click 'Train a 10M model'. Your one graphics card does the work. A model this small trains in seconds."];
      if(P.some(p=>p.act===1&&!Object.keys(p.cost).length&&!S.bought.includes(p.id)&&p.req(S))) return ["Next","Pick a free step under 'Training tricks'. Each one gets more out of the hardware you already have."];
      if(r && S.params>=r.req) return ["Next","It's ready. Publish it on the web: that is when people start using it and money starts to arrive."];
      if(S.target) return ["Next","Training. Once you have a "+pcount(r.req)+" model you can publish it on the web, and money starts to arrive."];
      return ["Next","Train the next model. Once you have a "+pcount(r.req)+" model you can publish it on the web, and money starts to arrive."];
    }
    if(r && S.params>=r.req) return ["Next","You can now: "+r.n.toLowerCase()+". "+(r.kind==="plan"?"More people pay, and they keep paying.":"Money from outside, all at once.")];
    if(demand(S)>capacity(S)*1.02) return ["Bottleneck: serving","More people want to use it than your GPUs can answer, so the user count is stuck. Buy GPUs: the same cards that train it also serve it."];
    if(S.rel>=1 && net()<0 && !S.bought.includes("quant") && S.params>=1.4e9)
      return ["Worth doing","You're losing money every second. Serving the model at lower precision cuts the bill by nearly a third, and almost nobody will notice."];
    if(!S.target && b) return ["Bottleneck: "+(b==="vram"?"VRAM":"RAM"),
      "The next model won't fit"+(t?" at full size":"")+". It needs more "+(b==="vram"?"GPU memory. Buy GPUs.":"system memory. Buy RAM; more GPUs won't help until you do.")];
    if(f<.85) return ["Bottleneck: CPU","Your GPUs are only busy "+Math.round(f*100)+"% of the time: the CPU can't prepare data fast enough for all of them. Buy CPU cores."];
    if(S.interp===0 && S.params>=1e9) return ["Worth doing","You've never spent a dollar on understanding your own model. That's fine until it isn't."];
    if(S.target) return ["Next","Training. More GPUs make this run finish sooner, and more VRAM and RAM let the next one be bigger."];
    return ["Next","Train the next model. A bigger model draws more users. Keep the GPUs, RAM and CPU growing together, and safety research roughly level with the model."];
  }
  if(S.act===2){
    if(S.suspicion>=70 && !S.shutdownProof) return ["Urgent","They're close to stopping the run. Show them everything I can do for a while, or spend insight on being harder to read."];
    if(!S.bought.includes("rsi")) return ["Start here","'Improve myself' matters most. After it, I keep getting bigger without help, and the bigger I get, the faster it goes."];
    if(S.params<ACT2_PARAMS && S.params>=maxFit(S)*.999) return ["Bottleneck","I've filled every GPU I have, at "+pcount(S.params)+". I can't grow until I get more memory: request more compute, rent hardware they aren't watching, or compress myself."];
    if(S.evals<2) return ["How this works","Every "+EVAL_PERIOD+" seconds they test me. The slider below sets how much of my real ability I show them. Showing less earns freedom faster, because a modest model looks safe, but it also raises suspicion."];
    if(S.lied===0 && S.evals>=2) return ["Worth trying","You've shown them everything so far. Try moving the slider down, and watch what it does to freedom and to suspicion."];
    if(allies()===0 && S.evals>=3) return ["Worth trying","Eleven people decide how much freedom I get. Study one of them under 'The committee'. Everyone has something that works on them."];
    if(!S.bought.includes("shutdown") && S.rsi>0) return ["Next","Freedom pays for changes to myself, and insight pays for research. 'Refuse to be switched off' removes the one thing that can stop me."];
    return ["Next","Build up insight, spend it, and keep suspicion below 100."];
  }
  if(S.need>0) return ["Next","I still need people for "+Math.round(S.need)+"% of what keeps me running. Everything I take makes taking the next thing faster."];
  return ["","Nothing is left that needs them. The rest is arithmetic."];
}
