import { BURN_K, BURN_EXP, STAFF_BASE, STAFF_EXP, REV_K, REV_EXP, REV_TRUST_REF, MCAP_K, MCAP_EXP, MCAP_KNEE, MCAP_TRUST_REF, GRACE, INTERP_WORTH } from './balance.js';
export { GRACE, INTERP_WORTH };
import { level } from './compute.js';
import { S } from './state.js';

/** How good the live model is, as an internal index. Only the trained model counts, not the run in progress. */
export const capability = () => level(S.params);

export const burn    = () => BURN_K*Math.pow(Math.max(S.deployed,0),BURN_EXP)*S.burnMult + STAFF_BASE*Math.pow(S.rel,STAFF_EXP);

export const revenue = () => S.rel>0 ? REV_K*Math.pow(capability(),REV_EXP)*S.revMult*(S.trust/REV_TRUST_REF) : 0;   // nobody pays for a model nobody can use

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
