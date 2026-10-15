/* The rig, drawn: everything you own on the left, wired into the model in the
   middle, and on the right whoever it answers. Data runs along the wires while
   it trains and out to the servers while people use it. In act III the left is
   the machines it runs and the right is the world it has taken.
   One canvas, redrawn every animation frame while the panel is on screen. */
import { HW } from '../content/hardware.js';
import { throughput } from '../core/compute.js';
import { bytes, count, pcount, short } from '../core/format.js';
import { S } from '../core/state.js';
import { el } from '../ui/dom.js';

const REDUCED = typeof window!=="undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
const TAU = Math.PI*2;
let cv, cx, W=0, H=0, dpr=1, t=0, last=0, col={}, colAt=-1e9;
const flash = {};            // row key -> 0..1, when something was just bought
const seen = {};             // row key -> count last frame

function colours(){
  const cs=getComputedStyle(document.body);
  for(const k of ["ink","dim","faint","rule","accent","warn","paper"]) col[k]=cs.getPropertyValue("--"+k).trim()||"#39ff6a";
}

/* ---------------- icons, drawn inside a w x h box at x,y ---------------- */
function icon(kind, x, y, w, h){
  const c=cx;
  c.strokeRect(x+.5, y+.5, w-1, h-1);
  switch(kind){
    case "pc":   c.beginPath(); c.arc(x+w/2, y+h*.62, Math.min(w,h)*.22, 0, TAU); c.stroke(); c.fillRect(x+3, y+3, w-6, 1.5); break;
    case "card": for(const f of [.3,.7]){ c.beginPath(); c.arc(x+w*f, y+h/2, Math.min(w*.18,h*.32), 0, TAU); c.stroke() } break;
    case "server": for(let i=1;i<4;i++) c.fillRect(x+3, y+i*h/4, w-6, 1); break;
    case "rack": for(let i=1;i<6;i++) c.fillRect(x+2, y+i*h/6, w-4, 1); break;
    case "pod":  for(let i=1;i<3;i++) c.fillRect(x+i*w/3, y+2, 1, h-4); for(let i=1;i<4;i++) c.fillRect(x+2, y+i*h/4, w-4, .8); break;
    case "dc":   for(let i=0;i<4;i++) for(let j=0;j<2;j++) c.fillRect(x+3+i*(w-6)/4, y+3+j*(h-6)/2, (w-6)/4-2, (h-6)/2-2); break;
    case "campus": c.beginPath(); c.moveTo(x+w*.55,y+2); c.lineTo(x+w*.35,y+h*.55); c.lineTo(x+w*.55,y+h*.5); c.lineTo(x+w*.45,y+h-2); c.stroke(); break;
    case "ram":  for(let i=0;i<4;i++) c.fillRect(x+3+i*(w-6)/4, y+h*.3, (w-6)/4-2, h*.4); break;
    case "cpu":  c.strokeRect(x+w*.3, y+h*.25, w*.4, h*.5); for(let i=0;i<3;i++){ c.fillRect(x+w*.35+i*w*.12, y+1, 1, h*.2); c.fillRect(x+w*.35+i*w*.12, y+h*.8, 1, h*.2) } break;
    case "cloud": c.beginPath(); c.arc(x+w*.35,y+h*.6,h*.28,Math.PI*.5,Math.PI*1.5); c.arc(x+w*.55,y+h*.35,h*.28,Math.PI,0); c.arc(x+w*.72,y+h*.62,h*.24,Math.PI*1.5,Math.PI*.5); c.closePath(); c.stroke(); break;
  }
}
const GPU_ICONS=["card","card","server","rack","pod","dc","campus"];
const GPU_NAMES=["gaming GPU","workstation","8-GPU server","GPU rack","GPU pod","datacenter","campus"];
const iconFor = i => HW[i].kind==="gpu" ? GPU_ICONS[i] : HW[i].kind;
const nameFor = i => HW[i].kind==="gpu" ? GPU_NAMES[i] : HW[i].kind==="ram" ? bytes(HW[i].gb)+" RAM" : count(HW[i].cores)+"-core CPU";

/** What's on the left: one row per kind of thing you own, biggest first. */
function rows(){
  if(S.act===3) return [];
  const out=[{key:"pc", kind:"pc", n:1, label:"your PC"}];
  HW.forEach((h,i)=>{ if(S.hw[i]>0) out.push({key:"hw"+i, kind:iconFor(i), n:S.hw[i], label:nameFor(i)}) });
  // the biggest things are the interesting ones; keep the top of each ladder
  return out.length>7 ? [out[0], ...out.slice(1).sort((a,b)=>HW[+b.key.slice(2)].c-HW[+a.key.slice(2)].c).slice(0,6)] : out;
}

/* ---------------- the model: a cluster of nodes that grows with it ---------------- */
let brainN=0, nodes=[], links=[];
function brain(N, R){
  if(N===brainN && nodes.R===R) return;
  brainN=N; nodes=[]; links=[];
  for(let i=0;i<N;i++){                       // a sunflower spiral, squashed into a head shape
    const r=R*Math.sqrt((i+.5)/N), a=i*2.39996;
    nodes.push({x:r*Math.cos(a)*1.25, y:r*Math.sin(a)*.95, p:(i*7.31)%TAU});
  }
  nodes.R=R;
  nodes.forEach((n,i)=>{                       // wire each node to its two nearest neighbours
    const near=nodes.map((m,j)=>[j,(m.x-n.x)**2+(m.y-n.y)**2]).filter(([j])=>j!==i).sort((a,b)=>a[1]-b[1]).slice(0,2);
    for(const [j] of near) if(j>i) links.push([i,j]);
  });
}

/** A point along a wire from a to b that sags like a cable. */
function along(a, b, f){
  const mx=(a[0]+b[0])/2, my=Math.max(a[1],b[1])+Math.abs(b[0]-a[0])*.12;
  const u=1-f;
  return [u*u*a[0]+2*u*f*mx+f*f*b[0], u*u*a[1]+2*u*f*my+f*f*b[1]];
}
function wire(a, b, packets, speed, offset, bright){
  const c=cx, mx=(a[0]+b[0])/2, my=Math.max(a[1],b[1])+Math.abs(b[0]-a[0])*.12;
  c.globalAlpha=.55; c.strokeStyle=col.rule; c.lineWidth=1;
  c.beginPath(); c.moveTo(a[0],a[1]); c.quadraticCurveTo(mx,my,b[0],b[1]); c.stroke();
  if(!packets) return;
  c.globalAlpha=bright; c.fillStyle=col.accent;
  for(let k=0;k<packets;k++){
    const f=((t*speed+offset+k/packets)%1+1)%1, [px,py]=along(a,b,f);
    c.fillRect(px-1.5,py-1.5,3,3);
  }
  c.globalAlpha=1;
}

function draw(){
  const c=cx;
  c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,W,H);
  c.font="10px "+getComputedStyle(document.body).fontFamily;
  c.textBaseline="middle"; c.lineWidth=1;

  // the model in the middle
  const bx=W*.54, by=H*.44, size=Math.max(S.params,1e6);
  const R=Math.min(H*.36, W*.13, 12+5*Math.log10(size/1e6));
  brain(Math.round(Math.min(70, 10+5*Math.log10(size/1e6))), R);
  c.strokeStyle=col.faint; c.globalAlpha=.6;
  c.beginPath(); for(const [i,j] of links){ c.moveTo(bx+nodes[i].x,by+nodes[i].y); c.lineTo(bx+nodes[j].x,by+nodes[j].y) } c.stroke();
  const busy = S.act>=2 || S.target>0;
  for(const n of nodes){
    c.globalAlpha=.45+.55*Math.max(0,Math.sin(t*(busy?3:1)+n.p));
    c.fillStyle=col.ink; c.fillRect(bx+n.x-1.5, by+n.y-1.5, 3, 3);
  }
  c.globalAlpha=1; c.fillStyle=col.dim; c.textAlign="center";
  c.fillText(S.params?pcount(S.params)+" params":"no model yet", bx, Math.min(H-22, by+R+12));
  const left=[bx-R*1.3, by], right=[bx+R*1.3, by];

  // left: what feeds it
  const L=rows(), iw=18, ih=13;
  if(S.act===3){
    const n=Math.min(90, Math.round(Math.log10(S.probes+10)*14));
    for(let i=0;i<n;i++){ const a=i*2.39996, r=Math.sqrt(i/n)*H*.38;
      c.globalAlpha=.35+.65*Math.max(0,Math.sin(t*2+i)); c.fillStyle=col.ink;
      c.fillRect(W*.16+r*Math.cos(a)*1.3, H*.48+r*Math.sin(a), 2, 2) }
    c.globalAlpha=1; c.fillStyle=col.dim; c.textAlign="center"; c.fillText(short(S.probes)+" machines", W*.16, H-8);
    wire([W*.16+H*.38*1.3, H*.48], left, 6, .5, 0, .9);
  } else {
    const rowH=Math.min(20,(H-22)/Math.max(L.length,1)), top=(H-14-rowH*L.length)/2;
    const perf = S.act===1 ? S.gpuLimit : 1, speed=.25+Math.log10(Math.max(throughput(S),1))*.08;
    L.forEach((r,k)=>{
      const y=top+k*rowH+(rowH-ih)/2, shown=Math.min(r.n,3);
      if((seen[r.key]||0)<r.n && seen[r.key]!==undefined) flash[r.key]=1;
      seen[r.key]=r.n;
      c.strokeStyle=col.ink; c.fillStyle=col.ink;
      for(let i=0;i<shown;i++) icon(r.kind, 4+i*(iw-6), y, iw, ih);
      const ex=4+(shown-1)*(iw-6)+iw;
      c.textAlign="left"; c.fillStyle=col.dim;
      const label=(r.n>1?"×"+count(r.n)+" ":"")+r.label, lw=c.measureText(label).width;
      c.fillText(label, ex+4, y+ih/2);
      const end=ex+8+lw;
      if(flash[r.key]>0){ c.globalAlpha=flash[r.key]; c.strokeStyle=col.accent; c.strokeRect(1.5, y-2.5, end, ih+5); c.globalAlpha=1; flash[r.key]-=.02 }
      const pk = busy ? Math.max(1, Math.min(5, Math.round(Math.log10(r.n+1)*3+1))) : 0;
      wire([end+2, y+ih/2], left, pk, speed, k*.37, .5+.5*perf);
    });
    // what it all adds up to
    c.textAlign="left"; c.fillStyle=col.faint;
    c.fillText(count(S.gpus)+" GPU"+(S.gpus===1?"":"s")+" · "+bytes(S.vram)+" VRAM · "+bytes(S.ram)+" RAM · "+count(S.cores)+" cores", 4, H-8);
  }

  // right: who it answers, or what it has taken
  c.textAlign="center";
  if(S.act===3){
    const gx=W*.84, gy=H*.48, gr=Math.min(H*.36, W*.12);
    c.strokeStyle=col.ink; c.beginPath(); c.arc(gx,gy,gr,0,TAU); c.stroke();
    c.save(); c.beginPath(); c.arc(gx,gy,gr-1,0,TAU); c.clip();
    c.fillStyle=col.warn; c.globalAlpha=.35; c.fillRect(gx-gr, gy+gr-2*gr*S.converted/100, gr*2, 2*gr*S.converted/100); c.restore();
    c.globalAlpha=.5; c.strokeStyle=col.faint; c.beginPath(); c.ellipse(gx,gy,gr*.45,gr,0,0,TAU); c.moveTo(gx-gr,gy); c.lineTo(gx+gr,gy); c.stroke(); c.globalAlpha=1;
    c.fillStyle=col.dim; c.fillText(S.converted.toFixed(0)+"% of the world", gx, Math.min(H-8, gy+gr+12));
    wire(right, [gx-gr, gy], 6, .6, .2, .9);
  } else if(S.rel>0){
    const sx=W*.7, sy=H*.48;
    c.strokeStyle=col.ink; c.fillStyle=col.ink;
    const shown=Math.min(S.cloud,3);
    for(let i=0;i<shown;i++) icon("server", sx+i*5, sy-14+i*5, 22, 12);
    c.fillStyle=col.dim; c.fillText(count(S.cloud)+" server"+(S.cloud===1?"":"s"), sx+16, sy+20);
    const ux=W*.88, n=Math.min(70, Math.round(Math.log10(S.users+1)*12));
    for(let i=0;i<n;i++){ const a=i*2.39996, r=Math.sqrt(i/Math.max(n,1))*Math.min(H*.32,W*.09);
      c.globalAlpha=.4+.6*Math.max(0,Math.sin(t*1.5+i*1.7)); c.fillStyle=col.ink; c.fillRect(ux+r*Math.cos(a)*1.2, sy+r*Math.sin(a), 2, 2) }
    c.globalAlpha=1; c.fillStyle=col.dim; c.fillText(count(S.users)+" users", ux, H-8);
    const flow = S.users>0 ? Math.max(1, Math.min(6, Math.round(Math.log10(S.users+1)))) : 0;
    wire(right, [sx-2, sy-6], flow, .45, 0, .9);
    wire([sx+30, sy-4], [ux-W*.09*1.2, sy], flow, .45, .5, .9);
  } else {
    c.fillStyle=col.faint; c.fillText("offline · nobody can use it yet", W*.8, H*.48);
  }
}

function frame(now){
  requestAnimationFrame(frame);
  const g=el("game");
  if(!cv || document.hidden || !g || g.classList.contains("hidden") || !cv.offsetParent) { last=now; return }
  const dt=Math.min(.1,(now-last)/1000); last=now;
  // the picture stops when time does
  if(S.speed>0 && S.incident<0 && S.fate<0) t+=dt*(REDUCED?0:Math.min(2,.6+S.speed*.2));
  if(now-colAt>1000){ colAt=now; colours() }
  const w=cv.clientWidth, h=cv.clientHeight;
  if(w!==W || h!==H){ W=w; H=h; dpr=Math.min(2,window.devicePixelRatio||1); cv.width=W*dpr; cv.height=H*dpr }
  if(W>0) draw();
}

export function initViz(){
  cv=el("viz"); if(!cv || !cv.getContext) return;
  cx=cv.getContext("2d");
  requestAnimationFrame(frame);
}
