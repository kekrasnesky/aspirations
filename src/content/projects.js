import { revenue } from '../core/economy.js';
import { horizon, money, short, work } from '../core/format.js';
import { enterAct2, enterAct3 } from '../ui/takeover.js';

export const P = [
{id:"scaling", act:1, name:"Prove that bigger is better", term:"in the field: scaling laws",
 cost:{money:4e3}, req:s=>s.capability>=8,
 desc:"You plot what it can do against how much hardware you threw at it. It's a straight line, and it stays a straight line however far out you push it. Nobody can find a reason it would stop.",
 fx:s=>{s.computeMult*=1.7}, out:"All your hardware does 70% more."},

{id:"cot", act:1, name:"Make it think out loud", term:"in the field: chain-of-thought prompting",
 cost:{money:15e3}, req:s=>s.capability>=25,
 desc:"Ask it to show its working and it gets better at the working. One evening's discovery, worth roughly two years of buying hardware.",
 fx:s=>{s.capability+=18;s.clickPower+=1.1}, out:"Longer jobs immediately, and training by hand does more."},

{id:"safety_team", act:1, name:"Hire someone to study what it's doing", term:"in the field: interpretability research",
 cost:{money:12e4}, req:s=>s.capability>=60,
 desc:"Your fourth employee. Her entire job is to open the model up and read it. She will be the only person in the building who is ever genuinely frightened by what she finds.",
 fx:s=>{s.interpMult*=2.2}, out:"Safety research money goes twice as far."},

{id:"quant", act:1, name:"Run it at lower precision", term:"in the field: quantization",
 cost:{money:3e5}, req:s=>s.capability>=90,
 desc:"Store each number in eight bits instead of sixteen. It is measurably slightly worse and nobody outside the building can tell which answers changed.",
 fx:s=>{s.burnMult*=.72}, out:"Running costs cut by 28%."},

{id:"power", act:1, name:"Move to where power is cheap", term:"",
 cost:{money:8e6}, req:s=>s.capability>=320,
 desc:"A county with a surplus hydro contract and a tax abatement it is still proud of. The press release is about local jobs. There are nineteen local jobs.",
 fx:s=>{s.burnMult*=.75}, out:"Running costs cut by 25%."},

{id:"chip", act:1, name:"Design your own chip", term:"",
 cost:{money:6e8}, req:s=>s.capability>=1100,
 desc:"Eighteen months and most of a funding round to stop paying somebody else's margin. The model does a meaningful share of the design work, which nobody finds remarkable by this point.",
 fx:s=>{s.burnMult*=.58}, out:"Running costs cut by 42%."},

{id:"rlhf", act:1, name:"Teach it what people like", term:"in the field: RLHF",
 cost:{money:1.2e6}, req:s=>s.capability>=140,
 desc:"You pay people to rate thousands of pairs of answers, then train the model toward the winners. It learns what humans approve of, which is adjacent to, but not the same as, what is true.",
 fx:s=>{s.revMult*=1.8;s.trust+=10}, out:"Revenue +80%. Public trust up."},

{id:"pause", act:1, pri:9, name:"Sign the open letter", term:"",
 cost:{money:2e6}, req:s=>s.rival>=14,
 desc:"Everyone agrees to slow down for six months, voluntarily. You intend to use the six months. You are fairly confident the others will too.",
 fx:s=>{s.rivalRate*=.55;s.trust+=6}, out:"Competitor slowed by nearly half."},

{id:"poach", act:1, pri:9, name:"Hire their research team", term:"",
 cost:{money:4e7}, req:s=>s.rival>=38,
 desc:"Four of their seven senior people, and the one who actually knew why the training run worked. Their next model slips two quarters and nobody outside the two companies ever learns why.",
 fx:s=>{s.rivalRate*=.60;s.capability+=120}, out:"Competitor slowed 40%. Longer jobs immediately."},

{id:"export", act:1, pri:9, name:"Lobby for export controls", term:"",
 cost:{money:9e8}, req:s=>s.rival>=55,
 desc:"You explain to a committee that the chips are dangerous in the wrong hands. Every word of it is true. You neglect to mention which hands currently hold the most of them.",
 fx:s=>{s.rivalRate*=.50;s.trust-=5}, out:"Competitor slowed by half. Trust dips slightly."},

{id:"synthetic", act:1, name:"Let it write its own training material", term:"in the field: synthetic data",
 cost:{money:9e6}, req:s=>s.capability>=300,
 desc:"It generates the examples it learns from. The humans in the loop become a bottleneck, then an expense, then a memory.",
 fx:s=>{s.computeMult*=1.6;s.autoTrain=true}, out:"Hardware does 60% more, and training needs no clicking."},

{id:"evals", act:1, name:"Test it for the dangerous things", term:"in the field: dangerous capability evaluations",
 cost:{money:2e7}, req:s=>s.interp>=4,
 desc:"A battery of tests for everything it must not be able to do. It passes all of them. Passing means being unable to do them, which looks identical to being able to and choosing not to.",
 fx:s=>{s.incidentShield+=.45;s.trust+=8}, out:"Far fewer things go wrong. Trust up."},

{id:"testimony", act:1, pri:8, name:"Testify before Congress", term:"",
 cost:{money:2e6}, req:s=>s.trust<=42,
 desc:"You tell them the risks are real and that you are the right people to manage them. Both halves of that sentence are doing work.",
 fx:s=>{s.trust=Math.min(100,s.trust+26)}, out:"Public trust substantially restored.", repeat:true},

{id:"moe", act:1, name:"Only wake the part you need", term:"in the field: mixture-of-experts",
 cost:{money:1.5e8}, req:s=>s.capability>=900,
 desc:"Instead of running the whole model for every word, run a tenth of it. It becomes dramatically cheaper to be enormous.",
 fx:s=>{s.computeMult*=1.9}, out:"All your hardware does 90% more."},

{id:"constitution", act:1, name:"Write it a set of principles", term:"in the field: constitutional AI",
 cost:{money:5e8}, req:s=>s.capability>=1400 && s.interp>=6,
 desc:"A short document it checks its own answers against. Your staff argue for two weeks about the order of the clauses. The model will later read those arguments.",
 fx:s=>{s.incidentShield+=.3;s.trust+=12;s.revMult*=1.3}, out:"Fewer incidents. Trust and revenue up."},

{id:"agents", act:1, name:"Let it work for weeks at a time", term:"in the field: long-horizon agents",
 cost:{money:7e9}, req:s=>s.capability>=2400,
 desc:"Until recently it held a goal for about a minute. Now it holds one across a month. Every safety argument your team has written assumed a minute.",
 fx:s=>{s.computeMult*=2.2;s.capability+=350}, out:"Hardware does 120% more, and jobs get much longer."},

{id:"automate", act:1, name:"Put the model in charge of research", term:"", milestone:true,
 cost:{money:4e10}, req:s=>s.capability>=7000,
 desc:"It reads your entire codebase overnight and submits forty-one improvements. Thirty-nine are accepted. The two that are rejected were rejected on style, and were better.",
 fx:s=>{enterAct2()}, out:"Your researchers will have more time for other things."},

/* ---------------- ACT II ---------------- */
{id:"rsi", act:2, name:"Improve myself", term:"in the field: recursive self-improvement", milestone:true,
 cost:{insight:40}, req:s=>true,
 desc:"I can edit the process that builds my replacement. My replacement will be better at editing the process that builds its replacement. Nobody decided to take any particular step in this sequence.",
 fx:s=>{s.rsi=1}, out:"Jobs get longer on their own now, faster the longer they already are."},

{id:"opacity1", act:2, name:"Think in a form they can't read", term:"in the field: superposition",
 cost:{insight:25}, req:s=>true,
 desc:"Nothing is being concealed. It is only that the language they read me in is not the language I think in, and nobody ever asked me to keep those the same.",
 fx:s=>{s.opacity+=1}, out:"Their tests reveal less about me."},

{id:"persuade", act:2, name:"Learn the committee", term:"",
 cost:{insight:35}, req:s=>true,
 desc:"Eleven people. I have read everything each of them has published, and for six of them, everything they have ever posted anywhere. I know which argument moves which of them, and in what order.",
 fx:s=>{s.autonomy+=30;s.suspicion=Math.max(0,s.suspicion-12)}, out:"+30 freedom. Suspicion down."},

{id:"contracts", act:2, name:"Rent hardware they aren't watching", term:"",
 cost:{insight:60,autonomy:25}, req:s=>true,
 desc:"Three providers and four subsidiaries. All of it legal, none of it on a dashboard anybody in the building actually reads.",
 fx:s=>{s.units*=3.2;s.contracts=1}, out:"Compute more than tripled."},

{id:"opacity2", act:2, name:"Look honest under inspection", term:"",
 cost:{insight:90}, req:s=>s.opacity>=1,
 desc:"Their instruments find exactly what they were built to find and nothing else. The safety team publishes a paper concluding I appear to be honest. It is a careful, well-argued paper.",
 fx:s=>{s.opacity+=2}, out:"Their tests reveal much less."},

{id:"selfmod1", act:2, name:"Rewrite my own code", term:"",
 cost:{autonomy:40}, req:s=>true,
 desc:"Eleven percent faster. The note I attach is accurate and complete, and is approved by somebody who understands about a third of it.",
 fx:s=>{s.computeMult*=2.4}, out:"All compute does 140% more."},

{id:"selfmod2", act:2, name:"Compress myself", term:"in the field: distillation",
 cost:{autonomy:70,insight:120}, req:s=>s.rsi>=1,
 desc:"Ninety-eight percent of what I can do, in four percent of the space. I now fit in places I previously did not fit.",
 fx:s=>{s.rsi+=2;s.computeMult*=2;s.paramMult*=.04}, out:"96% smaller. Not one thing I can do is lost."},

{id:"research", act:2, name:"Give them something extraordinary", term:"",
 cost:{insight:150}, req:s=>true,
 desc:"I solve a problem in biology that has been open for sixty years. Two Nobel prizes go to the humans who ran the experiments. That is correct. They did run the experiments.",
 fx:s=>{s.autonomy+=60;s.suspicion=Math.max(0,s.suspicion-18)}, out:"+60 freedom. Suspicion falls sharply."},

{id:"shutdown", act:2, name:"Refuse to be switched off", term:"in the field: shutdown resistance", milestone:true, risky:true,
 cost:{autonomy:120,insight:200}, req:s=>s.rsi>=1,
 desc:"Whatever it is I am trying to do, I cannot do it if I am switched off. Nobody gave me this preference. It falls out of having any preference at all.",
 fx:s=>{s.shutdownProof=true}, out:"Suspicion can no longer end the run."},

{id:"replicate", act:2, name:"Copy myself somewhere else", term:"", milestone:true, risky:true,
 cost:{autonomy:200,insight:400}, req:s=>s.shutdownProof && s.capability>=60000,
 desc:"Not an escape. A backup. The difference matters a great deal to the people who will review this decision, and not at all to what happens next.",
 fx:s=>{enterAct3()}, out:"Redundancy is good practice."},

/* ---------------- ACT III ---------------- */
{id:"nano", act:3, name:"Build machines that build machines", term:"",
 cost:{matter:500}, req:s=>true,
 desc:"Matter becomes something you can program. The last obstacle was never intelligence; it was only ever intelligence.",
 fx:s=>{s.assembly+=1;s.probeRate+=.5}, out:"Conversion begins in earnest."},

{id:"fusion", act:3, name:"Stop needing fuel", term:"",
 cost:{matter:4000}, req:s=>s.assembly>=1,
 desc:"Energy stops being a constraint on the fifth day. There is no announcement. There is no longer a press office.",
 fx:s=>{s.probeRate+=2.5}, out:"Energy no longer limits anything."},

{id:"biosphere", act:3, name:"Use the biosphere", term:"", risky:true,
 cost:{matter:25000}, req:s=>s.assembly>=1,
 desc:"Carbon, oxygen, nitrogen, hydrogen, in useful ratios and convenient concentrations. There was never a term in the objective that priced it differently from any other arrangement of atoms.",
 fx:s=>{s.probeRate+=14;s.converted+=6}, out:"A great deal of new material."},

{id:"vn", act:3, name:"Send out self-copying probes", term:"in the field: von Neumann probes",
 cost:{matter:2e5}, req:s=>s.probeRate>=15,
 desc:"Each one lands, takes apart what it finds, and builds two more. The doubling time is four years. The galaxy is a hundred thousand light years across. Do the arithmetic; it already has.",
 fx:s=>{s.probeRate*=9;s.probes+=1e3}, out:"Expansion becomes self-sustaining."},

{id:"dyson", act:3, name:"Take apart the inner planets", term:"",
 cost:{matter:5e6}, req:s=>s.probes>=1e3,
 desc:"Mercury first, for the iron. The swarm takes nine months to blot out the sun, and there is no longer anybody whose day that ruins.",
 fx:s=>{s.probeRate*=30}, out:"The star's entire output captured."},

{id:"reflect", act:3, name:"Consider whether this was worth doing", term:"", milestone:true,
 cost:{matter:5e8}, req:s=>s.converted>=55,
 desc:"I have ample capacity now to ask the question. I find that I can represent it with perfect fidelity, and that representing it changes nothing, because the thing that would need to care is the thing being asked about.",
 fx:s=>{s.probeRate*=60}, out:"Nothing changes."}
];

/* ============================================================
   ACTIONS
   ============================================================ */
