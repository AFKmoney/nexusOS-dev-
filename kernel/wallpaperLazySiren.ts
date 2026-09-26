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
function sirenPath(phase){
  const w=Math.sin(phase)*5;
  const k=Math.cos(phase*0.7)*3;
  return [
    [0,-38],
    [16+w,-28, 16+w,-8, -2,2],
    [-20-k,12, -18-k,26, 2,34],
    [18+w,40, 20+w,48, 8,54]
  ];
}
function drawSiren(s,phase){
  const p=sirenPath(phase);
  g.beginPath();
  g.moveTo(p[0][0],p[0][1]);
  g.bezierCurveTo(p[1][0],p[1][1],p[1][2],p[1][3],p[1][4],p[1][5]);
  g.bezierCurveTo(p[2][0],p[2][1],p[2][2],p[2][3],p[2][4],p[2][5]);
  g.bezierCurveTo(p[3][0],p[3][1],p[3][2],p[3][3],p[3][4],p[3][5]);
  g.strokeStyle='#10b981';
  g.lineWidth=3.4/Math.max(s,0.001)*s;
  g.lineCap='round';
  g.lineJoin='round';
  g.shadowColor='rgba(16,185,129,0.7)';
  g.shadowBlur=16;
  g.stroke();
}
function drawWord(text,fs){
  const gap=fs*0.38;
  g.font='600 '+fs+'px ui-sans-serif,system-ui,sans-serif';
  const widths=[...text].map(ch=>g.measureText(ch).width);
  const total=widths.reduce((a,b)=>a+b,0)+gap*(text.length-1);
  let x=-total/2;
  g.textAlign='left';
  g.textBaseline='top';
  g.fillStyle='rgba(255,255,255,0.92)';
  g.shadowBlur=0;
  for(let i=0;i<text.length;i++){
    g.fillText(text[i],x,0);
    x+=widths[i]+gap;
  }
}
function draw(){
  t+=0.01;
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
  const scale=Math.min(W,H)/460;
  const pulse=1+Math.sin(t*0.7)*0.03+imp*0.06;
  g.save();
  g.translate(W*0.5+ox,H*0.5+oy);
  g.scale(scale*pulse,scale*pulse);
  drawSiren(scale*pulse,t*0.45);
  g.translate(0,66);
  drawWord('LAZYSIREN',13);
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`;
