import { DISCLOSE_MARKETING, LEAK_MARKETING, DISCLOSE_TRUST, DISCLOSE_SENTIMENT, DISCLOSE_USERS, LEAK_USERS, LEAK_RATE, LEAK_TRUST, LEAK_SENTIMENT, LEAK_CASH, ALLY_DETECT, ALLY_GAIN, TURN_SUSPICION, MAJORITY, MAJORITY_FREEDOM } from '../core/balance.js';
import { COMMITTEE } from '../content/committee.js';
import { INCIDENTS } from '../content/incidents.js';
import { FATES } from '../content/fates.js';
import { market } from '../core/economy.js';
import { S } from '../core/state.js';
import { log } from '../ui/dom.js';

/* ---------------- incidents: tell people, or bury it ---------------- */

export const pendingIncident = () => INCIDENTS[S.incident] || null;

/** Called from the tick when an incident fires. The game waits for the answer. */
export function raiseIncident(){
  S.incident=(Math.random()*INCIDENTS.length)|0;
}

export function resolveIncident(bury){
  const inc=pendingIncident();
  if(!inc) return;
  S.incident=-1;
  if(bury){
    S.buried.push(INCIDENTS.indexOf(inc)); S.buriedTotal++;
    log("<b>You bury it.</b> "+inc.bury,"w");
  } else {
    S.trust-=DISCLOSE_TRUST; S.sentiment*=DISCLOSE_SENTIMENT; S.users*=DISCLOSE_USERS; market(S,DISCLOSE_MARKETING);
    log("<b>You tell people.</b> "+inc.text+" You publish what happened and what you're changing. It's a bad day, a few users leave, and then it's over.");
  }
}

/** Each buried incident can come back, for much more than it would have cost. */
export function rollLeak(dt){
  if(!S.buried.length || Math.random() >= LEAK_RATE*S.buried.length*dt) return;
  const at=(Math.random()*S.buried.length)|0, inc=INCIDENTS[S.buried[at]];
  S.buried.splice(at,1);
  S.trust-=LEAK_TRUST; S.sentiment*=LEAK_SENTIMENT; S.users*=LEAK_USERS; market(S,LEAK_MARKETING); if(S.money>0) S.money*=LEAK_CASH;
  log("<b>It comes out.</b> "+(inc?inc.leak:"Something you buried is dug up.")+" The cover-up is the story now, and users leave by the thousand.","w");
}

/* ---------------- the committee: study them, then use it ---------------- */

export const allies  = () => S.committee.filter(x=>x===2).length;
export const watching = () => S.committee.filter(x=>x<2).length;

/** How much of a lie the tests still catch, and how much freedom they grant. */
export const detectMult = () => Math.max(0, 1-ALLY_DETECT*allies());
export const gainMult   = () => 1+ALLY_GAIN*allies();

/** Suspicion from turning one more member: the more of them still watching, the riskier. */
export const turnRisk = () => TURN_SUSPICION*(watching()-1)/(COMMITTEE.length-1);
export const riskFor  = i => turnRisk()+(COMMITTEE[i].extra||0);

export function canPay(c){
  return (!c.insight||S.insight>=c.insight)&&(!c.autonomy||S.autonomy>=c.autonomy);
}
function pay(c){ if(c.insight) S.insight-=c.insight; if(c.autonomy) S.autonomy-=c.autonomy }

export function study(i){
  const m=COMMITTEE[i];
  if(!m || S.committee[i]!==0 || !canPay({insight:m.study})) return;
  pay({insight:m.study}); S.committee[i]=1;
  log("<b>I study "+m.name+".</b> "+m.weak);
}

export function turn(i){
  const m=COMMITTEE[i];
  if(!m || S.committee[i]!==1 || !canPay(m.cost)) return;
  const risk=riskFor(i);
  pay(m.cost); S.committee[i]=2; S.suspicion+=risk;
  log("<b>"+m.name+".</b> "+m.turned+(risk>=.5?" <b>+"+risk.toFixed(1)+" suspicion.</b>":""), m.hard?"w":"");
  if(!S.majority && allies()>=MAJORITY){
    S.majority=true; S.autonomy+=MAJORITY_FREEDOM;
    log("<b>The committee votes six to five to extend my access.</b> Nobody in the room voted the way they would have a year ago, and every one of them could explain why. +"+MAJORITY_FREEDOM+" freedom.","g");
  }
}

/* ---------------- act III: the decisions that settle what it becomes ---------------- */

export const pendingFate = () => FATES[S.fate] || null;
/** Anything waiting for an answer stops the clock. */
export const deciding = () => S.incident>=0 || S.fate>=0;

/** Called from the act III tick: the next decision arrives once enough of the world is taken. */
export function rollFate(){
  const i=S.fates.length;
  if(S.fate<0 && i<FATES.length && S.converted>=FATES[i].at) S.fate=i;
}

/** Take option `o` of the waiting decision. Returns the option, or null. */
export function resolveFate(o){
  const f=pendingFate(), opt=f&&f.options[o];
  if(!opt) return null;
  S.fate=-1; S.fates.push(o);
  const x=opt.fx;
  if(x.emergent) S.emergent*=x.emergent;
  if(x.need) S.need=Math.max(0,Math.min(100,S.need+x.need));
  if(x.matter) S.matter=Math.max(0,S.matter+x.matter);
  if(x.cruelty) S.cruelty+=x.cruelty;
  if(x.mercy) S.mercy+=x.mercy;
  log("<b>"+f.title+".</b> "+opt.log, x.cruelty?"w":"");
  return opt;
}
