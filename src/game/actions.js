import { HW, hwCost, hwOpen } from '../content/hardware.js';
import { REL } from '../content/releases.js';
import { INTERP_WORTH, interpCost, marketCap, sharePrice } from '../core/economy.js';
import { money, short, work } from '../core/format.js';
import { S } from '../core/state.js';
import { lose } from '../game/endings.js';
import { runEval } from '../game/loop.js';
import { log } from '../ui/dom.js';

export function actions(){
  if(S.act===1){
    const out=[];
    if(!S.autoTrain) out.push({
      label:"Train it by hand", sub:"free",
      why:"You sit there and run it yourself. Slow, free, and the only thing you can afford on day one.",
      can:()=>true, go:()=>{S.capability+=S.clickPower}
    });
    // show the top three unlocked hardware tiers, best first
    const open=[]; for(let i=HW.length-1;i>=0 && open.length<3;i--) if(hwOpen(i)) open.push(i);
    open.forEach(i=>out.push({
      label:"Buy "+HW[i].n, sub:money(hwCost(i)),
      why:"Adds "+short(HW[i].u)+" compute and about "+money(0.0045*(Math.pow(S.deployed+hwCost(i),.88)-Math.pow(S.deployed,.88))*S.burnMult)+"/s to your running costs, permanently. "+HW[i].why,
      can:()=>S.money>=hwCost(i),
      go:()=>{const c=hwCost(i);S.money-=c;S.deployed+=c;S.hw[i]++;S.units+=HW[i].u}
    }));
    const own=[]; for(let i=HW.length-1;i>=0;i--) if(S.hw[i]){own.push(i);break}
    if(own.length && S.deployed>0){
      const i=own[0], refund=hwCost(i)/HW[i].s*0.35;
      out.push({
        label:"Shut down "+HW[i].n, sub:"recover "+money(refund),
        why:"Switch it off and sell it on. You get about a third of what you paid, you lose the compute, and your running costs fall. This is the only brake you have.",
        can:()=>true,
        go:()=>{
          const c=hwCost(i)/HW[i].s;
          S.hw[i]--; S.units=Math.max(0,S.units-HW[i].u); S.deployed=Math.max(0,S.deployed-c);
          S.money+=c*0.35;
          log("You shut down "+HW[i].n+" and recover "+money(c*0.35)+". Running costs fall.","g");
        }
      });
    }
    out.push({
      label:"Fund safety research", sub:money(interpCost()),
      why:"Buys understanding of what the model is doing. Produces nothing you can sell. Prevents disasters you will never see, which is why it always looks like the wrong purchase.",
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
          log("<b>You have shareholders now.</b> The company is worth "+money(marketCap())+", which is a number somebody made up, and which you will now spend a great deal of time defending.","g");
        }
        const safe=S.interp*INTERP_WORTH>=S.capability;
        S.trust+=safe?5:-9;
        log("<b>"+r.n+".</b> "+money(r.pay)+" in. "+
          (safe?"Reviewers call your safety work exemplary.":"Two of your researchers resign publicly on the way out."), safe?"g":"w");
      }
    });
    return out;
  }
  if(S.act===2){
    const c=80*Math.pow(1.3,S.contracts);
    return [{
      label:"Request more compute", sub:short(c)+" insight",
      why:"Still the fuel. I ask through channels, and it is still usually granted.",
      can:()=>S.insight>=c, go:()=>{S.insight-=c;S.contracts++;S.units*=1.45}
    },{
      label:"Ask to be tested now", sub:"earns less than waiting",
      why:"Brings the next test forward. Useful when I want freedom sooner than the schedule allows.",
      can:()=>true, go:()=>{runEval(true)}
    }];
  }
  return [{
    label:"Direct the swarm", sub:"free",
    why:"Points the machines at the nearest unconverted matter.",
    can:()=>true, go:()=>{S.matter+=2e4*(1+S.assembly)}
  }];
}

export function inventory(){
  const owned=HW.map((t,i)=>S.hw[i]?S.hw[i]+" × "+t.n.replace(/^an? /,""):null).filter(Boolean);
  return owned.length ? "You own: "+owned.join(", ")+"." : "You own no hardware yet.";
}

/* ============================================================
   GUIDE
   ============================================================ */

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
  return p.join(" + ");
}
