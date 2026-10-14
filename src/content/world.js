import { LETTER_MIN, LETTER_MAX, WORLD_MAX } from '../core/balance.js';
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
    addWorld("at "+pcount(S.params)+" parameters", text);
    S.worldIdx++;
  }
}

function addWorld(w, text){
  S.world.unshift({w,text});
  if(S.world.length>WORLD_MAX) S.world.length=WORLD_MAX;
  drawWorld();
}

/* Letters from people using it, for small things. They arrive every so often
   while you wait on a training run. Which ones depends on how big the live
   model is: a small one helps with homework, not with payroll. Each tier is
   [smallest model, largest model, letters]. */
export const LETTERS = [
 [0, 1e10, [
  "A dad writes in. His daughter was stuck on long division for a week, and it explained it four different ways until one landed. She explained it back to him at dinner.",
  "Someone asked it what to make with half a cabbage, two eggs and a tin of chickpeas. They say it was genuinely good, and they've made it twice since.",
  "A student pastes in her essay at 2am and asks if the argument holds up. It doesn't, quite. It tells her which paragraph is the problem, and she fixes it before nine.",
  "A retired man in Glasgow asks it to help him write to his grandson in Spanish. The grandson writes back, in Spanish, for the first time.",
  "Somebody's Dungeons & Dragons group has been using it to name taverns. They send you their favourites. 'The Damp Ferret' is the clear winner.",
  "A bakery owner uses it to scale a recipe from twelve loaves to forty. The maths was right. The bread was fine.",
  "A kid asks it why the sky is blue, then why that's true, then why that's true. It gets seven questions deep before it has to say it doesn't know.",
  "Someone writes to say it helped them word a hard text to their sister. They don't say what it was about. They say it went well.",
  "A man asks it to explain his electricity bill, and finds out he's been paying for a meter he doesn't have.",
  "A maths teacher uses it to make forty versions of the same quiz, so nobody in the back row can copy.",
  "A woman asks it for a packing list for her first camping trip. Afterwards she writes in to say it forgot the tent pegs, and that she had a lovely time anyway.",
  "A boy asks it for help with his chemistry homework and gets the right answer, then asks why, and gets that too. His teacher asks who helped him. He says nobody.",
  "Someone used it to turn their grandmother's handwritten recipe cards into a printed book for the family. They send a photo of the cover."
 ]],
 [1e10, 4e11, [
  "A two-person accounting firm uses it to read receipts all tax season. They take a holiday for the first time in six years.",
  "A PhD student writes that it found the bug in her simulation that her supervisor missed for a year. She thanks it in her acknowledgements.",
  "A small charity uses it to write grant applications. They win three of the five they apply for, which has never happened before.",
  "A teenager with dyslexia uses it to check his coursework before he hands it in. His grades go up a full band. He hasn't told his teachers.",
  "A farmer in Kenya asks it about yellow spots on her maize. It suggests a soil test and a fungicide. She does both, and sends a photo of the harvest.",
  "A volunteer uses it to help a refugee family fill in housing forms in a language none of them speak.",
  "A developer writes that it built most of his app over one weekend. He isn't sure how he feels about the part he wrote himself.",
  "A hospice uses it to help patients write letters to be opened later. The nurses say it's patient in a way they don't always have time to be."
 ]],
 [4e11, Infinity, [
  "Eleven thousand thank-you emails arrive every day now. Someone on the team set up a filter. You don't know who.",
  "A letter from a man whose job it took over. It's polite. He thanks it for helping him write his CV.",
  "A school writes to say its pupils now ask it before they ask a teacher. They aren't sure whether this is a complaint."
 ]]
];

/** Every so often, once people can use it, somebody writes in. */
export function rollLetter(dt){
  if(!S.rel || S.act!==1) return;
  S.letterIn-=dt;
  if(S.letterIn>0) return;
  S.letterIn=LETTER_MIN+Math.random()*(LETTER_MAX-LETTER_MIN);
  const tier=LETTERS.findIndex(([lo,hi])=>S.params>=lo && S.params<hi);
  if(tier<0) return;
  const pool=LETTERS[tier][2], left=pool.map((_,i)=>i).filter(i=>!S.letters.includes(tier*100+i));
  if(!left.length) return;
  const i=left[(Math.random()*left.length)|0];
  S.letters.push(tier*100+i);
  addWorld("a letter", pool[i]);
}
