/* The business, one step at a time. req is the size of trained model each step
   needs. A "product" step makes it worth more to people (value multiplies the
   fair price, so market demand at any given price rises) and brings it to more
   of them (mkt multiplies the marketing rate). A "funding" step is money from
   outside, which arrives all at once. The first step puts it online: one cloud
   server and a $3 subscription, both of which you can change from then on. */
export const REL = [
 {req:1.2e8, kind:"product", n:"Put it on the web",
  why:"Until now it has only talked to you. You rent one cloud server and put it on a website, with a $3 a month subscription for anyone who wants more than a few questions a day. It's small and it makes mistakes."},
 {req:1.2e9, kind:"funding", pay:2e5, n:"Apply for a research grant",
  why:"A foundation that funds open research is taking applications. A model this size, trained by one person on hardware they mostly built themselves, is the kind of thing they like to fund."},
 {req:3e9, kind:"funding", pay:1e7, mkt:1.15, n:"Quit your job and raise money",
  why:"Investors want to meet you. There is a graph and the graph goes up and the graph does most of the talking. You would have to hire people, and pay them."},
 {req:1.3e10, kind:"product", value:1.4, mkt:1.25, n:"Launch a pro plan",
  why:"Faster answers, longer conversations, files and images. People will pay more for it than for the basic subscription."},
 {req:9e10, kind:"product", value:1.6, mkt:1.25, n:"Sell it to companies",
  why:"Business accounts with admin controls and an invoice. Companies pay far more per seat than people do."},
 {req:1e11, kind:"funding", pay:1e9, mkt:1.2, n:"Raise a huge funding round",
  why:"Investment funds owned by entire countries. Some of it would go on putting the model in front of everyone. Nobody in the room asks what happens if it works."},
 {req:1e12, kind:"funding", pay:1.5e10, mkt:1.2, n:"Take the company public",
  why:"You'd ring the bell. The people who told you this was a waste of time would be there, and so proud of you. The prospectus contains a risk section which is accurate, and which nobody reads."}
];

/** What a step changes, in game terms. */
export const relEffects = r => [
  r.kind==="product" && !r.value ? "1 cloud server · $3/mo subscription" : "",
  r.value ? "Fair price ×"+r.value : "",
  r.mkt ? "Marketing rate +"+Math.round((r.mkt-1)*100)+"%" : ""
].filter(Boolean).join(" · ");
