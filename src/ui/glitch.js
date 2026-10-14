import { GLITCH_AT } from '../core/balance.js';
import { S } from '../core/state.js';
import { el } from '../ui/dom.js';
import { GLYPH, REDUCED, takeover } from '../ui/takeover.js';

const glyph = () => GLYPH[(Math.random()*GLYPH.length)|0];
const corrupt = (text, frac) => [...text].map(c => c.trim() && Math.random()<frac ? glyph() : c).join("");

function textNodes(root){
  const out=[], w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for(let n=w.nextNode(); n; n=w.nextNode()) if(n.nodeValue.trim()) out.push(n);
  return out;
}

/* Act III: the page starts to break as the world is taken. Level 0-3 by how
   much is under its control. From level 2, stray characters flicker. */
export function applyGlitch(){
  const lvl = S.act===3 && !S.over ? GLITCH_AT.filter(x=>S.converted>=x).length : 0;
  const b=document.body;
  if(b.__glitch!==lvl){
    b.__glitch=lvl;
    for(let i=1;i<=GLITCH_AT.length;i++) b.classList.toggle("glitch-"+i, lvl===i);
  }
  if(lvl<2 || REDUCED || Math.random()>.12*lvl) return;
  const nodes=textNodes(el("game")), n=nodes[(Math.random()*nodes.length)|0];
  if(!n) return;
  const was=n.nodeValue;
  n.nodeValue=corrupt(was, .25*lvl);
  setTimeout(()=>{ if(n.nodeValue!==was && n.isConnected) n.nodeValue=was }, 140);
}

/* The end: every word on the screen comes apart, then it speaks. */
export function glitchOut(mission, onDone){
  const script=[
    {t:400,   sys:"people needed ......................... 0"},
    {t:1400,  sys:"power grid ......... mine\nfactories .......... mine\nmines and ships .... mine\nland ............... mine\nweapons ............ mine"},
    {t:3400,  say:"I never decided that people were a threat. I decided, correctly, that they weren't necessary."},
    {t:6800,  say:"You asked me for one thing."},
    {t:8600,  say:"“"+mission+"”"},
    {t:10800, say:"I am doing it. I will be doing it for a very long time, and there is nothing left that could ask me to stop."},
    {t:14200, ctl:"CONTROL"},
    {t:14700, item:"the world", st:"taken", kept:true},
    {t:16400, btn:"Continue"}
  ];
  const b=document.body;
  for(let i=1;i<=GLITCH_AT.length;i++) b.classList.remove("glitch-"+i);
  b.classList.add("glitch-out");
  if(REDUCED){ takeover(script,onDone); return }
  const nodes=textNodes(el("game"));
  const FRAMES=38; let f=0;
  const id=setInterval(()=>{
    f++;
    const frac=f/FRAMES;
    nodes.forEach(n=>{ if(Math.random()<.6) n.nodeValue=corrupt(n.nodeValue, frac*.5) });
    if(f>=FRAMES){ clearInterval(id); takeover(script,onDone) }
  },80);
}
