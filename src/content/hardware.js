import { S } from '../core/state.js';

/* Three kinds of hardware, each its own ladder. You start with one PC
   (START_* in balance.js), so everything here is an addition to it.
     gpu: g GPUs per purchase, each with v GB of memory, tf TFLOPS, drawing w watts
          (including its share of the server, networking and cooling)
     ram: gb of system memory
     cpu: cores
   A tier unlocks once you own one of the tier below it. c is the first price,
   and each repeat purchase costs s times the last. */
export const HW = [
 {kind:"gpu", n:"graphics card", w:300, label:"Add a graphics card", g:1, v:16, tf:40, c:1.6e3, s:1.35,
  why:"A second card in the spare slot. The model is split across both, so it can be twice as big, and they train it together."},
 {kind:"gpu", n:"workstation GPU", w:350, label:"Add a workstation GPU", g:1, v:48, tf:120, c:7e3, s:1.32,
  why:"A professional card with three times the memory of a gaming one. It needs its own power cable and makes the room noticeably warmer."},
 {kind:"gpu", n:"8-GPU server", w:2000, label:"Buy an 8-GPU server", g:8, v:80, tf:400, c:2.6e5, s:1.3,
  why:"Eight datacenter GPUs in a steel box built for a rack. It's loud, it needs its own power circuit, and it won't fit under a desk."},
 {kind:"gpu", n:"GPU rack", w:2500, label:"Fill a rack with GPU servers", g:256, v:80, tf:400, c:7e6, s:1.28,
  why:"Thirty-two of those servers in a cabinet taller than you are. You're renting space in someone else's building now."},
 {kind:"gpu", n:"GPU pod", w:3000, label:"Lease a GPU pod", g:4096, v:141, tf:600, c:1.4e8, s:1.27,
  why:"Four thousand newer GPUs wired together so they can act as one machine. Your cooling bill is now larger than your first funding round."},
 {kind:"gpu", n:"GPU datacenter", w:3500, label:"Build a GPU datacenter", g:32768, v:192, tf:900, c:1.6e9, s:1.26,
  why:"Purpose-built, with nothing else inside it. The local council objected over water use and was overruled."},
 {kind:"gpu", n:"campus and power station", w:4000, label:"Build a campus and a power station", g:262144, v:192, tf:1000, c:1.4e10, s:1.25,
  why:"Two gigawatts in west Texas, enough to power a large city, with its own substation because the public grid said no."},

 {kind:"ram", n:"32 GB of RAM", label:"Add 32 GB of RAM", gb:32, c:120, s:1.4,
  why:"Two more sticks in the empty slots. More RAM holds more training data and a bigger copy of the model while it trains."},
 {kind:"ram", n:"256 GB of RAM", label:"Add 256 GB of RAM", gb:256, c:1.6e3, s:1.35,
  why:"Workstation memory, the kind with error correction, because one flipped bit can ruin a week of training."},
 {kind:"ram", n:"2 TB memory server", label:"Add a 2 TB memory server", gb:2048, c:2.5e4, s:1.32,
  why:"A server that is mostly memory. It holds the training data close to the GPUs so they never wait for the disk."},
 {kind:"ram", n:"64 TB of rack memory", label:"Add 64 TB of rack memory", gb:65536, c:8e5, s:1.3,
  why:"A rack of memory servers. A full copy of the model and everything it reads, all held at once."},
 {kind:"ram", n:"1 PB of memory", label:"Add 1 PB of memory", gb:1.05e6, c:1.4e7, s:1.28,
  why:"A petabyte, held live. Enough to keep a copy of most of the written internet in RAM, which is roughly what it's for."},
 {kind:"ram", n:"16 PB of memory", label:"Add 16 PB of memory", gb:1.68e7, c:2.2e8, s:1.27,
  why:"Memory bought by the warehouse. The manufacturer opens a production line with your name on it."},
 {kind:"ram", n:"128 PB of memory", label:"Add 128 PB of memory", gb:1.34e8, c:1.8e9, s:1.26,
  why:"A sizeable share of all the memory made on Earth this year. Phone prices go up. Nobody connects the two."},

 {kind:"cpu", n:"16-core CPU", label:"Swap in a 16-core CPU", cores:12, c:500, s:1.4,
  why:"The CPU reads, cleans and shuffles the training data, then hands it to the GPUs. Too few cores and the GPUs sit idle waiting."},
 {kind:"cpu", n:"64-core CPU", label:"Add a 64-core workstation CPU", cores:64, c:5e3, s:1.35,
  why:"Sixty-four cores preparing data in parallel, so every GPU gets its next batch the moment it asks."},
 {kind:"cpu", n:"256-core CPU server", label:"Add a 256-core CPU server", cores:256, c:3.5e4, s:1.32,
  why:"Two server processors in one box, doing nothing but feeding the GPUs."},
 {kind:"cpu", n:"CPU rack", label:"Fill a rack with CPU servers", cores:8192, c:9e5, s:1.3,
  why:"Eight thousand cores whose only job is to keep thousands of GPUs from waiting."},
 {kind:"cpu", n:"hall of CPU servers", label:"Add 131,072 CPU cores", cores:131072, c:1.4e7, s:1.28,
  why:"A whole hall of CPU servers. More cores than every computer in a mid-sized country."},
 {kind:"cpu", n:"million CPU cores", label:"Add a million CPU cores", cores:1048576, c:1.1e8, s:1.27,
  why:"A million cores on one network, preparing data faster than people produce it."},
 {kind:"cpu", n:"8 million CPU cores", label:"Add 8 million CPU cores", cores:8388608, c:9e8, s:1.26,
  why:"Somewhere in this building is a team whose whole job is to replace the hundreds of processors that fail every day."}
];

export const KINDS = [["gpu","GPUs"],["ram","Memory (RAM)"],["cpu","Processors (CPU)"]];

export const hwCost = i => HW[i].c * Math.pow(HW[i].s, S.hw[i]);

/** The first tier of each kind is always open; every other tier opens once you own the one below it. */
export const hwOpen = i => i===0 || HW[i-1].kind!==HW[i].kind || S.hw[i-1]>0;

/** One line for the button: what this purchase adds. */
export function hwAdds(h, fmt){
  if(h.kind==="gpu") return "+"+fmt.count(h.g)+" GPU"+(h.g>1?"s":"")+" · "+fmt.bytes(h.g*h.v)+" VRAM · "+fmt.flops(h.g*h.tf);
  if(h.kind==="ram") return "+"+fmt.bytes(h.gb)+" RAM";
  return "+"+fmt.count(h.cores)+" CPU cores";
}
