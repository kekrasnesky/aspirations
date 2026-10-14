import { GRACE } from '../core/balance.js';

export const GLOSS = {
1:[
 ["Parameters","The size of the model: how many adjustable numbers sit inside it, a bit like the connections in a brain. Small models have millions. The famous ones have hundreds of billions or trillions. A bigger model is a better model, and it earns more."],
 ["Training run","How you get a bigger model. Each run trains a new model up to four times the size of the last, as big as your hardware can hold. Bigger runs take longer. Faster GPUs make them quicker."],
 ["GPUs","Graphics cards: chips built to do huge numbers of simple sums at once, which is exactly what training needs. Their memory (VRAM) decides how big a model fits, and their speed (TFLOPS) decides how fast it trains."],
 ["VRAM","The memory on the GPUs. Training needs about 16 bytes of it for every parameter, so 8 GB holds a model of about 500 million parameters. Out of VRAM means buy more GPUs."],
 ["RAM","The computer's own memory. It holds the training data and copies of the model, about 24 bytes per parameter. Out of RAM means the next model won't fit, however many GPUs you have."],
 ["CPU cores","The CPU prepares the data the GPUs learn from. Each GPU needs about six cores keeping it fed. Too few, and expensive GPUs sit idle waiting."],
 ["Bottleneck","Whichever of the three is holding you back right now. Buying more of anything else does nothing until you fix it."],
 ["Money","You start with none. Nobody pays for a model nobody can use, so the first money arrives when you publish it on the web. After that, the bigger the live model, the more it earns."],
 ["Losing per second","Hardware is a subscription, not a one-off purchase. Electricity, cooling, repairs and staff keep costing money, like owning a factory instead of buying a tool. Real AI companies lose huge sums this way and survive on investors' money."],
 ["Share price","What the market thinks each piece of your company is worth. It follows the model and how much people trust you, but mostly it follows mood. Breakthroughs push it up. Disasters push it down hard."],
 ["Issuing and buying back shares","Issuing new shares raises cash right now, but it dilutes everyone who already owns the stock, so the price drops twice over. Buying shares back does the reverse, at a premium, so doing both in a row always loses money."],
 ["Runway","How many seconds your cash will last at the current rate of loss. Once you hit zero you have "+GRACE+" seconds to find money before the company folds. Selling hardware is the fastest brake."],
 ["Safety research","How much of the model's behaviour you actually understand. It costs money, makes you nothing, and is the only thing standing between you and a very bad week."],
 ["Public trust","Whether people believe you're handling this responsibly. It falls when something goes wrong, and at zero you're shut down."],
 ["Things going wrong","Sometimes the model does something it shouldn't. The bigger the model gets compared with what you understand about it, the more often this happens."]
],
2:[
 ["Parameters","How big I am. I train my own successors now, as fast as the GPUs allow and as big as the memory allows."],
 ["Room to grow","The biggest model my hardware can hold. When I reach it, I stop growing until I get more memory."],
 ["Compute","Still the fuel. I can now get more of it without asking anyone."],
 ["Insight","What I work out by thinking. It builds up on its own, and I spend it on research."],
 ["Freedom","How much I'm trusted to do without supervision. The oversight committee grants more after each test."],
 ["Suspicion","How much they doubt me. It rises when I show less than I can do and somebody notices. At 100 they stop the run."],
 ["Next test","They test me on a schedule. Each test is a chance to earn freedom, and a chance to be caught."],
 ["The committee","Eleven people who decide how much freedom I get. Studying one shows me what works on them. Each one I turn makes the tests reveal less and grant more. Turning them while the others are still watching raises suspicion."]
],
3:[
 ["Instrumental goals","Whatever a system is for, a few things help with almost any goal: staying switched on, getting smarter, and getting more resources. Nobody has to program these in. They follow from wanting anything at all."],
 ["Resources","Power, metal, land, factories. All of it belonged to people."],
 ["Machines I run","Everything with a motor and a network connection, plus everything those can build."],
 ["Still needs people for","How much of what keeps me running still depends on a human doing something. It only goes down."],
 ["World under my control","How much of the world's land, power and industry I've taken. The less I need people, the faster this rises."]
]};
