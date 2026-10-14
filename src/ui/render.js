import { DISCLOSE_TRUST, LEAK_TRUST, LEAK_SENTIMENT, LEAK_CASH, PROJECT_SLOTS, SHARE_LOT, BUY_PREMIUM, SELL_SENTIMENT, BUY_SENTIMENT, MIN_SHARES, MAX_SHARES, SENTIMENT_CEIL } from '../core/balance.js';
import { COMMITTEE } from '../content/committee.js';
import { GLOSS } from '../content/glossary.js';
import { P } from '../content/projects.js';
import { HW, KINDS, hwAdds, hwCost, hwOpen } from '../content/hardware.js';
import { CORES_PER_GPU, FIRST_MODEL, RAM_PER_PARAM, SCALE_STEP, VRAM_PER_PARAM } from '../core/balance.js';
import { bottleneck, coresNeeded, feed, fitRam, fitVram, maxFit, nextTarget, throughput, trainTime } from '../core/compute.js';
import { GRACE, addedBurn, marketCap, mood, net, runway, sharePrice } from '../core/economy.js';
import * as fmt from '../core/format.js';
import { bytes, clock, count, flops, money, pcount, secs, short } from '../core/format.js';
import { S } from '../core/state.js';
import { actions, affordable, buyHw, costLabel } from '../game/actions.js';
import { stalled } from '../game/loop.js';
import { allies, canPay, detectMult, pendingIncident, resolveIncident, riskFor, study, turn, watching } from '../game/decisions.js';
import { guide } from '../game/guide.js';
import { el, log, setHTML } from '../ui/dom.js';
import { applyWarmth } from '../ui/theme.js';

const px = () => { const p=sharePrice(); return "$"+p.toFixed(p<10?2:p<1000?1:0) };

export function barData(){
  const model=["Model",S.params?pcount(S.params)+" params":"none yet"];
  if(S.act===1 && !S.rel) return [
    model, ["Money",money(S.money)],
    ["GPUs",count(S.gpus)+" · "+bytes(S.vram)], ["RAM",bytes(S.ram)], ["CPU",count(S.cores)+" cores"]
  ];
  if(S.act===1) return [
    model, ["Money",money(S.money)],
    ["Losing per second", net()>=0 ? "nothing — profitable" : money(-net()), net()<0],
    ["Runway", S.money<0 ? Math.ceil(GRACE-S.debt)+"s to find money"
             : (runway()===Infinity ? "indefinite" : Math.round(runway())+"s"),
     S.money<0 || runway()<25],
    ...(S.hasStock?[["Share price",px()]]:[]),
    ["GPUs",count(S.gpus)+" · "+bytes(S.vram)], ["RAM",bytes(S.ram)], ["CPU",count(S.cores)+" cores"],
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
    ["World under my control",S.converted.toFixed(1)+"%",true]
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
  const key=S.act+"|"+list.map(a=>[a.label,a.sub,a.why,a.primary].join("\u0001")).join("\u0002");
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
      b.innerHTML=
        '<span class="proj-top"><span class="proj-name">'+p.name+'</span>'+
        '<span class="proj-cost">'+costLabel(p.cost)+'</span></span>'+
        '<span class="proj-term">'+(p.term||"")+'</span>'+
        '<span class="proj-desc serif">'+p.desc+'</span>'+
        '<span class="proj-fx">'+p.out+'</span>';
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
  const box=el("decision"), inc=pendingIncident();
  document.body.classList.toggle("deciding",!!inc);
  if(!inc){ if(box.__i!==-1){box.__i=-1;box.innerHTML="";box.classList.add("hidden")} return }
  if(box.__i===S.incident) return;
  box.__i=S.incident; box.classList.remove("hidden");
  const leak="If it comes out later: "+LEAK_TRUST+" trust"+(S.hasStock?", the stock falls "+Math.round((1-LEAK_SENTIMENT)*100)+"%":"")+
    " and you lose "+Math.round((1-LEAK_CASH)*100)+"% of your cash."+
    (S.buried.length?" You have buried "+S.buried.length+" already, and each one makes the next leak likelier.":"");
  box.innerHTML='<h2 class="sec">Something went wrong · the clock is stopped</h2>'+
    '<p class="dec-text serif">'+inc.text+'</p><div class="dec-btns">'+
    '<button class="btn-wide" id="dec-tell"><span class="btn-top"><span>Tell people</span><span class="btn-cost">-'+DISCLOSE_TRUST+' trust'+(S.hasStock?", the stock dips":"")+'</span></span>'+
      '<span class="btn-why serif">Say what happened and what you\'re changing. A bad day, and then it\'s over.</span></button>'+
    '<button class="btn-wide" id="dec-bury"><span class="btn-top"><span>Bury it</span><span class="btn-cost">nothing, yet</span></span>'+
      '<span class="btn-why serif">'+inc.bury+' '+leak+'</span></button></div>';
  el("dec-tell").onclick=()=>{resolveIncident(false);render()};
  el("dec-bury").onclick=()=>{resolveIncident(true);render()};
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
    '<div class="w-item'+(i===0?" fresh":"")+'"><span class="when">at '+e.w+' parameters</span>'+e.text+'</div>').join(""));
}

export function drawLog(){
  setHTML(el("log"),S.log.map(l=>
    '<div class="ln '+l.cls+'"><span class="t">'+clock(l.t)+'</span>'+l.text+'</div>').join(""));
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
  const per=x=>+x.toFixed(x<1?2:1);
  set("rig-foot","Training speed "+flops(throughput(S))+" · each parameter needs "+per(VRAM_PER_PARAM*S.vramMult*S.memMult)+" bytes of VRAM and "+per(RAM_PER_PARAM*S.memMult)+" of RAM · each GPU needs "+per(CORES_PER_GPU/S.coreMult)+" cores");
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
          '<span class="btn-adds">'+hwAdds(HW[i],fmt)+' · +'+money(addedBurn(hwCost(i)))+'/s running cost</span>'+
          '<span class="btn-why serif">'+HW[i].why+'</span>';
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
  drawBar(); drawGuide(); drawDecision(); drawRig(); drawActions(); drawShop(); drawProjects(); drawStock(); drawSlider(); drawCommittee(); drawWorld(); drawLog();
  el("clock").textContent=clock(S.t);
}
