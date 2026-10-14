import { sanitize } from '../core/sanitize.js';
import { FRESH, S, setState } from '../core/state.js';
import { el } from '../ui/dom.js';

export const SAVE_KEY = "instrumental.v4";

/* Nothing is saved until the player has typed a mission: the autosave timers
   run on the title screen too, and a save without one would skip the prompt on
   the next visit. */
export function save(){
  if(!S.mission) return;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));el("savenote").textContent="saved in this browser"}
  catch(e){el("savenote").textContent="can't save in this browser"}
}

export function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const next=sanitize(JSON.parse(raw),FRESH());
    if(!next || !next.mission) return false;
    setState(next);
    return true;
  }catch(e){return false}
}
