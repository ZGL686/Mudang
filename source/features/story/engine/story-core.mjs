export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export const SPRING_LOW_CUT=.52;
export function sample(timeline,time){
 const t=clamp(time,0,timeline.duration);
 const index=timeline.shots.findIndex(s=>t<s.end);
 const i=index<0?timeline.shots.length-1:index;
 const shot=timeline.shots[i];
 return {shot,index:i,time:t,local:t-shot.start,progress:clamp((t-shot.start)/shot.duration)};
}
export function camera(shot,p,aspect=16/9){
 if(shot.motion==='spring-walk'){
  const low=p>=SPRING_LOW_CUT,follow=smooth(p/.45);
  if(low)return {x:0,y:0,zoom:lerp(1.01,1.055,smooth((p-SPRING_LOW_CUT)/(1-SPRING_LOW_CUT)))};
  if(aspect<1.1)return {x:lerp(.018,-.018,follow),y:.01,zoom:1.02};
  return {x:lerp(.045,-.005,follow),y:0,zoom:1.08};
 }
 if(shot.motion==='lantern'){
  const push=smooth(p/.18),pull=smooth((p-.22)/.72),portrait=aspect<1.1;
  return {x:(portrait?-.025:-.30)*(1-pull),y:(portrait?.04:.10)*(1-pull),zoom:lerp((portrait?1.10:1.85)+push*(portrait?.08:.2),1.02,pull)};
 }
 if(shot.motion==='pavilion'&&aspect<1.1)return {x:0,y:0,zoom:lerp(1.02,1.08,smooth(p))};
 if(shot.motion==='hair-flower')return {x:0,y:-.12*(1-smooth(p/.13)),zoom:lerp(1.20,1.38,smooth(p))};
 if(shot.motion==='silk')return {x:lerp(.08,-.18,smooth(p)),y:lerp(.02,-.07,smooth(p)),zoom:lerp(1.20,1.55,smooth(p))};
 if(shot.motion==='artifacts'){
  const {plane}=artifactFocus(p);
  return {x:(1140-lerp(910,1450,plane/2))/1920,y:lerp(0,-.14,smooth(p)),zoom:lerp(1.3,1.8,smooth(p))};
 }
 let q=smooth(p);
 if(shot.motion==='storm')q=p<.22?smooth(p/.22)*.7:.7+.3*smooth((p-.22)/.78);
 const [a,b]=shot.camera;
 return {x:lerp(a[0],b[0],q),y:lerp(a[1],b[1],q),zoom:lerp(a[2],b[2],q)};
}
export const noise=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
export function artifactFocus(progress){
 // Two deliberate focus pulls with a hold on each object, over the six seconds.
 const plane=smooth((progress-.18)/.22)+smooth((progress-.59)/.23);
 return {plane,blur:[0,1,2].map(i=>Math.min(16,Math.abs(i-plane)*10)),muralLight:smooth((progress-.5)/.5)};
}
export function crownPoint(i,count){
 const t=i/(count-1),x=550+t*820;
 const peaks=[0,.22,.5,.78,1];
 const distance=Math.min(...peaks.map(v=>Math.abs(t-v)));
 return {x,y:280+distance*680+Math.sin(t*Math.PI)*-70};
}
export function quoteProgress(local,length,duration){
 const reveal=Math.min(3.6,Math.max(1.2,duration*.45));
 return clamp((local-.45)/reveal)*length;
}
