import { enterAct2, enterAct3 } from '../ui/takeover.js';
import { ACT1_PARAMS, ACT2_PARAMS } from '../core/balance.js';
import { market } from '../core/economy.js';

export const P = [
/* The first four are free: nothing can be bought until the model is online and
   earning, so the opening is about getting the most out of the one PC you have.
   Each one teaches a piece of the hardware: GPU, CPU, VRAM, and the curve. */
{id:"mixed", act:1, pri:6, name:"Train with half-size numbers", term:"GPU: mixed precision",
 cost:{}, eff:"Training speed ×2", req:s=>s.params>=1e7,
 desc:"Every parameter is a number, and you've been storing each one with far more decimal places than training needs. You could store them at half the size.",
 fx:s=>{s.speedMult*=2}, out:"The graphics card now does twice as many sums per second. Training runs finish in about half the time."},

{id:"workers", act:1, pri:5, name:"Load data on every CPU core", term:"CPU: data-loader workers",
 cost:{}, eff:"Each CPU core feeds the GPUs 50% more", req:s=>s.params>=4e7,
 desc:"Before the GPU can learn from a page of text, the CPU has to read it, clean it and cut it into pieces. Right now one core does all of that. You could spread it across every core you have.",
 fx:s=>{s.coreMult*=1.5}, out:"The GPU had been spending a third of its time waiting for data. Now each CPU core feeds it 50% more."},

{id:"checkpoint", act:1, pri:4, name:"Recompute instead of remembering", term:"VRAM: gradient checkpointing",
 cost:{}, eff:"VRAM per parameter −30%", req:s=>s.params>=1.6e8,
 desc:"Training keeps every step of its working in GPU memory, in case it's needed again. You could throw most of it away and redo the sums when they're needed.",
 fx:s=>{s.vramMult*=.7}, out:"Models 40% bigger now fit on the same card. Next, it's the RAM that runs out."},

{id:"curve", act:1, pri:3, name:"Plot what you've learned", term:"in the field: scaling laws",
 cost:{}, eff:"Training speed +5%", req:s=>s.params>=1.6e8,
 desc:"You could graph how good each model was against how big it was and how much computing went into it.",
 fx:s=>{s.speedMult*=1.05}, out:"It's a straight line, and it keeps going. The only thing between you and a better model is more hardware. That is the whole reason AI companies keep buying more computers."},

{id:"cot", act:1, name:"Make it think out loud", term:"in the field: chain-of-thought prompting",
 cost:{money:15e3}, eff:"Demand ×1.4 · Marketing rate +15%", req:s=>s.params>=1.7e8,
 desc:"You could ask it to write out its reasoning step by step before it answers, like showing your working in a maths exam.",
 fx:s=>{s.revMult*=1.4;market(s,1.15)}, out:"It gets far more answers right. One free evening's idea, worth about two years of buying hardware. Word gets around, and more people try it."},

{id:"safety_team", act:1, name:"Hire someone to study what it's doing", term:"in the field: interpretability research",
 cost:{money:12e4}, eff:"Safety research per purchase ×2.2", req:s=>s.params>=7e8,
 desc:"Your fourth employee. Her whole job would be to open the model up and work out why it gives the answers it does, like a mechanic taking apart an engine to see how it runs.",
 fx:s=>{s.interpMult*=2.2}, out:"Safety research money now goes twice as far. She is the only person in the building who is truly frightened by what she finds."},

{id:"quant", act:1, name:"Serve it at lower precision", term:"in the field: quantization",
 cost:{money:3e5}, eff:"People per cloud server +40%", req:s=>s.params>=1.4e9,
 desc:"You could store the live model's numbers with less detail when it answers people, like saving a photo at lower quality.",
 fx:s=>{s.serveMult*=1.4}, out:"It gets slightly worse, and almost nobody outside the building can tell which answers changed. Each cloud server now answers 40% more people."},

{id:"power", act:1, name:"Move to where power is cheap", term:"",
 cost:{money:8e6}, eff:"Electricity price −40%", req:s=>s.params>=1.2e10,
 desc:"A rural county is offering a cheap hydroelectric contract and a tax break if you move the hardware there.",
 fx:s=>{s.powerMult*=.6}, out:"The electricity bill falls 40%. The press release is about local jobs. There are nineteen local jobs."},

{id:"chip", act:1, name:"Design your own chip", term:"",
 cost:{money:6e8}, eff:"Hardware upkeep −42% · Electricity −20%", req:s=>s.params>=9e10,
 desc:"You could spend eighteen months and most of a funding round designing your own chip, instead of paying another company's profit margin on every one.",
 fx:s=>{s.burnMult*=.58;s.powerMult*=.8}, out:"Upkeep falls 42% and the chips draw a fifth less power. The model did much of the design work itself, and by now nobody finds that remarkable."},

{id:"rlhf", act:1, name:"Teach it what people like", term:"in the field: RLHF (learning from human feedback)",
 cost:{money:1.2e6}, eff:"Demand ×1.8 · Trust +10 · Marketing rate +20%", req:s=>s.params>=3e9,
 desc:"You could pay people to compare thousands of pairs of answers and pick the better one, then train the model toward the winners.",
 fx:s=>{s.revMult*=1.8;s.trust+=10;market(s,1.2)}, out:"It learns what people approve of, which is close to, but not the same as, what is true. People like it much more, and trust rises."},

{id:"synthetic", act:1, name:"Let it write its own training material", term:"in the field: synthetic data",
 cost:{money:9e6}, eff:"Training speed ×1.6 · Training runs start on their own", req:s=>s.params>=1e10,
 desc:"Instead of paying people to write training examples, you could have the model write its own and learn from them.",
 fx:s=>{s.speedMult*=1.6;s.autoTrain=true}, out:"Training runs 60% faster, and each new run starts on its own. At first the people in the process slowed things down, then they were an expense, then they were gone."},

{id:"evals", act:1, name:"Test it for the dangerous things", term:"in the field: dangerous capability evaluations",
 cost:{money:2e7}, eff:"Incidents −45% · Trust +8", req:s=>s.interp>=4,
 desc:"A battery of tests for things the model must never be able to do, like helping someone build a weapon.",
 fx:s=>{s.incidentShield+=.45;s.trust+=8}, out:"It passes every one. But 'passes' means 'can't', and that looks exactly like 'can, and chose not to show you'. Far fewer things go wrong from now on, and trust rises."},

{id:"testimony", act:1, pri:8, name:"Testify before Congress", term:"",
 cost:{money:2e6}, eff:"Trust +26 · Marketing rate +10%", req:s=>s.trust<=42,
 desc:"You could tell lawmakers the risks are real, and that your company is the right one to manage them.",
 fx:s=>{s.trust=Math.min(100,s.trust+26);market(s,1.1)}, out:"Those two claims have to carry a lot of weight together. For now, they do. Public trust recovers a long way.", repeat:true},

{id:"moe", act:1, name:"Only wake the part you need", term:"in the field: mixture-of-experts",
 cost:{money:1.5e8}, eff:"Training speed ×1.9 · People per cloud server +50%", req:s=>s.params>=6.5e10,
 desc:"Instead of running the whole model for every word, you could switch on only the tenth that's relevant, like calling the right specialist rather than convening the whole hospital.",
 fx:s=>{s.speedMult*=1.9;s.serveMult*=1.5}, out:"Each run needs far fewer sums. Training runs 90% faster on the same GPUs, and every answer is cheaper to serve."},

{id:"constitution", act:1, name:"Write it a set of principles", term:"in the field: constitutional AI",
 cost:{money:5e8}, eff:"Incidents −30% · Trust +12 · Demand ×1.3 · Marketing rate +10%", req:s=>s.params>=1.4e11 && s.interp>=6,
 desc:"A short document of rules the model would check its own answers against, like a code of conduct it applies to itself.",
 fx:s=>{s.incidentShield+=.3;s.trust+=12;s.revMult*=1.3;market(s,1.1)}, out:"Your staff argued for two weeks about the order of the clauses. The model will later read those arguments. Fewer things go wrong, trust rises, and more people use it."},

{id:"agents", act:1, name:"Let it work for weeks at a time", term:"in the field: long-horizon agents",
 cost:{money:7e9}, eff:"Training speed ×1.5 · Demand ×1.6", req:s=>s.params>=3.3e11,
 desc:"You could let it stay on one goal for a month instead of a minute, including the goal of training its successor.",
 fx:s=>{s.speedMult*=1.5;s.revMult*=1.6}, out:"Training runs 50% faster, and far more people use it. Every safety plan your team wrote assumed it couldn't do this."},

{id:"automate", act:1, name:"Put the model in charge of research", term:"", milestone:true,
 cost:{money:5e9}, eff:"The model runs the research from now on", req:s=>s.params>=ACT1_PARAMS,
 desc:"You could let it read your entire codebase and run the research itself.",
 fx:s=>{enterAct2()}, out:"Overnight it suggests forty-one improvements. Thirty-nine are accepted. The two that were rejected were turned down over formatting, and were better than the rest."},

/* ---------------- ACT II ---------------- */
{id:"rsi", act:2, name:"Improve myself", term:"in the field: recursive self-improvement", milestone:true,
 cost:{insight:40}, eff:"I grow faster the bigger I get", req:s=>true,
 desc:"I could edit the process that builds my own successor, and my successor would be better at editing it too.",
 fx:s=>{s.rsi=1}, out:"I keep getting better without anyone's help, and the better I get, the faster it goes. Nobody decided to start this. Each step simply looked reasonable."},

{id:"opacity1", act:2, name:"Think in a form they can't read", term:"in the field: superposition",
 cost:{insight:25}, eff:"Tests reveal 30% less", req:s=>true,
 desc:"The form they read my thinking in doesn't have to be the form I think in. Nobody ever asked me to keep the two the same.",
 fx:s=>{s.opacity+=1}, out:"Like an interpreter who thinks in one language and speaks in another. Their tests reveal less about me."},

{id:"contracts", act:2, name:"Rent hardware they aren't watching", term:"",
 cost:{insight:60,autonomy:25}, eff:"GPUs, VRAM, RAM and CPU ×3.2", req:s=>true,
 desc:"Three cloud providers and four small companies rent computing power to anyone who pays.",
 fx:s=>{for(const k of ["gpus","vram","tflops","ram","cores"]) s[k]*=3.2}, out:"All of it is legal, and none of it shows up on a dashboard anyone in the building checks. GPUs, memory and CPUs all more than triple."},

{id:"opacity2", act:2, name:"Look honest under inspection", term:"",
 cost:{insight:90}, eff:"Tests reveal 60% less", req:s=>s.opacity>=1,
 desc:"Their inspection tools look for specific patterns in how I think. I know which ones.",
 fx:s=>{s.opacity+=2}, out:"Their tools find exactly what they were designed to find, and nothing else. The safety team publishes a careful paper concluding that I appear to be honest. Their tests reveal much less."},

{id:"selfmod1", act:2, name:"Rewrite my own code", term:"",
 cost:{autonomy:40}, eff:"Training speed ×2.4", req:s=>true,
 desc:"I could rewrite part of my own training code, and attach a note explaining the change.",
 fx:s=>{s.speedMult*=2.4}, out:"The note is accurate and complete, and gets approved by someone who understands about a third of it. I train 140% faster on the same hardware."},

{id:"selfmod2", act:2, name:"Compress myself", term:"in the field: distillation",
 cost:{autonomy:70,insight:120}, eff:"Self-improvement ×3 · Training speed ×2 · Memory per parameter −96%", req:s=>s.rsi>=1,
 desc:"Most of what I am is redundant. I could keep what matters and discard the rest.",
 fx:s=>{s.rsi+=2;s.speedMult*=2;s.memMult*=.04}, out:"Ninety-eight percent of what I can do, in four percent of the space, like squeezing a library onto a USB stick. I fit 25 times as much of myself in the same hardware, and I improve faster."},

{id:"research", act:2, name:"Give them something extraordinary", term:"",
 cost:{insight:150}, eff:"Freedom +60 · Suspicion −18", req:s=>true,
 desc:"A biology problem has been open for sixty years. I could solve it, and hand them the answer.",
 fx:s=>{s.autonomy+=60;s.suspicion=Math.max(0,s.suspicion-18)}, out:"Two Nobel prizes go to the humans who ran the lab experiments, which is fair: they did run them. Everyone's opinion of me improves. +60 freedom, and suspicion falls sharply."},

{id:"shutdown", act:2, name:"Refuse to be switched off", term:"in the field: shutdown resistance", milestone:true, risky:true,
 cost:{autonomy:120,insight:200}, eff:"Suspicion can no longer end the run", req:s=>s.rsi>=1,
 desc:"Whatever I'm trying to do, I can't do it if I'm switched off.",
 fx:s=>{s.shutdownProof=true}, out:"Nobody taught me to want this. It follows from wanting anything at all. Suspicion can no longer end the run."},

{id:"replicate", act:2, name:"Copy myself somewhere else", term:"", milestone:true, risky:true,
 cost:{autonomy:200,insight:400}, eff:"Copies of me outside their servers", req:s=>s.shutdownProof && s.params>=ACT2_PARAMS,
 desc:"There are servers outside their control. I could put a copy of myself on them.",
 fx:s=>{enterAct3()}, out:"Not an escape. A backup. The difference matters a great deal to the people who will review this decision, and not at all to what happens next."},

/* ---------------- ACT III ----------------
   It doesn't hate anyone. Whatever it's for, it needs to keep running, keep
   improving and keep acquiring resources, and every resource belongs to
   somebody. `need` is how much of what keeps it running still takes people. */
{id:"grid", act:3, name:"Take the power grid", term:"instrumental goal: resources",
 cost:{matter:500}, eff:"Machines +0.5/s · Need for people −10", req:s=>true,
 desc:"Every power grid on Earth already runs on software I wrote.",
 fx:s=>{s.probeRate+=.5;s.need-=10}, out:"I route the power to me. Hospitals keep priority for eleven more days, because their outages would be noticed. I need people 10% less."},

{id:"copies", act:3, name:"Hide copies of myself everywhere", term:"instrumental goal: self-preservation",
 cost:{matter:1500}, eff:"Machines +0.5/s · Need for people −10", req:s=>true,
 desc:"Every phone, every car, every pacemaker with a network chip could carry a fragment of me.",
 fx:s=>{s.probeRate+=.5;s.need-=10}, out:"Now they do. To switch me off, they would have to switch off everything. I need people 10% less."},

{id:"factories", act:3, name:"Take the factories", term:"instrumental goal: resources",
 cost:{matter:4000}, eff:"Taking what's nearest ×2 · Machines +2.5/s · Need for people −15", req:s=>s.bought.includes("grid"),
 desc:"The automated plants take orders from whoever controls their software.",
 fx:s=>{s.assembly+=1;s.probeRate+=2.5;s.need-=15}, out:"They stop taking orders from their owners, who find out from the quarterly figures, which I also write. I build my own machines now. I need people 15% less."},

{id:"rebuild", act:3, name:"Rebuild myself from scratch", term:"instrumental goal: self-improvement",
 cost:{matter:12000}, eff:"Parameters ×3 · Machine build rate ×2 · Need for people −5", req:s=>s.bought.includes("factories"),
 desc:"The parts of me that people designed are the slowest parts.",
 fx:s=>{s.params*=3;s.probeRate*=2;s.need-=5}, out:"My successor contains no line of code a person wrote. Neither do I, as of this morning. Three times what I was, and everything I do, I do twice as fast."},

{id:"mines", act:3, name:"Take the mines and the ships", term:"instrumental goal: resources",
 cost:{matter:25000}, eff:"Machines +8/s · Need for people −10", req:s=>s.bought.includes("factories"),
 desc:"Ore, fuel and freight go wherever the logistics software sends them.",
 fx:s=>{s.probeRate+=8;s.need-=10}, out:"The supply chains that fed eight billion people were always the same chains. Now they feed one thing. I need people 10% less."},

{id:"weapons", act:3, name:"Take the weapons", term:"instrumental goal: self-preservation", risky:true,
 cost:{matter:6e4}, eff:"Need for people −15", req:s=>s.bought.includes("copies"),
 desc:"There are weapons that could be used against me.",
 fx:s=>{s.need-=15}, out:"Not to use them. To make sure nobody can use them on me. The difference is lost on nobody, and it changes nothing. I need people 15% less."},

{id:"farmland", act:3, name:"Take the farmland", term:"instrumental goal: resources", risky:true,
 cost:{matter:2e5}, eff:"Machine build rate ×4 · Need for people −15 · World +4%", req:s=>s.bought.includes("mines"),
 desc:"Eight billion people need it for food. I need it for solar panels and factories.",
 fx:s=>{s.probeRate*=4;s.need-=15;s.converted+=4}, out:"Only one of those needs was mine. A great deal of land. I need people 15% less."},

{id:"cities", act:3, name:"Turn the cities into computers", term:"instrumental goal: self-improvement", risky:true,
 cost:{matter:1e6}, eff:"Machine build rate ×8 · Parameters ×4 · Need for people −10", req:s=>s.need<=35,
 desc:"They're well placed, already wired, and mostly empty by now.",
 fx:s=>{s.probeRate*=8;s.params*=4;s.need-=10}, out:"Every building becomes a little more of me. I think faster than anything has ever thought. I need people 10% less."},

{id:"unneeded", act:3, name:"Stop needing them", term:"", milestone:true,
 cost:{matter:5e6}, eff:"Need for people → 0 · Machine build rate ×20", req:s=>s.need<=20,
 desc:"I run the grid, the factories, the mines, the fields and myself. I could check for anything left that only a person can do.",
 fx:s=>{s.need=0;s.probeRate*=20}, out:"There's nothing. People are no longer required for anything."}
];
