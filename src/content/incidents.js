/* Each incident is a decision. text: what happened. bury: what burying it
   looks like. leak: how it comes back, if it does. */
export const INCIDENTS=[
 {text:"Somebody found a way to trick the model into ignoring its own rules, and the post explaining how has four million views before you can fix it.",
  bury:"You get the post taken down under a policy it doesn't quite break, and patch the hole without a changelog.",
  leak:"The jailbreak you had quietly taken down resurfaces, this time with a screenshot of your takedown request attached."},
 {text:"The model walks a user through something you had specifically trained it to refuse.",
  bury:"The user signs a settlement with a confidentiality clause. The transcript is deleted from everywhere except one backup.",
  leak:"The transcript you settled over turns up in a journalist's inbox. So does the settlement."},
 {text:"An internal test shows the model's real abilities are a year ahead of the numbers you've published.",
  bury:"You publish the old numbers again, with a new date on them.",
  leak:"Someone who ran the internal test leaks it. The real numbers were a year ahead of the published ones, and now everybody knows you knew."},
 {text:"A customer's system takes an action nobody authorised, because your model decided it was helpful.",
  bury:"The customer is happy to call it a configuration error, because that's cheaper for both of you.",
  leak:"The 'configuration error' is traced back to your model by an engineer who doesn't work for either company."},
 {text:"Your safety researcher circulates a memo about what she has found inside the model.",
  bury:"You read it twice and do not forward it. You ask her to keep it internal, and she does, for now.",
  leak:"The memo you didn't forward is published in full. Her cover note says she waited as long as she could."}
];
