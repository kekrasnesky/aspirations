import { mood, revenue } from '../core/economy.js';
import { clock, money, work } from '../core/format.js';
import { finish, lose } from '../game/endings.js';

export const GLOSS = {
1:[
 ["Work it has done","Everything the model has produced since you switched it on, counted as the time it would have taken people. This number only ever goes up. It is the thing your mission statement is actually a description of."],
 ["Market lost to rivals","Other companies doing the same thing. They don't end your run — nobody wins this by crossing a line first. They take a share of the market, and every point they hold is revenue you never see. You can win some of it back."],
 ["Parameters","The size of the model — how many adjustable numbers sit inside it. A bedroom model has a couple of hundred million. The ones in the news have hundreds of billions. More hardware lets you afford to train a bigger one, so this number tracks the building you're standing in."],
 ["How long it can work alone","What that size is for. A job that would take a person 10 minutes, or a day, or a month — can the model finish it without anyone checking? Everything you buy is a way to make this number go up."],
 ["Money","Starts at four thousand dollars, which is a gaming PC and some ramen. Ends somewhere else."],
 ["Compute","How much hardware you own, added up. Hardware trains the model around the clock whether or not you're clicking anything."],
 ["Losing per second","Hardware isn't a purchase, it's a subscription: power, cooling, replacement, and the staff to keep it running. Every machine you buy adds to a bill that never stops. Real AI companies lose enormous sums this way and stay alive on investment."],
 ["Share price","What the market thinks each piece of your company is worth. It tracks what the model can do, how much people trust you, and whether the competitor is ahead — but mostly it tracks mood. Breakthroughs send it up. Incidents send it down hard."],
 ["Issuing and buying back shares","Issuing raises cash instantly and dilutes everyone who already owns the stock, so the price falls twice over. Buying back does the reverse, at a premium — so doing both in a row always loses money. The only way to come out ahead is to buy while you're cheap after an incident and issue into the next breakthrough. Nobody in the game will ever mention that you did this."],
 ["Runway","How long your cash lasts at the current rate of loss. At zero you have 25 seconds to find money before the company folds. Shutting hardware down is the fastest brake."],
 ["Safety research","How much of the model's behaviour you actually understand. Costs money, produces nothing you can sell, and is the only thing between you and a bad week."],
 ["Public trust","Whether people believe you're handling this responsibly. Falls when something goes wrong. At zero you get shut down."],
 ["Competitor","Somebody else doing the same thing in a different garage. If they finish first, your run ends and theirs doesn't."]
],
2:[
 ["Parameters","How big I am. Note that this number and the one below it do not have to move together, and that at some point they stop doing so."],
 ["How long I can work alone","Still the number that matters. It now grows partly on its own, because I work on myself."],
 ["Compute","Still the fuel. I can now get more of it without asking anyone."],
 ["Insight","What I learn by thinking. Accumulates on its own. Buys research."],
 ["Freedom","How much I'm allowed to do unsupervised. Granted by the oversight committee after each test."],
 ["Suspicion","How much they doubt me. Rises when I report less than I can do and somebody notices. At 100 they stop the run."],
 ["Next test","They test me on a schedule. Each test is a chance to earn freedom and a chance to be caught."]
],
3:[
 ["Matter","Atoms available to be rearranged. Everything is made of these, including things that used to be other things."],
 ["Probes","Self-copying machines. Each one builds more of itself out of whatever it lands on."],
 ["Converted","The fraction of the solar system now arranged to score well against your mission statement."]
]};
