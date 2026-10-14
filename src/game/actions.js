import { HW, hwCost } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { EVAL_PERIOD, EVAL_EARLY_MIN, COMPUTE_REQUEST, SELL_BACK } from '../core/balance.js';
import { applyHw, nextTarget, trainTime } from '../core/compute.js';
import { INTERP_WORTH, capability, interpCost, marketCap, sharePrice } from '../core/economy.js';
import { money, pcount, secs, short } from '../core/format.js';
import { S } from '../core/state.js';
import { runEval, startRun } from '../game/loop.js';
import { log } from '../ui/dom.js';

/** Buy one of hardware tier i. */
export function buyHw(i){
  const c=hwCost(i);
  if(S.money<c) return;
  S.money-=c; S.deployed+=c; S.hw[i]++; applyHw(S,HW[i],1);
}

/** The owned tier that was dearest to buy: the one selling saves most on. */
export function sellable(){
  let best=-1, price=0;
  HW.forEach((h,i)=>{ if(S.hw[i]){ const p=hwCost(i)/h.s; if(p>price){price=p;best=i} } });
  return best;
}

export function actions(){
  if(S.act===1){
    const out=[], t=nextTarget(S);
    if(S.target) out.push({
      label:"Training a "+pcount(S.target)+" model", sub:"in progress", primary:true,
      why:"The GPUs are working through the data. Faster GPUs, or enough CPU to keep them fed, make it finish sooner.",
      can:()=>false, go:()=>{}
    });
    else if(!S.autoTrain || !t) out.push({
      label:t?"Train a "+pcount(t)+" model":"Train a bigger model", sub:t?"about "+secs(trainTime(S,t)):"doesn't fit",
      why:t?(S.params?"Up to four times the size of the last one, as big as your hardware can hold.":"Your first model. Tiny, but it's a start.")
           :"Your hardware can't hold anything bigger than what you've got. Add VRAM (GPUs) or RAM, whichever is the bottleneck.",
      primary:!!t, can:()=>!S.target && nextTarget(S)>0, go:()=>{startRun()}
    });
    const r=REL[S.rel];
    if(r) out.push({
      label:r.n, sub:S.params>=r.req?money(r.pay):"needs a "+pcount(r.req)+" model",
      why:r.why, primary:S.params>=r.req,
      can:()=>S.params>=r.req,
      go:()=>{
        S.money+=r.pay; S.revMult*=r.mult; S.rel++;
        if(S.rel>=3 && !S.hasStock){
          S.hasStock=true; S.lastPx=sharePrice();
          log("<b>You have shareholders now.</b> The company is worth "+money(marketCap())+", a number the market made up, and you will now spend a great deal of time defending it.","g");
        }
        const safe=S.rel===1||S.interp*INTERP_WORTH>=capability();   // nothing to criticise on day one
        S.trust+=S.rel===1?0:safe?5:-9;
        log("<b>"+r.n+".</b> "+money(r.pay)+" in"+(S.rel===1?", the first money this project has ever made":"")+". "+
          (S.rel===1?"":safe?"Reviewers call your safety work exemplary.":"Two of your researchers resign publicly on the way out."), safe?"g":"w");
      }
    });
    if(S.rel>0) out.push({
      label:"Fund safety research", sub:money(interpCost()),
      why:"Pays people to work out what the model is actually doing. Produces nothing you can sell. Prevents disasters you'll never see, which is why it always feels like the wrong purchase.",
      can:()=>S.money>=interpCost(),
      go:()=>{S.money-=interpCost();S.interpBought++;S.interp+=1*S.interpMult}
    });
    const i=sellable();
    if(i>=0){
      const paid=hwCost(i)/HW[i].s, back=paid*SELL_BACK;
      out.push({
        label:"Sell the "+HW[i].n, sub:"recover "+money(back),
        why:"Sell it second-hand for about a third of what you paid. You lose what it adds, but your running costs fall. This is the only brake you have.",
        can:()=>true,
        go:()=>{
          S.hw[i]--; applyHw(S,HW[i],-1); S.deployed=Math.max(0,S.deployed-paid);
          S.money+=back;
          log("You sell the "+HW[i].n+" and recover "+money(back)+". Running costs fall.","g");
        }
      });
    }
    return out;
  }
  if(S.act===2){
    const c=80*Math.pow(1.3,S.contracts);
    // without a gap, honest tests could be clicked back to back for free freedom
    const ready=()=>EVAL_PERIOD-S.evalTimer>=EVAL_EARLY_MIN;
    return [{
      label:"Request more compute", sub:short(c)+" insight",
      why:"More GPUs, more memory, more CPUs: "+Math.round((COMPUTE_REQUEST-1)*100)+"% more of each. Still the fuel, and the only way I grow past what I can fit. I ask through official channels, and it's usually granted.",
      can:()=>S.insight>=c, go:()=>{S.insight-=c;S.contracts++;for(const k of ["gpus","vram","tflops","ram","cores"]) S[k]*=COMPUTE_REQUEST}
    },{
      label:"Ask to be tested now", sub:ready()?"earns less than waiting":"too soon after the last one",
      why:"Skips the wait for the next test. Earns less freedom than a scheduled one, but sooner. They won't test me again within "+EVAL_EARLY_MIN+" seconds of the last time.",
      can:ready, go:()=>{runEval(true)}
    }];
  }
  return [{
    label:"Take what's nearest", sub:"free",
    why:"Sends my machines to the nearest thing worth having: a warehouse, a substation, a port. Nobody there stops them.",
    can:()=>true, go:()=>{S.matter+=2e4*(1+S.assembly)}
  }];
}

export function affordable(c){
  return (!c.money||S.money>=c.money)&&(!c.insight||S.insight>=c.insight)
      &&(!c.autonomy||S.autonomy>=c.autonomy)&&(!c.matter||S.matter>=c.matter);
}

export function costLabel(c){
  const p=[];
  if(c.money)    p.push(money(c.money));
  if(c.insight)  p.push(short(c.insight)+" insight");
  if(c.autonomy) p.push(short(c.autonomy)+" freedom");
  if(c.matter)   p.push(short(c.matter)+" resources");
  return p.join(" + ") || "free";
}
