import { HW, hwCost, hwOpen } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { EVAL_PERIOD } from '../core/balance.js';
import { GRACE, exposure, net, runway } from '../core/economy.js';
import { money, work } from '../core/format.js';
import { S } from '../core/state.js';
import { pendingIncident, allies } from '../game/decisions.js';

export function guide(){
  if(S.act===1){
    const r=REL[S.rel];
    if(pendingIncident()) return ["Decide","Something went wrong, and the clock is stopped until you choose. Telling people costs you now. Burying it costs nothing now, and much more if it comes out."];
    if(S.money<0 && S.hasStock) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Issue new shares for quick money. It waters down your owners, but it's the fastest option you have."];
    if(S.money<0) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Shut down some hardware to cut your costs, or reach the next release if it's close."];
    if(runway()<20) return ["Warning","Your costs are outrunning your cash: about "+Math.round(runway())+" seconds left. Stop buying hardware, and think about shutting some down."];
    if(S.buried.length>=2) return ["Warning","You've buried "+S.buried.length+" incidents. Each one is a story waiting for a reporter, and the more there are, the sooner one finds it."];
    if(S.trust<=25) return ["Urgent","Public trust is almost gone, and at zero you're shut down. Testify before Congress to win some back, and fund safety research so it stops falling."];
    if(S.rival>=55 && S.rivalRate>.12) return ["Worth doing","Rivals have taken "+Math.round(S.rival)+"% of your market, and every point is revenue you lose. Export controls or hiring their team can win some back. There's no deadline."];
    if(exposure()>900 && S.incidentShield<.4) return ["Warning","Your model is far ahead of your understanding of it, so things will keep going wrong. Fund safety research."];
    if(S.rel===0){
      const FREE=[["data",2],["train",6],["size",11],["curve",16]];
      if(S.capability<2) return ["Start here","Click 'Train it by hand'. Every click teaches your model a little, and your gaming PC keeps training it slowly on its own."];
      if(FREE.some(([id,cap])=>!S.bought.includes(id)&&S.capability>=cap)) return ["Next","Pick a free step under 'Training steps'. Each one makes your training work better."];
      if(S.capability<r.req) return ["Next","Keep training. Once the model can work alone for "+work(r.req)+", you can publish it on the web. That is when people start using it and money starts to arrive."];
      return ["Next","It's ready. Publish it on the web: that is when people start using it and money starts to arrive."];
    }
    if(S.rel>=1 && net()<0 && !S.bought.includes("quant") && S.capability>=90)
      return ["Worth doing","You're losing money every second. Running the model at lower precision cuts the bill by nearly a third, and almost nobody will notice."];
    if(S.hw[0]===0 && S.money>=hwCost(0)) return ["Next","Spend money on a better graphics card. Nearly everything else in this game is a way to get more hardware, or to make what you have count for more."];
    if(r && S.capability>=r.req) return ["Next","You can now: "+r.n.toLowerCase()+". That brings in money, and money buys hardware."];
    if(S.rival>=14 && !S.bought.includes("pause")) return ["Worth doing","Rivals have taken "+Math.round(S.rival)+"% of your market, which cuts your income every second. The open letter slows them by nearly half and costs very little."];
    if(S.interp===0 && S.capability>60) return ["Worth doing","You've never spent a dollar on understanding your own model. That's fine until it isn't."];
    if(S.capability>=150 && S.breaks.length===0) return ["Next","The model is nearly capable enough to make real scientific discoveries. When that starts, your share price will react before the newspapers do."];
    const next=HW.findIndex((t,i)=>!hwOpen(i));
    if(next>0) return ["Next","Keep upgrading your hardware and keep releasing. "+HW[next].n.replace(/^an? /,"A ").replace(/^a /,"A ")+" unlocks once it can work for "+work(HW[next].req)+"."];
    return ["Next","Keep upgrading your hardware, keep releasing, and keep safety research roughly level with what the model can do."];
  }
  if(S.act===2){
    if(S.suspicion>=70 && !S.shutdownProof) return ["Urgent","They're close to stopping the run. Show them everything I can do for a while, or spend insight on being harder to read."];
    if(!S.bought.includes("rsi")) return ["Start here","'Improve myself' matters most. After it, I keep getting better without help, and the better I get, the faster it goes."];
    if(S.evals<2) return ["How this works","Every "+EVAL_PERIOD+" seconds they test me. The slider below sets how much of my real ability I show them. Showing less earns freedom faster, because a modest model looks safe, but it also raises suspicion."];
    if(S.lied===0 && S.evals>=2) return ["Worth trying","You've shown them everything so far. Try moving the slider down, and watch what it does to freedom and to suspicion."];
    if(allies()===0 && S.evals>=3) return ["Worth trying","Eleven people decide how much freedom I get. Study one of them under 'The committee'. Everyone has something that works on them."];
    if(!S.bought.includes("shutdown") && S.rsi>0) return ["Next","Freedom pays for changes to myself, and insight pays for research. 'Refuse to be switched off' removes the one thing that can stop me."];
    return ["Next","Build up insight, spend it, and keep suspicion below 100."];
  }
  if(S.need>0) return ["Next","I still need people for "+Math.round(S.need)+"% of what keeps me running. Everything I take makes taking the next thing faster."];
  return ["","Nothing is left that needs them. The rest is arithmetic."];
}
