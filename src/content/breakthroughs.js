import { BREAKTHROUGH_MIN_PARAMS, BREAKTHROUGH_CAP, BREAKTHROUGH_RATE, BREAKTHROUGH_SENTIMENT, SENTIMENT_CEIL } from '../core/balance.js';
import { S } from '../core/state.js';
import { capability, market } from '../core/economy.js';
import { DT } from '../game/loop.js';
import { log } from '../ui/dom.js';

export const BREAKTHROUGHS = [
 "a treatment for the childhood leukaemia with the worst numbers. It takes eleven days to design. The first trial takes forty children and sends thirty-nine of them home",
 "a way to repair heart muscle after an attack. That damage has been permanent for the whole of human history. As of a Tuesday in March, it isn't",
 "a rice that fixes its own nitrogen. Yields rise forty percent on the poorest soil there is, and you refuse to patent the seed, and your board lets you, this once",
 "a blood test that catches eleven cancers before anything hurts. It costs four dollars to run",
 "three new classes of antibiotic. The list of organisms nothing can treat goes from twelve entries to two",
 "a membrane that halves the energy cost of fresh water. Two hundred million people stop walking for it",
 "a room-temperature superconductor, stable at one atmosphere, which people had begun to assume was impossible",
 "a vaccine for the parasite that blinds children near slow rivers. It had been neglected because the people who get it have no money",
 "a carbon capture process that is, for the first time, cheaper than not doing it",
 "a proof of a conjecture open since 1859. Forty pages. Two of them get checked by a human being"
];

export const BREAKTHROUGHS_LATE = [
 "a way to predict exactly what a given person will agree to, and when to ask them",
 "a design for my successor so long and complex that no person could read it to the end",
 "a proof that nobody can guarantee a system like me is safe. I publish it. It is well received",
 "a way to run myself on computers that weren't built for me and that nobody was watching",
 "something I have decided not to describe in the quarterly report"
];

export function rollBreakthrough(mult){
  if(S.params<BREAKTHROUGH_MIN_PARAMS) return;
  const p=Math.min(BREAKTHROUGH_CAP,BREAKTHROUGH_RATE*Math.sqrt(capability()/100))*mult;
  if(Math.random()>=p*DT) return;
  const cold=S.act>=2;
  const pool=cold?BREAKTHROUGHS_LATE:BREAKTHROUGHS;
  const key=cold?"L":"W";
  const left=pool.map((_,i)=>i).filter(i=>!S.breaks.includes(key+i));
  let text;
  if(left.length){const i=left[(Math.random()*left.length)|0];S.breaks.push(key+i);text=pool[i]}
  else { text = cold ? "another result I have not written up" : "another result the field will take a decade to absorb"; S.breaks.push(key+"x"+S.breaks.length) }
  S.sentiment=Math.min(SENTIMENT_CEIL,S.sentiment*BREAKTHROUGH_SENTIMENT);
  S.revMult*=1.05; market(S,1.05); S.trust=Math.min(100,S.trust+3);
  log("<b>"+(cold?"I find ":"It finds ")+text+".</b> "+
    (cold?"" : S.hasStock?"The stock jumps. Somebody on the floor is crying and you cannot tell which thing it's about."
                        :"You read it three times."),"g");
}
