import { ACT1_PARAMS } from '../core/balance.js';
import { S } from '../core/state.js';

// the page cools as the thing grows. warm basement -> clinical -> void.
export const PAL={
 light:{
  warm:{paper:"#F1ECE3",panel:"#E7E1D6",sunk:"#DED7C9",ink:"#241D16",dim:"#5E5447",
        faint:"#8C8172",rule:"#D0C7B6",accent:"#2E6E92",warn:"#B05412",good:"#3B7A4A"},
  cold:{paper:"#E7E9E6",panel:"#DDE0DC",sunk:"#D2D6D1",ink:"#1A2124",dim:"#55605F",
        faint:"#7E8A8A",rule:"#C2C7C1",accent:"#1F6FA8",warn:"#B4500A",good:"#2F7D4F"}},
 dark:{
  warm:{paper:"#171209",panel:"#1F190F",sunk:"#110D07",ink:"#EDE3D2",dim:"#A4977F",
        faint:"#776C58",rule:"#352C1D",accent:"#6FB0DC",warn:"#E08A33",good:"#63B77F"},
  cold:{paper:"#121618",panel:"#191E21",sunk:"#0E1214",ink:"#DDE3E1",dim:"#9AA5A5",
        faint:"#6E797A",rule:"#2A3236",accent:"#5BA7DC",warn:"#E0812F",good:"#5FB183"}}
};

export const hx=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];

export const mix=(a,b,t)=>{const A=hx(a),B=hx(b);
  return "#"+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,"0")).join("")};

// runs every tick; only touch the styles when the result would change
let applied="";

export function applyWarmth(){
  const r=document.documentElement;
  if(S.act!==1){
    if(applied==="off") return; applied="off";
    ["paper","panel","sunk","ink","dim","faint","rule","accent","warn","good"]
      .forEach(k=>r.style.removeProperty("--"+k));
    return;
  }
  const dark = (document.documentElement.dataset.theme==="dark") ||
    (document.documentElement.dataset.theme!=="light" &&
     window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const set = dark?PAL.dark:PAL.light;
  // cools as the model grows: warm at the first 10M model, cold by the end of act I
  const t = Math.min(1, Math.max(0, Math.log10(Math.max(S.params,1e7)/1e7)/Math.log10(ACT1_PARAMS/1e7)));
  const key = (dark?"d":"l")+t.toFixed(3);
  if(applied===key) return; applied=key;
  Object.keys(set.warm).forEach(k=>r.style.setProperty("--"+k, mix(set.warm[k],set.cold[k],t)));
}
