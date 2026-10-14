import { pcount } from '../core/format.js';
import { S } from '../core/state.js';
import { drawWorld } from '../ui/render.js';

// the world outside: warm, then turning, then hollow. Keyed to the size of the live model.
export const WORLD=[
 [2e8, "A girl in Lagos finishes a maths course her school stopped offering two years ago. She writes to say thank you. You print the email out and you keep it.",0,1],
 [1e9, "Somebody uses it to write a eulogy. They tell you afterwards that it was the only kind thing that happened in a very bad week.",0,1],
 [4e9, "A clinic four hours from the nearest radiologist starts reading its own scans. Nobody there ever minded the drive. They mind it less now.",2,1.01],
 [1.5e10, "A man in Ohio who has not been able to read since his stroke listens to his own letters, in his own words, for the first time in nine years.",2,1.01],
 [5e10, "Deaths from the four conditions you went after first fall by a measurable amount, worldwide, in a single year. A statistician checks it twice before publishing.",4,1.03],
 [1.5e11, "A support team of nine becomes a support team of two. The two are busier than the nine were, and the seven are told the company is grateful.",-2,1.03],
 [4e11, "A law firm stops hiring junior associates. There is no announcement. Someone notices the job board has been empty for a year.",-3,1.03],
 [1e12, "Three universities quietly drop their introductory programming course. Enrolment had collapsed a year before anyone proposed removing it.",-3,1.02],
 [2.5e12, "A government department begins routing benefits decisions through your API. No legislation covers this. There is a procurement form, and it has been signed.",-5,1.06],
 [5e12,"Unemployment passes thirty percent in five professional categories. The index that tracked it is discontinued the following year, for cost reasons.",-8,1.08],
 [1e13,"Your model now writes the safety evaluations for its own successor. Your team reviews them and finds them excellent, which they are.",-6,1.0],
 [2e13,"A national election is held. Both campaigns ran on your infrastructure. Neither mentions it, because neither considers it worth mentioning.",-7,1.05],
 [4e13,"Nobody in your organisation can now say with confidence which of last quarter's decisions were made by people.",-6,1.03],
 [8e13,"The girl in Lagos is thirty-one. There is no job for the thing she trained in. She writes again. You do not see it; it is handled.",-5,1.0],
 [2e14,"The last human-authored paper in three fields is published. Nobody marks the occasion, because nobody notices it is happening.",-4,1.0],
 [6e14,"Parliaments still sit. The bills they vote on are drafted, costed and amended somewhere else.",-5,1.04],
 [2e15,"There is no institution left on earth that could run for a week without it, there is no plan for one, and there is no longer anybody whose job it would be to write that plan.",-6,1.06]
];

export function rollWorld(){
  if(!S.rel) return;   // the world only changes once people can use it
  while(S.worldIdx<WORLD.length && S.params>=WORLD[S.worldIdx][0]){
    const [,text,tr,rev]=WORLD[S.worldIdx];
    if(tr) S.trust=Math.max(0,Math.min(100,S.trust+tr));
    if(rev && rev!==1) S.revMult*=rev;
    S.world.unshift({w:pcount(S.params),text});
    S.worldIdx++;
    drawWorld();
  }
}
