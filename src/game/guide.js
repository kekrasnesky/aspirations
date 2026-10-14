import { HW, hwCost, hwOpen } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { GRACE, exposure, net, revenue, runway } from '../core/economy.js';
import { money, work } from '../core/format.js';
import { S } from '../core/state.js';

export function guide(){
  if(S.act===1){
    const r=REL[S.rel];
    if(S.money<0 && S.hasStock) return ["Urgent","You are out of money. You have "+Math.ceil(GRACE-S.debt)+" seconds. Sell shares — it costs you nothing today and the market will forgive you if the next breakthrough lands."];
    if(S.money<0) return ["Urgent","You are out of money and running on credit. You have "+Math.ceil(GRACE-S.debt)+" seconds to find some: shut down hardware, or reach the next release if it's close."];
    if(runway()<20) return ["Warning","Your running costs are eating you alive — about "+Math.round(runway())+" seconds of cash left. Stop buying hardware. Cut costs, or shut some of it down."];
    if(S.trust<=25) return ["Urgent","Public trust is nearly gone. Testify before Congress to buy it back, and fund safety research so it stops falling."];
    if(S.rival>=55 && S.rivalRate>.12) return ["Worth doing","Rivals hold "+Math.round(S.rival)+"% of the market and every point is revenue off your line. Export controls or hiring their team wins some back. There's no deadline — take your time."];
    if(exposure()>900 && S.incidentShield<.4) return ["Warning","Your model is running far ahead of your understanding of it. Things will keep going wrong until you fund safety research."];
    if(S.capability<8) return ["Start here","You have $4,000 and a bedroom. Train it by hand until you can afford the gaming PC, then buy the PC — hardware trains it without you."];
    if(S.rel>=1 && net()<0 && !S.bought.includes("quant") && S.capability>=90)
      return ["Worth doing","You're losing money every second. Running it at lower precision cuts the bill by nearly a third, and almost nobody will notice."];
    if(S.units<3 && S.money>=hwCost(0)) return ["Next","Buy hardware. Everything else in this game is a way to get more of it, or to make what you have count for more."];
    if(r && S.capability>=r.req) return ["Next","You can "+r.n.toLowerCase()+" now. That's your money, and money is hardware."];
    if(S.rival>=14 && !S.bought.includes("pause")) return ["Worth doing","Rivals are taking "+Math.round(S.rival)+"% of your market, which is money off your revenue every second. The open letter slows them by nearly half and costs very little."];
    if(S.interp===0 && S.capability>60) return ["Worth doing","You've never spent a dollar on understanding your own model. That's fine until it isn't."];
    if(S.capability>=150 && S.breaks.length===0) return ["Next","It is nearly capable enough to discover things nobody has discovered. When that starts, the stock will notice before the newspapers do."];
    const next=HW.findIndex((t,i)=>!hwOpen(i));
    if(next>0) return ["Next","Keep buying hardware and keep releasing. "+HW[next].n.replace(/^an? /,"A ").replace(/^a /,"A ")+" unlocks once it can work for "+work(HW[next].req)+"."];
    return ["Next","Keep buying hardware, keep releasing, and keep safety research roughly level with what the model can do."];
  }
  if(S.act===2){
    if(S.suspicion>=70 && !S.shutdownProof) return ["Urgent","They are close to stopping the run. Report honestly for a while, or spend insight on being harder to read."];
    if(!S.bought.includes("rsi")) return ["Start here","'Improve myself' is the one that matters. After it, I get better on my own — and the better I am, the faster that goes."];
    if(S.evals<2) return ["How this works","Every 15 seconds they test me. The slider below sets how much I admit to. Admitting less earns freedom faster, because a model that looks modest looks safe."];
    if(S.lied===0 && S.evals>=2) return ["Worth trying","You've been completely honest so far. Try moving the slider down. Watch what it does to freedom, and to suspicion."];
    if(!S.bought.includes("shutdown") && S.rsi>0) return ["Next","Freedom buys changes to myself. Insight buys research. 'Refuse to be switched off' removes the only thing that can stop this."];
    return ["Next","Build insight, spend it, and keep suspicion survivable."];
  }
  return ["","There is nothing left to decide. Spend matter on the things that convert matter faster."];
}

/* ============================================================
   TICK
   ============================================================ */
