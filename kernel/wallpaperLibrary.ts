
export interface WallpaperPreset {
  id: string;
  name: string;
  category: string;
  desc: string;
  preview: string;
  code: string;
}

export const WALLPAPER_LIBRARY: WallpaperPreset[] = [
  {
    id: 'NEURAL_STORM',
    name: 'Neural Storm',
    category: 'Neural',
    desc: 'Evolving neural network with synaptic fire',
    preview: 'from-cyan-950 via-black to-blue-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020408"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,nodes=[],t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  nodes=[];
  for(let i=0;i<85;i++){
    const z=Math.random()*0.8+0.2;
    nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:1+z*2.5,z,fire:0,hue:Math.random()>.5?175:220});
  }
}
window.onresize=init;init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(2,4,8,0.15)';g.fillRect(0,0,W,H);
  nodes.forEach((n,i)=>{
    n.x+=n.vx;n.y+=n.vy;
    if(n.x<0)n.x=W;if(n.x>W)n.x=0;if(n.y<0)n.y=H;if(n.y>H)n.y=0;
    n.fire=Math.max(0,n.fire-.02);
    const ox=n.z>0.6?-gx*50*n.z:gx*18*n.z;
    const oy=n.z>0.6?-gy*50*n.z:gy*18*n.z;
    const nx=n.x+ox+(n.x-W/2)*imp*0.14*n.z;
    const ny=n.y+oy+(n.y-H/2)*imp*0.14*n.z;
    nodes.slice(i+1).forEach(m=>{
      if(Math.abs(n.z-m.z)<0.35){
        const mox=m.z>0.6?-gx*50*m.z:gx*18*m.z;
        const moy=m.z>0.6?-gy*50*m.z:gy*18*m.z;
        const mx=m.x+mox+(m.x-W/2)*imp*0.14*m.z;
        const my=m.y+moy+(m.y-H/2)*imp*0.14*m.z;
        const dx=mx-nx,dy=my-ny,d=Math.hypot(dx,dy);
        if(d<110*n.z){
          const a=(1-d/(110*n.z))*.5*(n.fire>0||m.fire>0?2:1);
          g.beginPath();g.moveTo(nx,ny);g.lineTo(mx,my);
          g.strokeStyle='hsla('+n.hue+',100%,'+(60+n.fire*40)+'%,'+(a*n.z)+')';
          g.lineWidth=n.fire>0?1.5*n.z:.6*n.z;g.stroke();
          if(Math.random()<.001){n.fire=1;m.fire=.8;}
        }
      }
    });
    const rad=(n.r*2+n.fire*6)*(1+imp*0.4*n.z);
    const grd=g.createRadialGradient(nx,ny,0,nx,ny,rad);
    grd.addColorStop(0,'hsla('+n.hue+',100%,75%,'+(0.7+n.fire*.3)+')');
    grd.addColorStop(1,'transparent');
    g.fillStyle=grd;g.beginPath();g.arc(nx,ny,rad,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'STARFIELD',
    name: 'Hyperspace',
    category: 'Space',
    desc: 'Warp-speed star tunnel',
    preview: 'from-blue-950 via-black to-indigo-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._stars3D=[];for(let i=0;i<350;i++)window._stars3D.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,z:Math.random()});
}
window.onresize=init;
window._stars3D=[];for(let i=0;i<350;i++)window._stars3D.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,z:Math.random()});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(0,0,W,H);
  g.save();g.translate(W/2+gx*15,H/2+gy*15);
  window._stars3D.forEach(s=>{
    s.z-=(0.006+imp*0.035);
    if(s.z<=0.02){s.z=1;s.x=(Math.random()-0.5)*2;s.y=(Math.random()-0.5)*2;}
    const px=(s.x-gx*0.2)/s.z*W*0.5;
    const py=(s.y-gy*0.2)/s.z*W*0.5;
    const sz=(1.2-s.z)*2.5*(1+imp*0.5);
    g.fillStyle='rgba(220,240,255,'+(1-s.z)+')';
    g.fillRect(px,py,sz,sz);
  });
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'CYBER_GRID',
    name: 'Neon Grid',
    category: 'Cyberpunk',
    desc: 'Reactive neon retro grid with pulse',
    preview: 'from-purple-950 via-black to-fuchsia-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#150525"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='#150525';g.fillRect(0,0,W,H);
  const horizY=H*0.45+gy*25;
  // Deep Sun
  const sunX=W/2+gx*12, sunY=horizY-H*0.15;
  const sRad=H*0.22*(1-imp*0.04);
  const sGrad=g.createRadialGradient(sunX,sunY,0,sunX,sunY,sRad);
  sGrad.addColorStop(0,'#ffec3d');sGrad.addColorStop(0.7,'#ff007f');sGrad.addColorStop(1,'transparent');
  g.fillStyle=sGrad;g.fillRect(sunX-sRad,sunY-sRad,sRad*2,sRad*2);
  // Ground grid lines
  g.save();
  g.translate(W/2-gx*35,horizY);
  g.strokeStyle='#ff007f';g.lineWidth=1.5;
  for(let z=10;z<400;z+=20){
    let p=z-(t*30%20);if(p<=0)continue;
    let w=W/(p*0.008), y=(H-horizY)/(p*0.015);
    g.globalAlpha=Math.max(0,1-p/380);
    g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.stroke();
  }
  for(let x=-18;x<=18;x++){
    g.beginPath();g.moveTo(x*40,0);g.lineTo(x*800,H);g.stroke();
  }
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'MATRIX_CORE',
    name: 'Matrix Core',
    category: 'Hacker',
    desc: 'Green digital rain with Katakana glyphs',
    preview: 'from-green-950 via-black to-emerald-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000300"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
}
window.onresize=init;
window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,3,0,0.1)';g.fillRect(0,0,W,H);
  const ch="01アイウエオカキクケコサシスセソタチツテトナニヌネノ#$@";
  window._mDrops.forEach(d=>{
    const ox=d.z>0.6?(-gx*50*d.z):(gx*18*d.z);
    const oy=d.z>0.6?(-gy*50*d.z):(gy*18*d.z);
    const curX=d.x+ox;
    const curY=d.y*18+oy;
    const fs=Math.floor((10+d.z*8)*(1+imp*0.3*d.z));
    g.font=fs+'px monospace';
    const len=Math.floor(6+d.z*12);
    for(let j=0;j<len;j++){
      const cy=curY-j*fs;
      if(cy<0||cy>H)continue;
      const alpha=Math.max(0,(1-j/len)*(0.3+d.z*0.6));
      if(j===0&&d.bright>0.6){g.fillStyle='rgba(210,255,220,'+(0.8+imp*0.2)+')';}
      else {g.fillStyle='rgba(0,'+Math.floor(140+d.z*100)+','+Math.floor(40+d.z*40)+','+alpha+')';}
      g.fillText(ch[(Math.floor(d.x+j+t*10))%ch.length],curX,cy);
    }
    d.y+=d.speed*(1+imp*0.5*d.z);
    if(d.y*18>H&&Math.random()>0.96){d.y=0;d.bright=Math.random();}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'QUANTUM_FIELD',
    name: 'Quantum Field',
    category: 'Neural',
    desc: 'Charged particle interaction field',
    preview: 'from-blue-950 via-indigo-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0a0a14"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
}
window.onresize=init;
window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.clearRect(0,0,W,H);
  const pts=window._pList;
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const px=p.x-gx*(35+p.z*35)+(p.x-W/2)*imp*0.14*p.z;
    const py=p.y-gy*(35+p.z*35)+(p.y-H/2)*imp*0.14*p.z;
    const r=(1.5+p.z*2.5)*(1+imp*0.4*p.z);
    g.fillStyle='rgba(0,255,230,'+(0.4+p.z*0.5)+')';
    g.beginPath();g.arc(px,py,r,0,7);g.fill();
    pts.forEach(p2=>{
      if(Math.abs(p.z-p2.z)<0.28){
        const p2x=p2.x-gx*(35+p2.z*35)+(p2.x-W/2)*imp*0.14*p2.z;
        const p2y=p2.y-gy*(35+p2.z*35)+(p2.y-H/2)*imp*0.14*p2.z;
        const d=Math.hypot(px-p2x,py-p2y);
        if(d<90*p.z){
          g.strokeStyle='rgba(0,255,230,'+((1-d/(90*p.z))*0.3*p.z)+')';
          g.beginPath();g.moveTo(px,py);g.lineTo(p2x,p2y);g.stroke();
        }
      }
    });
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'FRACTAL_ORBIT',
    name: 'Fractal Orbit',
    category: 'Abstract',
    desc: 'Sacred geometry in perpetual motion',
    preview: 'from-emerald-950 via-black to-purple-950',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020308"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,t=0;function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;init();function poly(x,y,r,n,rot,color,lw){g.beginPath();for(let i=0;i<=n;i++){const a=rot+i/n*Math.PI*2;i?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.strokeStyle=color;g.lineWidth=lw;g.stroke();}function rosette(cx,cy,r,n,rot,hue,a){for(let i=0;i<n;i++){const angle=rot+i/n*Math.PI*2,x2=cx+Math.cos(angle)*r,y2=cy+Math.sin(angle)*r;g.beginPath();g.moveTo(cx,cy);g.lineTo(x2,y2);g.strokeStyle=\'hsla(\'+hue+\',100%,70%,\'+(a*.4)+\')\';g.lineWidth=.5;g.stroke();poly(x2,y2,r*.3,6,angle+t*.5,\'hsla(\'+(hue+60)+\',100%,70%,\'+(a*.6)+\')\',0.5);}}function draw(){g.fillStyle=\'rgba(2,3,8,0.1)\';g.fillRect(0,0,W,H);t+=.008;const cx=W/2,cy=H/2,R=Math.min(W,H)*.38;poly(cx,cy,R,6,t,\'hsla(160,100%,60%,0.7)\',1);poly(cx,cy,R*.7,6,t+Math.PI/6,\'hsla(280,100%,70%,0.5)\',0.8);poly(cx,cy,R*.45,3,t*1.5,\'hsla(60,100%,70%,0.6)\',0.8);rosette(cx,cy,R,12,t*.5,160,0.8);rosette(cx,cy,R*.5,8,-t*.7,280,0.6);for(let i=0;i<6;i++){const a=t+i/6*Math.PI*2,ox=cx+Math.cos(a)*R,oy=cy+Math.sin(a)*R;poly(ox,oy,R*.18,6,-a,\'hsla(\'+(160+i*30)+\',100%,65%,0.5)\',0.6);for(let j=0;j<6;j++){const b=a*2+j/6*Math.PI*2,sx=ox+Math.cos(b)*R*.12,sy=oy+Math.sin(b)*R*.12;g.beginPath();g.arc(sx,sy,2,0,7);g.fillStyle=\'hsla(\'+(220+j*20)+\',100%,80%,0.8)\';g.fill();}}requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'MOUSE_PARTICLES',
    name: 'Cursor Swarm',
    category: 'Interactive',
    desc: 'Particles swarm your cursor',
    preview: 'from-blue-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),x=c.getContext(\'2d\');let W,H,mx=0,my=0,p=[];function r(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';x.scale(devicePixelRatio,devicePixelRatio);}r();onresize=r;onmousemove=e=>{mx=e.clientX;my=e.clientY};for(let i=0;i<200;i++)p.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:0,vy:0,hue:Math.random()*60+160});function d(){x.fillStyle=\'rgba(0,0,0,0.1)\';x.fillRect(0,0,W,H);p.forEach(n=>{const dx=mx-n.x,dy=my-n.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<200&&dist>0){n.vx+=dx/dist*.8;n.vy+=dy/dist*.8;}if(dist>250){n.vx+=(Math.random()-.5)*.2;n.vy+=(Math.random()-.5)*.2;}n.vx*=.95;n.vy*=.95;n.x+=n.vx;n.y+=n.vy;if(n.x<0)n.x=W;if(n.x>W)n.x=0;if(n.y<0)n.y=H;if(n.y>H)n.y=0;const sp=Math.sqrt(n.vx*n.vx+n.vy*n.vy);x.fillStyle=\'hsla(\'+n.hue+\',100%,\'+(60+sp*10)+\'%,\'+(0.5+sp*.2)+\')\';x.fillRect(n.x,n.y,1.5+sp*.5,1.5+sp*.5);});requestAnimationFrame(d);}d();</script></body></html>'
  },
  {
    id: 'NEON_RIPPLE',
    name: 'Neon Ripple',
    category: 'Interactive',
    desc: 'Click anywhere to send ripples',
    preview: 'from-cyan-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000508"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,ripples=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;init();window.onclick=e=>{for(let i=0;i<4;i++)ripples.push({x:e.clientX,y:e.clientY,r:0,maxR:Math.min(W,H)*.6,a:.9,hue:160+i*40,lw:3-i*.5,spd:3+i*2});};window.onmousemove=e=>{if(Math.random()<.03)ripples.push({x:e.clientX,y:e.clientY,r:0,maxR:80,a:.4,hue:180,lw:.8,spd:2});};setInterval(()=>ripples.push({x:Math.random()*W,y:Math.random()*H,r:0,maxR:200+Math.random()*200,a:.3,hue:160+Math.random()*80,lw:.5,spd:1+Math.random()*2}),2000);function draw(){g.fillStyle=\'rgba(0,5,8,0.12)\';g.fillRect(0,0,W,H);ripples=ripples.filter(r=>{r.r+=r.spd;r.a*=.975;g.beginPath();g.arc(r.x,r.y,r.r,0,Math.PI*2);g.strokeStyle=\'hsla(\'+r.hue+\',100%,70%,\'+r.a+\')\';g.lineWidth=r.lw;g.stroke();return r.r<r.maxR&&r.a>.005;});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'GRAVITY_WELL',
    name: 'Gravity Well',
    category: 'Interactive',
    desc: 'Mouse creates gravitational lensing',
    preview: 'from-indigo-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000208"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,mx=0,my=0,pts=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);pts=[];for(let i=0;i<300;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,hue:200+Math.random()*80,s:Math.random()*1.5+.5});}window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();function draw(){g.fillStyle=\'rgba(0,2,8,0.1)\';g.fillRect(0,0,W,H);pts.forEach(p=>{const dx=mx-p.x,dy=my-p.y,d=Math.sqrt(dx*dx+dy*dy)+1,f=Math.min(4,8e4/(d*d));p.vx=(p.vx+f*dx/d*.016)*.99;p.vy=(p.vy+f*dy/d*.016)*.99;const spd=Math.sqrt(p.vx*p.vx+p.vy*p.vy);if(spd>8){p.vx*=8/spd;p.vy*=8/spd;}p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W||p.y<0||p.y>H){p.x=Math.random()*W;p.y=Math.random()*H;p.vx=p.vy=0;}g.fillStyle=\'hsla(\'+p.hue+\',100%,\'+(50+spd*8|0)+\'%,0.8)\';g.beginPath();g.arc(p.x,p.y,p.s,0,7);g.fill();});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'FLUID_TRAIL',
    name: 'Fluid Trail',
    category: 'Interactive',
    desc: 'Fluid dynamics follow your cursor',
    preview: 'from-teal-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,mx=0,my=0,pmx=0,pmy=0,pts=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;window.onmousemove=e=>{pmx=mx;pmy=my;mx=e.clientX;my=e.clientY;const vx=mx-pmx,vy=my-pmy,spd=Math.sqrt(vx*vx+vy*vy);for(let i=0;i<Math.min(8,spd/3+1);i++)pts.push({x:mx,y:my,vx:vx*.3+(Math.random()-.5)*spd*.4,vy:vy*.3+(Math.random()-.5)*spd*.4,life:1,hue:160+Math.random()*60,s:3+spd*.1});};init();function draw(){g.fillStyle=\'rgba(0,0,0,0.08)\';g.fillRect(0,0,W,H);pts=pts.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy=p.vy*.97+.05;p.life-=.015;p.s*=.99;if(p.life<=0)return false;const grd=g.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s*3);grd.addColorStop(0,\'hsla(\'+p.hue+\',100%,70%,\'+(p.life*.8)+\')\');grd.addColorStop(1,\'transparent\');g.fillStyle=grd;g.beginPath();g.arc(p.x,p.y,p.s*3,0,7);g.fill();return true;});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'NEURAL_WEB',
    name: 'Neural Web',
    category: 'Interactive',
    desc: 'Click to spark neural propagation',
    preview: 'from-emerald-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020408"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,nodes=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);nodes=[];for(let i=0;i<100;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,fire:0});}window.onresize=init;init();window.onclick=e=>{const n=nodes.reduce((a,b)=>Math.hypot(a.x-e.clientX,a.y-e.clientY)<Math.hypot(b.x-e.clientX,b.y-e.clientY)?a:b);n.fire=1;};function draw(){g.fillStyle=\'rgba(2,4,8,0.15)\';g.fillRect(0,0,W,H);nodes.forEach((n,i)=>{n.fire=Math.max(0,n.fire-.03);nodes.slice(i+1).forEach(m=>{const dx=m.x-n.x,dy=m.y-n.y,d=Math.sqrt(dx*dx+dy*dy);if(d<130){const intensity=(n.fire+m.fire)*.5;g.beginPath();g.moveTo(n.x,n.y);g.lineTo(m.x,m.y);g.strokeStyle=\'rgba(16,\'+(185*intensity|0)+\',\'+(129*intensity|0)+\',\'+(0.1+intensity*.6)+\')\';g.lineWidth=.5+intensity*2;g.stroke();if(n.fire>.6&&m.fire<.1&&d<100&&Math.random()<.05)m.fire=n.fire*.7;}});const r=3+n.fire*8,grd=g.createRadialGradient(n.x,n.y,0,n.x,n.y,r);grd.addColorStop(0,\'rgba(16,185,129,\'+(0.3+n.fire*.7)+\')\');grd.addColorStop(1,\'transparent\');g.fillStyle=grd;g.beginPath();g.arc(n.x,n.y,r,0,7);g.fill();});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'SONAR_PING',
    name: 'Sonar Ping',
    category: 'Interactive',
    desc: 'Radar sweep with depth echoes',
    preview: 'from-green-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000802"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,angle=0,blips=[],pings=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);blips=[];for(let i=0;i<20;i++)blips.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*3+1,bright:0});}window.onresize=init;window.onclick=e=>{pings.push({x:e.clientX,y:e.clientY,r:0,a:1});};init();function draw(){g.fillStyle=\'rgba(0,8,2,0.15)\';g.fillRect(0,0,W,H);const ox=W/2,oy=H/2,R=Math.min(W,H)*.44;g.strokeStyle=\'rgba(0,255,80,0.15)\';g.lineWidth=.5;for(let i=1;i<5;i++){g.beginPath();g.arc(ox,oy,R*i/4,0,7);g.stroke();}g.beginPath();g.moveTo(ox-R,oy);g.lineTo(ox+R,oy);g.moveTo(ox,oy-R);g.lineTo(ox,oy+R);g.stroke();for(let i=0;i<20;i++){const a=angle-i*.04;g.beginPath();g.moveTo(ox,oy);g.lineTo(ox+Math.cos(a)*R,oy+Math.sin(a)*R);g.strokeStyle=\'rgba(0,255,80,\'+((20-i)/20*.4)+\')\';g.lineWidth=2;g.stroke();}angle+=.04;blips.forEach(b=>{const ba=Math.atan2(b.y-oy,b.x-ox),diff=((angle-ba)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);if(diff<.15)b.bright=1;else b.bright=Math.max(0,b.bright-.008);if(b.bright>0){g.beginPath();g.arc(b.x,b.y,b.s+b.bright*4,0,7);g.fillStyle=\'rgba(0,255,80,\'+b.bright+\')\';g.fill();}});pings=pings.filter(p=>{p.r+=3;p.a*=.96;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.strokeStyle=\'rgba(100,255,150,\'+p.a+\')\';g.lineWidth=1.5;g.stroke();return p.a>.01;});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'MAGNETIC_FIELD',
    name: 'Magnetic Field',
    category: 'Interactive',
    desc: 'Mouse is a magnetic pole',
    preview: 'from-rose-900 to-black',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#080002"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,mx=0,my=0,lines=[];function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);lines=[];const step=50;for(let x=step/2;x<W;x+=step)for(let y=step/2;y<H;y+=step)lines.push({ox:x,oy:y,pts:[]});}window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();function fAt(px,py){const dx=mx-px,dy=my-py,d2=dx*dx+dy*dy+1,f=Math.min(2,5e3/d2),d=Math.sqrt(d2);return{fx:f*dx/d,fy:f*dy/d};}function draw(){g.fillStyle=\'rgba(8,0,2,0.2)\';g.fillRect(0,0,W,H);lines.forEach(l=>{l.pts=[];let px=l.ox,py=l.oy;for(let i=0;i<12;i++){l.pts.push([px,py]);const{fx,fy}=fAt(px,py);px+=fx*8;py+=fy*8;if(px<0||px>W||py<0||py>H)break;}if(l.pts.length<2)return;for(let i=0;i<l.pts.length-1;i++){const t=i/l.pts.length;g.beginPath();g.moveTo(l.pts[i][0],l.pts[i][1]);g.lineTo(l.pts[i+1][0],l.pts[i+1][1]);g.strokeStyle=\'hsla(\'+(t*60+310)+\',100%,60%,\'+(t*.7+.1)+\')\';g.lineWidth=.8+t;g.stroke();}const last=l.pts[l.pts.length-1];g.beginPath();g.arc(last[0],last[1],2,0,7);g.fillStyle=\'rgba(255,100,150,0.6)\';g.fill();});requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'LIQUID_CHROME',
    name: 'Liquid Chrome',
    category: 'Abstract',
    desc: 'Metallic liquid morphing surface',
    preview: 'from-slate-800 via-black to-zinc-900',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050506"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,t=0,mx=0,my=0;function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();function noise(x,y,t){return Math.sin(x*.008+t)*Math.cos(y*.006+t*1.3)+Math.sin((x+y)*.005+t*.7)*.5+Math.sin(x*.003-y*.004+t*1.7)*.3;}function draw(){t+=.012;const res=6;for(let y=0;y<H;y+=res){for(let x=0;x<W;x+=res){const n=noise(x+(mx-W/2)*.01,y+(my-H/2)*.01,t),n2=noise(x*1.7,y*1.7,t*1.4+1),v=(n+n2)*.5,light=30+v*80+40,sat=5+Math.abs(v)*15,hue=200+v*40;g.fillStyle=\'hsl(\'+hue+\',\'+sat+\'%,\'+(Math.max(0,Math.min(100,light)))+\'%)\';g.fillRect(x,y,res+1,res+1);}}requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'SINE_WAVES',
    name: 'Sine Waves',
    category: 'Abstract',
    desc: 'Layered chromatic wave ribbons',
    preview: 'from-blue-950 via-purple-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050510"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(5,5,16,0.1)';g.fillRect(0,0,W,H);
  for(let i=0;i<5;i++){
    const z=0.2+i*0.2;
    const ox=z>0.5?-gx*45*z:gx*18*z;
    const oy=z>0.5?-gy*45*z:gy*18*z;
    g.beginPath();
    g.strokeStyle='hsla('+(180+i*22)+',100%,60%,'+(0.3+z*0.5)+')';
    g.lineWidth=1.5+z*2.5;
    for(let x=-40;x<=W+40;x+=12){
      let y=H*0.5+Math.sin(x*0.008+t*1.5+i)*70*z+Math.cos(x*0.015-t)*40*z+oy;
      x===-40?g.moveTo(x+ox,y):g.lineTo(x+ox,y);
    }
    g.stroke();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'HEX_HIVE',
    name: 'Hex Hive',
    category: 'Abstract',
    desc: 'Living hexagonal pulse matrix',
    preview: 'from-amber-950 via-black to-orange-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0e0e1a"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.clearRect(0,0,W,H);
  function hex(x,y,r){
    g.beginPath();
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      i===0?g.moveTo(x+r*Math.cos(a),y+r*Math.sin(a)):g.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));
    }
    g.closePath();g.stroke();
  }
  for(let layer=0;layer<3;layer++){
    const z=layer===0?0.25:(layer===1?0.55:0.95);
    const ox=z>0.6?-gx*45*z:gx*18*z;
    const oy=z>0.6?-gy*45*z:gy*18*z;
    const s=24+z*16;const h=s*Math.sqrt(3);
    g.lineWidth=1+z*1.5;
    for(let x=-s;x<W+s;x+=s*1.5){
      for(let y=-h;y<H+h;y+=h){
        const cy=y+(Math.round(x/(s*1.5))%2?h/2:0);
        const dist=Math.hypot(x-W/2,cy-H/2);
        g.strokeStyle='hsla('+((dist-t*40)%360)+',70%,60%,'+(0.08+z*0.25)+')';
        hex(x+ox,cy+oy,s*0.85*(1+imp*0.1*z));
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'COSMIC_DUST',
    name: 'Cosmic Dust',
    category: 'Space',
    desc: 'Nebula dust cloud with auroras',
    preview: 'from-purple-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020108"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._nStars=[];for(let i=0;i<100;i++)window._nStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.3,a:Math.random()});
  window._nPts=[];for(let i=0;i<110;i++)window._nPts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,z:Math.random()*0.8+0.2,s:Math.random()*2+1,hue:Math.random()>0.5?164:220});
}
window.onresize=init;
window._nStars=[];for(let i=0;i<100;i++)window._nStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.3,a:Math.random()});
  window._nPts=[];for(let i=0;i<110;i++)window._nPts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,z:Math.random()*0.8+0.2,s:Math.random()*2+1,hue:Math.random()>0.5?164:220});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(2,1,8,0.1)';g.fillRect(0,0,W,H);
  // Fond: Stars
  window._nStars.forEach(s=>{
    g.fillStyle='rgba(255,255,255,'+(s.a*(0.5+Math.sin(t*3+s.r)*0.5))+')';
    g.beginPath();g.arc((s.x+gx*5+W)%W,(s.y+gy*5+H)%H,s.r,0,7);g.fill();
  });
  // Milieu: Glowing nebulae
  for(let i=0;i<3;i++){
    const rx=W*(0.2+i*0.3)+gx*18, ry=H*(0.35+Math.sin(t*0.4+i)*0.2)+gy*18;
    const r=W*0.3*(1-imp*0.03);
    const rg=g.createRadialGradient(rx,ry,0,rx,ry,r);
    rg.addColorStop(0,'hsla('+(160+i*80)+',100%,50%,0.07)');rg.addColorStop(1,'transparent');
    g.fillStyle=rg;g.fillRect(rx-r,ry-r,r*2,r*2);
  }
  // Avant: Depth particles with 5-6x reverse parallax
  window._nPts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const ox=-gx*(36+p.z*34)+(p.x-W/2)*imp*0.15*p.z;
    const oy=-gy*(36+p.z*34)+(p.y-H/2)*imp*0.15*p.z;
    const fx=p.x+ox, fy=p.y+oy;
    const pr=p.s*(1+p.z*1.2)*(1+imp*0.45*p.z);
    const grd=g.createRadialGradient(fx,fy,0,fx,fy,pr*3.5);
    grd.addColorStop(0,'hsla('+p.hue+',100%,75%,'+(0.4+p.z*0.5)+')');
    grd.addColorStop(1,'transparent');
    g.fillStyle=grd;g.beginPath();g.arc(fx,fy,pr*3.5,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'LASER_SCAN',
    name: 'Laser Scan',
    category: 'Cyberpunk',
    desc: 'Rotating laser beams with interference',
    preview: 'from-red-950 via-black to-pink-950',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#040001"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,t=0,mx=0,my=0;function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();function laser(cx,cy,angle,hue,len,lw){const ex=cx+Math.cos(angle)*len,ey=cy+Math.sin(angle)*len,bx=cx-Math.cos(angle)*len,by=cy-Math.sin(angle)*len;const gl=g.createLinearGradient(bx,by,ex,ey);gl.addColorStop(0,\'transparent\');gl.addColorStop(.5,\'hsla(\'+hue+\',100%,70%,0.12)\');gl.addColorStop(1,\'transparent\');g.beginPath();g.moveTo(bx,by);g.lineTo(ex,ey);g.strokeStyle=gl;g.lineWidth=lw*8;g.stroke();g.beginPath();g.moveTo(bx,by);g.lineTo(ex,ey);g.strokeStyle=\'hsla(\'+hue+\',100%,70%,0.9)\';g.lineWidth=lw;g.stroke();}function draw(){g.fillStyle=\'rgba(4,0,1,0.12)\';g.fillRect(0,0,W,H);t+=.02;const cx=W/2+(mx-W/2)*.2,cy=H/2+(my-H/2)*.2,len=Math.sqrt(W*W+H*H);laser(cx,cy,t,0,len,1);laser(cx,cy,t+Math.PI/3,20,len,.8);laser(cx,cy,t*1.3+Math.PI*.7,340,len*.7,.6);laser(cx,cy,-t*.8+Math.PI*1.4,280,len*.5,.5);for(let i=0;i<6;i++){const a=t*2+i/6*Math.PI*2,r=80+Math.sin(t*3+i)*40,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;g.beginPath();g.arc(px,py,3,0,7);g.fillStyle=\'hsla(\'+(i*30)+\',100%,80%,0.8)\';g.fill();const grd=g.createRadialGradient(px,py,0,px,py,20);grd.addColorStop(0,\'hsla(\'+(i*30)+\',100%,70%,0.3)\');grd.addColorStop(1,\'transparent\');g.fillStyle=grd;g.beginPath();g.arc(px,py,20,0,7);g.fill();}requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'OBSERVER',
    name: 'Observer',
    category: 'Cyberpunk',
    desc: 'Pulsing eye with retinal scan',
    preview: 'from-orange-950 via-black to-red-950',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020100"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,t=0,mx=0,my=0;function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);mx=W/2;my=H/2;}window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();function draw(){g.fillStyle=\'rgba(2,1,0,0.15)\';g.fillRect(0,0,W,H);t+=.015;const cx=W/2,cy=H/2,R=Math.min(W,H)*.28,pulse=.85+Math.sin(t*2)*.15,eyeW=R*2.2*pulse,eyeH=R*.9*(.7+Math.sin(t*1.5)*.3);g.beginPath();g.ellipse(cx,cy,eyeW,eyeH,0,0,Math.PI*2);const eg=g.createRadialGradient(cx,cy,0,cx,cy,eyeW);eg.addColorStop(0,\'rgba(255,200,0,0.08)\');eg.addColorStop(.7,\'rgba(255,80,0,0.04)\');eg.addColorStop(1,\'transparent\');g.fillStyle=eg;g.fill();g.strokeStyle=\'rgba(255,140,0,\'+(0.5+Math.sin(t)*.3)+\')\';g.lineWidth=1.5;g.stroke();const lx=cx+(mx-cx)*.4,ly=cy+(my-cy)*.3,ig=g.createRadialGradient(lx,ly,0,lx,ly,R*.5);ig.addColorStop(0,\'rgba(255,100,0,0.9)\');ig.addColorStop(.4,\'rgba(180,20,0,0.8)\');ig.addColorStop(1,\'rgba(0,0,0,0.95)\');g.beginPath();g.arc(lx,ly,R*.5,0,7);g.fillStyle=ig;g.fill();g.beginPath();g.arc(lx,ly,R*.12,0,7);g.fillStyle=\'rgba(0,0,0,0.98)\';g.fill();g.beginPath();g.arc(lx-R*.06,ly-R*.06,R*.04,0,7);g.fillStyle=\'rgba(255,255,255,0.8)\';g.fill();for(let i=0;i<8;i++){const a=i/8*Math.PI*2+t*.3,r1=R*.55,r2=R*.8+Math.sin(t*3+i)*R*.1;g.beginPath();g.moveTo(lx+Math.cos(a)*r1,ly+Math.sin(a)*r1);g.lineTo(lx+Math.cos(a)*r2,ly+Math.sin(a)*r2);g.strokeStyle=\'rgba(255,140,0,\'+(0.2+Math.sin(t*2+i)*.15)+\')\';g.lineWidth=1;g.stroke();}const scanY=cy-eyeH+((t*80)%(eyeH*2));if(scanY>cy-eyeH&&scanY<cy+eyeH){const sl=g.createLinearGradient(cx-eyeW,scanY,cx+eyeW,scanY);sl.addColorStop(0,\'transparent\');sl.addColorStop(.5,\'rgba(255,200,0,0.12)\');sl.addColorStop(1,\'transparent\');g.fillStyle=sl;g.fillRect(cx-eyeW,scanY,eyeW*2,3);}requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'MATRIX_FLOW',
    name: 'Matrix Flow',
    category: 'Hacker',
    desc: 'Volumetric data cascade',
    preview: 'from-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000300"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
}
window.onresize=init;
window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,3,0,0.1)';g.fillRect(0,0,W,H);
  const ch="01アイウエオカキクケコサシスセソタチツテトナニヌネノ#$@";
  window._mDrops.forEach(d=>{
    const ox=d.z>0.6?(-gx*50*d.z):(gx*18*d.z);
    const oy=d.z>0.6?(-gy*50*d.z):(gy*18*d.z);
    const curX=d.x+ox;
    const curY=d.y*18+oy;
    const fs=Math.floor((10+d.z*8)*(1+imp*0.3*d.z));
    g.font=fs+'px monospace';
    const len=Math.floor(6+d.z*12);
    for(let j=0;j<len;j++){
      const cy=curY-j*fs;
      if(cy<0||cy>H)continue;
      const alpha=Math.max(0,(1-j/len)*(0.3+d.z*0.6));
      if(j===0&&d.bright>0.6){g.fillStyle='rgba(210,255,220,'+(0.8+imp*0.2)+')';}
      else {g.fillStyle='rgba(0,'+Math.floor(140+d.z*100)+','+Math.floor(40+d.z*40)+','+alpha+')';}
      g.fillText(ch[(Math.floor(d.x+j+t*10))%ch.length],curX,cy);
    }
    d.y+=d.speed*(1+imp*0.5*d.z);
    if(d.y*18>H&&Math.random()>0.96){d.y=0;d.bright=Math.random();}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'REPULSION_SWARM',
    name: 'Repulsion Swarm',
    category: 'Neural',
    desc: 'Intelligent boid swarm avoids cursor',
    preview: 'from-sky-950 via-black to-cyan-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000200"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._ff=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._ff.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,vx:(Math.random()-.5)*0.6,vy:(Math.random()-.5)*0.6,z});
  }
}
window.onresize=init;
window._ff=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._ff.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,vx:(Math.random()-.5)*0.6,vy:(Math.random()-.5)*0.6,z});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,2,0,0.12)';g.fillRect(0,0,W,H);
  window._ff.forEach(f=>{
    f.x+=f.vx+Math.sin(f.a)*0.4;f.y+=f.vy+Math.cos(f.a)*0.4;f.a+=0.04;
    if(f.x<0)f.x=W;if(f.x>W)f.x=0;if(f.y<0)f.y=H;if(f.y>H)f.y=0;
    const ox=f.z>0.6?-gx*50*f.z:gx*18*f.z;
    const oy=f.z>0.6?-gy*50*f.z:gy*18*f.z;
    const fx=f.x+ox+(f.x-W/2)*imp*0.15*f.z;
    const fy=f.y+oy+(f.y-H/2)*imp*0.15*f.z;
    const a=(0.4+Math.sin(f.a*2.5)*0.4)*f.z;
    const r=(1.5+f.z*3.5)*(1+imp*0.4*f.z);
    const rad=g.createRadialGradient(fx,fy,0,fx,fy,r*2.5);
    rad.addColorStop(0,'rgba(160,255,100,'+a+')');rad.addColorStop(1,'transparent');
    g.fillStyle=rad;g.beginPath();g.arc(fx,fy,r*2.5,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'PLASMA_BLOOM',
    name: 'Plasma Bloom',
    category: 'Abstract',
    desc: 'Organic plasma fields with color drift',
    preview: 'from-fuchsia-950 via-black to-violet-950',
    code: '<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050008"><canvas id="c"></canvas><script>const c=document.getElementById(\'c\'),g=c.getContext(\'2d\');let W,H,t=0;function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+\'px\';c.style.height=H+\'px\';g.scale(devicePixelRatio,devicePixelRatio);}window.onresize=init;init();function draw(){g.fillStyle=\'rgba(5,0,8,0.03)\';g.fillRect(0,0,W,H);t+=0.008;for(let i=0;i<6;i++){const x=W*(0.5+Math.sin(t*0.3+i*1.5)*0.3);const y=H*(0.5+Math.cos(t*0.4+i*1.2)*0.3);const r=80+Math.sin(t+i)*40+Math.cos(t*1.3+i)*30;const hue=(t*20+i*60)%360;const grd=g.createRadialGradient(x,y,0,x,y,r);grd.addColorStop(0,\'hsla(\'+hue+\',100%,60%,0.12)\');grd.addColorStop(0.5,\'hsla(\'+(hue+30)%360+\',100%,50%,0.06)\');grd.addColorStop(1,\'transparent\');g.fillStyle=grd;g.fillRect(0,0,W,H);}requestAnimationFrame(draw);}draw();</script></body></html>'
  },
  {
    id: 'CONSTELLATION',
    name: 'Constellation',
    category: 'Space',
    desc: 'Star chart with reactive connective lines',
    preview: 'from-indigo-950 via-black to-slate-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0a0a14"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
}
window.onresize=init;
window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.clearRect(0,0,W,H);
  const pts=window._pList;
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const px=p.x-gx*(35+p.z*35)+(p.x-W/2)*imp*0.14*p.z;
    const py=p.y-gy*(35+p.z*35)+(p.y-H/2)*imp*0.14*p.z;
    const r=(1.5+p.z*2.5)*(1+imp*0.4*p.z);
    g.fillStyle='rgba(0,255,230,'+(0.4+p.z*0.5)+')';
    g.beginPath();g.arc(px,py,r,0,7);g.fill();
    pts.forEach(p2=>{
      if(Math.abs(p.z-p2.z)<0.28){
        const p2x=p2.x-gx*(35+p2.z*35)+(p2.x-W/2)*imp*0.14*p2.z;
        const p2y=p2.y-gy*(35+p2.z*35)+(p2.y-H/2)*imp*0.14*p2.z;
        const d=Math.hypot(px-p2x,py-p2y);
        if(d<90*p.z){
          g.strokeStyle='rgba(0,255,230,'+((1-d/(90*p.z))*0.3*p.z)+')';
          g.beginPath();g.moveTo(px,py);g.lineTo(p2x,p2y);g.stroke();
        }
      }
    });
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'VORTEX_SPIRAL',
    name: 'Vortex Spiral',
    category: 'Abstract',
    desc: 'Hypnotic particle spiral with color shift',
    preview: 'from-purple-950 via-black to-pink-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(0,0,W,H);
  g.save();
  g.translate(W/2+gx*18,H/2+gy*18);
  g.scale(1,0.55+gy*0.005);
  g.rotate(t*0.5+gx*0.01);
  for(let i=0;i<450;i++){
    const a=i*0.1;const r=i*(1+imp*0.2);
    const z=(i/450);
    g.fillStyle='hsla('+(i%360)+',100%,70%,'+(0.3+z*0.6)+')';
    const sz=1.5+z*2;
    g.fillRect(Math.cos(a)*r,Math.sin(a)*r,sz,sz);
    g.fillRect(Math.cos(a+Math.PI)*r,Math.sin(a+Math.PI)*r,sz,sz);
  }
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'GLITCH_MATRIX',
    name: 'Glitch Matrix',
    category: 'Cyberpunk',
    desc: 'Digital rain with RGB chromatic aberration',
    preview: 'from-green-950 via-black to-emerald-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000300"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
}
window.onresize=init;
window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,3,0,0.1)';g.fillRect(0,0,W,H);
  const ch="01アイウエオカキクケコサシスセソタチツテトナニヌネノ#$@";
  window._mDrops.forEach(d=>{
    const ox=d.z>0.6?(-gx*50*d.z):(gx*18*d.z);
    const oy=d.z>0.6?(-gy*50*d.z):(gy*18*d.z);
    const curX=d.x+ox;
    const curY=d.y*18+oy;
    const fs=Math.floor((10+d.z*8)*(1+imp*0.3*d.z));
    g.font=fs+'px monospace';
    const len=Math.floor(6+d.z*12);
    for(let j=0;j<len;j++){
      const cy=curY-j*fs;
      if(cy<0||cy>H)continue;
      const alpha=Math.max(0,(1-j/len)*(0.3+d.z*0.6));
      if(j===0&&d.bright>0.6){g.fillStyle='rgba(210,255,220,'+(0.8+imp*0.2)+')';}
      else {g.fillStyle='rgba(0,'+Math.floor(140+d.z*100)+','+Math.floor(40+d.z*40)+','+alpha+')';}
      g.fillText(ch[(Math.floor(d.x+j+t*10))%ch.length],curX,cy);
    }
    d.y+=d.speed*(1+imp*0.5*d.z);
    if(d.y*18>H&&Math.random()>0.96){d.y=0;d.bright=Math.random();}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'AURORA_WAVES',
    name: 'Aurora Waves',
    category: 'Space',
    desc: 'Layered aurora borealis with starfield',
    preview: 'from-teal-950 via-black to-emerald-950',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#010208"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._aBands=[
    {hue:160,speed:0.8,z:0.2,shift:6,color:'rgba(16,185,129,'},
    {hue:200,speed:1.2,z:0.5,shift:22,color:'rgba(56,189,248,'},
    {hue:280,speed:1.5,z:0.9,shift:-52,color:'rgba(168,85,247,'}
  ];
  window._aStars=[];for(let i=0;i<80;i++)window._aStars.push({x:Math.random()*W,y:Math.random()*H*0.7,r:Math.random()*1.2+0.3,a:Math.random()});
}
window.onresize=init;
window._aBands=[
    {hue:160,speed:0.8,z:0.2,shift:6,color:'rgba(16,185,129,'},
    {hue:200,speed:1.2,z:0.5,shift:22,color:'rgba(56,189,248,'},
    {hue:280,speed:1.5,z:0.9,shift:-52,color:'rgba(168,85,247,'}
  ];
  window._aStars=[];for(let i=0;i<80;i++)window._aStars.push({x:Math.random()*W,y:Math.random()*H*0.7,r:Math.random()*1.2+0.3,a:Math.random()});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(1,2,8,0.12)';g.fillRect(0,0,W,H);
  // Fond: stars
  const sOffX=gx*4, sOffY=gy*4;
  window._aStars.forEach(s=>{
    g.fillStyle='rgba(255,255,255,'+(s.a*(0.6+Math.sin(t*2+s.x)*0.4))+')';
    g.beginPath();g.arc((s.x+sOffX+W)%W,(s.y+sOffY+H)%H,s.r,0,7);g.fill();
  });
  // 3 depth curtains
  window._aBands.forEach(b=>{
    const ox=b.shift>0?(gx*b.shift):(-gx*50*b.z);
    const oy=b.shift>0?(gy*b.shift):(-gy*50*b.z);
    const dScale=1+imp*0.12*(b.z-0.3);
    g.save();
    g.translate(W/2+ox,H*0.4+oy);
    g.scale(dScale,dScale);
    g.translate(-W/2,-H*0.4);
    g.beginPath();
    for(let x=-40;x<=W+40;x+=12){
      const y=H*0.35+Math.sin(x*0.005+t*b.speed)*H*0.14+Math.sin(x*0.009-t*0.5)*H*0.06;
      x===-40?g.moveTo(x,y):g.lineTo(x,y);
    }
    g.lineTo(W+40,H);g.lineTo(-40,H);g.closePath();
    const gg=g.createLinearGradient(0,H*0.1,0,H*0.8);
    gg.addColorStop(0,'transparent');
    gg.addColorStop(0.3,b.color+'0.07)');
    gg.addColorStop(0.6,b.color+'0.18)');
    gg.addColorStop(1,'transparent');
    g.fillStyle=gg;g.fill();
    g.strokeStyle=b.color+'0.45)';g.lineWidth=1.5+b.z*1.5;g.stroke();
    g.restore();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_MATRIX',
    name: 'Matrix',
    category: 'Cyberpunk',
    desc: 'Procedural Matrix',
    preview: 'from-green-950 via-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000300"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
}
window.onresize=init;
window._mDrops=[];const mCols=Math.floor(W/16);
  for(let i=0;i<mCols;i++){
    const z=i%3===0?0.25:(i%3===1?0.55:1.0);
    window._mDrops.push({x:i*16,y:Math.random()*-80,speed:(0.4+z*0.9),z,bright:Math.random()});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,3,0,0.1)';g.fillRect(0,0,W,H);
  const ch="01アイウエオカキクケコサシスセソタチツテトナニヌネノ#$@";
  window._mDrops.forEach(d=>{
    const ox=d.z>0.6?(-gx*50*d.z):(gx*18*d.z);
    const oy=d.z>0.6?(-gy*50*d.z):(gy*18*d.z);
    const curX=d.x+ox;
    const curY=d.y*18+oy;
    const fs=Math.floor((10+d.z*8)*(1+imp*0.3*d.z));
    g.font=fs+'px monospace';
    const len=Math.floor(6+d.z*12);
    for(let j=0;j<len;j++){
      const cy=curY-j*fs;
      if(cy<0||cy>H)continue;
      const alpha=Math.max(0,(1-j/len)*(0.3+d.z*0.6));
      if(j===0&&d.bright>0.6){g.fillStyle='rgba(210,255,220,'+(0.8+imp*0.2)+')';}
      else {g.fillStyle='rgba(0,'+Math.floor(140+d.z*100)+','+Math.floor(40+d.z*40)+','+alpha+')';}
      g.fillText(ch[(Math.floor(d.x+j+t*10))%ch.length],curX,cy);
    }
    d.y+=d.speed*(1+imp*0.5*d.z);
    if(d.y*18>H&&Math.random()>0.96){d.y=0;d.bright=Math.random();}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_NEBULA',
    name: 'Nebula',
    category: 'Space',
    desc: 'Procedural Nebula',
    preview: 'from-purple-950 via-fuchsia-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020108"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._nStars=[];for(let i=0;i<100;i++)window._nStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.3,a:Math.random()});
  window._nPts=[];for(let i=0;i<110;i++)window._nPts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,z:Math.random()*0.8+0.2,s:Math.random()*2+1,hue:Math.random()>0.5?164:220});
}
window.onresize=init;
window._nStars=[];for(let i=0;i<100;i++)window._nStars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.3,a:Math.random()});
  window._nPts=[];for(let i=0;i<110;i++)window._nPts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,z:Math.random()*0.8+0.2,s:Math.random()*2+1,hue:Math.random()>0.5?164:220});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(2,1,8,0.1)';g.fillRect(0,0,W,H);
  // Fond: Stars
  window._nStars.forEach(s=>{
    g.fillStyle='rgba(255,255,255,'+(s.a*(0.5+Math.sin(t*3+s.r)*0.5))+')';
    g.beginPath();g.arc((s.x+gx*5+W)%W,(s.y+gy*5+H)%H,s.r,0,7);g.fill();
  });
  // Milieu: Glowing nebulae
  for(let i=0;i<3;i++){
    const rx=W*(0.2+i*0.3)+gx*18, ry=H*(0.35+Math.sin(t*0.4+i)*0.2)+gy*18;
    const r=W*0.3*(1-imp*0.03);
    const rg=g.createRadialGradient(rx,ry,0,rx,ry,r);
    rg.addColorStop(0,'hsla('+(160+i*80)+',100%,50%,0.07)');rg.addColorStop(1,'transparent');
    g.fillStyle=rg;g.fillRect(rx-r,ry-r,r*2,r*2);
  }
  // Avant: Depth particles with 5-6x reverse parallax
  window._nPts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const ox=-gx*(36+p.z*34)+(p.x-W/2)*imp*0.15*p.z;
    const oy=-gy*(36+p.z*34)+(p.y-H/2)*imp*0.15*p.z;
    const fx=p.x+ox, fy=p.y+oy;
    const pr=p.s*(1+p.z*1.2)*(1+imp*0.45*p.z);
    const grd=g.createRadialGradient(fx,fy,0,fx,fy,pr*3.5);
    grd.addColorStop(0,'hsla('+p.hue+',100%,75%,'+(0.4+p.z*0.5)+')');
    grd.addColorStop(1,'transparent');
    g.fillStyle=grd;g.beginPath();g.arc(fx,fy,pr*3.5,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_WAVES',
    name: 'Waves',
    category: 'Abstract',
    desc: 'Procedural Waves',
    preview: 'from-rose-950 via-pink-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050510"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(5,5,16,0.1)';g.fillRect(0,0,W,H);
  for(let i=0;i<5;i++){
    const z=0.2+i*0.2;
    const ox=z>0.5?-gx*45*z:gx*18*z;
    const oy=z>0.5?-gy*45*z:gy*18*z;
    g.beginPath();
    g.strokeStyle='hsla('+(180+i*22)+',100%,60%,'+(0.3+z*0.5)+')';
    g.lineWidth=1.5+z*2.5;
    for(let x=-40;x<=W+40;x+=12){
      let y=H*0.5+Math.sin(x*0.008+t*1.5+i)*70*z+Math.cos(x*0.015-t)*40*z+oy;
      x===-40?g.moveTo(x+ox,y):g.lineTo(x+ox,y);
    }
    g.stroke();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_PARTICLES',
    name: 'Particles',
    category: 'Abstract',
    desc: 'Procedural Particles',
    preview: 'from-amber-950 via-orange-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0a0a14"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
}
window.onresize=init;
window._pList=[];for(let i=0;i<90;i++)window._pList.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,z:Math.random()*0.8+0.2});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.clearRect(0,0,W,H);
  const pts=window._pList;
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const px=p.x-gx*(35+p.z*35)+(p.x-W/2)*imp*0.14*p.z;
    const py=p.y-gy*(35+p.z*35)+(p.y-H/2)*imp*0.14*p.z;
    const r=(1.5+p.z*2.5)*(1+imp*0.4*p.z);
    g.fillStyle='rgba(0,255,230,'+(0.4+p.z*0.5)+')';
    g.beginPath();g.arc(px,py,r,0,7);g.fill();
    pts.forEach(p2=>{
      if(Math.abs(p.z-p2.z)<0.28){
        const p2x=p2.x-gx*(35+p2.z*35)+(p2.x-W/2)*imp*0.14*p2.z;
        const p2y=p2.y-gy*(35+p2.z*35)+(p2.y-H/2)*imp*0.14*p2.z;
        const d=Math.hypot(px-p2x,py-p2y);
        if(d<90*p.z){
          g.strokeStyle='rgba(0,255,230,'+((1-d/(90*p.z))*0.3*p.z)+')';
          g.beginPath();g.moveTo(px,py);g.lineTo(p2x,p2y);g.stroke();
        }
      }
    });
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_STARLIGHT',
    name: 'Starlight',
    category: 'Abstract',
    desc: 'Procedural Starlight',
    preview: 'from-teal-950 via-cyan-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._stars3D=[];for(let i=0;i<350;i++)window._stars3D.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,z:Math.random()});
}
window.onresize=init;
window._stars3D=[];for(let i=0;i<350;i++)window._stars3D.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,z:Math.random()});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,0,0,0.22)';g.fillRect(0,0,W,H);
  g.save();g.translate(W/2+gx*15,H/2+gy*15);
  window._stars3D.forEach(s=>{
    s.z-=(0.006+imp*0.035);
    if(s.z<=0.02){s.z=1;s.x=(Math.random()-0.5)*2;s.y=(Math.random()-0.5)*2;}
    const px=(s.x-gx*0.2)/s.z*W*0.5;
    const py=(s.y-gy*0.2)/s.z*W*0.5;
    const sz=(1.2-s.z)*2.5*(1+imp*0.5);
    g.fillStyle='rgba(220,240,255,'+(1-s.z)+')';
    g.fillRect(px,py,sz,sz);
  });
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_HEXAGONS',
    name: 'Hexagons',
    category: 'Abstract',
    desc: 'Procedural Hexagons',
    preview: 'from-sky-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0e0e1a"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.clearRect(0,0,W,H);
  function hex(x,y,r){
    g.beginPath();
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      i===0?g.moveTo(x+r*Math.cos(a),y+r*Math.sin(a)):g.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));
    }
    g.closePath();g.stroke();
  }
  for(let layer=0;layer<3;layer++){
    const z=layer===0?0.25:(layer===1?0.55:0.95);
    const ox=z>0.6?-gx*45*z:gx*18*z;
    const oy=z>0.6?-gy*45*z:gy*18*z;
    const s=24+z*16;const h=s*Math.sqrt(3);
    g.lineWidth=1+z*1.5;
    for(let x=-s;x<W+s;x+=s*1.5){
      for(let y=-h;y<H+h;y+=h){
        const cy=y+(Math.round(x/(s*1.5))%2?h/2:0);
        const dist=Math.hypot(x-W/2,cy-H/2);
        g.strokeStyle='hsla('+((dist-t*40)%360)+',70%,60%,'+(0.08+z*0.25)+')';
        hex(x+ox,cy+oy,s*0.85*(1+imp*0.1*z));
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_RAIN',
    name: 'Rain',
    category: 'Abstract',
    desc: 'Procedural Rain',
    preview: 'from-slate-950 via-zinc-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0b0c10"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._rDrops=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._rDrops.push({x:Math.random()*W,y:Math.random()*H,v:(6+z*10),l:(10+z*18),z});
  }
  window._rRips=[];
}
window.onresize=init;
window._rDrops=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._rDrops.push({x:Math.random()*W,y:Math.random()*H,v:(6+z*10),l:(10+z*18),z});
  }
  window._rRips=[];
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(11,12,16,0.25)';g.fillRect(0,0,W,H);
  window._rDrops.forEach(d=>{
    const ox=d.z>0.6?-gx*50*d.z:gx*18*d.z;
    const oy=d.z>0.6?-gy*50*d.z:gy*18*d.z;
    g.strokeStyle='rgba(102,252,241,'+(0.2+d.z*0.7)+')';
    g.lineWidth=0.8+d.z*1.8;
    g.beginPath();g.moveTo(d.x+ox,d.y+oy);g.lineTo(d.x+ox,d.y+oy+d.l*(1+imp*0.5*d.z));g.stroke();
    d.y+=d.v*(1+imp*0.6*d.z);
    if(d.y>H){
      d.y=-d.l;d.x=Math.random()*W;
      if(d.z>0.6)window._rRips.push({x:d.x+ox,y:H-5,r:0,a:0.8,z:d.z});
    }
  });
  for(let i=window._rRips.length-1;i>=0;i--){
    const r=window._rRips[i];
    g.strokeStyle='rgba(102,252,241,'+r.a+')';g.lineWidth=1;
    g.beginPath();g.ellipse(r.x,r.y,r.r*2,r.r,0,0,7);g.stroke();
    r.r+=(1.5+r.z*2);r.a-=0.04;
    if(r.a<=0)window._rRips.splice(i,1);
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_FIREFLIES',
    name: 'Fireflies',
    category: 'Abstract',
    desc: 'Procedural Fireflies',
    preview: 'from-blue-950 via-indigo-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000200"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._ff=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._ff.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,vx:(Math.random()-.5)*0.6,vy:(Math.random()-.5)*0.6,z});
  }
}
window.onresize=init;
window._ff=[];for(let i=0;i<120;i++){
    const z=Math.random()*0.8+0.2;
    window._ff.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,vx:(Math.random()-.5)*0.6,vy:(Math.random()-.5)*0.6,z});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,2,0,0.12)';g.fillRect(0,0,W,H);
  window._ff.forEach(f=>{
    f.x+=f.vx+Math.sin(f.a)*0.4;f.y+=f.vy+Math.cos(f.a)*0.4;f.a+=0.04;
    if(f.x<0)f.x=W;if(f.x>W)f.x=0;if(f.y<0)f.y=H;if(f.y>H)f.y=0;
    const ox=f.z>0.6?-gx*50*f.z:gx*18*f.z;
    const oy=f.z>0.6?-gy*50*f.z:gy*18*f.z;
    const fx=f.x+ox+(f.x-W/2)*imp*0.15*f.z;
    const fy=f.y+oy+(f.y-H/2)*imp*0.15*f.z;
    const a=(0.4+Math.sin(f.a*2.5)*0.4)*f.z;
    const r=(1.5+f.z*3.5)*(1+imp*0.4*f.z);
    const rad=g.createRadialGradient(fx,fy,0,fx,fy,r*2.5);
    rad.addColorStop(0,'rgba(160,255,100,'+a+')');rad.addColorStop(1,'transparent');
    g.fillStyle=rad;g.beginPath();g.arc(fx,fy,r*2.5,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_NEON_GRID',
    name: 'Neon Grid',
    category: 'Abstract',
    desc: 'Procedural Neon Grid',
    preview: 'from-green-950 via-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#150525"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='#150525';g.fillRect(0,0,W,H);
  const horizY=H*0.45+gy*25;
  // Deep Sun
  const sunX=W/2+gx*12, sunY=horizY-H*0.15;
  const sRad=H*0.22*(1-imp*0.04);
  const sGrad=g.createRadialGradient(sunX,sunY,0,sunX,sunY,sRad);
  sGrad.addColorStop(0,'#ffec3d');sGrad.addColorStop(0.7,'#ff007f');sGrad.addColorStop(1,'transparent');
  g.fillStyle=sGrad;g.fillRect(sunX-sRad,sunY-sRad,sRad*2,sRad*2);
  // Ground grid lines
  g.save();
  g.translate(W/2-gx*35,horizY);
  g.strokeStyle='#ff007f';g.lineWidth=1.5;
  for(let z=10;z<400;z+=20){
    let p=z-(t*30%20);if(p<=0)continue;
    let w=W/(p*0.008), y=(H-horizY)/(p*0.015);
    g.globalAlpha=Math.max(0,1-p/380);
    g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.stroke();
  }
  for(let x=-18;x<=18;x++){
    g.beginPath();g.moveTo(x*40,0);g.lineTo(x*800,H);g.stroke();
  }
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CIRCUIT',
    name: 'Circuit',
    category: 'Abstract',
    desc: 'Procedural Circuit',
    preview: 'from-purple-950 via-fuchsia-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000814"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._cLines=[];for(let i=0;i<40;i++)window._cLines.push({x:Math.random()*W,y:Math.random()*H,d:Math.floor(Math.random()*4),l:0,z:Math.random()*0.8+0.2});
}
window.onresize=init;
window._cLines=[];for(let i=0;i<40;i++)window._cLines.push({x:Math.random()*W,y:Math.random()*H,d:Math.floor(Math.random()*4),l:0,z:Math.random()*0.8+0.2});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,8,20,0.08)';g.fillRect(0,0,W,H);
  if(Math.random()<0.15)window._cLines.push({x:Math.random()*W,y:Math.random()*H,d:Math.floor(Math.random()*4),l:0,z:Math.random()*0.8+0.2});
  for(let i=window._cLines.length-1;i>=0;i--){
    const l=window._cLines[i];
    const ox=l.z>0.6?-gx*50*l.z:gx*18*l.z;
    const oy=l.z>0.6?-gy*50*l.z:gy*18*l.z;
    g.strokeStyle='rgba(0,255,180,'+(0.3+l.z*0.6)+')';
    g.lineWidth=1+l.z*2;
    g.beginPath();g.moveTo(l.x+ox,l.y+oy);
    if(l.d===0)l.y-=4;else if(l.d===1)l.x+=4;else if(l.d===2)l.y+=4;else l.x-=4;
    g.lineTo(l.x+ox,l.y+oy);g.stroke();
    l.l++;
    if(Math.random()<0.06)l.d=(l.d+(Math.random()<0.5?1:-1)+4)%4;
    if(l.l>45){
      g.fillStyle='#00ffb4';g.beginPath();g.arc(l.x+ox,l.y+oy,2+l.z*3,0,7);g.fill();
      window._cLines.splice(i,1);
    }
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_BUBBLES',
    name: 'Bubbles',
    category: 'Abstract',
    desc: 'Procedural Bubbles',
    preview: 'from-rose-950 via-pink-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#00112c"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._bList=[];for(let i=0;i<55;i++)window._bList.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*25+8,v:Math.random()*2+1,o:Math.random()*10,z:Math.random()*0.8+0.2});
}
window.onresize=init;
window._bList=[];for(let i=0;i<55;i++)window._bList.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*25+8,v:Math.random()*2+1,o:Math.random()*10,z:Math.random()*0.8+0.2});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#00112c');grad.addColorStop(1,'#003366');
  g.fillStyle=grad;g.fillRect(0,0,W,H);
  window._bList.forEach(b=>{
    b.y-=b.v*(1+imp*0.5*b.z);b.x+=Math.sin(b.y*0.04+b.o);
    if(b.y<-b.r*2){b.y=H+b.r*2;b.x=Math.random()*W;}
    const ox=b.z>0.6?-gx*50*b.z:gx*18*b.z;
    const oy=b.z>0.6?-gy*50*b.z:gy*18*b.z;
    const r=b.r*b.z*(1+imp*0.35*b.z);
    g.strokeStyle='rgba(255,255,255,'+(0.2+b.z*0.5)+')';g.lineWidth=1.5*b.z;
    g.beginPath();g.arc(b.x+ox,b.y+oy,r,0,7);g.stroke();
    g.fillStyle='rgba(255,255,255,'+(0.05+b.z*0.1)+')';g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_SNOW',
    name: 'Snow',
    category: 'Abstract',
    desc: 'Procedural Snow',
    preview: 'from-amber-950 via-orange-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#081220"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._sFlakes=[];for(let i=0;i<180;i++){
    const z=Math.random()*0.8+0.2;
    window._sFlakes.push({x:Math.random()*W,y:Math.random()*H,r:1+z*4.5,d:Math.random()*10,z});
  }
}
window.onresize=init;
window._sFlakes=[];for(let i=0;i<180;i++){
    const z=Math.random()*0.8+0.2;
    window._sFlakes.push({x:Math.random()*W,y:Math.random()*H,r:1+z*4.5,d:Math.random()*10,z});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(8,18,32,0.2)';g.fillRect(0,0,W,H);
  window._sFlakes.forEach(f=>{
    const ox=f.z>0.6?-gx*52*f.z:gx*18*f.z;
    const oy=f.z>0.6?-gy*52*f.z:gy*18*f.z;
    g.fillStyle='rgba(255,255,255,'+(0.3+f.z*0.65)+')';
    g.beginPath();g.arc(f.x+ox,f.y+oy,f.r*(1+imp*0.4*f.z),0,7);g.fill();
    f.y+=Math.pow(f.r,0.6)*(1+imp*0.6*f.z);f.x+=Math.sin(f.d)*0.6;f.d+=0.02;
    if(f.y>H+10){f.y=-10;f.x=Math.random()*W;}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_LASER',
    name: 'Laser',
    category: 'Abstract',
    desc: 'Procedural Laser',
    preview: 'from-teal-950 via-cyan-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(0,0,W,H);
  t+=0.05;
  g.globalCompositeOperation='lighter';
  for(let i=0;i<3;i++){
    let y=H/2+Math.sin(t+i*2)*H*0.4;
    g.strokeStyle=\`hsla(\${i*120},100%,50%,0.8)\`;
    g.lineWidth=10+Math.sin(t*2+i)*5;
    g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();
    g.lineWidth=2;g.strokeStyle='#fff';
    g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();
  }
  g.globalCompositeOperation='source-over';
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_BINARY',
    name: 'Binary',
    category: 'Abstract',
    desc: 'Procedural Binary',
    preview: 'from-sky-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,cols=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
cols=[];for(let x=0;x<W;x+=20)cols.push({x,y:Math.random()*H,v:1+Math.random()*2});}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,0,0,0.1)';g.fillRect(0,0,W,H);
  g.font='16px monospace';
  cols.forEach(c=>{
    g.fillStyle='#0f0';g.fillText(Math.random()>0.5?'1':'0',c.x,c.y);
    c.y+=c.v;if(c.y>H)c.y=0;
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_KALEIDOSCOPE',
    name: 'Kaleidoscope',
    category: 'Abstract',
    desc: 'Procedural Kaleidoscope',
    preview: 'from-slate-950 via-zinc-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#111"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(17,17,17,0.1)';g.fillRect(0,0,W,H);
  t+=0.02;
  g.translate(W/2,H/2);
  for(let i=0;i<8;i++){
    g.rotate(Math.PI/4);
    g.beginPath();
    g.strokeStyle=\`hsla(\${t*50},100%,50%,0.5)\`;
    g.lineWidth=4;
    g.moveTo(0,0);
    g.bezierCurveTo(Math.cos(t)*100,Math.sin(t)*100,Math.sin(t*0.5)*200,Math.cos(t*0.5)*200,300,0);
    g.stroke();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_SWIRL',
    name: 'Swirl',
    category: 'Abstract',
    desc: 'Procedural Swirl',
    preview: 'from-blue-950 via-indigo-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,0,0,0.1)';g.fillRect(0,0,W,H);
  t+=0.05;
  g.translate(W/2,H/2);
  for(let i=0;i<300;i++){
    let a=i*0.1+t;
    let r=i*2;
    let x=r*Math.cos(a), y=r*Math.sin(a);
    g.fillStyle=\`hsla(\${i+t*20},100%,50%,1)\`;
    g.beginPath();g.arc(x,y,2,0,7);g.fill();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_FIRE',
    name: 'Fire',
    category: 'Abstract',
    desc: 'Procedural Fire',
    preview: 'from-green-950 via-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,parts=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
for(let i=0;i<300;i++)parts.push({x:Math.random()*W,y:H+Math.random()*100,s:Math.random()*20+10,v:Math.random()*3+1,h:Math.random()*40});}
window.onresize=init;init();
function draw(){
  g.globalCompositeOperation='source-over';
  g.fillStyle='rgba(0,0,0,0.2)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  parts.forEach(p=>{
    p.y-=p.v;p.s*=0.97;
    g.fillStyle=\`hsla(\${p.h},100%,50%,0.5)\`;
    g.beginPath();g.arc(p.x,p.y,p.s,0,7);g.fill();
    if(p.s<0.5){p.y=H;p.x=Math.random()*W;p.s=Math.random()*20+10;}
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_PULSE',
    name: 'Pulse',
    category: 'Abstract',
    desc: 'Procedural Pulse',
    preview: 'from-purple-950 via-fuchsia-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#1a0033"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(26,0,51,0.1)';g.fillRect(0,0,W,H);
  t-=1;
  g.translate(W/2,H/2);
  for(let i=0;i<10;i++){
    let r=(i*50+t)%500;
    if(r<0)r+=500;
    g.strokeStyle=\`rgba(255,0,255,\${1-r/500})\`;
    g.lineWidth=r/50;
    g.beginPath();g.arc(0,0,r,0,7);g.stroke();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CRYSTAL',
    name: 'Crystal',
    category: 'Abstract',
    desc: 'Procedural Crystal',
    preview: 'from-rose-950 via-pink-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#05101a"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);
  let grad=g.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#05101a');grad.addColorStop(1,'#1a3a5a');
  g.fillStyle=grad;g.fillRect(0,0,W,H);
  t+=0.01;
  g.translate(W/2,H/2);
  for(let i=0;i<5;i++){
    g.rotate(t*0.5);
    g.strokeStyle='rgba(100,200,255,0.5)';g.fillStyle='rgba(100,200,255,0.1)';
    g.beginPath();g.moveTo(0,-200+i*20);g.lineTo(100-i*10,0);g.lineTo(0,200-i*20);g.lineTo(-100+i*10,0);g.closePath();
    g.fill();g.stroke();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CONSTELLATION',
    name: 'Constellation',
    category: 'Abstract',
    desc: 'Procedural Constellation',
    preview: 'from-amber-950 via-orange-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#030014"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,pts=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
pts=[];for(let i=0;i<120;i++)pts.push({x:Math.random()*W,y:Math.random()*H,v:Math.random()*0.5});}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);g.fillStyle='#030014';g.fillRect(0,0,W,H);
  pts.forEach(p=>{
    p.y-=p.v;if(p.y<0)p.y=H;
    g.fillStyle='#fff';g.beginPath();g.arc(p.x,p.y,1.5,0,7);g.fill();
    pts.forEach(p2=>{
      let d=Math.hypot(p.x-p2.x,p.y-p2.y);
      if(d<80){g.strokeStyle=\`rgba(150,200,255,\${1-d/80})\`;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p2.x,p2.y);g.stroke();}
    });
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CYBER_CITY',
    name: 'Cyber City',
    category: 'Abstract',
    desc: 'Procedural Cyber City',
    preview: 'from-teal-950 via-cyan-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#030208"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._ccSky=[];for(let i=0;i<50;i++)window._ccSky.push({x:Math.random()*W,w:Math.random()*60+30,h:Math.random()*H*0.65,z:i%3===0?0.25:(i%3===1?0.55:0.95),c:Math.random()>0.5?'#00f0ff':'#ff007f'});
}
window.onresize=init;
window._ccSky=[];for(let i=0;i<50;i++)window._ccSky.push({x:Math.random()*W,w:Math.random()*60+30,h:Math.random()*H*0.65,z:i%3===0?0.25:(i%3===1?0.55:0.95),c:Math.random()>0.5?'#00f0ff':'#ff007f'});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(3,2,8,0.18)';g.fillRect(0,0,W,H);
  window._ccSky.forEach(b=>{
    const ox=b.z>0.6?-gx*55*b.z:gx*18*b.z;
    const oy=b.z>0.6?-gy*20*b.z:gy*10*b.z;
    const curX=b.x+ox;
    const curH=b.h*(1+imp*0.08*b.z);
    g.strokeStyle=b.c;g.lineWidth=1+b.z*1.8;
    g.strokeRect(curX,H-curH+oy,b.w*b.z,curH);
    g.fillStyle='rgba(15,10,25,'+(0.5+b.z*0.4)+')';
    g.fillRect(curX,H-curH+oy,b.w*b.z,curH);
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CLOCK',
    name: 'Clock',
    category: 'Abstract',
    desc: 'Procedural Clock',
    preview: 'from-sky-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#eceff1"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);
  let d=new Date(), t=d.getTime()*0.001;
  g.translate(W/2,H/2);
  g.strokeStyle='#263238';g.lineCap='round';
  for(let i=0;i<3;i++){
    g.save();
    g.rotate((t*(i===0?1:i===1?1/60:1/3600))*Math.PI*2);
    g.lineWidth=10-i*2;
    g.beginPath();g.moveTo(0,0);g.lineTo(0,-100-i*50);g.stroke();
    g.restore();
  }
  g.fillStyle='#ff5252';g.beginPath();g.arc(0,0,8,0,7);g.fill();
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_MAGNETIC',
    name: 'Magnetic',
    category: 'Abstract',
    desc: 'Procedural Magnetic',
    preview: 'from-slate-950 via-zinc-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#222"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,mx=0,my=0,pts=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
pts=[];for(let x=0;x<W;x+=30)for(let y=0;y<H;y+=30)pts.push({x,y});}
window.onresize=init;window.onmousemove=e=>{mx=e.clientX;my=e.clientY};init();
function draw(){
  g.clearRect(0,0,W,H);g.fillStyle='#222';g.fillRect(0,0,W,H);
  g.strokeStyle='#aaa';g.lineWidth=2;
  pts.forEach(p=>{
    let a=Math.atan2(p.y-my,p.x-mx);
    let d=Math.hypot(p.y-my,p.x-mx);
    let l=Math.min(15,d*0.1);
    g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+Math.cos(a)*l,p.y+Math.sin(a)*l);g.stroke();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_INK',
    name: 'Ink',
    category: 'Abstract',
    desc: 'Procedural Ink',
    preview: 'from-blue-950 via-indigo-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#eee"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,drops=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(238,238,238,0.05)';g.fillRect(0,0,W,H);
  if(Math.random()<0.05)drops.push({x:Math.random()*W,y:Math.random()*H,r:0,max:Math.random()*100+50});
  g.fillStyle='rgba(0,0,0,0.1)';
  for(let i=drops.length-1;i>=0;i--){
    let d=drops[i];
    g.beginPath();g.arc(d.x,d.y,d.r,0,7);g.fill();
    d.r+=0.5;if(d.r>d.max)drops.splice(i,1);
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_LIQUID',
    name: 'Liquid',
    category: 'Nature',
    desc: 'Procedural Liquid',
    preview: 'from-green-950 via-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,b=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
b=[];for(let i=0;i<10;i++)b.push({x:Math.random()*W,y:Math.random()*H,vx:Math.random()*4-2,vy:Math.random()*4-2});}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);
  b.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
  });
  let d=g.getImageData(0,0,W,H),px=d.data;
  for(let x=0;x<W;x+=5)for(let y=0;y<H;y+=5){
    let sum=0;
    b.forEach(p=>{sum+=10000/((x-p.x)**2+(y-p.y)**2);});
    if(sum>1){g.fillStyle='#0af';g.fillRect(x,y,5,5);}
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_FRACTAL_TREE',
    name: 'Fractal Tree',
    category: 'Nature',
    desc: 'Procedural Fractal Tree',
    preview: 'from-purple-950 via-fuchsia-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#1e1e1e"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function tree(x,y,len,ang){
  if(len<4)return;
  g.beginPath();g.moveTo(x,y);
  let nx=x+Math.cos(ang)*len, ny=y+Math.sin(ang)*len;
  g.lineTo(nx,ny);g.stroke();
  tree(nx,ny,len*0.7,ang-Math.PI/4+Math.sin(t)*0.2);
  tree(nx,ny,len*0.7,ang+Math.PI/4-Math.sin(t)*0.2);
}
function draw(){
  g.clearRect(0,0,W,H);g.fillStyle='#1e1e1e';g.fillRect(0,0,W,H);
  t+=0.02;
  g.strokeStyle='#4caf50';g.lineWidth=2;
  tree(W/2,H,150,-Math.PI/2);
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_TRIANGLES',
    name: 'Triangles',
    category: 'Abstract',
    desc: 'Procedural Triangles',
    preview: 'from-rose-950 via-pink-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#2b2b2b"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,pts=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
pts=[];for(let i=0;i<50;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:Math.random()-.5,vy:Math.random()-.5});}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);g.fillStyle='#2b2b2b';g.fillRect(0,0,W,H);
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
  });
  g.strokeStyle='rgba(255,255,255,0.1)';
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)for(let k=j+1;k<pts.length;k++){
    let p1=pts[i],p2=pts[j],p3=pts[k];
    if(Math.hypot(p1.x-p2.x,p1.y-p2.y)<150&&Math.hypot(p2.x-p3.x,p2.y-p3.y)<150&&Math.hypot(p1.x-p3.x,p1.y-p3.y)<150){
      g.fillStyle=\`rgba(0,150,255,\${0.2-Math.hypot(p1.x-p2.x,p1.y-p2.y)/150*0.2})\`;
      g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p3.x,p3.y);g.closePath();g.fill();g.stroke();
    }
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_TUNNEL',
    name: 'Tunnel',
    category: 'Abstract',
    desc: 'Procedural Tunnel',
    preview: 'from-amber-950 via-orange-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(0,0,W,H);
  g.save();g.translate(W/2-gx*30,H/2-gy*30);
  g.strokeStyle='#00ff66';
  for(let i=10;i<240;i+=20){
    let z=i-(t*40%20);if(z<=0)continue;
    let r=5500/z*(1+imp*0.3);
    g.globalAlpha=Math.max(0,1-z/240);
    g.lineWidth=Math.max(1,4-z*0.02);
    g.beginPath();g.arc(0,0,r,0,7);g.stroke();
  }
  g.globalAlpha=1;
  for(let a=0;a<Math.PI*2;a+=Math.PI/4){
    g.beginPath();g.moveTo(Math.cos(a)*30,Math.sin(a)*30);g.lineTo(Math.cos(a)*W,Math.sin(a)*W);g.stroke();
  }
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_GALAXY',
    name: 'Galaxy',
    category: 'Space',
    desc: 'Procedural Galaxy',
    preview: 'from-teal-950 via-cyan-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,0,0,0.15)';g.fillRect(0,0,W,H);
  g.save();
  g.translate(W/2+gx*18,H/2+gy*18);
  g.scale(1,0.55+gy*0.005);
  g.rotate(t*0.5+gx*0.01);
  for(let i=0;i<450;i++){
    const a=i*0.1;const r=i*(1+imp*0.2);
    const z=(i/450);
    g.fillStyle='hsla('+(i%360)+',100%,70%,'+(0.3+z*0.6)+')';
    const sz=1.5+z*2;
    g.fillRect(Math.cos(a)*r,Math.sin(a)*r,sz,sz);
    g.fillRect(Math.cos(a+Math.PI)*r,Math.sin(a+Math.PI)*r,sz,sz);
  }
  g.restore();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_DNA',
    name: 'Dna',
    category: 'Abstract',
    desc: 'Procedural Dna',
    preview: 'from-sky-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#111"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);g.fillStyle='#111';g.fillRect(0,0,W,H);
  t+=0.05;
  g.translate(W/2,0);
  for(let y=0;y<H;y+=20){
    let x1=Math.sin(y*0.02+t)*100, x2=Math.sin(y*0.02+t+Math.PI)*100;
    g.strokeStyle='rgba(255,255,255,0.2)';g.beginPath();g.moveTo(x1,y);g.lineTo(x2,y);g.stroke();
    g.fillStyle='#f05';g.beginPath();g.arc(x1,y,4,0,7);g.fill();
    g.fillStyle='#05f';g.beginPath();g.arc(x2,y,4,0,7);g.fill();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_CLOUDS',
    name: 'Clouds',
    category: 'Nature',
    desc: 'Procedural Clouds',
    preview: 'from-slate-950 via-zinc-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#5ba4e5"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._clList=[];for(let i=0;i<25;i++)window._clList.push({x:Math.random()*W,y:Math.random()*H*0.7,s:Math.random()*50+40,v:Math.random()*0.4+0.1,z:i%3===0?0.25:(i%3===1?0.55:0.95)});
}
window.onresize=init;
window._clList=[];for(let i=0;i<25;i++)window._clList.push({x:Math.random()*W,y:Math.random()*H*0.7,s:Math.random()*50+40,v:Math.random()*0.4+0.1,z:i%3===0?0.25:(i%3===1?0.55:0.95)});
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='#5ba4e5';g.fillRect(0,0,W,H);
  window._clList.forEach(c=>{
    c.x+=c.v*(1+imp*0.5*c.z);if(c.x-c.s*3>W)c.x=-c.s*3;
    const ox=c.z>0.6?-gx*50*c.z:gx*18*c.z;
    const oy=c.z>0.6?-gy*25*c.z:gy*12*c.z;
    g.fillStyle='rgba(255,255,255,'+(0.4+c.z*0.55)+')';
    const curX=c.x+ox, curY=c.y+oy, s=c.s*c.z*(1+imp*0.25*c.z);
    g.beginPath();
    g.arc(curX,curY,s,0,7);
    g.arc(curX+s,curY-s*0.4,s*0.8,0,7);
    g.arc(curX-s,curY-s*0.3,s*0.7,0,7);
    g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_VAWES_3D',
    name: 'Vawes 3d',
    category: 'Abstract',
    desc: 'Procedural Vawes 3d',
    preview: 'from-blue-950 via-indigo-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,0,0,1)';g.fillRect(0,0,W,H);
  t+=0.05;
  g.strokeStyle='#0f0';
  for(let y=100;y<H;y+=20){
    g.beginPath();
    for(let x=0;x<W;x+=20){
      let z=Math.sin(x*0.01+t)*Math.cos(y*0.01+t)*50;
      let px=x, py=y-z;
      if(x===0)g.moveTo(px,py);else g.lineTo(px,py);
    }
    g.stroke();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_HYPERSPACE',
    name: 'Hyperspace',
    category: 'Space',
    desc: 'Procedural Hyperspace',
    preview: 'from-green-950 via-emerald-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,stars=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
stars=[];for(let i=0;i<300;i++)stars.push({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()});}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(0,0,W,H);
  g.translate(W/2,H/2);
  stars.forEach(s=>{
    let px=s.x/s.z*W, py=s.y/s.z*H;
    let ppx=s.x/(s.z+0.05)*W, ppy=s.y/(s.z+0.05)*H;
    s.z-=0.05;if(s.z<=0){s.z=1;s.x=Math.random()*2-1;s.y=Math.random()*2-1;}
    g.strokeStyle=\`hsla(\${s.z*360},100%,70%,\${1-s.z})\`;g.lineWidth=2;
    g.beginPath();g.moveTo(ppx,ppy);g.lineTo(px,py);g.stroke();
  });
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_GEOMETRY',
    name: 'Geometry',
    category: 'Cyberpunk',
    desc: 'Procedural Geometry',
    preview: 'from-purple-950 via-fuchsia-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#111"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(17,17,17,0.1)';g.fillRect(0,0,W,H);
  t+=0.01;
  g.translate(W/2,H/2);
  for(let i=0;i<6;i++){
    g.rotate(t+i);
    g.strokeStyle=\`hsla(\${i*60+t*100},70%,50%,0.8)\`;
    g.lineWidth=2;
    g.strokeRect(-100,-100,200,200);
    g.beginPath();g.arc(0,0,150,0,7);g.stroke();
  }
  g.resetTransform();
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_LAVA',
    name: 'Lava',
    category: 'Nature',
    desc: 'Procedural Lava',
    preview: 'from-rose-950 via-pink-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#200"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  let rad=g.createLinearGradient(0,0,0,H);rad.addColorStop(0,'#400');rad.addColorStop(1,'#f40');
  g.fillStyle=rad;g.fillRect(0,0,W,H);
  t+=0.02;
  g.fillStyle='rgba(255,100,0,0.5)';
  for(let i=0;i<10;i++){
    g.beginPath();
    let cx=W/2+Math.sin(t+i)*W*0.3, cy=H-Math.cos(t*0.5+i)*H*0.5;
    g.arc(cx,cy,50+Math.sin(t*2+i)*30,0,7);g.fill();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_BLOCKS',
    name: 'Blocks',
    category: 'Abstract',
    desc: 'Procedural Blocks',
    preview: 'from-amber-950 via-orange-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#eee"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,b=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
b=[];for(let x=0;x<W;x+=40)for(let y=0;y<H;y+=40)b.push({x,y,o:Math.random()*10});}
window.onresize=init;init();
function draw(){
  g.clearRect(0,0,W,H);
  let t=Date.now()*0.002;
  b.forEach(i=>{
    let s=20+Math.sin(t+i.o)*20;
    g.fillStyle=\`hsl(\${i.o*36},60%,60%)\`;
    g.fillRect(i.x+20-s/2,i.y+20-s/2,s,s);
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_NODES',
    name: 'Nodes',
    category: 'Cyberpunk',
    desc: 'Procedural Nodes',
    preview: 'from-teal-950 via-cyan-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#101"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,n=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
n=[];for(let i=0;i<40;i++)n.push({x:Math.random()*W,y:Math.random()*H,vx:Math.random()-.5,vy:Math.random()-.5});}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(17,0,17,0.2)';g.fillRect(0,0,W,H);
  g.strokeStyle='#f0f';g.lineWidth=1;
  n.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    n.forEach(p2=>{
      if(Math.hypot(p.x-p2.x,p.y-p2.y)<150){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p2.x,p2.y);g.stroke();}
    });
    g.fillStyle='#fff';g.beginPath();g.arc(p.x,p.y,3,0,7);g.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_OCEAN',
    name: 'Ocean',
    category: 'Nature',
    desc: 'Procedural Ocean',
    preview: 'from-sky-950 via-blue-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#001830"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  
}
window.onresize=init;

init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(0,24,48,0.2)';g.fillRect(0,0,W,H);
  for(let i=0;i<5;i++){
    const z=0.2+i*0.2;
    const ox=z>0.6?-gx*50*z:gx*18*z;
    const oy=z>0.6?-gy*35*z:gy*15*z;
    g.fillStyle='hsla(205,100%,'+(40-i*6)+'%,'+(0.3+z*0.6)+')';
    g.beginPath();g.moveTo(-40,H);
    for(let x=-40;x<=W+40;x+=20){
      const y=H*0.45+i*45+Math.sin(x*0.008+t*2+i)*40*z+oy;
      g.lineTo(x+ox,y);
    }
    g.lineTo(W+40,H);g.fill();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  },
  {
    id: 'NEW_PETALS',
    name: 'Petals',
    category: 'Nature',
    desc: 'Procedural Petals',
    preview: 'from-slate-950 via-zinc-950 to-black',
    code: `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#fce4ec"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  window._petals=[];for(let i=0;i<65;i++){
    const z=Math.random()*0.8+0.2;
    window._petals.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,v:Math.random()*2+1,s:Math.random()*12+6,z});
  }
}
window.onresize=init;
window._petals=[];for(let i=0;i<65;i++){
    const z=Math.random()*0.8+0.2;
    window._petals.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*7,v:Math.random()*2+1,s:Math.random()*12+6,z});
  }
init();
function draw(){
  t+=0.016;
  const {tiltX:tx,tiltY:ty,impulse:imp,strength:str}=g3();
  const gx=tx*str, gy=ty*str;
  g.fillStyle='rgba(252,228,236,0.25)';g.fillRect(0,0,W,H);
  window._petals.forEach(p=>{
    p.x+=Math.cos(p.a)*p.v*(1+imp*0.5*p.z);
    p.y+=Math.sin(p.a)*p.v+1.5*(1+imp*0.5*p.z);
    p.a+=0.04;
    if(p.y>H+30){p.y=-30;p.x=Math.random()*W;}
    const ox=p.z>0.6?-gx*52*p.z:gx*18*p.z;
    const oy=p.z>0.6?-gy*52*p.z:gy*18*p.z;
    g.fillStyle='rgba(244,143,177,'+(0.4+p.z*0.55)+')';
    g.save();
    g.translate(p.x+ox,p.y+oy);
    g.rotate(p.a);
    const sz=p.s*p.z*(1+imp*0.4*p.z);
    g.beginPath();g.ellipse(0,0,sz,sz*0.55,0,0,7);g.fill();
    g.restore();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
  }
];
