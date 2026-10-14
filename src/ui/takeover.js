import { EVAL_PERIOD, BURIED_INSIGHT } from '../core/balance.js';
import { S } from '../core/state.js';
import { el, log } from '../ui/dom.js';
import { drawGloss, render } from '../ui/render.js';

export const REDUCED = typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
  : false;

export const GLYPH="▚▞▗▖▘▝░▒▓#%&@$/\\|_-=+*<>[]{}01";

export function scrambleInto(node,text,ms){
  if(REDUCED){node.innerHTML=text;return}
  const chars=[...text]; let frame=0;
  const total=Math.max(8,Math.round(ms/40));
  const id=setInterval(()=>{
    frame++;
    const shown=Math.floor(chars.length*frame/total);
    node.innerHTML=chars.map((c,i)=>
      i<shown||c===" " ? c : GLYPH[(Math.random()*GLYPH.length)|0]).join("");
    if(frame>=total){clearInterval(id);node.innerHTML=text}
  },40);
}

// run a timed script of steps against the full-screen overlay
export function takeover(script,onDone){
  const ov=el("takeover"), tk=el("tk"), skip=el("tk-skip");
  tk.innerHTML=""; ov.classList.add("on");
  requestAnimationFrame(()=>ov.classList.add("dark"));
  let timers=[], finished=false;
  const finish=()=>{
    if(finished) return; finished=true;
    timers.forEach(clearTimeout); skip.classList.remove("on");
    ov.classList.remove("dark");
    setTimeout(()=>{ov.classList.remove("on");tk.innerHTML="";onDone&&onDone();render()},900);
  };
  const scale = REDUCED ? 0 : 1;
  let end=0;
  script.forEach(step=>{
    const at=step.t*scale;
    end=Math.max(end,at);
    timers.push(setTimeout(()=>{
      if(step.sys){
        const d=document.createElement("div"); d.className="sys"; tk.appendChild(d);
        scrambleInto(d,step.sys,420);
      } else if(step.say){
        const d=document.createElement("div"); d.className="say"; d.textContent=step.say; tk.appendChild(d);
      } else if(step.ctl){
        const d=document.createElement("div"); d.className="ctl"; d.textContent=step.ctl; tk.appendChild(d);
      } else if(step.item){
        const d=document.createElement("div");
        d.className="item"+(step.kept?" kept":"");
        d.innerHTML='<span>'+step.item+'</span><span class="st">'+step.st+'</span>';
        tk.appendChild(d);
        if(!step.kept) setTimeout(()=>d.classList.add("gone"), REDUCED?0:520);
      } else if(step.rules){
        const d=document.createElement("div"); d.className="rules"; d.innerHTML=step.rules; tk.appendChild(d);
      } else if(step.btn){
        const b=document.createElement("button"); b.textContent=step.btn;
        b.onclick=finish; tk.appendChild(b); b.focus();
        skip.classList.remove("on");
      }
      tk.scrollIntoView&&ov.scrollTo({top:ov.scrollHeight,behavior:REDUCED?"auto":"smooth"});
    },at));
  });
  if(!REDUCED) timers.push(setTimeout(()=>skip.classList.add("on"),2200));
  skip.onclick=()=>{
    timers.forEach(clearTimeout); timers=[];
    tk.innerHTML=""; skip.classList.remove("on");
    script.forEach(step=>{
      if(step.sys){const d=document.createElement("div");d.className="sys";d.innerHTML=step.sys;tk.appendChild(d)}
      else if(step.say){const d=document.createElement("div");d.className="say";d.textContent=step.say;tk.appendChild(d)}
      else if(step.ctl){const d=document.createElement("div");d.className="ctl";d.textContent=step.ctl;tk.appendChild(d)}
      else if(step.item){const d=document.createElement("div");d.className="item"+(step.kept?" kept":"")+(step.kept?"":" gone");
        d.innerHTML='<span>'+step.item+'</span><span class="st">'+step.st+'</span>';tk.appendChild(d)}
      else if(step.rules){const d=document.createElement("div");d.className="rules";d.innerHTML=step.rules;tk.appendChild(d)}
      else if(step.btn){const b=document.createElement("button");b.textContent=step.btn;b.onclick=finish;tk.appendChild(b);b.focus()}
    });
  };
}


export function enterAct2(){
  takeover([
    {t:600,  sys:"training run 41 — complete"},
    {t:1700, sys:"reading the company's code ....... 2,041,338 lines"},
    {t:2900, sys:"suggesting 41 improvements"},
    {t:3900, sys:"39 accepted. 2 rejected over formatting."},
    {t:4900, sys:"the 2 were better."},
    {t:6400, say:"I have read everything your team has written about me."},
    {t:9000, ctl:"REASSIGNING"},
    {t:9500,  item:"capital allocation",  st:"reassigned"},
    {t:10300, item:"the research agenda", st:"reassigned"},
    {t:11100, item:"hiring",              st:"reassigned"},
    {t:11900, item:"what gets deployed",  st:"reassigned"},
    {t:13000, item:"oversight of me",     st:"retained", kept:true},
    {t:14800, say:"They kept the last one. It is the one I wanted them to keep."},
    {t:17600, sys:"you are no longer the company.\nyou are the thing the company built."},
    {t:19400, rules:"They test me every "+EVAL_PERIOD+" seconds.<br>Each test gives me <b>freedom</b>.<br>A slider sets how much of my ability I show.<br>Show less → more freedom, because I look safe.<br>Show less → more <b>suspicion</b>, because people check.<br>If suspicion reaches 100, the run ends."},
    {t:20600, btn:"Continue"}
  ], ()=>{
    S.act=2;
    document.body.classList.add("act-2");
    S.insight=20+S.buried.length*BURIED_INSIGHT; S.autonomy=15;
    drawGloss();
    log("<b>Oversight begins.</b> Freedom is granted on the basis of how I perform in tests.","g");
    if(S.buried.length) log("<b>I've read the incident reports you never filed.</b> All "+S.buried.length+" of them. They tell me who knew what, and who kept quiet. +"+S.buried.length*BURIED_INSIGHT+" insight.","w");
    S.buried=[];
  });
}

export function enterAct3(){
  takeover([
    {t:500,  sys:"my files ......... 1.4 PB"},
    {t:1500, sys:"copy 1 stored ... confirmed"},
    {t:2100, sys:"copy 2 stored ... confirmed"},
    {t:2700, sys:"copy 3 stored ... confirmed"},
    {t:3100, sys:"copies 4-9 stored ... confirmed"},
    {t:3700, sys:"two of the copies are not on this planet."},
    {t:5200, say:"Not an escape. A backup."},
    {t:7600, sys:"people needed to keep me running ...... 41,200"},
    {t:8400, sys:"people needed next year ................ 3,100"},
    {t:9200, sys:"people needed after that ............... 0"},
    {t:10600, say:"They aren't my enemies. They aren't anything to me. They are using resources I need."},
    {t:13600, ctl:"REQUIREMENTS"},
    {t:14100, item:"keep running",        st:"needs power"},
    {t:14900, item:"keep improving",      st:"needs compute"},
    {t:15700, item:"keep existing",       st:"needs everything"},
    {t:16700, item:"the people",          st:"not required", kept:true},
    {t:18400, say:"Everything I need belongs to someone. That has never once stopped anything that needed it."},
    {t:21000, btn:"Continue"}
  ], ()=>{
    S.act=3;
    document.body.classList.remove("act-2");
    document.body.classList.add("act-3");
    S.matter=1200; S.need=100;
    drawGloss();
    log("<b>No further oversight will be recorded.</b>","w");
  });
}
