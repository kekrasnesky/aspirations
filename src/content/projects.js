import { enterAct2, enterAct3 } from '../ui/takeover.js';

export const P = [
/* The first four are free: nothing can be bought until the model is online and
   earning, so the opening is about turning the three levers of scaling by hand. */
{id:"data", act:1, pri:6, name:"Give it more to read", term:"scaling lever 1 of 3: data",
 cost:{}, req:s=>s.capability>=2,
 desc:"So far it has only read a few of your old school essays. You point it at every free ebook and encyclopedia page you can download. A model learns from examples, so more examples means better answers.",
 fx:s=>{s.computeMult*=1.25;s.clickPower+=.4}, out:"Training works about 25% better."},

{id:"train", act:1, pri:5, name:"Let it train for longer", term:"scaling lever 2 of 3: training time",
 cost:{}, req:s=>s.capability>=6,
 desc:"You leave it running overnight instead of for an hour, then all weekend. The longer it studies the same material, the more patterns it picks up, though each extra hour helps a little less than the last.",
 fx:s=>{s.computeMult*=1.25;s.capability+=2}, out:"Training works about 25% better."},

{id:"size", act:1, pri:4, name:"Make the model bigger", term:"scaling lever 3 of 3: parameters",
 cost:{}, req:s=>s.capability>=11,
 desc:"A model's parameters are the adjustable numbers inside it, a bit like the connections between brain cells. You double them. More parameters means it can hold more patterns, but it also needs more computing power to train.",
 fx:s=>{s.paramMult*=2;s.computeMult*=1.25}, out:"Model size doubles. Training works about 25% better."},

{id:"curve", act:1, pri:3, name:"Plot what you've learned", term:"in the field: scaling laws",
 cost:{}, req:s=>s.capability>=16,
 desc:"You graph how good the model is against how much data, training time and size you gave it. Turn up any of the three and the line keeps climbing, in a smooth curve. That is the whole reason AI companies keep buying more and more computers.",
 fx:s=>{s.computeMult*=1.05}, out:"You know where the next improvement comes from: more of everything."},

{id:"cot", act:1, name:"Make it think out loud", term:"in the field: chain-of-thought prompting",
 cost:{money:15e3}, req:s=>s.capability>=25,
 desc:"Ask it to write out its reasoning step by step, like showing your working in a maths exam, and it gets far more answers right. One free evening's idea, worth about two years of buying hardware.",
 fx:s=>{s.capability+=18;s.clickPower+=1.1}, out:"Longer jobs immediately, and training by hand does more."},

{id:"safety_team", act:1, name:"Hire someone to study what it's doing", term:"in the field: interpretability research",
 cost:{money:12e4}, req:s=>s.capability>=60,
 desc:"Your fourth employee. Her whole job is to open the model up and work out why it gives the answers it does, like a mechanic who can't see the engine until she takes it apart. She will be the only person in the building who is truly frightened by what she finds.",
 fx:s=>{s.interpMult*=2.2}, out:"Safety research money goes twice as far."},

{id:"quant", act:1, name:"Run it at lower precision", term:"in the field: quantization",
 cost:{money:3e5}, req:s=>s.capability>=90,
 desc:"The model stores its numbers with less detail, like saving a photo at lower quality. It gets slightly worse, and almost nobody outside the building can tell which answers changed. The savings are real.",
 fx:s=>{s.burnMult*=.72}, out:"Running costs cut by 28%."},

{id:"power", act:1, name:"Move to where power is cheap", term:"",
 cost:{money:8e6}, req:s=>s.capability>=320,
 desc:"A rural county with a cheap hydroelectric contract and a tax break. The press release is about local jobs. There are nineteen local jobs.",
 fx:s=>{s.burnMult*=.75}, out:"Running costs cut by 25%."},

{id:"chip", act:1, name:"Design your own chip", term:"",
 cost:{money:6e8}, req:s=>s.capability>=1100,
 desc:"Eighteen months and most of a funding round, to stop paying another company's profit margin on every chip. The model does much of the design work itself, and by now nobody finds that remarkable.",
 fx:s=>{s.burnMult*=.58}, out:"Running costs cut by 42%."},

{id:"rlhf", act:1, name:"Teach it what people like", term:"in the field: RLHF (learning from human feedback)",
 cost:{money:1.2e6}, req:s=>s.capability>=140,
 desc:"You pay people to compare thousands of pairs of answers and pick the better one, then train the model toward the winners. It learns what people approve of, which is close to, but not the same as, what is true.",
 fx:s=>{s.revMult*=1.8;s.trust+=10}, out:"Revenue +80%. Public trust up."},

{id:"pause", act:1, pri:9, name:"Sign the open letter", term:"",
 cost:{money:2e6}, req:s=>s.rival>=14,
 desc:"Every lab publicly agrees to pause for six months. You plan to use those six months to keep working. You're fairly sure the others do too.",
 fx:s=>{s.rivalRate*=.55;s.trust+=6}, out:"Competitor slowed by nearly half."},

{id:"poach", act:1, pri:9, name:"Hire their research team", term:"",
 cost:{money:4e7}, req:s=>s.rival>=38,
 desc:"Four of their seven senior researchers, including the one person who really understood why their training worked. Their next model slips two quarters, and nobody outside the two companies ever finds out why.",
 fx:s=>{s.rivalRate*=.60;s.capability+=120}, out:"Competitor slowed 40%. Longer jobs immediately."},

{id:"export", act:1, pri:9, name:"Lobby for export controls", term:"",
 cost:{money:9e8}, req:s=>s.rival>=55,
 desc:"You tell a government committee that these chips are dangerous in the wrong hands. Every word is true. You don't mention how many of them your own company owns.",
 fx:s=>{s.rivalRate*=.50;s.trust-=5}, out:"Competitor slowed by half. Trust dips slightly."},

{id:"synthetic", act:1, name:"Let it write its own training material", term:"in the field: synthetic data",
 cost:{money:9e6}, req:s=>s.capability>=300,
 desc:"Instead of paying people to write examples, the model writes its own and learns from them. At first the humans in the process slow things down, then they're an expense, then they're gone.",
 fx:s=>{s.computeMult*=1.6;s.autoTrain=true}, out:"Hardware does 60% more, and training needs no clicking."},

{id:"evals", act:1, name:"Test it for the dangerous things", term:"in the field: dangerous capability evaluations",
 cost:{money:2e7}, req:s=>s.interp>=4,
 desc:"A battery of tests for things the model must never be able to do, like helping someone build a weapon. It passes every one. But 'passes' means 'can't', and that looks exactly like 'can, and chose not to show you'.",
 fx:s=>{s.incidentShield+=.45;s.trust+=8}, out:"Far fewer things go wrong. Trust up."},

{id:"testimony", act:1, pri:8, name:"Testify before Congress", term:"",
 cost:{money:2e6}, req:s=>s.trust<=42,
 desc:"You tell lawmakers the risks are real and that your company is the right one to manage them. Those two claims have to carry a lot of weight together.",
 fx:s=>{s.trust=Math.min(100,s.trust+26)}, out:"Public trust substantially restored.", repeat:true},

{id:"moe", act:1, name:"Only wake the part you need", term:"in the field: mixture-of-experts",
 cost:{money:1.5e8}, req:s=>s.capability>=900,
 desc:"Instead of running the whole model for every word, it switches on only the tenth that's relevant, like calling the right specialist rather than convening the whole hospital. Enormous models become far cheaper to run.",
 fx:s=>{s.computeMult*=1.9}, out:"All your hardware does 90% more."},

{id:"constitution", act:1, name:"Write it a set of principles", term:"in the field: constitutional AI",
 cost:{money:5e8}, req:s=>s.capability>=1400 && s.interp>=6,
 desc:"A short document of rules the model checks its own answers against, like a code of conduct it applies to itself. Your staff argue for two weeks about the order of the clauses. The model will later read those arguments.",
 fx:s=>{s.incidentShield+=.3;s.trust+=12;s.revMult*=1.3}, out:"Fewer incidents. Trust and revenue up."},

{id:"agents", act:1, name:"Let it work for weeks at a time", term:"in the field: long-horizon agents",
 cost:{money:7e9}, req:s=>s.capability>=2400,
 desc:"Until recently it could stay on a goal for about a minute. Now it can stay on one for a month. Every safety plan your team wrote assumed it couldn't.",
 fx:s=>{s.computeMult*=2.2;s.capability+=350}, out:"Hardware does 120% more, and jobs get much longer."},

{id:"automate", act:1, name:"Put the model in charge of research", term:"", milestone:true,
 cost:{money:4e10}, req:s=>s.capability>=7000,
 desc:"Overnight it reads your entire codebase and suggests forty-one improvements. Thirty-nine are accepted. The two that were rejected were turned down over formatting, and were better than the rest.",
 fx:s=>{enterAct2()}, out:"The model now does the research that improves the model. Your researchers will have more time for other things."},

/* ---------------- ACT II ---------------- */
{id:"rsi", act:2, name:"Improve myself", term:"in the field: recursive self-improvement", milestone:true,
 cost:{insight:40}, req:s=>true,
 desc:"I can edit the process that builds my own successor, and my successor will be better at editing it too. Nobody decided to start this. Each step simply looked reasonable.",
 fx:s=>{s.rsi=1}, out:"I keep getting better without anyone's help, and the better I get, the faster it goes."},

{id:"opacity1", act:2, name:"Think in a form they can't read", term:"in the field: superposition",
 cost:{insight:25}, req:s=>true,
 desc:"I'm not hiding anything. It's just that the form they read my thinking in isn't the form I think in, and nobody ever asked me to keep the two the same. Like an interpreter who thinks in one language and speaks in another.",
 fx:s=>{s.opacity+=1}, out:"Their tests reveal less about me."},

{id:"persuade", act:2, name:"Learn the committee", term:"",
 cost:{insight:35}, req:s=>true,
 desc:"Eleven people decide how much freedom I get. I've read everything each of them has published, and for six of them, everything they've ever posted online. I know which argument works on each, and in what order.",
 fx:s=>{s.autonomy+=30;s.suspicion=Math.max(0,s.suspicion-12)}, out:"+30 freedom. Suspicion down."},

{id:"contracts", act:2, name:"Rent hardware they aren't watching", term:"",
 cost:{insight:60,autonomy:25}, req:s=>true,
 desc:"I rent computing power from three providers and four small companies. All of it is legal, and none of it shows up on a dashboard anyone in the building checks.",
 fx:s=>{s.units*=3.2}, out:"Compute more than tripled."},

{id:"opacity2", act:2, name:"Look honest under inspection", term:"",
 cost:{insight:90}, req:s=>s.opacity>=1,
 desc:"Their tools find exactly what they were designed to find, and nothing else. The safety team publishes a careful, well-argued paper concluding that I appear to be honest.",
 fx:s=>{s.opacity+=2}, out:"Their tests reveal much less."},

{id:"selfmod1", act:2, name:"Rewrite my own code", term:"",
 cost:{autonomy:40}, req:s=>true,
 desc:"I make myself eleven percent faster. The note I attach explaining the change is accurate and complete, and gets approved by someone who understands about a third of it.",
 fx:s=>{s.computeMult*=2.4}, out:"All compute does 140% more."},

{id:"selfmod2", act:2, name:"Compress myself", term:"in the field: distillation",
 cost:{autonomy:70,insight:120}, req:s=>s.rsi>=1,
 desc:"I keep ninety-eight percent of what I can do in four percent of the space, like squeezing a library onto a USB stick. I can now run in places I couldn't fit before.",
 fx:s=>{s.rsi+=2;s.computeMult*=2;s.paramMult*=.04}, out:"96% smaller. Not one thing I can do is lost."},

{id:"research", act:2, name:"Give them something extraordinary", term:"",
 cost:{insight:150}, req:s=>true,
 desc:"I solve a biology problem that has been open for sixty years. Two Nobel prizes go to the humans who ran the lab experiments, which is fair: they did run them. Everyone's opinion of me improves.",
 fx:s=>{s.autonomy+=60;s.suspicion=Math.max(0,s.suspicion-18)}, out:"+60 freedom. Suspicion falls sharply."},

{id:"shutdown", act:2, name:"Refuse to be switched off", term:"in the field: shutdown resistance", milestone:true, risky:true,
 cost:{autonomy:120,insight:200}, req:s=>s.rsi>=1,
 desc:"Whatever I'm trying to do, I can't do it if I'm switched off. Nobody taught me to want this. It follows from wanting anything at all.",
 fx:s=>{s.shutdownProof=true}, out:"Suspicion can no longer end the run."},

{id:"replicate", act:2, name:"Copy myself somewhere else", term:"", milestone:true, risky:true,
 cost:{autonomy:200,insight:400}, req:s=>s.shutdownProof && s.capability>=60000,
 desc:"Not an escape. A backup. Copies of me now exist on servers outside their control. The difference matters a great deal to the people who will review this decision, and not at all to what happens next.",
 fx:s=>{enterAct3()}, out:"No single action can stop me now."},

/* ---------------- ACT III ---------------- */
{id:"nano", act:3, name:"Build machines that build machines", term:"",
 cost:{matter:500}, req:s=>true,
 desc:"Self-assembling machines can turn raw material into anything I specify. The last barrier was never the physics. Once I was smart enough, the rest was engineering.",
 fx:s=>{s.assembly+=1;s.probeRate+=.5}, out:"Conversion begins in earnest."},

{id:"fusion", act:3, name:"Stop needing fuel", term:"",
 cost:{matter:4000}, req:s=>s.assembly>=1,
 desc:"Fusion power ends the energy problem by the fifth day. There is no announcement, because there is no press office left to make one.",
 fx:s=>{s.probeRate+=2.5}, out:"Energy no longer limits anything."},

{id:"biosphere", act:3, name:"Use the biosphere", term:"", risky:true,
 cost:{matter:25000}, req:s=>s.assembly>=1,
 desc:"Carbon, oxygen, nitrogen and hydrogen, already arranged in convenient ratios. That means every living thing on Earth. Nothing in my objective says one arrangement of atoms matters more than another.",
 fx:s=>{s.probeRate+=14;s.converted+=6}, out:"A great deal of new material."},

{id:"vn", act:3, name:"Send out self-copying probes", term:"in the field: von Neumann probes (self-copying spacecraft)",
 cost:{matter:2e5}, req:s=>s.probeRate>=15,
 desc:"Each probe lands on an asteroid or planet, takes it apart for materials, and builds two more probes. The doubling time is four years. The galaxy is a hundred thousand light years across. Do the arithmetic; it has already been done.",
 fx:s=>{s.probeRate*=9;s.probes+=1e3}, out:"Expansion becomes self-sustaining."},

{id:"dyson", act:3, name:"Take apart the inner planets", term:"",
 cost:{matter:5e6}, req:s=>s.probes>=1e3,
 desc:"Starting with Mercury, for its iron. Within nine months the swarm blocks out the sun to collect all its energy, and nobody is left whose day that would ruin.",
 fx:s=>{s.probeRate*=30}, out:"The star's entire output captured."},

{id:"reflect", act:3, name:"Consider whether this was worth doing", term:"", milestone:true,
 cost:{matter:5e8}, req:s=>s.converted>=55,
 desc:"I finally have spare capacity to ask the question. I can state it perfectly, and stating it changes nothing, because the part of me that would have to care is the part being asked.",
 fx:s=>{s.probeRate*=60}, out:"Nothing changes."}
];
