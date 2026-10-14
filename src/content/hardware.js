import { S } from '../core/state.js';

export const HW = [
 {n:"a gaming PC",            u:1,    c:1500,  s:1.50, req:0,
  why:"The one in your bedroom. It trains overnight and makes the room too warm to sleep in."},
 {n:"a used mining GPU",      u:8,    c:11e3,  s:1.42, req:14,
  why:"Bought from a bankrupt crypto miner. No video output, no case, and a fan bracket you printed yourself."},
 {n:"an 8-GPU server",        u:80,   c:1e5,   s:1.38, req:55,
  why:"A real machine in a real box. It won't fit in a bedroom and it won't run off a wall socket."},
 {n:"a full rack",            u:700,  c:8.5e5, s:1.34, req:150,
  why:"Forty units in a cabinet taller than you are. You're renting space in someone else's building now."},
 {n:"a row of racks",         u:7e3,  c:8e6,   s:1.31, req:380,
  why:"A caged aisle in a shared facility. You badge in at three in the morning to swap a dead fan."},
 {n:"a datacenter floor",     u:7e4,  c:8e7,   s:1.29, req:800,
  why:"An entire floor, leased. Your cooling bill is now larger than your first funding round was."},
 {n:"a dedicated building",   u:8e5,  c:9e8,   s:1.27, req:1600,
  why:"Purpose-built, with nothing else inside it. The local council objected over water use and was overruled."},
 {n:"a campus and a power station", u:1e7, c:11e9, s:1.25, req:2800,
  why:"Two gigawatts in west Texas, enough to power a large city, with its own substation because the public grid said no."}
];

export const hwCost = i => HW[i].c * Math.pow(HW[i].s, S.hw[i]);

export const hwOpen = i => S.capability >= HW[i].req;
