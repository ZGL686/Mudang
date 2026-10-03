import {clamp,smooth} from './story-core.mjs';

// Pixel bounds and crown/hair anchors measured on the generated source sheets.
// Aligning the head keeps the actor in place while hands and expressions change.
export const pavilionAtlases={
 emperor:{width:2172,height:724,cuts:[0,724,1448,2172],anchors:[[324,46],[310,46],[295,45]]},
 consort:{width:2172,height:724,cuts:[0,730,1442,2172],anchors:[[421,19],[396,21],[390,27]]},
 poet:{width:1774,height:887,cuts:[0,591,1183,1774],anchors:[[299,12],[291.5,12],[289.5,16]]},
 musician:{width:2172,height:724,cuts:[0,724,1448,2172],anchors:[[393,19],[348.5,20],[311.5,22]]}
};

export function pavilionPoses(local,duration=8){
 const seconds=clamp(local,0,duration),p=seconds/duration;
 const cycle=period=>1-Math.cos(seconds/period*Math.PI*2);
 return {
  emperor:smooth((p-.1)/.22)+smooth((p-.66)/.23),
  consort:smooth((p-.16)/.24)+smooth((p-.62)/.24),
  poet:cycle(3.1),
  musician:cycle(1.25)
 };
}

export function pavilionLayout(aspect){
 if(aspect<1.1){
  const spread=clamp(aspect/(390/844),.72,1.6),size=Math.min(1,spread);
  // Stagger head heights while keeping hems near the same courtyard floor.
  return [
   {actor:'poet',x:960-105*spread,y:250,height:570*size,depth:.55},
   {actor:'consort',x:960+100*spread,y:390,height:420*size,depth:.75},
   {actor:'emperor',x:960-140*spread,y:450,height:350*size,depth:1},
   {actor:'musician',x:960+105*spread,y:550,height:260*size,depth:1.1}
  ];
 }
 return [
  {actor:'musician',x:1220,y:320,height:500,depth:.45},
  {actor:'emperor',x:740,y:300,height:620,depth:.6},
  {actor:'poet',x:1420,y:270,height:720,depth:.9},
  {actor:'consort',x:1010,y:350,height:700,depth:1.1}
 ];
}
