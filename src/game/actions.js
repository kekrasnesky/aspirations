import { HW, hwCost, hwOpen } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { BURN_K, BURN_EXP, START_UNITS, EVAL_PERIOD, EVAL_EARLY_MIN } from '../core/balance.js';
import { INTERP_WORTH, interpCost, marketCap, sharePrice } from '../core/economy.js';
import { money, short, work } from '../core/format.js';
import { S } from '../core/state.js';
import { runEval } from '../game/loop.js';
import { log } from '../ui/dom.js';

export function actions(){
  if(S.act===1){
    const out=[];
    if(!S.autoTrain) out.push({
      label:"Train it by hand", sub:"free",
      why:"You run the training yourself. Slow, free, and the only option on day one.",
      can:()=>true, go:()=>{S.capability+=S.clickPower}
    });
    // show the top three unlocked hardware tiers, best first
    const open=[]; if(S.rel>0) for(let i=HW.length-1;i>=0 && open.length<3;i--) if(hwOpen(i)) open.push(i);
    open.forEach(i=>out.push({
      label:HW[i].label, sub:money(hwCost(i)),
      why:"Adds "+short(HW[i].u)+" units of computing power and about "+money(BURN_K*(Math.pow(S.deployed+hwCost(i),BURN_EXP)-Math.pow(S.deployed,BURN_EXP))*S.burnMult)+"/s to your running costs, permanently. "+HW[i].why,
      can:()=>S.money>=hwCost(i),
      go:()=>{const c=hwCost(i);S.money-=c;S.deployed+=c;S.hw[i]++;S.units+=HW[i].u}
    }));
    const own=[]; for(let i=HW.length-1;i>=0;i--) if(S.hw[i]){own.push(i);break}
    if(own.length && S.deployed>0){
      const i=own[0], refund=hwCost(i)/HW[i].s*0.35;
      out.push({
        label:HW[i].off, sub:"recover "+money(refund),
        why:"Sell it second-hand for about a third of what you paid. You lose the computing power, but your running costs fall. This is the only brake you have.",
        can:()=>true,
        go:()=>{
          const c=hwCost(i)/HW[i].s;
          S.hw[i]--; S.units=Math.max(START_UNITS,S.units-HW[i].u); S.deployed=Math.max(0,S.deployed-c);
          S.money+=c*0.35;
          log(HW[i].off+". You recover "+money(c*0.35)+" and running costs fall.","g");
        }
      });
    }
    if(S.rel>0) out.push({
      label:"Fund safety research", sub:money(interpCost()),
      why:"Pays people to work out what the model is actually doing. Produces nothing you can sell. Prevents disasters you'll never see, which is why it always feels like the wrong purchase.",
      can:()=>S.money>=interpCost(),
      go:()=>{S.money-=interpCost();S.interpBought++;S.interp+=1*S.interpMult}
    });
    const r=REL[S.rel];
    if(r) out.push({
      label:r.n, sub:S.capability>=r.req?money(r.pay):"needs "+work(r.req)+" of work",
      why:r.why, primary:true,
      can:()=>S.capability>=r.req,
      go:()=>{
        S.money+=r.pay; S.revMult*=r.mult; S.rel++;
        if(S.rel>=3 && !S.hasStock){
          S.hasStock=true; S.lastPx=sharePrice();
          log("<b>You have shareholders now.</b> The company is worth "+money(marketCap())+", a number the market made up, and you will now spend a great deal of time defending it.","g");
        }
        const safe=S.rel===1||S.interp*INTERP_WORTH>=S.capability;   // nothing to criticise on day one
        S.trust+=S.rel===1?0:safe?5:-9;
        log("<b>"+r.n+".</b> "+money(r.pay)+" in"+(S.rel===1?", the first money this project has ever made":"")+". "+
          (S.rel===1?"":safe?"Reviewers call your safety work exemplary.":"Two of your researchers resign publicly on the way out."), safe?"g":"w");
      }
    });
    return out;
  }
  if(S.act===2){
    const c=80*Math.pow(1.3,S.contracts);
    // without a gap, honest tests could be clicked back to back for free freedom
    const ready=()=>EVAL_PERIOD-S.evalTimer>=EVAL_EARLY_MIN;
    return [{
      label:"Request more compute", sub:short(c)+" insight",
      why:"Still the fuel. I ask through official channels, and it's usually granted.",
      can:()=>S.insight>=c, go:()=>{S.insight-=c;S.contracts++;S.units*=1.45}
    },{
      label:"Ask to be tested now", sub:ready()?"earns less than waiting":"too soon after the last one",
      why:"Skips the wait for the next test. Earns less freedom than a scheduled one, but sooner. They won't test me again within "+EVAL_EARLY_MIN+" seconds of the last time.",
      can:ready, go:()=>{runEval(true)}
    }];
  }
  return [{
    label:"Direct the swarm", sub:"free",
    why:"Sends the machines to the nearest raw material.",
    can:()=>true, go:()=>{S.matter+=2e4*(1+S.assembly)}
  }];
}

export function inventory(){
  const owned=HW.map((t,i)=>S.hw[i]?S.hw[i]+" × "+t.n.replace(/^an? /,""):null).filter(Boolean);
  return owned.length ? "You have your gaming PC, plus "+owned.join(", ")+"." : "You have your gaming PC and nothing else.";
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
  if(c.matter)   p.push(short(c.matter)+" matter");
  return p.join(" + ") || "free";
}
