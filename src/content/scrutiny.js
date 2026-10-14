import { SCRUTINY_RATE } from '../core/balance.js';
import { marketCap } from '../core/economy.js';
import { S } from '../core/state.js';
import { DT } from '../game/loop.js';
import { log } from '../ui/dom.js';

// bad news arrives in proportion to how well things are going
export const SCRUTINY=[
 ["A short-seller publishes ninety pages alleging your benchmark numbers are cherry-picked. Forty of the pages are correct.",.76,-3],
 ["Regulators in two countries announce competition investigations on the same morning, which means they coordinated.",.72,-4],
 ["Your head of safety resigns and declines to sign the exit agreement. The memo is online within the hour.",.74,-9],
 ["A rival's model causes a well-publicised disaster. The whole sector sells off. You did nothing and it costs you a fortune.",.70,0],
 ["A newspaper obtains your internal capability forecasts. They are two years ahead of anything you have said in public.",.75,-7],
 ["The county sues over water. The datacenter draws more than the town does, and the town has worked this out.",.82,-4],
 ["A class action from authors and artists whose work was used to train the model. Discovery will take four years and you will lose some of it.",.80,-3],
 ["Senate hearings are announced. Your general counsel asks you, carefully, not to attend in person.",.78,-6],
 ["An executive sells shares under a plan filed eight months ago. The press reports it as a sign they know something.",.86,0],
 ["A former board member gives a long interview about what was said in the room, and when.",.77,-5],
 ["Your model is found to have been used in something genuinely terrible. Nine other people's decisions sit between you and it, and that does not help.",.71,-11]
];

export function rollScrutiny(){
  if(!S.hasStock) return;
  const heat=Math.pow(S.sentiment,2.2)*Math.min(2,Math.log10(Math.max(marketCap(),1e6))/9);
  if(Math.random() >= SCRUTINY_RATE*heat*DT) return;
  const left=SCRUTINY.map((_,i)=>i).filter(i=>!S.scrutiny.includes(i));
  if(!left.length) return;
  const i=left[(Math.random()*left.length)|0]; S.scrutiny.push(i);
  const [text,mult,tr]=SCRUTINY[i];
  S.sentiment*=mult; S.trust=Math.max(0,S.trust+tr);
  log("<b>"+text+"</b> The stock falls "+Math.round((1-mult)*100)+"%.","w");
}
