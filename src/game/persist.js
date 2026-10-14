import { REL } from '../content/releases.js';
import { sanitize } from '../core/sanitize.js';
import { FRESH, S, setState } from '../core/state.js';
import { el } from '../ui/dom.js';

export const SAVE_KEY = "instrumental.v5";   // v5: the model is a parameter count driven by hardware; older saves don't fit

/* Nothing is saved until the player has typed a mission: the autosave timers
   run on the title screen too, and a save without one would skip the prompt on
   the next visit. */
export function save(){
  if(!S.mission) return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));el("savenote").textContent="saved in this browser"}
  catch(e){el("savenote").textContent="can't save in this browser"}
}

/** Saves from before subscribers have taken business steps but have no plan.
 *  Give them the plan and reach those steps would have set; users rebuild on their own. */
export function upgrade(s){
  if(s && s.rel>0 && !s.planPrice){
    for(const r of REL.slice(0,s.rel)){
      if(r.kind==="plan"){ s.planPrice=r.price; s.planConv=r.conv }
      if(r.reach) s.reach*=r.reach;
    }
  }
  return s;
}

export function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const next=upgrade(sanitize(JSON.parse(raw),FRESH()));
    if(!next || !next.mission) return false;
    setState(next);
    return true;
  }catch(e){return false}
}
