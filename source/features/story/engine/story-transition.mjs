import {clamp,smooth} from './story-core.mjs';

export const PETAL_WIPE_SECONDS=1.35;

// Coordinates are in the unzoomed 1920×1080 composition, including portrait crop.
export function petalWipeGeometry(progress,aspect=16/9){
 const q=smooth(clamp(progress)),visibleWidth=Math.min(1920,1080*aspect);
 const radius=Math.max(220,Math.min(760,visibleWidth*.40));
 const left=960-visibleWidth/2,right=960+visibleWidth/2;
 return {x:left-radius*1.2+(visibleWidth+radius*2.4)*q,y:540+Math.sin(q*Math.PI)*35,rx:radius,ry:920};
}

export function drawPetalWipe(c,previous,progress,aspect){
 const {x,y,rx,ry}=petalWipeGeometry(progress,aspect);
 // Hold the outgoing shot to the right; the petal's trailing edge reveals the
 // already rendered incoming shot. The image change is hidden inside the petal.
 c.save();c.beginPath();c.rect(x,0,1920-x,1080);c.clip();c.drawImage(previous,0,0,1920,1080);c.restore();
 c.save();c.translate(x,y);c.scale(rx,ry);
 c.beginPath();c.moveTo(-.10,-1);
 c.bezierCurveTo(.60,-1.13,1.00,-.40,.88,.20);
 c.bezierCurveTo(.76,.92,-.10,1.05,-.58,.77);
 c.bezierCurveTo(-1.00,.26,-.85,-.72,-.10,-1);c.closePath();
 const color=c.createLinearGradient(-.8,-.5,.8,.6);
 color.addColorStop(0,'#ecc5b1');color.addColorStop(.30,'#d98287');color.addColorStop(.72,'#b44d64');color.addColorStop(1,'#e8ae9e');
 c.fillStyle=color;c.fill();c.clip();
 c.strokeStyle='#f6d9bd55';c.lineWidth=.009;
 for(let i=0;i<17;i++){
  const a=(i-8)/9;c.beginPath();c.moveTo(-.2,.94);
  c.bezierCurveTo(a*.30,.52,a*.84,-.20,a*.72,-1.1);c.stroke();
 }
 const fold=c.createLinearGradient(-.12,0,.19,0);fold.addColorStop(0,'#f8d6bd00');fold.addColorStop(.46,'#f8d6bd55');fold.addColorStop(.56,'#84354a33');fold.addColorStop(1,'#84354a00');
 c.fillStyle=fold;c.fillRect(-.12,-1.2,.31,2.4);c.restore();
}
