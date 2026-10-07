import {clamp,lerp,smooth,camera,noise,crownPoint,artifactFocus,sample} from './story-core.mjs';
import {pavilionAtlases,pavilionLayout,pavilionPoses} from './story-pavilion.mjs';
import {springRig,springLowRig,springView,springPose,springLayout,springArmSegments,springWalkers,springWalkCycle,springWalkerLayout} from './story-spring.mjs';
import {PETAL_WIPE_SECONDS,drawPetalWipe} from './story-transition.mjs';
const W=1920,H=1080,TAU=Math.PI*2;
const surface=()=>{const c=document.createElement('canvas');c.width=1440;c.height=810;return c};
function petal(c,x,y,size,angle,alpha=1,color='#be514e'){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.fillStyle=color;c.beginPath();
 c.moveTo(-size*.6,0);c.bezierCurveTo(-size,-size,size*.8,-size*.8,size,0);c.bezierCurveTo(size*.45,size*.65,-size*.4,size*.9,-size*.6,0);c.fill();
 c.strokeStyle='#e8b59066';c.lineWidth=.6;c.beginPath();c.moveTo(-size*.5,0);c.quadraticCurveTo(0,size*.18,size*.7,0);c.stroke();c.restore();
}
export class ScrollRenderer{
 constructor(canvas,assets,timeline=null){
  this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.assets=assets;
  this.world=surface();this.w=this.world.getContext('2d');this.mask=surface();this.m=this.mask.getContext('2d');
  this.colour=surface();this.col=this.colour.getContext('2d');this.focus=0;this.mobile=false;this.lastShot=-1;
  this.silk=surface();this.silkContext=this.silk.getContext('2d');this.stitches=surface();this.stitchContext=this.stitches.getContext('2d');
  this.portrait=surface();this.portraitContext=this.portrait.getContext('2d');
  this.actorPose=document.createElement('canvas');this.actorPose.width=1280;this.actorPose.height=960;this.actorPoseContext=this.actorPose.getContext('2d');
  this.timeline=timeline;this.outgoing=surface();this.outgoingContext=this.outgoing.getContext('2d');this.outgoingShot=null;
  this.springArm=surface();this.springArmContext=this.springArm.getContext('2d');
 }
 resize(){this.mobile=innerWidth<700;const dpr=Math.min(devicePixelRatio||1,this.mobile?1.4:1.75);this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);this.outgoingShot=null;}
 image(name){return this.assets.get(name)}
 puppet(c,name,x,y,scale,angle,t,pointer,responsive=true){
  const im=this.image(name);if(!im)return;
  const child=name==='lantern-child-puppet';
  // Parts remain in the generated alpha sheet; these are source pixel bounds.
  const body=child?[0,0,850,1024]:[0,0,1140,941];
  const arm=child?[1020,60,440,490]:[1140,145,480,685];
  const joint=child?[760,270]:[405,275];
  const pivot=child?[1070,260]:[1165,255];
  const ax=im.width/(child?1536:1672),ay=im.height/(child?1024:941);
  c.save();
  if(this.mobile&&responsive){x=960+(x-960)*.43;scale*=.88}
  c.translate(x-pointer.x*22,y-pointer.y*9+Math.sin(t*1.5)*1.3);c.scale(scale,scale);
  c.drawImage(im,body[0]*ax,body[1]*ay,body[2]*ax,body[3]*ay,...body);
  c.translate(...joint);c.rotate(angle);
  c.drawImage(im,arm[0]*ax,arm[1]*ay,arm[2]*ax,arm[3]*ay,arm[0]-pivot[0],arm[1]-pivot[1],arm[2],arm[3]);
  if(child){
   // The taper follows the same shoulder transform as the hand.
   const flicker=.88+Math.sin(t*17)*.12;c.fillStyle='#fff1bc';
   c.beginPath();c.ellipse(1430-pivot[0],80-pivot[1]-6,4*flicker,9,0,0,TAU);c.fill();
  }
  c.restore();
 }
 sprite(c,name,x,y,width,{angle=0,alpha=1,sway=0,depth=1,pointer={x:0,y:0},t=0,blur=0}={}){
  const im=this.image(name);if(!im)return;
  if(this.mobile){x=960+(x-960)*.43;width*=.88}
  const h=width*im.height/im.width;
  c.save();c.translate(x-pointer.x*depth*20,y-pointer.y*depth*10);c.rotate(angle);c.globalAlpha*=alpha;
  if(blur)c.filter=`blur(${blur}px)`;
  if(sway){const n=30,step=im.height/n;
   for(let k=0;k<n;k++){const q=k/n,move=Math.sin(t*1.1+q*5)*sway*(.16+q*q);c.drawImage(im,0,k*step,im.width,Math.min(step+1,im.height-k*step),-width/2+move,-h+q*h,width,h/n+1.2)}
  }else c.drawImage(im,-width/2,-h,width,h);
  c.restore();
 }
 pavilion(c,local,p,pointer,duration){
  const poses=pavilionPoses(local,duration),layout=pavilionLayout(innerWidth/innerHeight);
  for(const {actor,x,y,height,depth} of layout){
   const im=this.image('pavilion-'+actor+'-poses'),atlas=pavilionAtlases[actor];if(!im)continue;
   // Hold each painted pose, with a short dissolve around the handover.
   const pose=clamp(poses[actor],0,2),a=Math.floor(pose),b=Math.min(2,a+1),mix=smooth((pose-a-.4)/.2);
   const k=this.actorPoseContext,normal=900/atlas.height;
   k.setTransform(1,0,0,1,0,0);k.clearRect(0,0,1280,960);k.globalCompositeOperation='lighter';
   for(const [frame,weight] of [[a,1-mix],[b,mix]]){
    if(!weight)continue;
    const left=atlas.cuts[frame],width=atlas.cuts[frame+1]-left,[ax,ay]=atlas.anchors[frame];
    k.globalAlpha=weight;
    k.drawImage(im,left/atlas.width*im.width,0,width/atlas.width*im.width,im.height,640-ax*normal,24-ay*normal,width*normal,900);
   }
   k.globalAlpha=1;k.globalCompositeOperation='source-over';
   const scale=height/900;
   c.save();c.globalAlpha=smooth(p/.1);c.translate(x-pointer.x*depth*20,y-pointer.y*depth*10);
   c.drawImage(this.actorPose,-640*scale,-24*scale,1280*scale,960*scale);c.restore();
  }
  this.field(c,local,pointer,7,40);this.petals(c,local,{count:30});
 }
 field(c,t,pointer,amount=12,rise=0){
  for(let i=0;i<amount;i++){const d=i%3;this.sprite(c,'peony',-180+i*220+(d?50:0),H+120+d*60-rise,220+d*120,{t,sway:3+d*2,depth:1+d*.6,pointer,angle:Math.sin(i*2)*.2})}
 }
 petals(c,t,{vortex=false,crown=0,storm=false,count=48}={}){
  for(let i=0;i<count;i++){
   const a=noise(i+4),b=noise(i+38),speed=.11+noise(i+91)*.2;
   let x=(a*W+t*(storm?-140:22)+i*10)%(W+120);if(x<0)x+=W+120;
   let y=((b*H+t*(storm?170:35))%(H+130))-65;
   if(vortex){const theta=a*TAU+t*.65;x=1140+Math.cos(theta)*(180+b*430);y=900-((t*65+b*1000)%1000)+Math.sin(theta)*70}
   if(crown>0){const q=crownPoint(i,count);x=lerp(x,q.x,smooth(crown));y=lerp(y,q.y+Math.sin(t*.6)*5,smooth(crown));}
   petal(c,x,y,5+noise(i+88)*12,t*speed+a*10,.3+b*.6,i%4?'#b54c46':'#dfaaa0');
  }
 }
 mist(c,t,strength=.35){
  c.save();c.globalAlpha=strength;
  for(let i=0;i<7;i++){const x=noise(i+12)*W+Math.sin(t*.13+i)*75,y=420+noise(i+82)*530;
   const g=c.createRadialGradient(x,y,2,x,y,240);g.addColorStop(0,'#f7eddb');g.addColorStop(1,'#f7eddb00');c.fillStyle=g;c.fillRect(x-240,y-240,480,480)}c.restore();
 }
 branches(c,t,{burnt=false,buds=true,x=1300,y=1000}={}){
  c.save();c.translate(x,y);c.strokeStyle=burnt?'#211d1b':'#4e4b3a';c.lineCap='round';
  for(let i=0;i<11;i++){const a=(i-5)*.14,len=180+noise(i)*320;c.lineWidth=5+noise(i+2)*8;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.sin(a)*len*.5,-len*.7,Math.sin(a)*len,-len);c.stroke();
   if(buds){c.fillStyle='#7c4946';c.beginPath();c.ellipse(Math.sin(a)*len,-len,12+Math.sin(t)*1.5,23,a,0,TAU);c.fill()}}
  c.restore();
 }
 fire(c,t,p){
  const strength=1-smooth((p-.55)/.22);c.save();c.globalAlpha=strength;
  for(let i=0;i<22;i++){const x=i*100-90;const h=170+noise(i+1)*300+Math.sin(t*5+i)*65;
   const g=c.createLinearGradient(0,H,0,H-h);g.addColorStop(0,'#b13918dd');g.addColorStop(.5,'#e77f2699');g.addColorStop(1,'#f4bd5700');c.fillStyle=g;c.beginPath();c.moveTo(x-80,H);c.bezierCurveTo(x-110,H-h*.4,x+70,H-h*.65,x,H-h);c.bezierCurveTo(x+10,H-h*.4,x+135,H-h*.3,x+100,H);c.fill();
  }c.restore();
  for(let i=0;i<42;i++){const x=noise(i+123)*W+Math.sin(t+i)*40,y=H-((t*110+noise(i)*700)%1200);c.fillStyle=p>.6?'#78706588':'#e0a85b';c.globalAlpha=.7; c.fillRect(x,y,3,3)}c.globalAlpha=1;
 }
 dew(c,p){
  const q=p<.56?p/.56*.48:p<.66?.48:.48+(p-.66)/.34*.52;
  const x=1250+Math.sin(q*2.8)*70,y=330+q*q*430;
  c.save();c.beginPath();c.ellipse(x,y,18,24+q*12,-.2,0,TAU);c.clip();
  const im=this.image('palace');c.drawImage(im,im.width*.4,0,im.width*.5,im.height,x-25,y-30,50,65);
  c.fillStyle='#c4ded977';c.fillRect(x-30,y-40,60,80);c.restore();c.strokeStyle='#fff8dc';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,18,24+q*12,-.2,0,TAU);c.stroke();c.fillStyle='#fffbe8';c.beginPath();c.arc(x-6,y-9,4,0,TAU);c.fill();
 }
 gold(c,t,alpha=.4){c.save();c.globalCompositeOperation='screen';const x=900+Math.sin(t*.2)*350;const g=c.createRadialGradient(x,260,0,x,260,750);g.addColorStop(0,`rgba(236,182,77,${alpha})`);g.addColorStop(1,'#dca14a00');c.fillStyle=g;c.fillRect(0,0,W,H);c.restore()}
 consort(c,t,p,pointer){
  const im=this.image('consort-turn');if(!im)return;
  const pose=smooth((p-.22)/.18)+smooth((p-.48)/.28),a=Math.min(2,Math.floor(pose)),b=Math.min(2,a+1),mix=pose-a;
  const tile=im.width/3,x=this.mobile?480:770,y=185,w=940,h=w*im.height/tile;
  const k=this.portraitContext;k.setTransform(.75,0,0,.75,0,0);k.clearRect(0,0,W,H);
  // Premultiplied weighted blending preserves transparent edges at pose changes.
  k.globalCompositeOperation='lighter';
  for(const [frame,weight] of [[a,1-mix],[b,mix]]){
   if(!weight)continue;k.globalAlpha=weight;
   k.drawImage(im,frame*tile,0,tile,im.height,x,y,w,h);
  }
  k.globalAlpha=1;k.globalCompositeOperation='source-over';
  c.save();c.translate(-pointer.x*14,-pointer.y*7);
  const rows=40,step=this.portrait.height/rows;
  for(let i=0;i<rows;i++){
   const q=i/rows,breath=Math.sin(t*1.4)*1.8*smooth((q-.6)/.4);
   c.drawImage(this.portrait,0,i*step,this.portrait.width,Math.min(step+1,this.portrait.height-i*step),breath,q*H,W,H/rows+1.2);
  }
  // Brief restrained gleams are tied to the hair ornaments and necklace.
  c.globalCompositeOperation='screen';
  for(const [j,u,v] of [[0,.62,.15],[1,.47,.24],[2,.64,.83]]){
   const alpha=Math.pow(Math.max(0,Math.sin(t*1.7+j*2)),12)*.7;
   const gx=x+w*u,gy=y+h*v;c.strokeStyle=`rgba(255,235,173,${alpha})`;c.lineWidth=1;
   c.beginPath();c.moveTo(gx-6,gy);c.lineTo(gx+6,gy);c.moveTo(gx,gy-8);c.lineTo(gx,gy+8);c.stroke();
  }
  c.restore();
 }
 bridal(c,t,p,pointer){
  const fabric=this.image('bridal-silk'),motifs=this.image('bridal-embroidery');if(!fabric||!motifs)return;
  const s=this.silkContext,e=this.stitchContext,focus=smooth((p-.30)/.32);
  for(const ctx of [s,e]){ctx.setTransform(.75,0,0,.75,0,0);ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);}
  s.drawImage(fabric,0,-330,2300,1600);
  // Separate motifs share the fabric deformation after their own focus pass.
  e.filter=`blur(${focus*6}px)`;
  e.drawImage(motifs,0,0,motifs.width*.61,motifs.height,690,290,750,485);
  e.filter=`blur(${(1-focus)*7}px)`;
  e.drawImage(motifs,motifs.width*.65,0,motifs.width*.35,motifs.height,1330,490,380,390);
  e.filter='none';
  e.globalCompositeOperation='source-atop';
  const sweep=lerp(650,1900,smooth((p-.65)/.35));
  const glint=e.createLinearGradient(sweep-160,0,sweep+160,0);glint.addColorStop(0,'#ffefb400');glint.addColorStop(.5,`rgba(255,241,186,${.08+.42*smooth((p-.65)/.25)})`);glint.addColorStop(1,'#ffefb400');
  e.fillStyle=glint;e.fillRect(0,0,W,H);e.globalCompositeOperation='source-over';
  s.globalCompositeOperation='source-atop';s.drawImage(this.stitches,0,0,W,H);s.globalCompositeOperation='source-over';
  c.save();c.translate(-pointer.x*24,-pointer.y*12);
  // Strip deformation moves the embroidery with the same cloth fibres.
  const rows=64,step=this.silk.height/rows;
  for(let i=0;i<rows;i++){const q=i/rows,dx=Math.sin(q*7+t*.9)*11+Math.sin(q*13-t*.55)*4;
   c.drawImage(this.silk,0,i*step,this.silk.width,Math.min(step+1,this.silk.height-i*step),dx,q*H,W,H/rows+1.5);
  }
  c.restore();
 }
 lantern(c,t,p,placements=null){
  const painted=this.image('peony-lantern');
  if(painted){
   const lamps=placements||Array.from({length:5},(_,i)=>({x:450+i*290,y:i===3?235:70+(i%2)*50,width:290,main:i===3}));
   for(const [i,{x,y,width,main}] of lamps.entries()){
    const lit=smooth((p-(main?.52:.18+i*.06))/.2);
    c.save();c.translate(x,y);c.rotate(Math.sin(t*1.4+i)*.022);
    c.strokeStyle='#8d7851';c.lineWidth=2;c.beginPath();c.moveTo(0,-350);c.lineTo(0,6);c.stroke();
    c.filter=`brightness(${.48+lit*.52}) saturate(${.6+lit*.4})`;
    c.drawImage(painted,-width/2,0,width,width*1.5);c.filter='none';c.restore();
   }
   return;
  }
  for(let i=0;i<5;i++){const x=450+i*290,y=i===3?315:170+(i%2)*50;c.save();c.translate(x,y);c.rotate(Math.sin(t*1.4+i)*.025);c.strokeStyle='#715f40';c.lineWidth=3;c.beginPath();c.moveTo(0,-180);c.lineTo(0,0);c.stroke();
   c.fillStyle='#a7402fe8';c.beginPath();c.ellipse(0,90,67,91,0,0,TAU);c.fill();c.strokeStyle='#d6a666';c.lineWidth=2;for(let j=-2;j<=2;j++){c.beginPath();c.ellipse(j*9,90,12+Math.abs(j)*12,88,0,0,TAU);c.stroke()}
   c.fillStyle='#d1a25a';c.fillRect(-42,0,84,10);c.fillRect(-42,176,84,8);c.fillRect(-2,183,4,63);
   const a=smooth((p-(i===3?.52:.18+i*.06))/.2)*(.34+Math.sin(t*4+i)*.035);const g=c.createRadialGradient(0,90,0,0,90,150);g.addColorStop(0,`rgba(255,214,114,${a})`);g.addColorStop(1,'#ffe4ad00');c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(-170,-60,340,340);c.restore();
  }
 }
 newyear(c,local,p,pointer){
  const portrait=innerWidth/innerHeight<1.1;
  const body=this.image('newyear-paster-puppet'),print=this.image('peony-newyear-print');
  c.fillStyle='#364b5c35';c.fillRect(0,0,W,H);
  // The print and the woman's steadying hand share one transform, so they
  // remain in contact under both the camera and pointer parallax.
  if(body&&print){
   const [x,y,scale]=portrait?[630,350,.55]:[1120,240,.68];
   c.save();c.translate(x-pointer.x*14,y-pointer.y*7);c.scale(scale,scale);
   const settle=smooth((p-.08)/.48),curl=(1-settle)*20;
   // The curled paper centre settles; its top and bottom stay on the window.
   const rows=32;
   for(let i=0;i<rows;i++){
    const q=i/rows,offset=Math.sin(q*Math.PI)*curl;
    c.drawImage(print,56,60+1413*q,913,1413/rows+1,715+offset,22+480*q,310,480/rows+1);
   }
   c.drawImage(body,0,0,920,1024,0,0,920,1024);
   // Source sheet socket (1034,380) overlaps shoulder (540,280).
   const press=smooth((p-.10)/.30),release=smooth((p-.66)/.22);
   const angle=lerp(.62,.13,press)+release*.20;
   c.translate(540,280);c.rotate(angle);
   c.drawImage(body,940,100,400,480,940-1034,100-380,400,480);
   c.restore();
  }
  const lamps=portrait?[
   {x:815,y:80,width:115},{x:1135,y:85,width:105},
   {x:1012,y:460,width:160,main:true}
  ]:[
   {x:420,y:130,width:155},{x:700,y:100,width:190},
   {x:1050,y:80,width:170},{x:1320,y:295,width:220,main:true}
  ];
  this.lantern(c,local,p,lamps);
  const child=portrait?[620,580,.35]:[727,450,.53];
  this.puppet(c,'lantern-child-puppet',...child,.52*(1-smooth((p-.12)/.43)),local,pointer,false);
  // The small ignition bloom happens after the taper reaches the lantern.
  const flash=Math.exp(-Math.pow((p-.57)/.055,2))*.15;
  if(flash>.001){c.fillStyle=`rgba(255,236,174,${flash})`;c.fillRect(0,0,W,H)}
  for(let i=0;i<55;i++){c.fillStyle='#fbf5e5aa';c.beginPath();c.arc((noise(i)*W+local*15)%W,(noise(i+33)*H+local*30)%H,1+noise(i+6)*3,0,TAU);c.fill()}
 }
 springOuting(c,local,p,pointer,duration){
  const low=springView(local,duration)==='low',rig=low?springLowRig:springRig;
  const layout=springLayout(innerWidth/innerHeight,low),pose=springPose(local,duration,rig);
  const family=this.image(low?'spring-low-family':'spring-family-puppet'),flower=this.image(low?'spring-low-peony':'spring-peony-stem');
  const walkers=this.image('spring-walkers');
  if(walkers&&!low)for(const walker of springWalkerLayout(local,innerWidth/innerHeight)){
   const atlas=springWalkers[walker.actor],{frame}=springWalkCycle(local,walker.phase);
   const sx=frame*springWalkers.cellWidth,sy=atlas.row*springWalkers.cellHeight,[ax,ay]=atlas.anchors[frame];
   const scale=walker.height/(ay-atlas.top);
   c.save();c.translate(walker.x-pointer.x*7,walker.ground-pointer.y*3);c.scale(scale*walker.direction,scale);
   c.drawImage(walkers,sx,sy,springWalkers.cellWidth,springWalkers.cellHeight,sx-ax,sy-ay,springWalkers.cellWidth,springWalkers.cellHeight);c.restore();
  }
  const [kx,ky]=layout.kite;
  c.save();c.translate(kx+Math.sin(local*.7)*24,ky+Math.cos(local*.5)*12);c.rotate(Math.sin(local*1.2)*.14);
  c.fillStyle='#b7654d';c.beginPath();c.moveTo(0,-34);c.lineTo(28,0);c.lineTo(0,44);c.lineTo(-28,0);c.closePath();c.fill();
  c.strokeStyle='#e5ca94';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-34);c.lineTo(0,44);c.moveTo(-28,0);c.lineTo(28,0);c.stroke();
  c.strokeStyle='#98856588';c.beginPath();c.moveTo(0,44);c.bezierCurveTo(30,170,-100,220,-150,350);c.stroke();c.restore();
  if(family&&flower){
   // Grounded flower and both actors share scene parallax. Only the family approaches.
   c.save();c.translate(layout.x-pointer.x*18,layout.y-pointer.y*9);c.scale(layout.scale,layout.scale);
   const stem=layout.flower||{x:1195,y:930,width:310,height:620};
   c.save();c.translate(stem.x,stem.y);c.rotate(Math.sin(local*1.15)*.012);c.drawImage(flower,-stem.width/2,-stem.height,stem.width,stem.height);c.restore();
   c.translate(pose.approach,pose.bob);
   const shade=c.createRadialGradient(630,925,15,630,925,280);shade.addColorStop(0,'#6e654b25');shade.addColorStop(1,'#6e654b00');
   c.save();c.translate(0,925);c.scale(1,.1);c.fillStyle=shade;c.fillRect(300,-300,650,600);c.restore();
   c.drawImage(family,...rig.body,...rig.body);
   const child=rig.child,mother=rig.mother;
   c.save();c.translate(...child.joint);c.rotate(pose.angle);
   c.drawImage(family,...child.crop,child.crop[0]-child.socket[0],child.crop[1]-child.socket[1],child.crop[2],child.crop[3]);c.restore();
   // Aim the mother's palm at the child's moving wrist. Stretch along the arm
   // axis only, keeping sleeve thickness stable while the elbow straightens.
   const source=[mother.palm[0]-mother.socket[0],mother.palm[1]-mother.socket[1]];
   const target=[pose.motherTarget[0]-mother.joint[0],pose.motherTarget[1]-mother.joint[1]];
   c.save();c.translate(...mother.joint);c.rotate(Math.atan2(target[1],target[0]));
   if(low){
    // Stretch only the sleeve between shoulder and wrist. Preserve the painted
    // palm/fingers at 1:1 length so reaching cannot create an elongated hand.
    const k=this.springArmContext,length=Math.hypot(...source),reach=Math.hypot(...target);
    k.setTransform(1,0,0,1,0,0);k.clearRect(0,0,1440,810);k.save();k.translate(170,300);k.rotate(-Math.atan2(source[1],source[0]));
    k.drawImage(family,...mother.crop,mother.crop[0]-mother.socket[0],mother.crop[1]-mother.socket[1],mother.crop[2],mother.crop[3]);k.restore();
    c.scale(1,.76);
    for(const [a,b,x,width] of springArmSegments(length,reach)){
     c.drawImage(this.springArm,170+a,0,b-a,810,x,-300,width,810);
    }
   }else{
    c.scale(Math.hypot(...target)/Math.hypot(...source),1);c.rotate(-Math.atan2(source[1],source[0]));
    c.drawImage(family,...mother.crop,mother.crop[0]-mother.socket[0],mother.crop[1]-mother.socket[1],mother.crop[2],mother.crop[3]);
   }
   c.restore();
   // In the low view the child's face sits in front of the mother's near sleeve.
   if(low)c.drawImage(family,...rig.childFace,...rig.childFace);
   c.restore();
  }
  if(!low)this.field(c,local,pointer,6);this.petals(c,local,{count:20});
 }
 artifacts(c,t,p,pointer){
  const focus=artifactFocus(p);
  // The mural light remains behind the separate foreground objects.
  c.save();const glow=c.createRadialGradient(1430,360,20,1430,360,600);
  glow.addColorStop(0,`rgba(255,213,128,${focus.muralLight*.28})`);glow.addColorStop(1,'#ffd58000');
  c.globalCompositeOperation='screen';c.fillStyle=glow;c.fillRect(800,0,1120,850);c.restore();
  this.sprite(c,'bronze-mirror',910,865,465,{t,pointer,depth:.7,blur:focus.blur[0]});
  this.sprite(c,'peony-bowl',1265,880,335,{t,pointer,depth:1.15,blur:focus.blur[1]});
  // Lay the pin across the tabletop, foreshortened independently of the camera.
  c.save();c.translate(0,865);c.scale(1,.35);
  this.sprite(c,'peony-hairpin',1450,0,360,{t,pointer,depth:1.7,blur:focus.blur[2],angle:-.09});c.restore();
 }
 effects(c,shot,p,t,pointer){
  switch(shot.motion){
   case 'scroll-unroll':this.field(c,t,pointer,10);this.petals(c,t,{count:28});c.save();c.beginPath();c.rect(400,260,820*smooth(p*2),200);c.clip();c.fillStyle='#983d32';c.font='110px KaiTi, STKaiti, serif';c.fillText('牡丹真国色',420,410);c.restore();break;
   case 'dew':this.sprite(c,'peony',1260,1220,970,{t,sway:3,pointer,depth:2});this.dew(c,p);break;
   case 'petal-vortex':this.sprite(c,'empress',1300,1030,1040,{t,sway:13,pointer,depth:1.2});this.field(c,t,pointer,7);this.petals(c,t,{vortex:true,count:62});this.gold(c,t,.23+p*.12);break;
   case 'watering':this.sprite(c,'empress',1550,810,520,{t,sway:5,pointer,depth:.4});this.field(c,t,pointer,8);for(let i=0;i<25;i++){const q=(t*.5+i/25)%1;c.fillStyle='#a5c3c388';c.beginPath();c.arc(1240+q*55,670+q*q*240,2,0,TAU);c.fill()}break;
   case 'winter-split':c.save();c.beginPath();c.rect(0,0,W/2,H);c.clip();this.field(c,t,pointer,8);this.gold(c,t,.15);c.restore();c.fillStyle='#50637355';c.fillRect(W/2,0,W/2,H);this.branches(c,t);c.strokeStyle='#d2b268';c.lineWidth=3;c.beginPath();c.moveTo(960,0);for(let i=1;i<12;i++)c.lineTo(960+Math.sin(i*3)*30,i*100);c.stroke();this.sprite(c,'empress',1150,580,700+p*170,{alpha:.18,sway:3,t});break;
   case 'fire-rebirth':c.fillStyle=`rgba(30,23,23,${.18+.48*(1-smooth((p-.6)/.3))})`;c.fillRect(0,0,W,H);this.branches(c,t,{burnt:true,buds:false});this.fire(c,t,p);this.sprite(c,'peony',1290,1020,660*smooth((p-.55)/.35),{t,sway:3,alpha:smooth((p-.5)/.3),pointer});break;
   case 'water-banquet':{
    c.fillStyle='#b8d1c435';c.fillRect(0,830,W,250);c.strokeStyle='#eef0dc8a';c.lineWidth=2;
    for(let i=0;i<14;i++){const q=(t*.12+i/14)%1;c.beginPath();c.ellipse(650+noise(i)*680,900+noise(i+9)*140,q*230,q*16,0,0,TAU);c.stroke()}
    if(this.mobile)this.sprite(c,'fan-attendant',1180,600,270,{t,pointer,depth:.8,sway:1.1,angle:Math.sin(t*.45)*.012,alpha:smooth((p-.16)/.24)});
    this.puppet(c,'banquet-puppet',730,380,.50,.3-.4*smooth((p-.15)/.55),t,pointer);
    this.sprite(c,'banquet-emperor',1190,900,650,{t,pointer,depth:.6,alpha:smooth((p-.06)/.2)});
    if(!this.mobile)this.sprite(c,'fan-attendant',1580,925,385,{t,pointer,depth:.8,sway:1.1,angle:Math.sin(t*.45)*.012,alpha:smooth((p-.16)/.24)});
    this.field(c,t,pointer,7);break;
   }
   case 'gate-light':{const opening=smooth(p*.8);c.fillStyle='#862e29';c.fillRect(740-330*opening,170,170*(1-opening),650);c.fillRect(1010+330*opening,170,170*(1-opening),650);c.strokeStyle='#cf974b';c.lineWidth=12;c.beginPath();c.moveTo(965,400);c.bezierCurveTo(850,640,1250,760,1070,1090);c.stroke();for(let i=0;i<8;i++)this.sprite(c,'peony',580+i*130,1050,140*smooth((p-i*.07)/.25),{t,sway:2});this.gold(c,t,.25);break}
   case 'spring-walk':this.springOuting(c,p*shot.duration,p,pointer,shot.duration);break;
   case 'silk':this.bridal(c,t,p,pointer);break;
   case 'lantern':this.newyear(c,p*shot.duration,p,pointer);break;
   case 'artifacts':this.artifacts(c,t,p,pointer);break;
   case 'pavilion':this.pavilion(c,p*shot.duration,p,pointer,shot.duration);break;
   case 'hair-flower':this.consort(c,t,p,pointer);break;
   case 'storm':c.fillStyle='#23374788';c.fillRect(0,0,W,H);c.strokeStyle='#c3d0d05a';c.lineWidth=1;for(let i=0;i<130;i++){const x=(noise(i)*W-t*220+W*30)%W,y=(noise(i+77)*H+t*600)%H;c.beginPath();c.moveTo(x,y);c.lineTo(x-17,y+58);c.stroke()}this.petals(c,t,{storm:true,count:65});break;
   case 'ruins':c.fillStyle='#53576666';c.fillRect(0,0,W,H);this.sprite(c,'peony',1390,1000,500,{t,sway:2,pointer});this.petals(c,t,{count:25});break;
   case 'sunrise':this.field(c,t,pointer,16,p*80);this.mist(c,t,.2*(1-p));this.gold(c,t,.2+p*.4);this.petals(c,t,{vortex:true,count:40});break;
   case 'crown':this.field(c,t,pointer,16,50);this.petals(c,t,{crown:clamp((p-.15)/.6),count:130});this.gold(c,t,.3);break;
  }
 }
 paintScene(c,{shot,progress:p,time},pointer){
  c.setTransform(.75,0,0,.75,0,0);c.clearRect(0,0,W,H);c.fillStyle='#eee5d2';c.fillRect(0,0,W,H);
  const cam=camera(shot,p,innerWidth/innerHeight);
  c.save();c.translate(W/2,H/2);const scale=cam.zoom+this.focus*.14;c.scale(scale,scale);c.translate(-W/2+cam.x*W-pointer.x*10,-H/2+cam.y*H-pointer.y*5);
  const lowSpring=shot.motion==='spring-walk'&&springView(p*shot.duration,shot.duration)==='low';
  const bg=this.image(lowSpring?'plate-spring-low':`plate-${shot.motion}`)||this.image(`plate-${shot.chapter}`)||this.image('palace');
  if(shot.motion==='dew'||shot.motion==='hair-flower')c.filter='blur(5px)';
  if(shot.motion==='artifacts')c.filter=`blur(${4+8*(1-smooth(p*5))}px)`;
  if(shot.motion==='silk')c.filter='blur(7px)';
  const bgTop=shot.motion==='pavilion'&&innerWidth/innerHeight<1.1?.14:0;
  c.drawImage(bg,0,bg.height*bgTop,bg.width,bg.height*(1-bgTop),-80,-45,W+160,H+90);c.filter='none';this.mist(c,time,.20);this.effects(c,shot,p,time,pointer);c.restore();
 }
 render(state,pointer,dt,started=true,playing=true){
  const {shot,local,time}=state,c=this.w;
  this.focus=lerp(this.focus,pointer.down?1:0,1-Math.exp(-dt*5));
  this.paintScene(c,state,pointer);
  const petalTransition=shot.motion==='spring-walk'&&shot.transition==='petal'&&this.timeline&&shot.start>0;
  if(started&&playing&&petalTransition&&local<PETAL_WIPE_SECONDS){
   if(this.outgoingShot!==shot.id){
    this.paintScene(this.outgoingContext,sample(this.timeline,shot.start-.001),pointer);this.outgoingShot=shot.id;
   }
   drawPetalWipe(c,this.outgoing,local/PETAL_WIPE_SECONDS,innerWidth/innerHeight);
  }
  if(started&&playing&&!petalTransition){const q=smooth(local/.9);
   if(q<1){c.save();if(shot.transition==='unroll'){c.fillStyle='#e9dfc9';const half=W*q*.5;c.fillRect(0,0,W/2-half,H);c.fillRect(W/2+half,0,W,H)}
    else if(shot.transition==='red-silk'){
     const r=1300*(1-q);c.fillStyle=`rgba(139,45,30,${1-q})`;c.beginPath();c.ellipse(0,H*.55,r,H*.9,0,0,TAU);c.fill();c.beginPath();c.ellipse(W,H*.45,r,H*.9,0,0,TAU);c.fill();
    }
    else if(shot.transition==='focus'){
     c.fillStyle=`rgba(246,222,179,${(1-q)*.32})`;c.fillRect(0,0,W,H);
     for(let i=0;i<6;i++){const x=350+i*280,y=280+(i%2)*170,r=80*(1-q)+15;
      const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,238,184,${(1-q)*.75})`);g.addColorStop(1,'#ffedb800');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
    }
    else if(['gold','flash','candle','dawn'].includes(shot.transition)){c.fillStyle=`rgba(255,242,199,${(1-q)*.82})`;c.fillRect(0,0,W,H)}
    else{c.fillStyle=`rgba(239,231,213,${1-q})`;c.fillRect(0,0,W,H)}c.restore();}
  }
  if(started&&shot.id===1&&local<.45){c.fillStyle=`rgba(15,14,12,${1-smooth(local/.45)})`;c.fillRect(0,0,W,H)}
  if(this.lastShot!==shot.id){this.m.clearRect(0,0,1440,810);this.lastShot=shot.id}
  this.m.globalCompositeOperation='destination-out';this.m.fillStyle=`rgba(0,0,0,${1-Math.exp(-dt*.8)})`;this.m.fillRect(0,0,1440,810);this.m.globalCompositeOperation='source-over';
  if(pointer.active){const px=(pointer.x+1)*720,py=(pointer.y+1)*405;for(let i=0;i<8;i++){const r=20+noise(i+time*.2)*26,x=px+(noise(i+3)-.5)*75,y=py+(noise(i+17)-.5)*65;const g=this.m.createRadialGradient(x,y,0,x,y,r*(1+this.focus));g.addColorStop(0,'#0009');g.addColorStop(1,'#0000');this.m.fillStyle=g;this.m.fillRect(x-r*2,y-r*2,r*4,r*4)}}
  this.col.globalCompositeOperation='source-over';this.col.clearRect(0,0,1440,810);this.col.drawImage(this.world,0,0);this.col.globalCompositeOperation='destination-in';this.col.drawImage(this.mask,0,0);
  const out=this.c,cw=this.canvas.width,ch=this.canvas.height,s=Math.max(cw/1440,ch/810),dw=1440*s,dh=810*s,x=(cw-dw)/2,y=(ch-dh)/2;
  out.fillStyle='#eee5d2';out.fillRect(0,0,cw,ch);out.filter='saturate(.72) contrast(.94)';out.drawImage(this.world,x,y,dw,dh);out.filter='saturate(1.12)';out.drawImage(this.colour,x,y,dw,dh);out.filter='none';
 }
}
