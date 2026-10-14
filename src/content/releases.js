/* The business, one step at a time. req is the size of trained model each step
   needs. A "plan" step changes what people pay and how many of them you reach;
   it brings in no lump sum, only subscribers over time. A "funding" step is
   money from outside, which does arrive all at once. */
export const REL = [
 {req:1.2e8, kind:"plan", price:3, conv:.02, reach:1, n:"Put it on the web for free",
  why:"Until now it has only talked to you. You put it on a free website with a tip jar: anyone who likes it can chip in $3 a month to keep the servers on. It's small and it makes mistakes, but it's free."},
 {req:1.2e9, kind:"funding", pay:5e5, n:"Apply for a research grant",
  why:"A foundation that funds open research is taking applications. A model this size, trained by one person on hardware they mostly built themselves, is the kind of thing they like to fund."},
 {req:3e9, kind:"funding", pay:1.1e7, n:"Quit your job and raise money",
  why:"Investors want to meet you. There is a graph and the graph goes up and the graph does most of the talking. You would have to hire people, and pay them."},
 {req:1.3e10, kind:"plan", price:8, conv:.03, reach:1.2, n:"Launch a paid plan",
  why:"A model this size is finally good enough that people would pay for it: $8 a month for faster answers and longer conversations. The free version stays."},
 {req:9e10, kind:"plan", price:20, conv:.05, reach:1.3, n:"Sell it to companies",
  why:"Business accounts at $20 a seat. Your model would start doing a meaningful share of somebody's actual payroll."},
 {req:1e11, kind:"funding", pay:1.8e9, reach:1.2, n:"Raise a huge funding round",
  why:"Investment funds owned by entire countries. Some of it would go on putting the model in front of everyone. Nobody in the room asks what happens if it works."},
 {req:1e12, kind:"funding", pay:2.4e10, reach:1.2, n:"Take the company public",
  why:"You'd ring the bell. The people who told you this was a waste of time would be there, and so proud of you. The prospectus contains a risk section which is accurate, and which nobody reads."}
];
