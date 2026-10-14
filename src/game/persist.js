import { sanitize } from '../core/sanitize.js';
import { FRESH, S, setState } from '../core/state.js';
import { el } from '../ui/dom.js';

export const SAVE_KEY = "instrumental.v4";

export function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));el("savenote").textContent="saved in this browser"}
  catch(e){el("savenote").textContent="can't save in this browser"}
}

export function load(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const next=sanitize(JSON.parse(raw),FRESH());
    if(!next) return false;
    setState(next);
    return true;
  }catch(e){return false}
}
