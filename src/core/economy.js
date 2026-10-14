import { BURN_K, BURN_EXP, STAFF_BASE, STAFF_EXP, STAFF_FROM, REV_TRUST_REF, USERS_K, USERS_EXP, USERS_GROW, USERS_CHURN, CLOUD_COST, CLOUD_USERS, SERVE_EXP, DAYS_PER_MONTH, MCAP_K, MCAP_EXP, MCAP_KNEE, MCAP_TRUST_REF, GRACE, INTERP_WORTH, POWER_PRICE, BASE_W, W_PER_GB, W_PER_CORE, GPU_IDLE, MAX_PAY, PRICE_K, PRICE_EXP, START_PRICE, MARKETING_MIN, MARKETING_MAX, AD_BASE, AD_PER_USER, AD_STEP } from './balance.js';
export { GRACE, INTERP_WORTH };
import { level } from './compute.js';
import { S } from './state.js';

/** How good the live model is, as an internal index. Only the trained model counts, not the run in progress. */
export const capability = () => level(S.params);

/* Every cost and every user figure takes the state, so the simulation runs the same arithmetic. */

/** Salaries: none until there are staff, then rising with each step the company takes. */
export const staff = rel => STAFF_BASE*Math.pow(Math.max(0,rel-STAFF_FROM),STAFF_EXP);
/** Repairs, cooling and rack space: grows with what you've bought. */
export const upkeep = s => BURN_K*Math.pow(Math.max(s.deployed,0),BURN_EXP)*s.burnMult;
/** Kilowatts drawn right now. GPUs only draw their full rating while a run is training. */
export const powerKw = s => (BASE_W + s.gpuW*(s.target>0?1:GPU_IDLE) + s.ram*W_PER_GB + s.cores*W_PER_CORE)/1000;
/** Electricity, in dollars per day. */
export const powerCost = s => powerKw(s)*24*POWER_PRICE*s.powerMult;
/** Cloud servers, in dollars per day. */
export const cloudCost = s => s.cloud*CLOUD_COST;
export const burnOf = s => upkeep(s) + staff(s.rel) + powerCost(s) + cloudCost(s);
export const burn = () => burnOf(S);

/** People one cloud server can answer: bigger models need more of a server each. */
export const perServer = s => CLOUD_USERS*s.serveMult/Math.pow(Math.max(s.params/1e9,1),SERVE_EXP);
export const capacity = s => s.cloud*perServer(s);
/** How many people would use it, if there were servers enough for all of them. */
export const demand = s => s.rel>0 ? USERS_K*Math.pow(level(s.params),USERS_EXP)*s.revMult*Math.sqrt(s.marketing)*Math.max(0,s.trust)/REV_TRUST_REF : 0;
/** Where the user count is heading. */
export const usersTarget = s => Math.min(demand(s), capacity(s));

/** The monthly price at which revenue per user peaks. It rises with the model and with each product step. */
export const fairPrice = s => PRICE_K*Math.pow(Math.max(level(s.params),1),PRICE_EXP)*s.payMult;
/** Market demand: the share of users who pay at price p. */
export const payShare = (s, p=s.planPrice) => s.rel>0 && p>0 ? MAX_PAY*Math.exp(-p/fairPrice(s)) : 0;
export const paying = s => s.users*payShare(s);
/** Dollars per second (per day of play). Nobody pays for a model nobody can use. */
export const revenueOf = s => paying(s)*s.planPrice/DAYS_PER_MONTH;
export const revenue = () => revenueOf(S);

/** Users move toward the target a little each tick: they arrive at the marketing rate and leave faster. */
export function stepUsers(s, dt){
  const t=usersTarget(s), k=t>s.users?USERS_GROW*s.marketing:USERS_CHURN;
  s.users += (t-s.users)*Math.min(1,k*dt);
}
/** The share of the gap to demand that closes each day. */
export const marketingRate = s => USERS_GROW*s.marketing;
/** Change the marketing rate, within bounds. */
export function market(s, x){ s.marketing=Math.min(MARKETING_MAX,Math.max(MARKETING_MIN,s.marketing*x)) }
export const adCost = s => Math.max(AD_BASE, s.users*AD_PER_USER)*Math.pow(AD_STEP,s.ads);

/** Take the next step on the business ladder. Returns the step taken. */
export function takeStep(s, r){
  s.rel++;
  if(s.rel===1){ s.planPrice=START_PRICE; s.cloud=Math.max(s.cloud,1) }
  if(r.value) s.payMult*=r.value;
  if(r.mkt) market(s,r.mkt);
  if(r.pay) s.money+=r.pay;
  return r;
}

export const net     = () => revenue()-burn();

export const runway  = () => net()>=0 ? Infinity : S.money/(-net());

/** Extra running cost per second from deploying another `c` dollars of hardware. */
export const addedBurn = c => BURN_K*(Math.pow(S.deployed+c,BURN_EXP)-Math.pow(S.deployed,BURN_EXP))*S.burnMult;
/** Extra electricity per day from `w` more watts running flat out. */
export const addedPower = w => w/1000*24*POWER_PRICE*S.powerMult;

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
