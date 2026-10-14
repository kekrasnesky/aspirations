import { S } from '../core/state.js';

/* He starts with one gaming PC (START_UNITS in balance.js), so the ladder is a
   list of upgrades. n: what it is, label: the button, off: selling it again. */
export const HW = [
 {n:"a better graphics card", label:"Upgrade my graphics card", off:"Sell the upgraded graphics card",
  u:5,    c:3e3,   s:1.50, req:18,
  why:"A graphics card (GPU) is a chip built to do huge numbers of simple sums at once, which is exactly what training an AI needs. Swapping yours for a better one makes the whole PC train faster. Your bedroom gets noticeably warmer."},
 {n:"a workstation PC", label:"Build a workstation PC", off:"Sell the workstation PC",
  u:20,   c:1.4e4, s:1.42, req:40,
  why:"A new PC built around two or three top graphics cards, a huge power supply and a case that no longer closes. Your parents ask why the electricity bill doubled."},
 {n:"a rackmount server", label:"Buy a rackmount server", off:"Shut down a rackmount server",
  u:80,   c:1e5,   s:1.38, req:55,
  why:"A real server: eight graphics cards in a steel box built to slide into a rack. It's loud, it needs its own power circuit, and it won't fit in a bedroom."},
 {n:"a full rack", label:"Buy a full rack", off:"Shut down a full rack",
  u:700,  c:8.5e5, s:1.34, req:150,
  why:"Forty servers in a cabinet taller than you are. You're renting space in someone else's building now."},
 {n:"a row of racks", label:"Rent a row of racks", off:"Shut down a row of racks",
  u:7e3,  c:8e6,   s:1.31, req:380,
  why:"A caged aisle in a shared facility. You badge in at three in the morning to swap a dead fan."},
 {n:"a datacenter floor", label:"Lease a datacenter floor", off:"Shut down a datacenter floor",
  u:7e4,  c:8e7,   s:1.29, req:800,
  why:"An entire floor, leased. Your cooling bill is now larger than your first funding round was."},
 {n:"a dedicated building", label:"Build your own datacenter", off:"Shut down the datacenter",
  u:8e5,  c:9e8,   s:1.27, req:1600,
  why:"Purpose-built, with nothing else inside it. The local council objected over water use and was overruled."},
 {n:"a campus and a power station", label:"Build a campus and a power station", off:"Shut down the campus",
  u:1e7,  c:11e9,  s:1.25, req:2800,
  why:"Two gigawatts in west Texas, enough to power a large city, with its own substation because the public grid said no."}
];

export const hwCost = i => HW[i].c * Math.pow(HW[i].s, S.hw[i]);

export const hwOpen = i => S.capability >= HW[i].req;
