import { BURN_K, BURN_EXP, STAFF_BASE, STAFF_EXP, STAFF_FROM, REV_TRUST_REF, USERS_K, USERS_EXP, USERS_GROW, USERS_CHURN, SERVE_K, SERVE_EXP, DAYS_PER_MONTH, MCAP_K, MCAP_EXP, MCAP_KNEE, MCAP_TRUST_REF, GRACE, INTERP_WORTH } from './balance.js';
export { GRACE, INTERP_WORTH };
import { level, throughput } from './compute.js';
import { S } from './state.js';

/** How good the live model is, as an internal index. Only the trained model counts, not the run in progress. */
export const capability = () => level(S.params);

/** Salaries: none until there are staff, then rising with each step the company takes. */
export const staff = rel => STAFF_BASE*Math.pow(Math.max(0,rel-STAFF_FROM),STAFF_EXP);
export const burn    = () => BURN_K*Math.pow(Math.max(S.deployed,0),BURN_EXP)*S.burnMult + staff(S.rel);

/* Users. Each takes the state, so the simulation runs the same arithmetic. */
/** How many people the hardware can serve: GPUs that train also answer, and bigger models cost more per answer. */
export const capacity = s => SERVE_K*throughput(s)/Math.pow(Math.max(s.params/1e9,1),SERVE_EXP);
/** How many people would use it, if the hardware could serve them all. */
export const demand = s => s.rel>0 ? USERS_K*Math.pow(level(s.params),USERS_EXP)*s.reach*s.revMult*Math.max(0,s.trust)/REV_TRUST_REF : 0;
/** Where the user count is heading. */
export const usersTarget = s => Math.min(demand(s), capacity(s));
export const paying = s => s.users*s.planConv;
/** Dollars per second (per day of play). Nobody pays for a model nobody can use. */
export const revenueOf = s => s.rel>0 ? paying(s)*s.planPrice/DAYS_PER_MONTH : 0;
export const revenue = () => revenueOf(S);

/** Users move toward the target a little each tick: they arrive slowly and leave faster. */
export function stepUsers(s, dt){
  const t=usersTarget(s), k=t>s.users?USERS_GROW:USERS_CHURN;
  s.users += (t-s.users)*Math.min(1,k*dt);
}

/** Take the next step on the business ladder. Returns the step taken. */
export function takeStep(s, r){
  s.rel++;
  if(r.kind==="plan"){ s.planPrice=r.price; s.planConv=r.conv }
  if(r.reach) s.reach*=r.reach;
  if(r.pay) s.money+=r.pay;
  return r;
}

export const net     = () => revenue()-burn();

export const runway  = () => net()>=0 ? Infinity : S.money/(-net());

/** Extra running cost per second from deploying another `c` dollars of hardware. */
export const addedBurn = c => BURN_K*(Math.pow(S.deployed+c,BURN_EXP)-Math.pow(S.deployed,BURN_EXP))*S.burnMult;

// what the market thinks the company is worth, and the mood it's in
// the model as the market prices it: itself up to the knee, logarithmic after
export const valued = c => c<=MCAP_KNEE ? Math.max(c,1) : MCAP_KNEE*(1+Math.log(c/MCAP_KNEE));
export const marketCap  = () => MCAP_K*Math.pow(valued(capability()),MCAP_EXP)*(S.trust/MCAP_TRUST_REF)*S.sentiment;

export const sharePrice = () => marketCap()/S.shares;

export const mood = () =>
  S.sentiment>=1.35 ? "Investors are euphoric. Nobody is asking what happens if it works." :
  S.sentiment>=1.12 ? "The market likes what it's seeing." :
  S.sentiment>=0.92 ? "The market is calm." :
  S.sentiment>=0.72 ? "Analysts are writing cautious notes." :
                      "Investors are spooked. Somebody is drafting a letter to the board.";

export const interpCost = () => 3000*Math.pow(1.42,S.interpBought);

export const exposure = () => Math.max(0, capability() - S.interp*INTERP_WORTH - 10);
