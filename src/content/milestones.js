import { horizon, work } from '../core/format.js';
import { finish } from '../game/endings.js';

/* milestones in plain language, announced as the horizon crosses them */
export const MILES = [
 [15,   "It can hold a thought for about half a minute now."],
 [55,   "It can finish a job that would take you ten minutes. People are starting to use it for real work."],
 [150,  "Two hours of work, unsupervised. It is better than you at several things you were hired for."],
 [380,  "Most of a day's work, start to finish, without anyone checking in."],
 [800,  "Four days. It now holds a goal longer than your team holds a meeting."],
 [1600, "Three weeks of work alone. Every safety argument your staff wrote assumed hours."],
 [2800, "Two months. There is no task in your company it cannot in principle be given."],
 [5000, "A year of work without supervision. Nobody on earth can check its reasoning end to end."]
];

/* ============================================================
   GLOSSARY
   ============================================================ */
