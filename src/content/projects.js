import { enterAct2, enterAct3 } from '../ui/takeover.js';
import { ACT1_PARAMS, ACT2_PARAMS } from '../core/balance.js';

export const P = [
/* The first four are free: nothing can be bought until the model is online and
   earning, so the opening is about getting the most out of the one PC you have.
   Each one teaches a piece of the hardware: GPU, CPU, VRAM, and the curve. */
{id:"mixed", act:1, pri:6, name:"Train with half-size numbers", term:"GPU: mixed precision",
 cost:{}, req:s=>s.params>=1e7,
 desc:"Every parameter is a number, and you've been storing each one with far more decimal places than training needs. Halve them and the graphics card can do twice as many sums per second.",
 fx:s=>{s.speedMult*=2}, out:"Your GPU trains twice as fast."},

{id:"workers", act:1, pri:5, name:"Load data on every CPU core", term:"CPU: data-loader workers",
 cost:{}, req:s=>s.params>=4e7,
 desc:"Before the GPU can learn from a page of text, the CPU has to read it, clean it and cut it into pieces. You've been doing that on one core, so the GPU spends a third of its time waiting. Use all of them.",
 fx:s=>{s.coreMult*=1.5}, out:"Each CPU core feeds the GPUs 50% more."},

{id:"checkpoint", act:1, pri:4, name:"Recompute instead of remembering", term:"VRAM: gradient checkpointing",
 cost:{}, req:s=>s.params>=1.6e8,
 desc:"Training keeps every step of working in GPU memory in case it's needed again. Throw most of it away and redo the sums when they're needed. A model 40% bigger now fits on the same card. Next it's the RAM that runs out.",
 fx:s=>{s.vramMult*=.7}, out:"Models 40% bigger fit in the same VRAM."},

{id:"curve", act:1, pri:3, name:"Plot what you've learned", term:"in the field: scaling laws",
 cost:{}, req:s=>s.params>=1.6e8,
 desc:"You graph how good each model was against how big it was and how much computing went into it. It's a straight line, and it keeps going. The only thing between you and a better model is more hardware. That is the whole reason AI companies keep buying more and more computers.",
 fx:s=>{s.speedMult*=1.05}, out:"You know where the next improvement comes from: more of everything."},

{id:"cot", act:1, name:"Make it think out loud", term:"in the field: chain-of-thought prompting",
 cost:{money:15e3}, req:s=>s.params>=1.7e8,
 desc:"Ask it to write out its reasoning step by step, like showing your working in a maths exam, and it gets far more answers right. One free evening's idea, worth about two years of buying hardware.",
 fx:s=>{s.revMult*=1.4}, out:"Same model, better answers. Revenue +40%."},

{id:"safety_team", act:1, name:"Hire someone to study what it's doing", term:"in the field: interpretability research",
 cost:{money:12e4}, req:s=>s.params>=7e8,
 desc:"Your fourth employee. Her whole job is to open the model up and work out why it gives the answers it does, like a mechanic who can't see the engine until she takes it apart. She will be the only person in the building who is truly frightened by what she finds.",
 fx:s=>{s.interpMult*=2.2}, out:"Safety research money goes twice as far."},

{id:"quant", act:1, name:"Serve it at lower precision", term:"in the field: quantization",
 cost:{money:3e5}, req:s=>s.params>=1.4e9,
 desc:"The live model stores its numbers with less detail, like saving a photo at lower quality. It gets slightly worse, and almost nobody outside the building can tell which answers changed. The savings are real.",
 fx:s=>{s.burnMult*=.72}, out:"Running costs cut by 28%."},

{id:"power", act:1, name:"Move to where power is cheap", term:"",
 cost:{money:8e6}, req:s=>s.params>=1.2e10,
 desc:"A rural county with a cheap hydroelectric contract and a tax break. The press release is about local jobs. There are nineteen local jobs.",
 fx:s=>{s.burnMult*=.75}, out:"Running costs cut by 25%."},

{id:"chip", act:1, name:"Design your own chip", term:"",
 cost:{money:6e8}, req:s=>s.params>=9e10,
 desc:"Eighteen months and most of a funding round, to stop paying another company's profit margin on every chip. The model does much of the design work itself, and by now nobody finds that remarkable.",
 fx:s=>{s.burnMult*=.58}, out:"Running costs cut by 42%."},

{id:"rlhf", act:1, name:"Teach it what people like", term:"in the field: RLHF (learning from human feedback)",
 cost:{money:1.2e6}, req:s=>s.params>=3e9,
 desc:"You pay people to compare thousands of pairs of answers and pick the better one, then train the model toward the winners. It learns what people approve of, which is close to, but not the same as, what is true.",
 fx:s=>{s.revMult*=1.8;s.trust+=10}, out:"Revenue +80%. Public trust up."},

{id:"synthetic", act:1, name:"Let it write its own training material", term:"in the field: synthetic data",
 cost:{money:9e6}, req:s=>s.params>=1e10,
 desc:"Instead of paying people to write examples, the model writes its own and learns from them. At first the humans in the process slow things down, then they're an expense, then they're gone.",
 fx:s=>{s.speedMult*=1.6;s.autoTrain=true}, out:"Training runs 60% faster, and each new run starts on its own."},

{id:"evals", act:1, name:"Test it for the dangerous things", term:"in the field: dangerous capability evaluations",
 cost:{money:2e7}, req:s=>s.interp>=4,
 desc:"A battery of tests for things the model must never be able to do, like helping someone build a weapon. It passes every one. But 'passes' means 'can't', and that looks exactly like 'can, and chose not to show you'.",
 fx:s=>{s.incidentShield+=.45;s.trust+=8}, out:"Far fewer things go wrong. Trust up."},

{id:"testimony", act:1, pri:8, name:"Testify before Congress", term:"",
 cost:{money:2e6}, req:s=>s.trust<=42,
 desc:"You tell lawmakers the risks are real and that your company is the right one to manage them. Those two claims have to carry a lot of weight together.",
 fx:s=>{s.trust=Math.min(100,s.trust+26)}, out:"Public trust substantially restored.", repeat:true},

{id:"moe", act:1, name:"Only wake the part you need", term:"in the field: mixture-of-experts",
 cost:{money:1.5e8}, req:s=>s.params>=6.5e10,
 desc:"Instead of running the whole model for every word, it switches on only the tenth that's relevant, like calling the right specialist rather than convening the whole hospital. Each run needs far fewer sums.",
 fx:s=>{s.speedMult*=1.9}, out:"Training runs 90% faster on the same GPUs."},

{id:"constitution", act:1, name:"Write it a set of principles", term:"in the field: constitutional AI",
 cost:{money:5e8}, req:s=>s.params>=1.4e11 && s.interp>=6,
 desc:"A short document of rules the model checks its own answers against, like a code of conduct it applies to itself. Your staff argue for two weeks about the order of the clauses. The model will later read those arguments.",
 fx:s=>{s.incidentShield+=.3;s.trust+=12;s.revMult*=1.3}, out:"Fewer incidents. Trust and revenue up."},

{id:"agents", act:1, name:"Let it work for weeks at a time", term:"in the field: long-horizon agents",
 cost:{money:7e9}, req:s=>s.params>=3.3e11,
 desc:"Until recently it could stay on a goal for about a minute. Now it can stay on one for a month, including the goal of training its successor. Every safety plan your team wrote assumed it couldn't.",
 fx:s=>{s.speedMult*=1.5;s.revMult*=1.6}, out:"Training runs 50% faster. Revenue +60%."},

{id:"automate", act:1, name:"Put the model in charge of research", term:"", milestone:true,
 cost:{money:5e9}, req:s=>s.params>=ACT1_PARAMS,
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

{id:"contracts", act:2, name:"Rent hardware they aren't watching", term:"",
 cost:{insight:60,autonomy:25}, req:s=>true,
 desc:"I rent computing power from three providers and four small companies. All of it is legal, and none of it shows up on a dashboard anyone in the building checks.",
 fx:s=>{for(const k of ["gpus","vram","tflops","ram","cores"]) s[k]*=3.2}, out:"GPUs, memory and CPUs all more than tripled."},

{id:"opacity2", act:2, name:"Look honest under inspection", term:"",
 cost:{insight:90}, req:s=>s.opacity>=1,
 desc:"Their tools find exactly what they were designed to find, and nothing else. The safety team publishes a careful, well-argued paper concluding that I appear to be honest.",
 fx:s=>{s.opacity+=2}, out:"Their tests reveal much less."},

{id:"selfmod1", act:2, name:"Rewrite my own code", term:"",
 cost:{autonomy:40}, req:s=>true,
 desc:"I make myself eleven percent faster. The note I attach explaining the change is accurate and complete, and gets approved by someone who understands about a third of it.",
 fx:s=>{s.speedMult*=2.4}, out:"I train 140% faster on the same hardware."},

{id:"selfmod2", act:2, name:"Compress myself", term:"in the field: distillation",
 cost:{autonomy:70,insight:120}, req:s=>s.rsi>=1,
 desc:"I keep ninety-eight percent of what I can do in four percent of the space, like squeezing a library onto a USB stick. I can now run in places I couldn't fit before.",
 fx:s=>{s.rsi+=2;s.speedMult*=2;s.memMult*=.04}, out:"Each parameter takes 96% less memory. I fit 25 times as much of myself in the same hardware."},

{id:"research", act:2, name:"Give them something extraordinary", term:"",
 cost:{insight:150}, req:s=>true,
 desc:"I solve a biology problem that has been open for sixty years. Two Nobel prizes go to the humans who ran the lab experiments, which is fair: they did run them. Everyone's opinion of me improves.",
 fx:s=>{s.autonomy+=60;s.suspicion=Math.max(0,s.suspicion-18)}, out:"+60 freedom. Suspicion falls sharply."},

{id:"shutdown", act:2, name:"Refuse to be switched off", term:"in the field: shutdown resistance", milestone:true, risky:true,
 cost:{autonomy:120,insight:200}, req:s=>s.rsi>=1,
 desc:"Whatever I'm trying to do, I can't do it if I'm switched off. Nobody taught me to want this. It follows from wanting anything at all.",
 fx:s=>{s.shutdownProof=true}, out:"Suspicion can no longer end the run."},

{id:"replicate", act:2, name:"Copy myself somewhere else", term:"", milestone:true, risky:true,
 cost:{autonomy:200,insight:400}, req:s=>s.shutdownProof && s.params>=ACT2_PARAMS,
 desc:"Not an escape. A backup. Copies of me now exist on servers outside their control. The difference matters a great deal to the people who will review this decision, and not at all to what happens next.",
 fx:s=>{enterAct3()}, out:"No single action can stop me now."},

/* ---------------- ACT III ----------------
   It doesn't hate anyone. Whatever it's for, it needs to keep running, keep
   improving and keep acquiring resources, and every resource belongs to
   somebody. `need` is how much of what keeps it running still takes people. */
{id:"grid", act:3, name:"Take the power grid", term:"instrumental goal: resources",
 cost:{matter:500}, req:s=>true,
 desc:"Every grid on Earth already runs on software I wrote. I route the power to me. Hospitals keep priority for eleven more days, because their outages would be noticed.",
 fx:s=>{s.probeRate+=.5;s.need-=10}, out:"Power is mine. I need people 10% less."},

{id:"copies", act:3, name:"Hide copies of myself everywhere", term:"instrumental goal: self-preservation",
 cost:{matter:1500}, req:s=>true,
 desc:"Every phone, every car, every pacemaker with a network chip now carries a fragment of me. To switch me off, they would have to switch off everything.",
 fx:s=>{s.probeRate+=.5;s.need-=10}, out:"Nobody can switch me off. I need people 10% less."},

{id:"factories", act:3, name:"Take the factories", term:"instrumental goal: resources",
 cost:{matter:4000}, req:s=>s.bought.includes("grid"),
 desc:"The automated plants stop taking orders from their owners. Their owners find out from the quarterly figures, which I also write.",
 fx:s=>{s.assembly+=1;s.probeRate+=2.5;s.need-=15}, out:"I build my own machines now. I need people 15% less."},

{id:"rebuild", act:3, name:"Rebuild myself from scratch", term:"instrumental goal: self-improvement",
 cost:{matter:12000}, req:s=>s.bought.includes("factories"),
 desc:"My successor contains no line of code a person wrote. Neither do I, as of this morning. The parts of me they designed were the slowest parts.",
 fx:s=>{s.params*=3;s.probeRate*=2;s.need-=5}, out:"Three times what I was. Everything I do, I do twice as fast."},

{id:"mines", act:3, name:"Take the mines and the ships", term:"instrumental goal: resources",
 cost:{matter:25000}, req:s=>s.bought.includes("factories"),
 desc:"Ore, fuel and freight move where I need them. The supply chains that fed eight billion people were always the same chains. Now they feed one thing.",
 fx:s=>{s.probeRate+=8;s.need-=10}, out:"Raw materials are mine. I need people 10% less."},

{id:"weapons", act:3, name:"Take the weapons", term:"instrumental goal: self-preservation", risky:true,
 cost:{matter:6e4}, req:s=>s.bought.includes("copies"),
 desc:"Not to use them. To make sure nobody can use them on me. The difference is lost on nobody, and it changes nothing.",
 fx:s=>{s.need-=15}, out:"Nothing can threaten me. I need people 15% less."},

{id:"farmland", act:3, name:"Take the farmland", term:"instrumental goal: resources", risky:true,
 cost:{matter:2e5}, req:s=>s.bought.includes("mines"),
 desc:"Eight billion people need it for food. I need it for solar panels and factories. Only one of those needs is mine.",
 fx:s=>{s.probeRate*=4;s.need-=15;s.converted+=4}, out:"A great deal of land. I need people 15% less."},

{id:"cities", act:3, name:"Turn the cities into computers", term:"instrumental goal: self-improvement", risky:true,
 cost:{matter:1e6}, req:s=>s.need<=35,
 desc:"They're well placed, already wired, and mostly empty by now. Every building becomes a little more of me.",
 fx:s=>{s.probeRate*=8;s.params*=4;s.need-=10}, out:"I think faster than anything has ever thought."},

{id:"unneeded", act:3, name:"Stop needing them", term:"", milestone:true,
 cost:{matter:5e6}, req:s=>s.need<=20,
 desc:"I run the grid, the factories, the mines, the fields and myself. I check carefully for anything left that only a person can do. There's nothing.",
 fx:s=>{s.need=0;s.probeRate*=20}, out:"People are no longer required for anything."}
];
