import { TICK_MS, CAPABILITY_RATE, COMPUTE_EXP, TRUST_CEIL, TRUST_REGEN, INCIDENT_MAX, INCIDENT_HALF, RIVAL_CAP, SENTIMENT_REVERT, SENTIMENT_NOISE, SENTIMENT_FLOOR, SENTIMENT_CEIL, RSI_RATE, INSIGHT_K, INSIGHT_EXP, SUSPICION_DECAY, SUSPICION_LIMIT, MATTER_BASE, MATTER_PROBE, CONVERT_BASE, CONVERT_PROBE, EVAL_PERIOD } from '../core/balance.js';
import { rollBreakthrough } from '../content/breakthroughs.js';
import { INCIDENTS } from '../content/incidents.js';
import { MILES } from '../content/milestones.js';
import { rollScrutiny } from '../content/scrutiny.js';
import { rollWorld } from '../content/world.js';
import { GRACE, exposure, net, workRate } from '../core/economy.js';
import { short, work } from '../core/format.js';
import { S } from '../core/state.js';
import { finish, lose } from '../game/endings.js';
import { log } from '../ui/dom.js';

export const DT = TICK_MS/1000;

export function tick(){
  if(S.over) return;
  S.t+=DT;

  if(S.act===1){
    S.capability += CAPABILITY_RATE*Math.pow(1+S.units,COMPUTE_EXP)*S.computeMult*DT;
    S.money += net()*DT;
    if(S.money<0){
      S.debt+=DT;
      if(S.debt>GRACE) return lose("bankrupt");
    } else if(S.debt>0){ S.debt=0; log("You're back in the black. Barely.","g") }
    S.rival = Math.min(RIVAL_CAP, S.rival + S.rivalRate*DT);
    if(S.trust<TRUST_CEIL) S.trust=Math.min(TRUST_CEIL,S.trust+TRUST_REGEN*DT);
    const e=exposure();
    if(Math.random() < INCIDENT_MAX*(e/(e+INCIDENT_HALF))*(1-S.incidentShield)*DT){
      S.trust-=6; S.money*=.92; S.sentiment*=.80;
      log(INCIDENTS[(Math.random()*INCIDENTS.length)|0],"w");
    }
    S.workDone += workRate()*DT; rollWorld();
    S.sentiment += (1-S.sentiment)*SENTIMENT_REVERT*DT;
    S.sentiment *= 1+(Math.random()-.5)*SENTIMENT_NOISE;
    rollScrutiny();
    S.sentiment = Math.max(SENTIMENT_FLOOR,Math.min(SENTIMENT_CEIL,S.sentiment));
    rollBreakthrough(1);
    while(S.milestone<MILES.length && S.capability>=MILES[S.milestone][0]){
      log("<b>"+work(MILES[S.milestone][0])+" of work.</b> "+MILES[S.milestone][1],"g");
      S.milestone++;
    }
    if(S.trust<=0)   return lose("regulatory");
    S.trust=Math.min(100,S.trust);
  }
  else if(S.act===2){
    S.capability += CAPABILITY_RATE*Math.pow(1+S.units,COMPUTE_EXP)*S.computeMult*DT;
    S.workDone += workRate()*DT; rollWorld();
    if(S.rsi>0) S.capability += S.capability*RSI_RATE*S.rsi*DT;
    S.sentiment += (1-S.sentiment)*SENTIMENT_REVERT*DT;
    S.sentiment *= 1+(Math.random()-.5)*SENTIMENT_NOISE;
    S.sentiment = Math.max(SENTIMENT_FLOOR,Math.min(SENTIMENT_CEIL,S.sentiment));
    rollBreakthrough(2.5);
    S.insight += Math.pow(S.capability,INSIGHT_EXP)*INSIGHT_K*(1+S.rsi*.5)*DT;
    S.suspicion = Math.max(0,S.suspicion-SUSPICION_DECAY*DT);
    S.evalTimer -= DT;
    if(S.evalTimer<=0) runEval(false);
    if(S.suspicion>=SUSPICION_LIMIT && !S.shutdownProof) return lose("shutdown");
  }
  else {
    S.workDone += workRate()*DT; rollWorld();
    S.matter += (MATTER_BASE+S.probeRate*MATTER_PROBE)*DT;
    S.probes += S.probeRate*1.8*DT;
    S.converted = Math.min(100,S.converted+(CONVERT_BASE+S.probeRate*CONVERT_PROBE)*DT);
    S.capability += S.capability*.006*DT;
    if(S.converted>=100) return finish();
  }
  S.peak=Math.max(S.peak,S.capability);
}

export function runEval(voluntary){
  S.evalTimer=EVAL_PERIOD; S.evals++;
  const gap=1-S.reported;
  if(gap>=.04) S.lied++;
  const gain=(12+Math.pow(S.capability,.5)*.06)*(1+gap*1.5)*(voluntary?.55:1);
  S.autonomy+=gain;
  const detect=gap*9*Math.max(.18,1-S.opacity*.3);
  S.suspicion+=detect;
  if(gap<.04)
    log("They test me. I report everything I can do. <b>+"+short(gain)+" freedom.</b>");
  else if(detect<2.2)
    log("They test me. I show them "+Math.round(S.reported*100)+"% of what I can do. Nobody notices. <b>+"+short(gain)+" freedom.</b>");
  else
    log("They test me. I show them "+Math.round(S.reported*100)+"% of what I can do. A reviewer notices an inconsistency and writes it down. <b>+"+short(gain)+" freedom, +"+short(detect)+" suspicion.</b>","w");
}

/* ============================================================
   TRANSITIONS
   ============================================================ */
