// Offline production-renderer motion proof. Does not emulate browser UI.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas'));
GlobalFonts.registerFromPath('C:/Windows/Fonts/simkai.ttf','KaiTi');
globalThis.document={createElement:()=>createCanvas(1440,810)};
globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.devicePixelRatio=1;
const {ScrollRenderer}=await import('../story-renderer.mjs');
const {sample}=await import('../story-core.mjs');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const timeline=JSON.parse(fs.readFileSync(path.join(root,'story-timeline.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'story-layer-manifest.json'),'utf8'));
const id=Number(process.argv[2]||10),shot=timeline.shots[id-1];
if(!shot)throw new Error('Shot must be 1–18');
const assets=new Map(),cache=new Map();
for(const [key,file] of Object.entries(manifest.runtimeAssets)){
 if(!cache.has(file))cache.set(file,await loadImage(path.join(root,file)));
 assets.set(key,cache.get(file));
}
const dir=path.join(root,`.qa/clip-${id}-frames`);fs.mkdirSync(dir,{recursive:true});
const c=createCanvas(1280,720),renderer=new ScrollRenderer(c,assets,timeline);renderer.resize();
const fps=15;
for(let i=0;i<shot.duration*fps;i++){
 renderer.render(sample(timeline,shot.start+i/fps),{x:0,y:0,down:false,active:false},1/fps,true);
 fs.writeFileSync(path.join(dir,`${String(i).padStart(4,'0')}.png`),c.toBuffer('image/png'));
}
const output=path.join(root,`.qa/shot-${String(id).padStart(2,'0')}-motion.mp4`);
const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-i',path.join(dir,'%04d.png'),'-frames:v',String(shot.duration*fps),'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',output],{encoding:'utf8',windowsHide:true});
if(result.status!==0)throw new Error(result.stderr||'ffmpeg failed');
console.log(JSON.stringify({output,duration:shot.duration,fps,frames:shot.duration*fps,browserVerified:false}));
