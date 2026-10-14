import { FRESH, S, setState } from '../core/state.js';
import { el } from '../ui/dom.js';

export function save(){
  try{localStorage.setItem("instrumental.v3",JSON.stringify(S));el("savenote").textContent="saved in this browser"}
  catch(e){el("savenote").textContent="can't save in this browser"}
}

export function load(){
  try{
    const raw=localStorage.getItem("instrumental.v3");
    if(!raw) return false;
    const o=JSON.parse(raw);
    if(!o||typeof o.act!=="number"||o.over) return false;
    setState(Object.assign(FRESH(),o));
    return true;
  }catch(e){return false}
}
