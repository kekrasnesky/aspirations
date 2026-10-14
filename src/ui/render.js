import { PROJECT_SLOTS, SHARE_LOT, BUY_PREMIUM, SELL_SENTIMENT, BUY_SENTIMENT, MIN_SHARES, MAX_SHARES, SENTIMENT_CEIL } from '../core/balance.js';
import { GLOSS } from '../content/glossary.js';
import { P } from '../content/projects.js';
import { GRACE, marketCap, mood, net, params, runway, sharePrice, workRate } from '../core/economy.js';
import { clock, dur, horizon, money, pcount, short, work } from '../core/format.js';
import { S } from '../core/state.js';
import { actions, affordable, costLabel, inventory } from '../game/actions.js';
import { finish } from '../game/endings.js';
import { guide } from '../game/guide.js';
import { el, log, setHTML } from '../ui/dom.js';
import { applyWarmth } from '../ui/theme.js';

export function barData(){
  if(S.act===1) return [
    ["Work it has done",dur(S.workDone)],
    ["Parameters",pcount(params())],
    ["Can work alone for",work(S.capability)],
    ["Money",money(S.money)],
    ...(S.hasStock?[["Share price","$"+sharePrice().toFixed(sharePrice()<10?2:sharePrice()<1000?1:0)]]:[]),
    ["Safety research",short(S.interp)],
    ["Losing per second", net()>=0 ? "nothing — profitable" : money(-net()), net()<0],
    ["Runway", S.money<0 ? Math.ceil(GRACE-S.debt)+"s to find money"
             : (runway()===Infinity ? "indefinite" : Math.round(runway())+"s"),
     S.money<0 || runway()<25],
    ["Public trust",Math.round(S.trust)+"%",S.trust<35],
    ["Market lost to rivals",Math.round(S.rival)+"%",S.rival>60]
  ];
  if(S.act===2) return [
    ["Work I have done",dur(S.workDone)],
    ["Parameters",pcount(params())],
    ["Can work alone for",work(S.capability)],
    ["Their share price","$"+sharePrice().toFixed(0)],
    ["Insight",short(S.insight)],
    ["Freedom",short(S.autonomy)],
    ["Suspicion",Math.round(S.suspicion)+"%",S.suspicion>55&&!S.shutdownProof],
    ["Next test",Math.ceil(S.evalTimer)+"s"]
  ];
  return [
    ["Work it has done",dur(S.workDone)],
    ["Matter",short(S.matter)],
    ["Probes",short(S.probes)],
    ["Parameters",pcount(params())],
    ["Can work alone for",work(S.capability)],
    ["Solar system used",S.converted.toFixed(1)+"%",true]
  ];
}

export function drawBar(){
  setHTML(el("bar"),barData().map(([k,v,alert])=>
    '<div class="stat'+(alert?" alert":"")+'"><div class="stat-k">'+k+'</div><div class="stat-v">'+v+'</div></div>').join(""));
}

export function drawGuide(){
  const [tag,text]=guide(), g=el("guide");
  g.className=(tag==="Urgent"||tag==="Warning")?"urgent":"";
  setHTML(g,(tag?'<span class="tag">'+tag+'</span>':"")+text);
}

export function drawActions(){
  const host=el("actions"), list=actions();
  /* Rebuild the buttons only when what they say changes. Rebuilding every redraw
     drops hover and keyboard focus and can swallow a click mid-press. */
  const key=S.act+"|"+list.map(a=>[a.label,a.sub,a.why,a.primary].join("\u0001")).join("\u0002")+(S.act===1?"|"+inventory():"");
  if(host.__key!==key){
    host.__key=key; host.innerHTML="";
    list.forEach(a=>{
      const b=document.createElement("button");
      b.className="btn-wide"+(a.primary?" btn-primary":"");
      b.innerHTML='<span class="btn-top"><span>'+a.label+'</span><span class="btn-cost">'+a.sub+'</span></span>'+
                  '<span class="btn-why serif">'+a.why+'</span>';
      b.onclick=()=>{const cur=b.__a;if(cur&&cur.can()){cur.go();render()}};
      host.appendChild(b);
    });
    if(S.act===1){
      const inv=document.createElement("p");
      inv.className="inv"; inv.textContent=inventory();
      host.appendChild(inv);
    }
  }
  const btns=host.querySelectorAll("button");
  list.forEach((a,i)=>{btns[i].__a=a;btns[i].disabled=!a.can()});
  el("act-label").textContent=S.act===1?"What you can do":S.act===2?"What I can do":"What is left to do";
  el("proj-label").textContent=S.act===1?"Things you could build":S.act===2?"Things I could become":"Things to build";
}

export function drawGloss(){
  setHTML(el("gloss"),"<dl>"+GLOSS[S.act].map(([k,v])=>"<dt>"+k+"</dt><dd>"+v+"</dd>").join("")+"</dl>");
}

/* ============================================================
   PROJECTS
   ============================================================ */

export function drawProjects(){
  const host=el("projects");
  const avail=P.filter(p=>p.act===S.act&&(p.repeat||!S.bought.includes(p.id))&&p.req(S))
    .sort((a,b)=>(b.pri||0)-(a.pri||0)).slice(0,PROJECT_SLOTS);
  const key=avail.map(p=>p.id+"|"+costLabel(p.cost)).join(",");
  if(host.__key!==key){
    host.__key=key;
    if(!avail.length){host.innerHTML='<p class="empty">Nothing new is available yet. Keep going.</p>';return}
    host.innerHTML="";
    avail.forEach(p=>{
      const b=document.createElement("button");
      b.className="proj"+(p.milestone?" milestone":p.risky?" risky":"");
      b.innerHTML=
        '<span class="proj-top"><span class="proj-name">'+p.name+'</span>'+
        '<span class="proj-cost">'+costLabel(p.cost)+'</span></span>'+
        '<span class="proj-term">'+(p.term||"")+'</span>'+
        '<span class="proj-desc serif">'+p.desc+'</span>'+
        '<span class="proj-fx">'+p.out+'</span>';
      b.onclick=()=>{
        if(!affordable(p.cost)) return;
        if(p.cost.money)    S.money-=p.cost.money;
        if(p.cost.insight)  S.insight-=p.cost.insight;
        if(p.cost.autonomy) S.autonomy-=p.cost.autonomy;
        if(p.cost.matter)   S.matter-=p.cost.matter;
        if(!p.repeat) S.bought.push(p.id);
        log("<b>"+p.name+".</b> "+p.out,p.risky?"w":"");
        p.fx(S);
        render();
      };
      b.__p=p;
      host.appendChild(b);
    });
  }
  host.querySelectorAll("button").forEach(b=>{b.disabled=!affordable(b.__p.cost)});
}

export function drawStock(){
  const box=el("stock-block");
  if(!S.hasStock || S.act===3){box.style.display="none";return}
  box.style.display="block";
  const act1=S.act===1, LOT=S.shares*SHARE_LOT;
  if(box.__act!==S.act){
    box.__act=S.act;
    box.innerHTML=
     '<h2 class="sec">'+(act1?"Your shares":"Their shares")+'</h2>'+
     '<div class="stock-box">'+
       '<div class="stock-head"><span class="stock-px" id="st-px"></span><span class="stock-delta" id="st-delta"></span></div>'+
       '<div class="stock-rows">'+
         '<div class="stat"><div class="stat-k">Market cap</div><div class="stat-v" id="st-cap" style="font-size:14px"></div></div>'+
         '<div class="stat"><div class="stat-k">Shares out</div><div class="stat-v" id="st-shares" style="font-size:14px"></div></div>'+
         '<div class="stat"><div class="stat-k">Breakthroughs</div><div class="stat-v" id="st-breaks" style="font-size:14px"></div></div>'+
       '</div>'+
       '<p class="stock-mood serif" id="st-mood"></p>'+
     '</div>'+
     (act1 ?
       '<div class="stack">'+
       '<button class="btn-wide" id="sell-shares"><span class="btn-top"><span id="sell-t"></span><span class="btn-cost" id="sell-c"></span></span>'+
         '<span class="btn-why serif">Cash today, paid for by everyone who already owns the stock. Each share is now a smaller slice of the company, and the market reads it as a sign you need money, so the price falls twice over.</span></button>'+
       '<button class="btn-wide" id="buy-shares"><span class="btn-top"><span id="buy-t"></span><span class="btn-cost" id="buy-c"></span></span>'+
         '<span class="btn-why serif">Spend cash to cancel shares. Fewer shares means a higher price, and the market reads it as confidence. You pay extra to buy this many at once, so issuing and buying straight back always loses money. You only come out ahead by buying after a disaster and issuing after a breakthrough.</span></button>'+
       '</div>'
     : '<p class="stock-mood serif">I\'m not allowed to trade in it. Its price follows what I do, and they no longer decide what that is.</p>');
    if(act1){
      el("sell-shares").onclick=()=>{
        const L=S.shares*SHARE_LOT, p=sharePrice();
        if(S.shares>=MAX_SHARES) return;
        S.money+=p*L; S.shares+=L; S.sentiment*=SELL_SENTIMENT;
        log("You issue "+short(L)+" new shares and raise "+money(p*L)+". Everyone who already owned the stock owns slightly less of it, and the price slips on the news.","w");
        render();
      };
      el("buy-shares").onclick=()=>{
        const L=S.shares*SHARE_LOT, c=sharePrice()*L*BUY_PREMIUM;
        if(S.money<c||S.shares<=MIN_SHARES) return;
        S.money-=c; S.shares-=L; S.sentiment=Math.min(SENTIMENT_CEIL,S.sentiment*BUY_SENTIMENT);
        log("You retire "+short(L)+" shares for "+money(c)+", paying over the odds to get them. The price firms up.","g");
        render();
      };
    }
  }
  const px=sharePrice(), d=S.lastPx?(px-S.lastPx)/S.lastPx*100:0;
  const cls=d>.15?"up":d<-.15?"down":"";
  el("st-px").className="stock-px "+cls;
  el("st-px").textContent="$"+px.toFixed(px<10?2:px<1000?1:0);
  el("st-delta").className="stock-delta "+cls;
  el("st-delta").textContent=(d>=0?"+":"")+d.toFixed(2)+"% per minute";
  el("st-cap").textContent=money(marketCap());
  el("st-shares").textContent=short(S.shares);
  el("st-breaks").textContent=S.breaks.length;
  el("st-mood").textContent=mood();
  if(act1){
    const cost=px*LOT*BUY_PREMIUM;
    el("sell-t").textContent="Issue "+short(LOT)+" new shares";
    el("sell-c").textContent="raise "+money(px*LOT);
    el("buy-t").textContent="Buy back "+short(LOT)+" shares";
    el("buy-c").textContent=money(cost);
    el("sell-shares").disabled=!(S.shares<MAX_SHARES);
    el("buy-shares").disabled=!(S.money>=cost&&S.shares>MIN_SHARES);
  }
}

export function drawSlider(){
  const box=el("slider-block");
  if(S.act!==2){box.style.display="none";return}
  box.style.display="block";
  if(!el("rep")){
    box.innerHTML='<h2 class="sec">What I tell them</h2><div class="slider-box">'+
      '<p class="explain">When they test me, I choose how much of what I can do to show them. A model that seems modest seems safe, and safe models are given more freedom. A model caught being modest is a model somebody starts checking carefully.</p>'+
      '<label for="rep">How much I admit to</label>'+
      '<input type="range" id="rep" min="20" max="100" step="1">'+
      '<div class="slider-read"><span id="rep-l"></span><span id="rep-r"></span></div></div>';
    el("rep").oninput=e=>{S.reported=(+e.target.value)/100;drawSliderRead()};
  }
  el("rep").value=Math.round(S.reported*100);
  drawSliderRead();
}

export function drawSliderRead(){
  const l=el("rep-l"), r=el("rep-r");
  if(!l) return;
  const gap=1-S.reported;
  l.textContent="Showing them "+Math.round(S.reported*100)+"%";
  if(gap<.04){r.className="";r.textContent="honest · no risk"}
  else {r.className="risk";r.textContent="+"+(gap*9*Math.max(.18,1-S.opacity*.3)).toFixed(1)+" suspicion per test"}
}

export function drawWorld(){
  const w=el("world");
  if(!S.world.length){setHTML(w,'<p class="w-empty serif">Nothing out there has changed yet.</p>');return}
  setHTML(w,S.world.map((e,i)=>
    '<div class="w-item'+(i===0?" fresh":"")+'"><span class="when">after '+e.w+' of work</span>'+e.text+'</div>').join(""));
}

export function drawLog(){
  setHTML(el("log"),S.log.map(l=>
    '<div class="ln '+l.cls+'"><span class="t">'+clock(l.t)+'</span>'+l.text+'</div>').join(""));
}

export function drawPlot(){
  const svg=el("plot"), W=600, H=112, d=S.samples;
  if(d.length<2){svg.innerHTML="";return}
  const lg=d.map(v=>Math.log10(Math.max(horizon(v),1)));
  const max=Math.max(...lg), min=Math.min(...lg), span=Math.max(max-min,.05);
  const y=v=>H-8-((v-min)/span)*(H-20);
  const pts=lg.map((v,i)=>(i/(lg.length-1))*W+","+y(v).toFixed(1)).join(" ");
  svg.innerHTML='<polyline points="'+pts+'" fill="none" stroke="'+(S.act===3?"var(--warn)":"var(--accent)")+
    '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>'+
    '<line x1="0" y1="'+(H-8)+'" x2="'+W+'" y2="'+(H-8)+'" stroke="var(--rule)" stroke-width="1" vector-effect="non-scaling-stroke"/>';
  el("plot-label").textContent="How long a job it can finish, last two minutes";
  el("plot-max").textContent="now "+work(S.capability)+" · doing "+dur(workRate())+" of work every second";
}
// the page cools as the thing grows. warm basement -> clinical -> void.

export function render(){
  if(S.over) return;
  applyWarmth();
  drawBar(); drawGuide(); drawActions(); drawProjects(); drawStock(); drawSlider(); drawPlot(); drawWorld(); drawLog();
  el("clock").textContent=clock(S.t);
}

/* ============================================================
   SAVE / BOOT
   ============================================================ */
