import {clamp,lerp,smooth,SPRING_LOW_CUT} from './story-core.mjs';

// Measured source pixels; regeneration requires remeasuring these sockets.
export const springRig={
 width:1671,height:941,body:[0,0,1000,941],
 child:{crop:[1090,100,435,305],socket:[1155,206],joint:[748,466],wrist:[1378,240],tip:[1488,226]},
 mother:{crop:[1090,420,435,521],socket:[1155,502],joint:[515,314],palm:[1440,735]}
};

export const springLowRig={
 width:1672,height:941,body:[0,0,1000,941],
 child:{crop:[1120,140,470,295],socket:[1180,236],joint:[733,428],wrist:[1436,263],tip:[1548,248]},
 mother:{crop:[1070,435,525,495],socket:[1138,517],joint:[448,235],palm:[1480,675]},
 childFace:[684,247,208,151]
};

export const springView=(local,duration=7)=>local/duration>=SPRING_LOW_CUT?'low':'wide';

export const springArmSegments=(length,reach)=>[
 [-150,60,-150,210],[60,length-65,60,reach-125],[length-65,length+220,reach-65,285]
];

export function springPose(local,duration=7,rig=springRig){
 const p=clamp(local/duration),reach=smooth((p-.12)/.28),catchHand=smooth((p-.42)/.15),withdraw=smooth((p-.64)/.24);
 const angle=lerp(.94,-.14,reach)+withdraw*.70,cs=Math.cos(angle),sn=Math.sin(angle),child=rig.child;
 const point=source=>{const x=source[0]-child.socket[0],y=source[1]-child.socket[1];return [child.joint[0]+x*cs-y*sn,child.joint[1]+x*sn+y*cs]};
 const wrist=point(child.wrist),tip=point(child.tip);
 return {angle,wrist,tip,motherTarget:[lerp(675,wrist[0],catchHand),lerp(600,wrist[1],catchHand)],
  approach:-48*(1-smooth(p/.30)),bob:Math.sin(local*9)*1.3*(1-smooth(p/.30))};
}

export function springLayout(aspect,low=false){
 if(aspect<1.1){
  const fit=clamp(aspect/(390/844),.75,1),scale=(low?.66:.48)*fit;
  if(low)return {x:960-540*fit,y:1080-941*scale,scale,kite:[1130,325],flower:{x:1075,y:941,width:220,height:650}};
  return {x:960-395*fit,y:900-941*scale,scale,kite:[1100,220]};
 }
 if(low)return {x:280,y:1085-941*.98,scale:.98,kite:[1580,245],flower:{x:1195,y:941,width:310,height:620}};
 return {x:580,y:250,scale:.78,kite:[1590,320]};
}

// Four painted walk phases per actor, with measured head-x / ground-y anchors.
export const springWalkers={
 width:1536,height:1024,cellWidth:384,cellHeight:512,
 man:{row:0,anchors:[[254,477],[628,477],[1000,480],[1382,480]],top:20},
 elder:{row:1,anchors:[[235,980],[610,980],[992,982],[1380,982]],top:519}
};

export function springWalkCycle(local,phase=0){
 const cycle=local/3.2+phase;
 return {frame:Math.floor(((cycle%1)+1)%1*4)};
}

export function springWalkerLayout(local,aspect){
 const portrait=aspect<1.1;
 return [
  {actor:'man',x:(portrait?1100:1310)+local*(portrait?13:28),ground:portrait?760:854-local*10,height:portrait?100:155-local*3,phase:0,direction:1},
  {actor:'elder',x:(portrait?1180:1530)-local*(portrait?17:26),ground:portrait?800:810+local*9,height:portrait?110:148+local*3,phase:.4,direction:-1}
 ];
}
