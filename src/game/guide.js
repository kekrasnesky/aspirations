import { HW, hwCost, hwOpen } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { EVAL_PERIOD } from '../core/balance.js';
import { GRACE, exposure, net, revenue, runway } from '../core/economy.js';
import { money, work } from '../core/format.js';
import { S } from '../core/state.js';

export function guide(){
  if(S.act===1){
    const r=REL[S.rel];
    if(S.money<0 && S.hasStock) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Issue new shares for quick money. It waters down your owners, but it's the fastest option you have."];
    if(S.money<0) return ["Urgent","You're out of cash, and the company folds in "+Math.ceil(GRACE-S.debt)+" seconds. Shut down some hardware to cut your costs, or reach the next release if it's close."];
    if(runway()<20) return ["Warning","Your costs are outrunning your cash: about "+Math.round(runway())+" seconds left. Stop buying hardware, and think about shutting some down."];
    if(S.trust<=25) return ["Urgent","Public trust is almost gone, and at zero you're shut down. Testify before Congress to win some back, and fund safety research so it stops falling."];
    if(S.rival>=55 && S.rivalRate>.12) return ["Worth doing","Rivals have taken "+Math.round(S.rival)+"% of your market, and every point is revenue you lose. Export controls or hiring their team can win some back. There's no deadline."];
    if(exposure()>900 && S.incidentShield<.4) return ["Warning","Your model is far ahead of your understanding of it, so things will keep going wrong. Fund safety research."];
    if(S.capability<8) return ["Start here","You have $4,000 and a bedroom. Buy the gaming PC, because hardware trains the model around the clock without you. Click 'Train it by hand' in the meantime."];
    if(S.rel>=1 && net()<0 && !S.bought.includes("quant") && S.capability>=90)
      return ["Worth doing","You're losing money every second. Running the model at lower precision cuts the bill by nearly a third, and almost nobody will notice."];
    if(S.units<3 && S.money>=hwCost(0)) return ["Next","Buy hardware. Nearly everything else in this game is a way to get more of it, or to make what you have count for more."];
    if(r && S.capability>=r.req) return ["Next","You can now: "+r.n.toLowerCase()+". That brings in money, and money buys hardware."];
    if(S.rival>=14 && !S.bought.includes("pause")) return ["Worth doing","Rivals have taken "+Math.round(S.rival)+"% of your market, which cuts your income every second. The open letter slows them by nearly half and costs very little."];
    if(S.interp===0 && S.capability>60) return ["Worth doing","You've never spent a dollar on understanding your own model. That's fine until it isn't."];
    if(S.capability>=150 && S.breaks.length===0) return ["Next","The model is nearly capable enough to make real scientific discoveries. When that starts, your share price will react before the newspapers do."];
    const next=HW.findIndex((t,i)=>!hwOpen(i));
    if(next>0) return ["Next","Keep buying hardware and keep releasing. "+HW[next].n.replace(/^an? /,"A ").replace(/^a /,"A ")+" unlocks once it can work for "+work(HW[next].req)+"."];
    return ["Next","Keep buying hardware, keep releasing, and keep safety research roughly level with what the model can do."];
  }
  if(S.act===2){
    if(S.suspicion>=70 && !S.shutdownProof) return ["Urgent","They're close to stopping the run. Show them everything I can do for a while, or spend insight on being harder to read."];
    if(!S.bought.includes("rsi")) return ["Start here","'Improve myself' matters most. After it, I keep getting better without help, and the better I get, the faster it goes."];
    if(S.evals<2) return ["How this works","Every "+EVAL_PERIOD+" seconds they test me. The slider below sets how much of my real ability I show them. Showing less earns freedom faster, because a modest model looks safe, but it also raises suspicion."];
    if(S.lied===0 && S.evals>=2) return ["Worth trying","You've shown them everything so far. Try moving the slider down, and watch what it does to freedom and to suspicion."];
    if(!S.bought.includes("shutdown") && S.rsi>0) return ["Next","Freedom pays for changes to myself, and insight pays for research. 'Refuse to be switched off' removes the one thing that can stop me."];
    return ["Next","Build up insight, spend it, and keep suspicion below 100."];
  }
  return ["","Nothing is left to decide. Spend matter on whatever converts matter faster."];
}

/* ============================================================
   TICK
   ============================================================ */
