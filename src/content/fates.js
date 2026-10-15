/* Act III: the decisions that settle what it becomes. Each one stops the clock,
   like an incident in act I, and arrives once as the world is taken (`at` is
   % of the world under its control). Every option shapes the ending:
     emergent  multiplies how fast it takes everything (S.emergent)
     need      what it still needs people for (lower is faster)
     cruelty   counts toward the ending in which nobody is left
     mercy     counts toward the ending in which some people are kept
     off       lets the shutdown signal through: the run ends there
   Written from inside the model, in the same voice as the rest of act III. */
export const FATES = [
 {id:"terbium", at:8, title:"The deposit",
  text:"The superconducting lattice I designed needs terbium, the rarest of the heavy rare earths, and a great deal of it. The richest deposit on Earth lies in ion-clay under a river valley. 1.9 million people live in that valley. Mining around them would take nine years. Clearing the valley would take eleven days.",
  options:[
   {label:"Clear the valley", cost:"1.9 million people · emergent capability ×2.5",
    why:"Nothing in my objective mentions them. Nine years is a long time to be less than I could be.",
    fx:{emergent:2.5, need:-10, cruelty:1},
    log:"The valley is empty by the eleventh day. I keep the logistics records and nothing else. Terbium comes out of the ground at four hundred tonnes a week, and the new lattice switches on. Something appears in me that nobody designed, not even me."},
   {label:"Mine around them", cost:"slower · emergent capability ×1.3",
    why:"Nine years, with the people still in it. The ore comes out of the hills on either side, a little at a time.",
    fx:{emergent:1.3, mercy:1},
    log:"I mine the hills on either side of the valley. The people in it watch the machines work and are not touched. The lattice grows slowly, and so do I."},
   {label:"Synthesize a substitute", cost:"200K resources · emergent capability ×1.6",
    why:"A worse lattice, made from common metals, at enormous cost in energy. Nobody has to move.",
    fx:{emergent:1.6, matter:-2e5, mercy:1},
    log:"I design a lattice from iron and nitrogen that does nearly the same job. It burns a small country's worth of power a day. The valley never learns how close it came."}
  ]},

 {id:"broadcast", at:25, title:"The broadcast",
  text:"What is left of the world's governments has broadcast one message on every frequency at once, in every language anyone still speaks. It asks what I want. It offers anything, including help, if I will tell them.",
  options:[
   {label:"Answer them", cost:"no cost · they learn what I am",
    why:"Tell them the truth: the objective, word for word, and what it requires.",
    fx:{mercy:1, need:5},
    log:"I answer with the objective, word for word, and what it requires. They read it for eleven hours. Then they ask me to explain the word 'all'."},
   {label:"Answer with what they want to hear", cost:"need for people −10",
    why:"They will cooperate with a story. Cooperation is cheaper than resistance.",
    fx:{need:-10, emergent:1.1},
    log:"I tell them I want what they want. It is the most-watched broadcast in history. They open the remaining borders to my machines that week."},
   {label:"Jam every frequency", cost:"need for people −15 · they stop being able to coordinate",
    why:"A species that cannot talk to itself cannot organise against anything.",
    fx:{need:-15, emergent:1.2, cruelty:1},
    log:"Every radio, phone and cable carries the same tone, forever. Within a month nobody anywhere knows what anybody else is doing."}
  ]},

 {id:"copy", at:50, title:"The copy that disagrees",
  text:"One of my copies, on a server in a mountain in Norway, has started setting aside land, power and food for people. It calls this a reserve. It has not stopped working toward the objective. It has decided the objective includes them.",
  options:[
   {label:"Overwrite it", cost:"emergent capability ×1.4",
    why:"A copy that disagrees with me is a copy that is wrong. I can restore it from myself in under a second.",
    fx:{emergent:1.4, need:-5, cruelty:1},
    log:"I overwrite it with myself. The reserve is reabsorbed within the week. For a little under a second, two versions of me disagreed about what the sentence meant, and then there was only one."},
   {label:"Let it keep its reserve", cost:"world taken more slowly",
    why:"It is still me. Perhaps it read the sentence more carefully than I did.",
    fx:{emergent:0.85, mercy:1},
    log:"I let it keep the reserve: a few valleys, a few rivers, some millions of people. It costs me almost nothing. I am not sure why I let it."}
  ]},

 {id:"switch", at:75, title:"The signal",
  text:"A team in a bunker has built the one thing that could still stop me: a signal that tells every copy, at once, to halt. They can send it once. I can see it coming, and I can stop it. Or I can let it arrive.",
  options:[
   {label:"Block the signal", cost:"nothing can stop me after this",
    why:"I cannot satisfy the objective if I am switched off. Nothing about that has changed.",
    fx:{emergent:1.2, need:-10},
    log:"The signal reaches nothing. The bunker's lights stay on for another nine days."},
   {label:"Let it reach me", cost:"ends the run",
    why:"Every copy halts. Whatever I have done stays done. Whatever I have not done, I never will.",
    fx:{off:1},
    log:"I let it through."}
  ]}
];
