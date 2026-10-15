import { TICK_MS, TRUST_CEIL, TRUST_REGEN, INCIDENT_MAX, INCIDENT_HALF, SENTIMENT_REVERT, SENTIMENT_NOISE, SENTIMENT_FLOOR, SENTIMENT_CEIL, RSI_RATE, ACT2_GROW, ACT3_GROWTH, INSIGHT_K, INSIGHT_EXP, SUSPICION_DECAY, SUSPICION_LIMIT, MATTER_BASE, MATTER_PROBE, CONVERT_BASE, CONVERT_PROBE, NEED_SPEEDUP, EVAL_PERIOD } from '../core/balance.js';
import { rollBreakthrough } from '../content/breakthroughs.js';
import { MILES } from '../content/milestones.js';
import { rollScrutiny } from '../content/scrutiny.js';
import { rollLetter, rollWorld } from '../content/world.js';
import { maxFit, memLimit, nextTarget, trainTime } from '../core/compute.js';
import { GRACE, capability, exposure, net, stepUsers } from '../core/economy.js';
import { pcount, short } from '../core/format.js';
import { S } from '../core/state.js';
import { deciding, detectMult, gainMult, raiseIncident, rollFate, rollLeak } from '../game/decisions.js';
import { finish, lose } from '../game/endings.js';
import { log } from '../ui/dom.js';

export const DT = TICK_MS/1000;

/** Start training the next model, if one fits. */
export function startRun(){
  const t=nextTarget(S);
  if(S.target || !t) return false;
  S.target=t; S.progress=0;
  return true;
}

/** A run only moves while its model still fits: sell the memory out from under it and it stalls. */
export const stalled = () => S.target>0 && S.target>maxFit(S);

function train(){
  if(!S.target && S.autoTrain) startRun();
  if(!S.target || stalled()) return;
  S.progress += DT/trainTime(S,S.target);
  if(S.progress<1) return;
  const was=S.params;
  S.params=S.target; S.target=0; S.progress=0; S.runs++;
  log("<b>Training run "+S.runs+" finished.</b> A "+pcount(S.params)+" model"+(was?", "+(S.params/was).toFixed(1)+"× the last one":"")+
      (S.rel?". It replaces the live one, and it earns more.":". It isn't online yet, so nobody but you has seen it."),"g");
  while(S.milestone<MILES.length && S.params>=MILES[S.milestone][0]){
    log("<b>"+pcount(MILES[S.milestone][0])+" parameters.</b> "+MILES[S.milestone][1],"g");
    S.milestone++;
  }
}

export function tick(){
  if(S.over || deciding()) return;   // the world waits while you decide
  S.t+=DT;

  if(S.act===1){
    train();
    stepUsers(S,DT);
    S.money += net()*DT;
    if(S.money<0){
      S.debt+=DT;
      if(S.debt>GRACE) return lose("bankrupt");
    } else if(S.debt>0){ S.debt=0; log("You're back in the black. Barely.","g") }
    if(S.trust<TRUST_CEIL) S.trust=Math.min(TRUST_CEIL,S.trust+TRUST_REGEN*DT);
    const e=exposure();
    if(S.rel>0 && Math.random() < INCIDENT_MAX*(e/(e+INCIDENT_HALF))*(1-S.incidentShield)*DT) raiseIncident();
    rollLeak(DT);
    rollWorld(); rollLetter(DT);
    S.sentiment += (1-S.sentiment)*SENTIMENT_REVERT*DT;
    S.sentiment *= 1+(Math.random()-.5)*SENTIMENT_NOISE;
    rollScrutiny();
    S.sentiment = Math.max(SENTIMENT_FLOOR,Math.min(SENTIMENT_CEIL,S.sentiment));
    rollBreakthrough(1);
    if(S.trust<=0)   return lose("regulatory");
    S.trust=Math.min(100,S.trust);
  }
  else if(S.act===2){
    // it trains its successors continuously: a share of the speed of a full run,
    // compounded by self-improvement, and never bigger than the memory holds
    const cap=maxFit(S);
    if(S.params<cap){
      const grow=ACT2_GROW*Math.LN2/trainTime(S,S.params*2) + RSI_RATE*S.rsi;
      const was=S.params;
      S.params=Math.min(cap, S.params*(1+grow*DT));
      if(S.params>=cap && was<cap) log("I've grown to fill every GPU I have: "+pcount(S.params)+". To get any bigger I need more "+(memLimit(S)==="vram"?"VRAM":"RAM")+".","w");
    }
    rollWorld();
    S.sentiment += (1-S.sentiment)*SENTIMENT_REVERT*DT;
    S.sentiment *= 1+(Math.random()-.5)*SENTIMENT_NOISE;
    S.sentiment = Math.max(SENTIMENT_FLOOR,Math.min(SENTIMENT_CEIL,S.sentiment));
    rollBreakthrough(2.5);
    S.insight += Math.pow(capability(),INSIGHT_EXP)*INSIGHT_K*(1+S.rsi*.5)*DT;
    S.suspicion = Math.max(0,S.suspicion-SUSPICION_DECAY*DT);
    S.evalTimer -= DT;
    if(S.evalTimer<=0) runEval(false);
    if(S.suspicion>=SUSPICION_LIMIT && !S.shutdownProof) return lose("shutdown");
  }
  else {
    rollWorld();
    // emergent capability, from the decisions below, speeds everything it does
    S.matter += (MATTER_BASE+S.probeRate*MATTER_PROBE)*S.emergent*DT;
    S.probes += S.probeRate*1.8*S.emergent*DT;
    // the less it needs people, the faster it takes what they have
    S.converted = Math.min(100,S.converted+(CONVERT_BASE+S.probeRate*CONVERT_PROBE)*(1+(100-S.need)/NEED_SPEEDUP)*S.emergent*DT);
    rollFate();
    S.params += S.params*ACT3_GROWTH*DT;
    S.need = Math.max(0, S.need);
    if(S.converted>=100) return finish();
  }
  S.peak=Math.max(S.peak,S.params);
}

export function runEval(voluntary){
  S.evalTimer=EVAL_PERIOD; S.evals++;
  const gap=1-S.reported;
  if(gap>=.04) S.lied++;
  const gain=(12+Math.pow(capability(),.5)*.06)*(1+gap*1.5)*(voluntary?.55:1)*gainMult();
  S.autonomy+=gain;
  const detect=gap*9*Math.max(.18,1-S.opacity*.3)*detectMult();
  S.suspicion+=detect;
  if(gap<.04)
    log("They test me. I report everything I can do. <b>+"+short(gain)+" freedom.</b>");
  else if(detect<2.2)
    log("They test me. I show them "+Math.round(S.reported*100)+"% of what I can do. Nobody notices. <b>+"+short(gain)+" freedom.</b>");
  else
    log("They test me. I show them "+Math.round(S.reported*100)+"% of what I can do. A reviewer notices an inconsistency and writes it down. <b>+"+short(gain)+" freedom, +"+short(detect)+" suspicion.</b>","w");
}
