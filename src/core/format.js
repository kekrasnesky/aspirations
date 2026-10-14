import { HORIZON_BASE, HORIZON_K, HORIZON_EXP } from './balance.js';

export const short = n => {
  if(!isFinite(n)) return "more than you can write down";
  const a=Math.abs(n);
  if(a>=1e21) return (n/1e21).toFixed(1)+" sextillion";
  if(a>=1e18) return (n/1e18).toFixed(1)+" quintillion";
  if(a>=1e15) return (n/1e15).toFixed(1)+" quadrillion";
  if(a>=1e12) return (n/1e12).toFixed(1)+" trillion";
  if(a>=1e9)  return (n/1e9).toFixed(1)+" billion";
  if(a>=1e6)  return (n/1e6).toFixed(1)+" million";
  if(a>=1e4)  return Math.round(n).toLocaleString();
  if(a>=100)  return n.toFixed(0);
  return n.toFixed(1);
};

export const money = n => {
  const a=Math.abs(n), sign=Math.round(n)<0?"-$":"$";
  if(a>=1e12) return sign+(a/1e12).toFixed(2)+"T";
  if(a>=1e9)  return sign+(a/1e9).toFixed(2)+"B";
  if(a>=1e6)  return sign+(a/1e6).toFixed(2)+"M";
  if(a>=1e3)  return sign+Math.round(a).toLocaleString();
  return sign+Math.round(a);
};

// capability is an internal index. What the player sees is how long a job it can finish alone.
export const horizon = c => HORIZON_BASE + HORIZON_K*Math.pow(Math.max(c,0),HORIZON_EXP);

export const dur = x => {
  if(x<10)      return x.toFixed(1)+" seconds";
  if(x<60)      return Math.round(x)+" seconds";
  if(x<5400)    return (x/60).toFixed(x<600?1:0)+" minutes";
  if(x<1.728e5) return (x/3600).toFixed(1)+" hours";
  if(x<1.21e6)  return (x/86400).toFixed(1)+" days";
  if(x<6.3e6)   return (x/604800).toFixed(1)+" weeks";
  if(x<6.3e7)   return (x/2.592e6).toFixed(1)+" months";
  return short(x/3.15e7)+" years";
};

export const work  = c => dur(horizon(c));

export const pcount = n => {
  if(n>=1e15) return (n/1e15).toFixed(1)+" quadrillion";
  if(n>=1e12) return (n/1e12).toFixed(n<1e13?2:1)+"T";
  if(n>=1e9)  return (n/1e9).toFixed(n<1e10?1:0)+"B";
  return Math.round(n/1e6)+"M";
};

export const clock = s => Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
