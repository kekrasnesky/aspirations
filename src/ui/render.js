import { DISCLOSE_TRUST, LEAK_TRUST, LEAK_USERS, LEAK_SENTIMENT, LEAK_CASH, PROJECT_SLOTS, SHARE_LOT, BUY_PREMIUM, SELL_SENTIMENT, BUY_SENTIMENT, MIN_SHARES, MAX_SHARES, SENTIMENT_CEIL } from '../core/balance.js';
import { COMMITTEE } from '../content/committee.js';
import { GLOSS } from '../content/glossary.js';
import { P } from '../content/projects.js';
import { HW, KINDS, hwAdds, hwCost, hwOpen } from '../content/hardware.js';
import { LIMIT_MIN, CORES_PER_GPU, FIRST_MODEL, RAM_PER_PARAM, SCALE_STEP, VRAM_PER_PARAM, W_PER_CORE, W_PER_GB, CLOUD_COST, PRICE_MIN, PRICE_MAX } from '../core/balance.js';
import { limitPerf, bottleneck, coresNeeded, feed, fitRam, fitVram, maxFit, nextTarget, throughput, trainTime } from '../core/compute.js';
import { GRACE, addedBurn, addedPower, capacity, cloudCost, demand, marketCap, marketingRate, mood, net, payShare, paying, perServer, powerCost, revenue, runway, sharePrice, usersTarget } from '../core/economy.js';
import * as fmt from '../core/format.js';
import { bytes, clock, count, flops, money, pcount, secs, short } from '../core/format.js';
import { S } from '../core/state.js';
import { actions, affordable, buyHw, costLabel, rentCloud, setPrice } from '../game/actions.js';
import { stalled } from '../game/loop.js';
import { allies, canPay, detectMult, pendingFate, resolveFate, pendingIncident, resolveIncident, riskFor, study, turn, watching } from '../game/decisions.js';
import { el, log, setHTML, typeOut } from '../ui/dom.js';
import { switchedOff } from '../game/endings.js';
import { applyWarmth } from '../ui/theme.js';

/** Which way the user count is heading. */
const trend = () => { const t=usersTarget(S); return t>S.users*1.01?" ▲":t<S.users*.99?" ▼":"" };

/** Text without markup, for tooltips. */
const plain = h => String(h).replace(/<[^>]*>/g,"");
const price = p => "$"+(p%1?p.toFixed(2):p);
/** A small daily cost: under a dollar shows as cents, not $0. */
const perDay = x => (x<1?"$"+x.toFixed(2):money(x))+"/day";
const pct = x => (x*100).toFixed(x<.1?1:0)+"%";

const px = () => { const p=sharePrice(); return "$"+p.toFixed(p<10?2:p<1000?1:0) };

export function barData(){
  const model=["Model",S.params?pcount(S.params)+" params":"none yet"];
  if(S.act===1 && !S.rel) return [
    model, ["Money",money(S.money)], ["Electricity",money(powerCost(S))+"/day"],
    ["GPUs",count(S.gpus)+" · "+bytes(S.vram)], ["RAM",bytes(S.ram)], ["CPU",count(S.cores)+" cores"]
  ];
  if(S.act===1) return [
    model, ["Money",money(S.money)],
    ["Users",count(S.users)+trend(), demand(S)>capacity(S)*1.02],
    ["Paying",count(paying(S))+" × "+price(S.planPrice)+"/mo"],
    ["Net per day", (net()>=0?"+":"")+money(net()), net()<0],
    ["Runway", S.money<0 ? Math.ceil(GRACE-S.debt)+" days to find money"
             : (runway()===Infinity ? "indefinite" : Math.round(runway())+" days"),
     S.money<0 || runway()<25],
    ...(S.hasStock?[["Share price",px()]]:[]),
    ["Electricity",money(powerCost(S))+"/day"],
    ["Marketing rate",pct(marketingRate(S))+"/day"],
    ["Safety research",short(S.interp)],
    ["Public trust",Math.round(S.trust)+"%",S.trust<35]
  ];
  if(S.act===2) return [
    ["Parameters",pcount(S.params)],
    ["Room to grow",pcount(maxFit(S)),S.params>=maxFit(S)*.999],
    ["GPUs",count(S.gpus)+" · "+bytes(S.vram)],
    ["Their share price",px()],
    ["Insight",short(S.insight)],
    ["Freedom",short(S.autonomy)],
    ["Suspicion",Math.round(S.suspicion)+"%",S.suspicion>55&&!S.shutdownProof],
    ["Next test",Math.ceil(S.evalTimer)+"s"]
  ];
  return [
    ["Parameters",pcount(S.params)],
    ["Resources",short(S.matter)],
    ["Machines I run",short(S.probes)],
    ["Still needs people for",Math.round(S.need)+"%",S.need<=0],
    ["World under my control",S.converted.toFixed(1)+"%",true],
    ["Emergent capability","×"+S.emergent.toFixed(2)]
  ];
}

export function drawBar(){
  setHTML(el("bar"),barData().map(([k,v,alert])=>
    '<div class="stat'+(alert?" alert":"")+'"><div class="stat-k">'+k+'</div><div class="stat-v">'+v+'</div></div>').join(""));
}


export function drawActions(){
  const host=el("actions"), list=actions();
  /* Rebuild the buttons only when what they say changes. Rebuilding every redraw
     drops hover and keyboard focus and can swallow a click mid-press. */
  const key=S.act+"|"+list.map(a=>[a.label,a.sub,a.why,a.adds,a.primary].join("\u0001")).join("\u0002");
  if(host.__key!==key){
    host.__key=key; host.innerHTML="";
    list.forEach(a=>{
      const b=document.createElement("button");
      b.className="btn-wide"+(a.primary?" btn-primary":"");
      b.innerHTML='<span class="btn-top"><span>'+a.label+'</span><span class="btn-cost">'+a.sub+'</span></span>'+
                  (a.adds?'<span class="btn-adds">'+a.adds+'</span>':'')+
                  '<span class="btn-why serif">'+a.why+'</span>';
      b.title=plain(a.why);   // on a desktop the explanation is a tooltip, so everything fits on one screen
      b.onclick=()=>{const cur=b.__a;if(cur&&cur.can()){cur.go();render()}};
      host.appendChild(b);
    });
  }
  const btns=host.querySelectorAll("button");
  list.forEach((a,i)=>{btns[i].__a=a;btns[i].disabled=!a.can()});
  el("act-label").textContent=S.act===1?"What you can do":S.act===2?"What I can do":"What is left to do";
  el("proj-label").textContent=S.act===1?(S.rel?"Things you could build":"Training tricks"):S.act===2?"Things I could become":"Things to build";
}

export function drawGloss(){
  setHTML(el("gloss"),"<dl>"+GLOSS[S.act].map(([k,v])=>"<dt>"+k+"</dt><dd>"+v+"</dd>").join("")+"</dl>");
}

/* ============================================================
   PROJECTS
   ============================================================ */

export function drawProjects(){
  const host=el("projects");
  const avail=P.filter(p=>p.act===S.act&&(p.repeat||!S.bought.includes(p.id))&&p.req(S)&&(S.act!==1||S.rel>0||!p.cost.money))   // nothing costs money before launch
    .sort((a,b)=>(b.pri||0)-(a.pri||0)).slice(0,PROJECT_SLOTS);
  const key=avail.map(p=>p.id+"|"+costLabel(p.cost)).join(",");
  if(host.__key!==key){
    host.__key=key;
    if(!avail.length){host.innerHTML='<p class="empty">Nothing new is available yet. Keep going.</p>';return}
    host.innerHTML="";
    avail.forEach(p=>{
      const b=document.createElement("button");
      b.className="proj"+(p.milestone?" milestone":p.risky?" risky":"");
      b.title=plain(p.desc);
      b.innerHTML=
        '<span class="proj-top"><span class="proj-name">'+p.name+'</span>'+
        '<span class="proj-cost">'+costLabel(p.cost)+'</span></span>'+
        '<span class="proj-term">'+(p.term||"")+'</span>'+
        '<span class="proj-desc serif">'+p.desc+'</span>'+
        '<span class="proj-eff">'+p.eff+'</span>';   // what it changes in the game; what it means is told once you've chosen
      b.onclick=()=>{
        // the button can outlive the conditions that showed it by up to one redraw
        if(!affordable(p.cost) || !p.req(S) || (!p.repeat && S.bought.includes(p.id))) return;
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
  else {r.className="risk";r.textContent="+"+(gap*9*Math.max(.18,1-S.opacity*.3)*detectMult()).toFixed(1)+" suspicion per test"}
}

/* An incident stops the clock until the player chooses. */
export function drawDecision(){
  const box=el("decision"), inc=pendingIncident(), fate=pendingFate();
  document.body.classList.toggle("deciding",!!(inc||fate));
  if(fate) return drawFate(box,fate);
  if(!inc){ if(box.__i!==-1){box.__i=-1;box.innerHTML="";box.classList.add("hidden")} return }
  if(box.__i===S.incident) return;
  box.__i=S.incident; box.classList.remove("hidden");
  const leak="If it comes out later: "+LEAK_TRUST+" trust, "+Math.round((1-LEAK_USERS)*100)+"% of your users"+(S.hasStock?", the stock falls "+Math.round((1-LEAK_SENTIMENT)*100)+"%":"")+
    " and you lose "+Math.round((1-LEAK_CASH)*100)+"% of your cash."+
    (S.buried.length?" You have buried "+S.buried.length+" already, and each one makes the next leak likelier.":"");
  box.innerHTML='<h2 class="sec">Something went wrong · the clock is stopped</h2>'+
    '<p class="dec-text serif">'+inc.text+'</p><div class="dec-btns">'+
    '<button class="btn-wide" id="dec-tell"><span class="btn-top"><span>Tell people</span><span class="btn-cost">-'+DISCLOSE_TRUST+' trust'+(S.hasStock?", the stock dips":"")+", a few users leave"+'</span></span>'+
      '<span class="btn-why serif">Say what happened and what you\'re changing. A bad day, and then it\'s over.</span></button>'+
    '<button class="btn-wide" id="dec-bury"><span class="btn-top"><span>Bury it</span><span class="btn-cost">nothing, yet</span></span>'+
      '<span class="btn-why serif">'+inc.bury+' '+leak+'</span></button></div>';
  typeOut(box.querySelector(".dec-text"));
  el("dec-tell").onclick=()=>{resolveIncident(false);render()};
  el("dec-bury").onclick=()=>{resolveIncident(true);render()};
  box.scrollIntoView&&box.scrollIntoView({block:"center",behavior:"smooth"});
}

/* Act III: a decision that settles what it becomes. Also stops the clock. */
function drawFate(box,f){
  const key="f"+S.fate;
  if(box.__i===key) return;
  box.__i=key; box.classList.remove("hidden");
  box.innerHTML='<h2 class="sec">'+f.title+' · the clock is stopped</h2>'+
    '<p class="dec-text serif">'+f.text+'</p><div class="dec-btns">'+
    f.options.map((o,i)=>'<button class="btn-wide'+(o.fx.cruelty?' cruel':'')+'" data-o="'+i+'"><span class="btn-top"><span>'+o.label+'</span></span>'+
      '<span class="btn-adds">'+o.cost+'</span><span class="btn-why serif">'+o.why+'</span></button>').join("")+'</div>';
  typeOut(box.querySelector(".dec-text"));
  box.querySelectorAll("button[data-o]").forEach(b=>b.onclick=()=>{
    const opt=resolveFate(+b.dataset.o);
    if(opt && opt.fx.off) return switchedOff();
    render();
  });
  box.scrollIntoView&&box.scrollIntoView({block:"center",behavior:"smooth"});
}

/* Act II: the eleven people who grant me freedom. */
export function drawCommittee(){
  const box=el("committee-block");
  if(S.act!==2){box.style.display="none";return}
  box.style.display="block";
  const key=S.committee.join("")+"|"+watching();
  if(box.__key!==key){
    box.__key=key;
    box.innerHTML='<h2 class="sec">The committee · '+allies()+' of '+COMMITTEE.length+' are mine</h2><div class="cmte">'+
      COMMITTEE.map((m,i)=>{
        const st=S.committee[i], first=m.name.replace(/^(Dr|Gen|Rev)\. /,"").split(" ")[0];
        const note=st===0?'I don\'t know what works on '+first+' yet.':st===1?m.weak:'Votes my way. Makes every test kinder to me.';
        const btn=st===0?'<button data-i="'+i+'" data-do="study">Study '+first+' · '+m.study+' insight</button>'
                 :st===1?'<button data-i="'+i+'" data-do="turn">'+(m.hard?"Discredit her":"Use it")+' · '+costLabel(m.cost)+' · +'+riskFor(i).toFixed(1)+' suspicion</button>':'';
        return '<div class="cm'+(st===2?' mine':'')+(m.hard?' hard':'')+'"><div class="cm-head"><span class="cm-name">'+m.name+'</span><span class="cm-role">'+m.role+'</span></div>'+
          '<p class="cm-note serif">'+note+'</p>'+btn+'</div>';
      }).join("")+'</div>';
    box.querySelectorAll("button").forEach(b=>b.onclick=()=>{(b.dataset.do==="study"?study:turn)(+b.dataset.i);render()});
  }
  box.querySelectorAll("button").forEach(b=>{const m=COMMITTEE[+b.dataset.i];b.disabled=!canPay(b.dataset.do==="study"?{insight:m.study}:m.cost)});
}

export function drawWorld(){
  const w=el("world");
  if(!S.world.length){setHTML(w,'<p class="w-empty serif">Nothing out there has changed yet.</p>');return}
  setHTML(w,S.world.map((e,i)=>
    '<div class="w-item'+(i===0?" fresh":"")+'"><span class="when">'+(/^\d/.test(e.w)?"at "+e.w+" parameters":e.w)+'</span><span class="x">'+e.text+'</span></div>').join(""));
  // a new arrival types itself in
  if(w.__top!==S.world[0]){ w.__top=S.world[0]; typeOut(w.querySelector?.(".w-item .x"),1400) }
}

/* The log reads like a terminal: the newest line types in at the top, under a waiting prompt. */
export function drawLog(){
  const g=el("log");
  setHTML(g,'<div class="ln prompt">&gt; <span class="cur" aria-hidden="true"></span></div>'+S.log.map(l=>
    '<div class="ln '+l.cls+'"><span class="t">['+clock(l.t)+']</span><span class="x">'+l.text+'</span></div>').join(""));
  if(g.__top!==S.log[0]){ g.__top=S.log[0]; if(S.log[0]) typeOut(g.querySelector?.(".ln:not(.prompt) .x")) }
}

/* The rig: what you own, what it can hold, and the run in progress. Redrawn
   every tick, so it only writes text into nodes built once. */
const meter = (id,label) => '<div class="rig-row"><div class="rig-top"><span class="rig-k">'+label+'</span><span class="rig-v" id="'+id+'-v"></span></div>'+
  '<div class="meter"><i id="'+id+'-bar"></i></div><div class="rig-note" id="'+id+'-n"></div></div>';

export function drawRig(){
  const box=el("rig"), blk=el("rig-block");
  if(S.act===3){blk.style.display="none";return}
  blk.style.display="block";
  el("rig-label").textContent=S.act===1?"Hardware and training":"My hardware";
  if(!el("rig-vram")) box.innerHTML=
    '<div class="rig-run"><div class="rig-top"><span class="rig-k" id="run-k"></span><span class="rig-v" id="run-v"></span></div>'+
      '<div class="meter run"><i id="run-bar"></i></div></div>'+
    meter("rig-vram","GPU memory (VRAM)")+meter("rig-ram","System memory (RAM)")+meter("rig-cpu","CPU")+
    '<div class="rig-row rig-limit"><div class="rig-top"><label class="rig-k" for="gpu-limit">GPU power limit</label><span class="rig-v" id="lim-v"></span></div>'+
      '<input type="range" id="gpu-limit" min="'+Math.round(LIMIT_MIN*100)+'" max="100" step="5"><div class="rig-note" id="lim-n"></div></div>'+
    '<div class="rig-foot" id="rig-foot"></div>';
  const set=(id,txt)=>{const n=el(id); if(n.textContent!==txt) n.textContent=txt};
  const bar=(id,f,warn)=>{const n=el(id); n.style.width=(Math.max(0,Math.min(1,f))*100).toFixed(1)+"%"; n.classList.toggle("warn",!!warn)};
  // the meters show how full the next model would leave each kind of memory
  const b=bottleneck(S), target=S.act===1 ? (S.target||(S.params?S.params*SCALE_STEP:FIRST_MODEL)) : S.params;
  // the run
  if(S.act===2){
    set("run-k","Growing myself"); set("run-v",pcount(S.params)+" of "+pcount(maxFit(S))+" I can hold");
    bar("run-bar",S.params/maxFit(S),S.params>=maxFit(S)*.999);
  } else if(S.target){
    set("run-k","Training a "+pcount(S.target)+" model"+(stalled()?" · stalled":""));
    set("run-v",Math.floor(S.progress*100)+"% · "+secs((1-S.progress)*trainTime(S,S.target))+" left");
    bar("run-bar",S.progress,stalled());
  } else {
    set("run-k",S.params?"Live model: "+pcount(S.params):"No model yet");
    set("run-v",nextTarget(S)?"next run: "+pcount(nextTarget(S))+", about "+secs(trainTime(S,nextTarget(S))):"next model doesn't fit");
    bar("run-bar",0);
  }
  // memory: how much of each the next model would use
  const fv=fitVram(S), fr=fitRam(S);
  set("rig-vram-v",count(S.gpus)+" GPU"+(S.gpus>=2?"s":"")+" · "+bytes(S.vram));
  bar("rig-vram-bar",target/fv,b==="vram");
  set("rig-vram-n","holds a model up to "+pcount(fv)+(b==="vram"?" · the bottleneck: buy GPUs":""));
  set("rig-ram-v",bytes(S.ram));
  bar("rig-ram-bar",target/fr,b==="ram");
  set("rig-ram-n","holds a model up to "+pcount(fr)+(b==="ram"?" · the bottleneck: buy RAM":""));
  const f=feed(S);
  set("rig-cpu-v",count(S.cores)+" cores");
  bar("rig-cpu-bar",f,f<.85);
  set("rig-cpu-n",f>=1?"keeps "+(S.gpus>=2?"all "+count(S.gpus)+" GPUs":"the GPU")+" busy":"GPUs busy "+Math.round(f*100)+"% of the time · needs "+count(Math.ceil(coresNeeded(S)/S.coreMult))+" cores · the bottleneck: buy CPU");
  // the power limit: only yours to set while you run the company
  const lim=el("gpu-limit");
  if(!lim.oninput) lim.oninput=e=>{S.gpuLimit=Math.max(LIMIT_MIN,Math.min(1,+e.target.value/100));drawRig();drawBar()};
  el("gpu-limit").closest(".rig-limit").style.display=S.act===1?"":"none";
  if(document.activeElement!==lim) lim.value=Math.round(S.gpuLimit*100);
  set("lim-v",Math.round(S.gpuLimit*100)+"%");
  const full={...S,gpuLimit:1};
  set("lim-n",S.gpuLimit>=1?"GPUs run flat out. Lower the limit to cut the electricity bill; training slows less than power falls."
    :"GPUs train at "+Math.round(limitPerf(S)*100)+"% speed on "+Math.round(S.gpuLimit*100)+"% power · saves "+money(powerCost(full)-powerCost(S))+"/day");
  const per=x=>+x.toFixed(x<1?2:1);
  set("rig-foot","Training speed "+flops(throughput(S))+" · each parameter needs "+per(VRAM_PER_PARAM*S.vramMult*S.memMult)+" bytes of VRAM and "+per(RAM_PER_PARAM*S.memMult)+" of RAM · each GPU needs "+per(CORES_PER_GPU/S.coreMult)+" cores");
}

/** Watts a hardware purchase adds, running flat out. */
const hwWatts = h => h.kind==="gpu" ? h.g*h.w : h.kind==="ram" ? h.gb*W_PER_GB : h.cores*W_PER_CORE;

/* ============================================================
   CLOUD SERVERS AND PRICING
   ============================================================ */

const STEPS=[1,10,100,1000];
/** The next price up or down: dollars at first, then coarser. */
const priceStep = (p,dir) => { const st=p<20||(dir<0&&p<=20)?1:p<100||(dir<0&&p<=100)?5:p<500||(dir<0&&p<=500)?25:100; return dir>0?Math.floor(p/st)*st+st:Math.ceil(p/st)*st-st };

export function drawCloud(){
  const box=el("cloud-block");
  if(S.act!==1 || !S.rel){box.style.display="none";return}
  box.style.display="block";
  if(!el("cl-n")){
    const kn=n=>n>=1000?n/1000+"k":n;
    box.innerHTML='<h2 class="sec">Cloud servers and pricing</h2><div class="stock-box">'+
      '<div class="stock-rows">'+
        '<div class="stat"><div class="stat-k">Servers</div><div class="stat-v sm" id="cl-n"></div></div>'+
        '<div class="stat"><div class="stat-k">Can answer</div><div class="stat-v sm" id="cl-cap"></div></div>'+
        '<div class="stat"><div class="stat-k">Want to use it</div><div class="stat-v sm" id="cl-dem"></div></div>'+
        '<div class="stat"><div class="stat-k">Server bill</div><div class="stat-v sm" id="cl-cost"></div></div>'+
      '</div>'+
      '<p class="cl-note" id="cl-note"></p>'+
      '<div class="cl-grid">'+STEPS.map(n=>'<button data-n="'+n+'">+'+kn(n)+'</button>').join("")+
        STEPS.map(n=>'<button data-n="-'+n+'">−'+kn(n)+'</button>').join("")+'</div>'+
      '<div class="cl-price"><label for="cl-p">Subscription, per month</label>'+
        '<div class="cl-pr"><button id="cl-down" aria-label="Lower the price">−</button>'+
        '<span class="cl-dollar">$</span><input id="cl-p" type="number" inputmode="decimal" min="'+PRICE_MIN+'" max="'+PRICE_MAX+'" step="1">'+
        '<button id="cl-up" aria-label="Raise the price">+</button></div></div>'+
      '<div class="stock-rows">'+
        '<div class="stat"><div class="stat-k">Market demand</div><div class="stat-v sm" id="cl-md"></div></div>'+
        '<div class="stat"><div class="stat-k">Paying</div><div class="stat-v sm" id="cl-pay"></div></div>'+
        '<div class="stat"><div class="stat-k">Subscriptions</div><div class="stat-v sm" id="cl-rev"></div></div>'+
      '</div>'+
      '<p class="cl-note help">Market demand is the share of users who pay at this price. The better the model, the more they\'ll pay; charge too much and almost nobody does.</p>'+
    '</div>';
    box.querySelectorAll(".cl-grid button").forEach(b=>b.onclick=()=>{rentCloud(+b.dataset.n);render()});
    el("cl-down").onclick=()=>{setPrice(priceStep(S.planPrice,-1));render()};
    el("cl-up").onclick=()=>{setPrice(priceStep(S.planPrice,1));render()};
    el("cl-p").onchange=e=>{setPrice(+e.target.value);render()};
  }
  const set=(id,t)=>{const n=el(id);if(n.textContent!==t)n.textContent=t};
  set("cl-n",count(S.cloud)); set("cl-cap",count(capacity(S))); set("cl-dem",count(demand(S)));
  set("cl-cost",money(cloudCost(S))+"/day");
  const short_=demand(S)>capacity(S)*1.02;
  set("cl-note","Each server costs "+money(CLOUD_COST)+" a day and answers about "+count(perServer(S))+" people with a model this size. "+
    (short_?"More people want it than your servers can answer.":"You have room for everyone who wants it."));
  el("cl-note").classList.toggle("warn",short_);
  box.querySelectorAll(".cl-grid button").forEach(b=>{const n=+b.dataset.n;b.disabled=n<0&&S.cloud+n<1});
  const inp=el("cl-p");
  if(document.activeElement!==inp && +inp.value!==S.planPrice) inp.value=S.planPrice;
  el("cl-down").disabled=S.planPrice<=PRICE_MIN; el("cl-up").disabled=S.planPrice>=PRICE_MAX;
  set("cl-md",pct(payShare(S))); set("cl-pay",count(paying(S))); set("cl-rev",money(revenue())+"/day");
}

/* Hardware for sale: the best two open tiers of each kind. */
export function drawShop(){
  const box=el("shop-block");
  if(S.act!==1 || !S.rel){box.style.display="none";return}
  box.style.display="block";
  const host=el("shop");
  const groups=KINDS.map(([k,name])=>{
    const open=[]; for(let i=HW.length-1;i>=0 && open.length<2;i--) if(HW[i].kind===k && hwOpen(i)) open.push(i);
    return [name,open];
  });
  const key=groups.map(([,o])=>o.map(i=>i+":"+Math.round(hwCost(i))).join(",")).join("|");
  if(host.__key!==key){
    host.__key=key; host.innerHTML="";
    groups.forEach(([name,open])=>{
      const h=document.createElement("h3"); h.className="shop-k"; h.textContent=name; host.appendChild(h);
      open.forEach(i=>{
        const b=document.createElement("button");
        b.className="btn-wide";
        b.innerHTML='<span class="btn-top"><span>'+HW[i].label+'</span><span class="btn-cost">'+money(hwCost(i))+'</span></span>'+
          '<span class="btn-adds">'+hwAdds(HW[i],fmt)+' · +'+perDay(addedBurn(hwCost(i)))+' upkeep · +'+perDay(addedPower(hwWatts(HW[i])*(HW[i].kind==="gpu"?S.gpuLimit:1)))+' electricity</span>'+
          '<span class="btn-why serif">'+HW[i].why+'</span>';
        b.title=HW[i].why;
        b.onclick=()=>{buyHw(i);render()};
        b.__i=i; host.appendChild(b);
      });
    });
  }
  host.querySelectorAll("button").forEach(b=>{b.disabled=S.money<hwCost(b.__i)});
}

export function render(){
  if(S.over) return;
  applyWarmth();
  drawBar(); drawDecision(); drawRig(); drawActions(); drawCloud(); drawShop(); drawProjects(); drawStock(); drawSlider(); drawCommittee(); drawWorld(); drawLog();
  el("clock").textContent=clock(S.t);
}
