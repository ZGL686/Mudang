import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {sample,camera,quoteProgress,crownPoint,SPRING_LOW_CUT} from '../story-core.mjs';
import {pavilionAtlases,pavilionLayout,pavilionPoses} from '../story-pavilion.mjs';
import {springRig,springLowRig,springView,springPose,springLayout,springArmSegments,springWalkers,springWalkCycle,springWalkerLayout} from '../story-spring.mjs';
import {PETAL_WIPE_SECONDS,petalWipeGeometry} from '../story-transition.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const timeline=read('story-timeline.json'),source=read('story-assets/source-documents.json'),manifest=read('story-layer-manifest.json');
const rows=source.storyboard.tables.slice(2).flatMap(table=>table.slice(1));
assert.equal(timeline.shots.length,18);assert.equal(rows.length,18);
let total=0;
for(let i=0;i<18;i++){
 const shot=timeline.shots[i],row=rows[i],seconds=Number(row[1].match(/(\d+)s/)[1]);
 assert.equal(shot.duration,seconds);assert.equal(shot.start,total);total+=seconds;assert.equal(shot.end,total);
 assert.equal(shot.label,row[2]);assert.equal(shot.elements,row[3]);assert.equal(shot.transitionSource,row[4]);assert.equal(shot.cameraSource,row[5]);
 const q=shot.quote;assert.equal(source.narrative.paragraphs[q.paragraph].slice(q.start,q.end),q.text);
 assert.equal(sample(timeline,shot.start).shot.id,i+1);assert.equal(sample(timeline,shot.end-.0001).shot.id,i+1);
 for(const p of [0,.2,.5,1])assert.ok(Object.values(camera(shot,p)).every(Number.isFinite));
 assert.ok(quoteProgress(shot.duration,q.text.length,shot.duration)>=q.text.length);
}
assert.equal(total,119);assert.equal(timeline.duration,119);assert.equal(sample(timeline,119).shot.id,18);
assert.equal(sample(timeline,-4).time,0);assert.equal(sample(timeline,1000).time,119);
for(const file of Object.values(manifest.runtimeAssets))assert.ok(fs.existsSync(path.join(root,file)),file);
for(const name of ['peony','empress','newyear-paster-puppet','peony-newyear-print','spring-family-puppet','spring-peony-stem','spring-walkers','spring-low-family','spring-low-peony']){const png=fs.readFileSync(path.join(root,manifest.runtimeAssets[name]));assert.equal(png[25],6,`${name} must retain RGBA transparency`)}
for(const [name,width,height] of [['newyear-paster-puppet',1536,1024],['peony-newyear-print',1024,1536],['spring-family-puppet',springRig.width,springRig.height],['spring-peony-stem',887,1774],['spring-walkers',springWalkers.width,springWalkers.height],['spring-low-family',springLowRig.width,springLowRig.height],['spring-low-peony',887,1774],['plate-spring-low',1672,941]]){
 const png=fs.readFileSync(path.join(root,manifest.runtimeAssets[name]));
 assert.equal(png.readUInt32BE(16),width,name+' measured crop width');assert.equal(png.readUInt32BE(20),height,name+' measured crop height');
}
assert.equal(springWalkers.width,springWalkers.cellWidth*4);assert.equal(springWalkers.height,springWalkers.cellHeight*2);
assert.deepEqual([.01,.81,1.61,2.41].map(t=>springWalkCycle(t).frame),[0,1,2,3]);
assert.equal(springWalkCycle(.2).frame,springWalkCycle(3.4).frame);
for(const actor of [springWalkers.man,springWalkers.elder])for(const [frame,[x,y]] of actor.anchors.entries()){
 assert.ok(x>frame*384&&x<(frame+1)*384&&y>actor.row*512&&y<(actor.row+1)*512);
}
assert.ok(PETAL_WIPE_SECONDS>0&&PETAL_WIPE_SECONDS<timeline.shots[8].duration);
for(const aspect of [16/9,390/844,320/740,768/1024]){
 const width=Math.min(1920,1080*aspect),left=960-width/2,right=960+width/2;
 const first=petalWipeGeometry(0,aspect),last=petalWipeGeometry(1,aspect);
 assert.ok(first.x+first.rx<left&&last.x-last.rx>right,'petal clears viewport at both ends');
 let previous=-Infinity;
 for(let i=0;i<=100;i++){
  const geometry=petalWipeGeometry(i/100,aspect);assert.ok(Object.values(geometry).every(Number.isFinite));
  assert.ok(geometry.x>=previous);previous=geometry.x;
 }
 for(const t of [0,3.5,7])for(const actor of springWalkerLayout(t,aspect)){
  assert.ok([actor.x,actor.ground,actor.height].every(Number.isFinite)&&actor.height>0);
  assert.ok([1,-1].includes(actor.direction));
 }
}
assert.equal(springView(SPRING_LOW_CUT*7-.001),'wide');assert.equal(springView(SPRING_LOW_CUT*7),'low');
for(const rig of [springRig,springLowRig]){
for(const [x,y,w,h] of [rig.body,rig.child.crop,rig.mother.crop,...(rig.childFace?[rig.childFace]:[])])assert.ok(x>=0&&y>=0&&x+w<=rig.width&&y+h<=rig.height);
for(let i=0;i<=700;i++){
 const pose=springPose(i/100,7,rig);
 assert.ok([pose.angle,...pose.wrist,...pose.tip,...pose.motherTarget,pose.approach,pose.bob].every(Number.isFinite));
 if(i>=400)assert.deepEqual(pose.motherTarget,pose.wrist,'mother follows the moving wrist after catching it');
 if(rig===springLowRig&&i>=SPRING_LOW_CUT*700){
  const length=Math.hypot(rig.mother.palm[0]-rig.mother.socket[0],rig.mother.palm[1]-rig.mother.socket[1]);
  const reach=Math.hypot(pose.motherTarget[0]-rig.mother.joint[0],pose.motherTarget[1]-rig.mother.joint[1]);
  const parts=springArmSegments(length,reach);
  assert.ok(parts.every(([a,b,x,w])=>b>a&&w>0));
  assert.ok(Math.abs(parts[2][1]-parts[2][0]-parts[2][3])<1e-8,'palm slice keeps original length');
  assert.ok(Math.abs(parts[2][2]+length-parts[2][0]-reach)<1e-8,'palm still maps to target wrist');
 }
}
}
assert.ok(springPose(2.8).tip[0]>springPose(0).tip[0]+100,'child first reaches toward flower');
assert.ok(springPose(6.5).tip[1]>springPose(2.8).tip[1]+100,'child lowers hand after being stopped');
for(const [width,height] of [[1280,720],[390,844],[320,740],[768,1024]]){
 const aspect=width/height,cover=Math.max(width/1920,height/1080);
 for(const p of [.12,.5,SPRING_LOW_CUT,.8,.99]){
  const low=springView(p*7)==='low',layout=springLayout(aspect,low),rig=low?springLowRig:springRig;
  const cam=camera(timeline.shots[8],p,aspect),pose=springPose(p*7,7,rig);
  const points=[['mother face',600,140,true],['child face',820,350,true],['flower centre',low?layout.flower.x:1160,low?layout.flower.y-layout.flower.height*.80:420,false]];
  for(const [name,sx,sy,moving] of points){
   const wx=layout.x+(sx+(moving?pose.approach:0))*layout.scale,wy=layout.y+(sy+(moving?pose.bob:0))*layout.scale;
   const x=width/2+(wx-960+cam.x*1920)*cam.zoom*cover,y=height/2+(wy-540+cam.y*1080)*cam.zoom*cover;
   assert.ok(x>24&&x<width-24&&y>96&&y<height*.75,name+' outside visible safe area at '+width+'x'+height);
  }
  if(low)for(const [sx,sy] of [[480,7],[655,190],[684,247],[892,398]]){
   const x=width/2+(layout.x+sx*layout.scale-960)*cam.zoom*cover,y=height/2+(layout.y+sy*layout.scale-540)*cam.zoom*cover;
   assert.ok(x>4&&x<width-4&&y>80&&y<height*.8,'low-view hair/face crop stays inside viewport');
  }
 }
}
for(let i=0;i<130;i++)assert.ok(Object.values(crownPoint(i,130)).every(Number.isFinite));
// Atlas regeneration must not silently invalidate the measured crop/anchor data.
for(const [actor,atlas] of Object.entries(pavilionAtlases)){
 const png=fs.readFileSync(path.join(root,manifest.runtimeAssets['pavilion-'+actor+'-poses']));
 assert.equal(png.readUInt32BE(16),atlas.width,actor+' atlas width');assert.equal(png.readUInt32BE(20),atlas.height,actor+' atlas height');assert.equal(png[25],6,actor+' alpha');
 for(let i=0;i<3;i++)assert.ok(atlas.anchors[i][0]>0&&atlas.anchors[i][0]<atlas.cuts[i+1]-atlas.cuts[i]&&atlas.anchors[i][1]>=0&&atlas.anchors[i][1]<atlas.height);
}
for(let i=0;i<=800;i++)assert.ok(Object.values(pavilionPoses(i/100)).every(p=>Number.isFinite(p)&&p>=0&&p<=2));
// All four head anchors must survive the actual cover crop and camera at either size.
for(const [width,height] of [[1280,720],[390,844],[320,740],[768,1024]]){
 const aspect=width/height,scale=Math.max(width/1920,height/1080),layout=pavilionLayout(aspect);
 assert.equal(new Set(layout.map(a=>a.actor)).size,4);
 for(const p of [.12,.5,.99]){
  const cam=camera(timeline.shots[12],p,aspect);
  for(const actor of layout){
   const x=width/2+(actor.x-960+cam.x*1920)*cam.zoom*scale,y=height/2+(actor.y-540+cam.y*1080)*cam.zoom*scale;
   assert.ok(x>24&&x<width-24&&y>96&&y<height*.7,actor.actor+' head outside visible safe area at '+width+'x'+height);
  }
 }
}
console.log('PASS: 18 source-exact shots/quotes, 119 seconds, runtime assets, both spring rigs/cut/head bounds/palm scale, walking and petal sweep, pavilion pose/head bounds.');
console.log('NOT VERIFIED: rendered quality, pointer/touch behavior, complete shot artwork and every requested character action. Goal remains in progress.');
