export const LAZYSIRN_WALLPAPER_ID = 'nexus://procedural/lazysiren';

export const LAZYSIRN_WALLPAPER_HTML = `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050508"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,nodes=[],t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.min(70,Math.floor((W*H)/18000));
  nodes=[];
  for(let i=0;i<n;i++) nodes.push({
    x:Math.random()*W,y:Math.random()*H,
    vx:(Math.random()-0.5)*0.28,vy:(Math.random()-0.5)*0.28,
    r:Math.random()*1.4+0.5
  });
}
window.onresize=init;init();
function mark(cx,cy,s,phase){
  g.save();
  g.translate(cx,cy);
  g.scale(s,s);
  g.beginPath();
  const steps=64;
  for(let i=0;i<=steps;i++){
    const u=i/steps;
    const y=(u-0.5)*92;
    const x=Math.sin(u*Math.PI*2 + phase)*16;
    if(i===0) g.moveTo(x,y);
    else g.lineTo(x,y);
  }
  g.strokeStyle='#10b981';
  g.lineWidth=3.4;
  g.lineCap='round';
  g.lineJoin='round';
  g.shadowColor='rgba(16,185,129,0.7)';
  g.shadowBlur=16;
  g.stroke();
  g.restore();
}
function draw(){
  t+=0.012;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const ox=tiltX*28*str, oy=tiltY*22*str;
  g.fillStyle='#050508';
  g.fillRect(0,0,W,H);
  const vg=g.createRadialGradient(W*0.5+ox,H*0.5+oy,20,W*0.5,H*0.5,Math.max(W,H)*0.7);
  vg.addColorStop(0,'rgba(16,185,129,'+(0.10+imp*0.08)+')');
  vg.addColorStop(1,'rgba(5,5,8,0)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
  for(const n of nodes){
    n.x+=n.vx;n.y+=n.vy;
    if(n.x<0||n.x>W)n.vx*=-1;
    if(n.y<0||n.y>H)n.vy*=-1;
  }
  g.lineWidth=0.6;
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j];
      const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
      if(d<130){
        g.strokeStyle='rgba(16,185,129,'+(0.12*(1-d/130))+')';
        g.beginPath();g.moveTo(a.x+ox*0.15,a.y+oy*0.15);g.lineTo(b.x+ox*0.15,b.y+oy*0.15);g.stroke();
      }
    }
  }
  for(const n of nodes){
    g.fillStyle='rgba(110,231,183,0.7)';
    g.beginPath();g.arc(n.x+ox*0.15,n.y+oy*0.15,n.r,0,Math.PI*2);g.fill();
  }
  const scale=Math.min(W,H)/420;
  const cx=W*0.5+ox;
  const cy=H*0.48+oy;
  mark(cx,cy,scale,t*0.55);
  g.shadowBlur=0;
  g.fillStyle='rgba(255,255,255,0.9)';
  const fs=Math.max(12,Math.min(W,H)*0.028);
  g.font='600 '+fs+'px ui-sans-serif,system-ui,sans-serif';
  g.textAlign='center';
  g.textBaseline='middle';
  if(g.letterSpacing!==undefined) g.letterSpacing='0.42em';
  g.fillText('LAZYSIREN',cx,cy);
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`;
