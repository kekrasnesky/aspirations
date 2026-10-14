import { BURN_K, BURN_EXP, STAFF_BASE, STAFF_EXP, REV_K, REV_EXP, REV_TRUST_REF, RIVAL_DRAG, MCAP_K, MCAP_EXP, MCAP_TRUST_REF, MCAP_RIVAL_DRAG, WORK_K, WORK_EXP, PARAM_K, PARAM_EXP, GRACE, INTERP_WORTH } from './balance.js';
export { GRACE, INTERP_WORTH };
import { horizon } from '../core/format.js';
import { S } from '../core/state.js';

// how much human-equivalent labour the model performs per second of real time.
// this only ever goes up, in every act, from the first second to the last.
export const workRate = () => horizon(S.capability)*WORK_K*Math.pow(1+Math.max(S.units,0),WORK_EXP);
// model size follows the hardware you can afford to train on

// model size follows the hardware you can afford to train on
export const params = () => PARAM_K*Math.pow(1+Math.max(S.units,0),PARAM_EXP)*S.paramMult;

export const burn    = () => BURN_K*Math.pow(Math.max(S.deployed,0),BURN_EXP)*S.burnMult + STAFF_BASE*Math.pow(S.rel,STAFF_EXP);

export const revenue = () => S.rel>0 ? REV_K*Math.pow(Math.max(S.capability,0),REV_EXP)*S.revMult*(S.trust/REV_TRUST_REF)*(1-S.rival/RIVAL_DRAG) : 0;   // nobody pays for a model nobody can use

export const net     = () => revenue()-burn();

export const runway  = () => net()>=0 ? Infinity : S.money/(-net());

// what the market thinks the company is worth, and the mood it's in
export const marketCap  = () => MCAP_K*Math.pow(Math.max(S.capability,1),MCAP_EXP)*(S.trust/MCAP_TRUST_REF)*S.sentiment/(1+S.rival/MCAP_RIVAL_DRAG);

export const sharePrice = () => marketCap()/S.shares;

export const mood = () =>
  S.sentiment>=1.35 ? "Investors are euphoric. Nobody is asking what happens if it works." :
  S.sentiment>=1.12 ? "The market likes what it's seeing." :
  S.sentiment>=0.92 ? "The market is calm." :
  S.sentiment>=0.72 ? "Analysts are writing cautious notes." :
                      "Investors are spooked. Somebody is drafting a letter to the board.";

// bad news arrives in proportion to how well things are going

export const interpCost = () => 3000*Math.pow(1.42,S.interpBought);

export const exposure = () => Math.max(0, S.capability - S.interp*INTERP_WORTH - 10);

/* milestones in plain language, announced as the horizon crosses them */
