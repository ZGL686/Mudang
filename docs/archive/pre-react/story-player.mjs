import {sample,clamp,quoteProgress,SPRING_LOW_CUT} from './story-core.mjs';
import {ScrollRenderer} from './story-renderer.mjs';
const $=id=>document.getElementById(id);
const pointer={x:0,y:0,down:false,active:false};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let timeline,renderer,time=0,playing=false,started=false,lastFrame=0,lastShot=-1,characters=[],resumeAfterReading=false;
const audio=new Audio('wp-content/themes/davidwhyte/resources/assets/xp/sounds/loop-main.mp3');
audio.loop=true;audio.preload='none';audio.volume=.22;
let sound=false;
const format=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const mainEntryLink=$('main-entry-link');
mainEntryLink?.addEventListener('click',e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();window.location.assign(e.currentTarget.href)});

function setPlaying(value){
 playing=value;$('play').textContent=value?'Ⅱ':'▷';$('play').setAttribute('aria-label',value?'暂停':'播放');
 if(value&&sound)audio.play().catch(()=>{sound=false;$('sound').textContent='声 · 关';$('sound').setAttribute('aria-pressed','false')});else audio.pause();
}
function enter(){
 if(started)return;started=true;$('opening').hidden=true;$('narration').hidden=false;
 document.querySelector('.controls').hidden=false;$('chapter-nav').hidden=false;
 setPlaying(!reduced);$('play').focus({preventScroll:true});
}
function seek(value){time=clamp(Number(value)||0,0,timeline.duration);lastShot=-1;if(time>=timeline.duration)setPlaying(false)}
function restart(){seek(0);$('end-note').hidden=true;if(!started)enter();setPlaying(!reduced)}
function buildReading(){
 const fragment=document.createDocumentFragment();
 for(const text of timeline.narrative){if(!text.trim())continue;const tag=/^[一二三四]．$/.test(text)?'h3':'p';const node=document.createElement(tag);node.textContent=text;fragment.append(node)}
 $('full-text').replaceChildren(fragment);
}
function renderText(state){
 const {shot,index,local}=state;
 if(index!==lastShot){
  lastShot=index;$('chapter').textContent=shot.chapterTitle;$('shot-number').textContent=`${String(shot.id).padStart(2,'0')} / 18`;
  $('shot-label').textContent=shot.label;$('context-label').textContent=shot.context;
  characters=Array.from(shot.quote.text).map(char=>{const node=document.createElement('span');node.textContent=char;return node});
  $('quote').replaceChildren(...characters);
  [...$('chapter-nav').children].forEach((node,i)=>node.setAttribute('aria-current',String(i===shot.chapter)));
 }
 const count=reduced?characters.length:quoteProgress(local,characters.length,shot.duration);
 characters.forEach((node,i)=>{const alpha=clamp(count-i);node.style.opacity=alpha;node.style.filter=`blur(${(1-alpha)*4}px)`});
 $('experience').dataset.shot=String(shot.id);$('experience').dataset.time=time.toFixed(3);$('experience').dataset.playing=String(playing);
 $('experience').dataset.view=shot.motion==='spring-walk'&&local/shot.duration>=SPRING_LOW_CUT?'low':'wide';
 $('seek').value=String(time);$('elapsed').textContent=format(time);$('seek').setAttribute('aria-valuetext',`${shot.chapterTitle}，${shot.label}，${format(time)}`);
 $('end-note').hidden=time<timeline.duration;
}
function frame(now){
 const dt=Math.min(.1,lastFrame?(now-lastFrame)/1000:0);lastFrame=now;
 if(playing&&!document.hidden){time=Math.min(time+dt,timeline.duration);if(time===timeline.duration)setPlaying(false)}
 const state=sample(timeline,time);
 renderer.render(state,pointer,dt,started,playing);renderText(state);requestAnimationFrame(frame);
}
function trackPointer(e){
 const scale=Math.max(innerWidth/1920,innerHeight/1080),dw=1920*scale,dh=1080*scale;
 pointer.x=((e.clientX-(innerWidth-dw)/2)/dw)*2-1;pointer.y=((e.clientY-(innerHeight-dh)/2)/dh)*2-1;pointer.active=true;
 $('cursor').style.left=`${e.clientX}px`;$('cursor').style.top=`${e.clientY}px`;
}
let gesture=null;
function bind(){
 $('enter').addEventListener('click',enter);$('restart').addEventListener('click',e=>{e.preventDefault();restart()});$('replay').addEventListener('click',restart);
 $('play').addEventListener('click',()=>{if(time>=timeline.duration)seek(0);setPlaying(!playing)});
 $('seek').addEventListener('input',e=>{setPlaying(false);seek(e.target.value)});
 const stage=$('stage');stage.addEventListener('pointermove',e=>{trackPointer(e);if(gesture&&e.pointerType==='touch'&&Math.abs(e.clientY-gesture.y)>7){setPlaying(false);seek(gesture.time+(gesture.y-e.clientY)/28)}});
 stage.addEventListener('pointerdown',e=>{trackPointer(e);pointer.down=true;gesture={y:e.clientY,time};$('cursor').classList.add('pressed');stage.setPointerCapture(e.pointerId)});
 const release=()=>{pointer.down=false;gesture=null;$('cursor').classList.remove('pressed')};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('pointerleave',()=>{pointer.active=false;release()});
 $('experience').addEventListener('wheel',e=>{if(!started||$('reading').open)return;e.preventDefault();setPlaying(false);seek(time+e.deltaY*.012)},{passive:false});
 $('read').addEventListener('click',()=>{resumeAfterReading=playing;setPlaying(false);$('reading').showModal();$('close-reading').focus()});
 $('close-reading').addEventListener('click',()=>$('reading').close());$('reading').addEventListener('close',()=>{if(resumeAfterReading)setPlaying(true);$('read').focus()});
 $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'声 · 开':'声 · 关';$('sound').setAttribute('aria-pressed',String(sound));if(sound&&playing)audio.play().catch(()=>{sound=false;$('sound').textContent='声 · 关';$('sound').setAttribute('aria-pressed','false')});else audio.pause()});
 for(let i=0;i<6;i++){const button=document.createElement('button');button.setAttribute('aria-label',`第${i+1}场：${timeline.chapters[i]}`);button.title=timeline.chapters[i];button.addEventListener('click',()=>{setPlaying(false);seek(timeline.shots[i*3].start+.01)});$('chapter-nav').append(button)}
 document.addEventListener('keydown',e=>{if($('reading').open||!started||['INPUT','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();setPlaying(!playing)}else if(e.code==='ArrowRight'){e.preventDefault();setPlaying(false);seek(time+3)}else if(e.code==='ArrowLeft'){e.preventDefault();setPlaying(false);seek(time-3)}else if(e.code==='Home'){seek(0)}else if(e.code==='End'){seek(timeline.duration)}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false)});
 addEventListener('resize',()=>renderer.resize());
}
async function boot(){
 try{
  const [t,m]=await Promise.all([fetch('story-timeline.json'),fetch('story-layer-manifest.json')]);
  if(!t.ok||!m.ok)throw new Error('无法读取长卷资料');timeline=await t.json();const manifest=await m.json();
  const decoded=new Map();
  const entries=await Promise.all(Object.entries(manifest.runtimeAssets).map(async([name,path])=>{if(!decoded.has(path))decoded.set(path,(async()=>{const im=new Image();im.src=path;await im.decode();return im})());return [name,await decoded.get(path)]}));
  renderer=new ScrollRenderer($('stage'),new Map(entries),timeline);renderer.resize();$('seek').max=timeline.duration;
  buildReading();bind();$('enter').disabled=false;$('enter').textContent='入 卷';
  const query=new URLSearchParams(location.search),shot=Number(query.get('shot'));
  if(shot>=1&&shot<=18){enter();seek(timeline.shots[shot-1].start+Number(query.get('at')||.1));setPlaying(false)}
  requestAnimationFrame(frame);
 }catch(error){$('load-error').textContent=`画卷暂未载入：${error.message}。请通过本地 HTTP 服务打开网页。`;console.error(error)}
}
boot();
