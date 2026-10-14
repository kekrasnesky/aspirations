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

/** Parameter counts the way the field writes them: 124M, 7B, 1.8T. */
export const pcount = n => {
  if(n<=0) return "0";
  const f=(x,u)=>(x<10&&Math.round(x*10)%10?x.toFixed(1):Math.round(x).toLocaleString())+u;
  if(n>=1e12) return f(n/1e12,"T");
  if(n>=1e9)  return f(n/1e9,"B");
  if(n>=1e6)  return f(n/1e6,"M");
  return f(n/1e3,"K");
};

/** Memory, given in GB. */
export const bytes = gb => {
  if(gb>=1e6) return (gb/1e6).toFixed(gb<1e7?1:0)+" PB";
  if(gb>=1e3) return (gb/1e3).toFixed(gb<1e4?1:0)+" TB";
  return Math.round(gb)+" GB";
};

/** Compute, given in TFLOPS. */
export const flops = tf => {
  if(tf>=1e6) return (tf/1e6).toFixed(tf<1e7?1:0)+" EFLOPS";
  if(tf>=1e3) return (tf/1e3).toFixed(tf<1e4?1:0)+" PFLOPS";
  return Math.round(tf)+" TFLOPS";
};

export const count = n => n>=1e6 ? (n/1e6).toFixed(1)+"M" : Math.round(n).toLocaleString();

export const secs = s => s<60 ? Math.ceil(s)+"s" : Math.floor(s/60)+"m "+String(Math.ceil(s%60)).padStart(2,"0")+"s";

export const clock = s => Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
