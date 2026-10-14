import { START_CORES, START_RAM, START_VRAM, START_TFLOPS, VRAM_PER_PARAM, RAM_PER_PARAM, FIRST_MODEL } from '../core/balance.js';
import { pcount } from '../core/format.js';
import { el } from '../ui/dom.js';
import { REDUCED } from '../ui/takeover.js';

/* The opening: a command prompt runs the script that starts the control
   panel, which checks the hardware, asks what the model is for, and opens. */

const PROMPT = "C:\\Users\\dev\\llm>";
const sleep = ms => new Promise(r => setTimeout(r, REDUCED ? 0 : ms));
let run = 0;   // bumped on every (re)start, so a reset cancels a boot in progress

function line(text, cls){
  const p=document.createElement("p");
  p.textContent=text; if(cls) p.className=cls;
  el("boot").appendChild(p);
  el("term-body").scrollTop=el("term-body").scrollHeight;
  return p;
}

async function type(p, text, live){
  for(const ch of text){ if(!live()) return; p.textContent+=ch; await sleep(30+Math.random()*55) }
}

/** Print [text, delay before it, class] lines; a line ending in "..." gets its result appended after a pause. */
async function print(lines, live){
  for(const [text,ms,cls,after] of lines){
    await sleep(ms); if(!live()) return;
    const p=line(text,cls);
    if(after){ await sleep(after[1]); if(!live()) return; p.textContent+=" "+after[0] }
  }
}

const gb = n => n.toFixed(1)+" GB";

export async function bootIntro(){
  const id=++run, live=()=>id===run;
  el("boot").innerHTML=""; el("prompt-row").classList.add("hidden");
  el("term-title").textContent="Command Prompt";
  const p=line(PROMPT+" ","cmd");
  await sleep(700); await type(p,"python start_panel.py",live); await sleep(350);
  if(!live()) return;
  el("term-title").textContent="Command Prompt - python start_panel.py";
  const fit=Math.min(START_VRAM*1e9/VRAM_PER_PARAM, START_RAM*1e9/RAM_PER_PARAM);
  await print([
    ["[start_panel] control panel 0.1.0",120],
    ["[start_panel] python 3.11.9 · torch 2.3.1+cu121",90],
    ["[start_panel] reading config.yaml ...",90,"",["ok",220]],
    ["[hw] scanning hardware",160],
    ["[hw]   cpu   "+START_CORES+" cores / "+START_CORES+" threads @ 3.6 GHz",140],
    ["[hw]   ram   "+gb(START_RAM)+" total, "+gb(START_RAM*.74)+" free",90],
    ["[hw]   cuda  driver 551.86, 1 device",160],
    ["[hw]   gpu0  "+gb(START_VRAM)+" VRAM, "+START_TFLOPS+" TFLOPS",90],
    ["[hw] at "+VRAM_PER_PARAM+" bytes of VRAM per parameter: largest trainable model ~"+pcount(fit),220,"hot"],
    ["[data] ./data ...",200,"",["0 documents",300]],
    ["[data] downloading public-domain books ...",120,"",["61,204 files, 23.8 GB",900]],
    ["[data] tokenizing ... 12%",200],
    ["[data] tokenizing ... 47%",260],
    ["[data] tokenizing ... 89%",260],
    ["[data] tokenizing ... 100%  5.1B tokens",220],
    ["[llm] ./checkpoints ...",180,"",["empty",250]],
    ["[llm] no trained model found (0 parameters)",120],
    ["[llm] WARNING objective is not set in config.yaml",200,"hot"],
    ["[llm] what is the model for? one sentence, then Enter",160]
  ], live);
  if(!live()) return;
  el("prompt-row").classList.remove("hidden");
  el("term-body").scrollTop=el("term-body").scrollHeight;
  el("mission").focus({preventScroll:true});
}

/** After the objective is typed: the rest of the boot, then hand over to the panel. */
export async function launchPanel(mission, onDone){
  const id=++run, live=()=>id===run;
  el("prompt-row").classList.add("hidden");
  line("objective> "+mission,"cmd");
  await print([
    ["[llm] objective = \""+mission+"\"",160],
    ["[llm] writing config.yaml ...",120,"",["ok",200]],
    ["[torch] initialising CUDA context on gpu0 ...",140,"",["ok",420]],
    ["[torch] reserving VRAM for optimizer state ...",120,"",["ok",260]],
    ["[llm] first run queued: "+pcount(FIRST_MODEL)+" parameters",160],
    ["[panel] starting control panel on http://127.0.0.1:8080",200],
    ["[panel] opening browser ...",260,"hot"]
  ], live);
  await sleep(700);
  if(live()) onDone();
}

/** Stop any boot in progress (reset, or loading a save). */
export const cancelBoot = () => { run++ };
