// Runs the production Canvas2D renderer directly in Skia. This checks art
// composition; it is not a substitute for browser input/layout verification.
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {dataPath,qaPath,runtimeAssetPath} from '../lib/project-paths.mjs';
// Skia loads system fonts. An optional font can be supplied for reproducible labels.
if(process.env.STORY_FONT)GlobalFonts.registerFromPath(process.env.STORY_FONT,'KaiTi');
globalThis.document={createElement:()=>createCanvas(1440,810)};
globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.devicePixelRatio=1;
const {ScrollRenderer}=await import('../../source/features/story/engine/story-renderer.mjs');
const {sample}=await import('../../source/features/story/engine/story-core.mjs');
const timeline=JSON.parse(fs.readFileSync(dataPath('story-timeline.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(dataPath('story-layer-manifest.json'),'utf8'));
const cache=new Map(),assets=new Map();
for(const [key,file] of Object.entries(manifest.runtimeAssets)){if(!cache.has(file))cache.set(file,await loadImage(runtimeAssetPath(file)));assets.set(key,cache.get(file))}
const out=qaPath('story-frames');fs.mkdirSync(out,{recursive:true});
const canvas=createCanvas(1280,720),renderer=new ScrollRenderer(canvas,assets,timeline);renderer.resize();
const sheet=createCanvas(1440,6*295),sc=sheet.getContext('2d');sc.fillStyle='#e9e2d5';sc.fillRect(0,0,sheet.width,sheet.height);
for(let i=0;i<18;i++){
 const shot=timeline.shots[i],state=sample(timeline,shot.start+shot.duration*.56);
 renderer.render(state,{x:.1,y:0,down:false,active:false},1/60,true);
 const buffer=canvas.toBuffer('image/png');
 fs.writeFileSync(path.join(out,`shot-${String(i+1).padStart(2,'0')}.png`),buffer);
 const snapshot=await loadImage(buffer);
 const x=(i%3)*480,y=Math.floor(i/3)*295;sc.drawImage(snapshot,x,y,480,270);sc.fillStyle='#413321';sc.font='17px KaiTi';sc.fillText(`${String(i+1).padStart(2,'0')} · ${shot.label} · ${shot.duration}s`,x+10,y+289);
}
fs.writeFileSync(path.join(out,'contact.jpg'),sheet.toBuffer('image/jpeg'));
// Capture independent action phases, not only a single attractive still.
const actionShots=[7,9,10,11,12,13,14];
const actionSheet=createCanvas(1920,actionShots.length*390),ac=actionSheet.getContext('2d');
ac.fillStyle='#e9e2d5';ac.fillRect(0,0,1920,actionSheet.height);
for(const [row,id] of actionShots.entries()){
 const shot=timeline.shots[id-1];
 for(const [col,p] of [.18,.50,.85].entries()){
  renderer.render(sample(timeline,shot.start+shot.duration*p),{x:0,y:0,down:false,active:false},1/60,true);
  const b=canvas.toBuffer('image/png');const snap=await loadImage(b);
  ac.drawImage(snap,col*640,row*390,640,360);ac.fillStyle='#413321';ac.font='18px KaiTi';
  ac.fillText(`镜${id} · ${(shot.duration*p).toFixed(1)}s`,col*640+12,row*390+384);
 }
}
fs.writeFileSync(path.join(out,'puppet-actions.jpg'),actionSheet.toBuffer('image/jpeg'));
globalThis.innerWidth=390;globalThis.innerHeight=844;renderer.resize();
for(const id of [9,11,13]){
 const mobileSheet=createCanvas(1170,884),mc=mobileSheet.getContext('2d');
 mc.fillStyle='#e9e2d5';mc.fillRect(0,0,1170,884);
 for(const [col,p] of [.18,.50,.85].entries()){
  const shot=timeline.shots[id-1];renderer.render(sample(timeline,shot.start+shot.duration*p),{x:0,y:0,down:false,active:false},1/60,true,false);
  const buffer=canvas.toBuffer('image/png');fs.writeFileSync(path.join(out,'shot-'+String(id).padStart(2,'0')+'-mobile-'+Math.round(p*100)+'.png'),buffer);
  mc.drawImage(await loadImage(buffer),col*390,0,390,844);mc.fillStyle='#413321';mc.font='17px KaiTi';mc.fillText('镜'+id+' · '+(shot.duration*p).toFixed(1)+'s',col*390+12,872);
 }
 fs.writeFileSync(path.join(out,'shot-'+String(id).padStart(2,'0')+'-mobile-contact.jpg'),mobileSheet.toBuffer('image/jpeg'));
}
// Incoming shot 09 actually replaces the held outgoing shot 08 behind a petal.
for(const [width,height,label] of [[1280,720,'desktop'],[390,844,'portrait']]){
 globalThis.innerWidth=width;globalThis.innerHeight=height;renderer.resize();
 const steps=[0,.22,.50,.78,1.05,1.36],cellW=label==='desktop'?426:260,cellH=cellW*height/width;
 const proof=createCanvas(cellW*3,Math.ceil((cellH+32)*2)),pc=proof.getContext('2d');
 pc.fillStyle='#e9e2d5';pc.fillRect(0,0,proof.width,proof.height);
 for(const [i,seconds] of steps.entries()){
  renderer.render(sample(timeline,52+seconds),{x:0,y:0,down:false,active:false},1/60,true,true);
  pc.drawImage(canvas,(i%3)*cellW,Math.floor(i/3)*(cellH+32),cellW,cellH);
  pc.fillStyle='#413321';pc.font='16px KaiTi';pc.fillText('镜09转场 '+seconds.toFixed(2)+'s',(i%3)*cellW+10,Math.floor(i/3)*(cellH+32)+cellH+23);
 }
 fs.writeFileSync(path.join(out,'shot-09-transition-'+label+'.jpg'),proof.toBuffer('image/jpeg'));
}
for(const [width,height,label] of [[1280,720,'desktop'],[390,844,'portrait']]){
 globalThis.innerWidth=width;globalThis.innerHeight=height;renderer.resize();
 const steps=[3.50,3.63,3.64,4,5,6.3],cellW=label==='desktop'?426:260,cellH=cellW*height/width;
 const proof=createCanvas(cellW*3,Math.ceil((cellH+32)*2)),pc=proof.getContext('2d');pc.fillStyle='#e9e2d5';pc.fillRect(0,0,proof.width,proof.height);
 for(const [i,seconds] of steps.entries()){
  renderer.render(sample(timeline,52+seconds),{x:0,y:0,down:false,active:false},1/60,true,false);
  pc.drawImage(canvas,(i%3)*cellW,Math.floor(i/3)*(cellH+32),cellW,cellH);pc.fillStyle='#413321';pc.font='16px KaiTi';
  pc.fillText('镜09视角 '+seconds.toFixed(2)+'s',(i%3)*cellW+10,Math.floor(i/3)*(cellH+32)+cellH+23);
 }
 fs.writeFileSync(path.join(out,'shot-09-low-cut-'+label+'.jpg'),proof.toBuffer('image/jpeg'));
}
console.log('Rendered 18 stills, action/portrait sheets and shot 09 petal-wipe / low-angle-cut proofs to '+out);
