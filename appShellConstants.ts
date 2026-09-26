import { LAZYSIRN_WALLPAPER_HTML, LAZYSIRN_WALLPAPER_ID } from './kernel/wallpaperLazySiren';

export const DESKTOP_DIR_FALLBACK_USER = 'user';

export const PROCEDURAL_WALLPAPERS: Record<string, string> = {
  [LAZYSIRN_WALLPAPER_ID]: LAZYSIRN_WALLPAPER_HTML,
  // 1. COSMIC NEBULA 3D - True Volumetric 3D Celestial Universe
  'nexus://procedural/nebula': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#020208"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,stars=[],nebulae=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  stars=[];
  for(let i=0;i<750;i++){
    stars.push({
      x:(Math.random()-0.5)*2600,
      y:(Math.random()-0.5)*2000,
      z:Math.random()*1500+80,
      sz:Math.random()*1.8+0.5,
      hue:Math.random()>0.6?195:(Math.random()>0.5?275:160),
      blink:Math.random()*Math.PI*2
    });
  }
  nebulae=[
    {x:-280,y:-140,z:950,r:460,color:'rgba(16,185,129,',h:160},
    {x:320,y:90,z:1100,r:520,color:'rgba(56,189,248,',h:200},
    {x:40,y:240,z:850,r:420,color:'rgba(168,85,247,',h:280},
    {x:-160,y:260,z:1250,r:390,color:'rgba(244,63,94,',h:340}
  ];
}
window.onresize=init;
init();
function draw(){
  time+=0.008;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-tiltY*0.5)*str;
  const yaw=(tiltX*0.5)*str;
  const cosP=Math.cos(pitch), sinP=Math.sin(pitch);
  const cosY=Math.cos(yaw), sinY=Math.sin(yaw);
  const fov=620*(1+imp*0.14);

  g.fillStyle='#020209';g.fillRect(0,0,W,H);

  nebulae.forEach(n=>{
    let nx=n.x+Math.sin(time*0.4)*35;
    let ny=n.y+Math.cos(time*0.35)*25;
    let nz=n.z-imp*140;
    let x1=nx*cosY-nz*sinY;
    let z1=nx*sinY+nz*cosY;
    let y1=ny*cosP-z1*sinP;
    let z2=ny*sinP+z1*cosP;
    if(z2>60){
      let sx=W/2+(x1*fov)/z2;
      let sy=H/2+(y1*fov)/z2;
      let sr=(n.r*fov)/z2;
      let grd=g.createRadialGradient(sx,sy,0,sx,sy,sr);
      grd.addColorStop(0,n.color+'0.08)');
      grd.addColorStop(0.5,n.color+'0.025)');
      grd.addColorStop(1,'transparent');
      g.fillStyle=grd;
      g.fillRect(sx-sr,sy-sr,sr*2,sr*2);
    }
  });

  for(let i=0;i<stars.length;i++){
    const s=stars[i];
    let sz=s.z-time*20-imp*160;
    while(sz<80)sz+=1500;
    while(sz>1580)sz-=1500;
    let x1=s.x*cosY-sz*sinY;
    let z1=s.x*sinY+sz*cosY;
    let y1=s.y*cosP-z1*sinP;
    let z2=y1*sinP+z1*cosP;
    if(z2>50){
      let sx=W/2+(x1*fov)/z2;
      let sy=H/2+(y1*fov)/z2;
      if(sx>=0&&sx<=W&&sy>=0&&sy<=H){
        let alpha=(1-z2/1600)*(0.55+Math.sin(time*3+s.blink)*0.45);
        let radius=Math.max(0.6,(s.sz*fov)/z2);
        g.fillStyle='hsla('+s.hue+',85%,90%,'+alpha+')';
        g.beginPath();g.arc(sx,sy,radius,0,Math.PI*2);g.fill();
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 2. NEON GRID HORIZON 3D - 80s Synthwave Infinite Wireframe Mountain Plain
  'nexus://procedural/neon-grid': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#0d021a"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0;
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
  time+=0.02;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-tiltY*0.45)*str;
  const yaw=(tiltX*0.45)*str;
  const fov=480*(1+imp*0.12);
  const horizonY=H*0.46+pitch*H*0.4;
  const camX=yaw*W*0.35;

  g.fillStyle='#090114';g.fillRect(0,0,W,H);

  // Glowing Synthwave Sun at vanishing point
  const sunX=W/2-camX*0.3;
  const sunY=horizonY-H*0.12;
  const sRad=Math.min(W,H)*0.22;
  const sGrad=g.createRadialGradient(sunX,sunY,0,sunX,sunY,sRad);
  sGrad.addColorStop(0,'#ffe600');
  sGrad.addColorStop(0.5,'#ff007f');
  sGrad.addColorStop(1,'transparent');
  g.fillStyle=sGrad;
  g.fillRect(sunX-sRad,sunY-sRad,sRad*2,sRad*2);

  // Sun horizontal scanline slats
  g.fillStyle='#090114';
  for(let y=sunY;y<sunY+sRad;y+=11){
    const h=(y-sunY)*0.08+1.5;
    g.fillRect(sunX-sRad,y,sRad*2,h);
  }

  // Neon Horizon haze
  const hGrad=g.createLinearGradient(0,horizonY-30,0,horizonY+60);
  hGrad.addColorStop(0,'transparent');
  hGrad.addColorStop(0.4,'rgba(255,0,128,0.3)');
  hGrad.addColorStop(1,'transparent');
  g.fillStyle=hGrad;
  g.fillRect(0,horizonY-30,W,90);

  // 3D Perspective Ground Grid & Mountains
  const groundY=130;
  const speed=(time*180)%80;

  // Transverse horizontal grid lines
  g.strokeStyle='rgba(255,0,128,0.7)';
  g.lineWidth=1.2;
  for(let z=80;z<1600;z+=80){
    let curZ=z-speed;
    if(curZ<50)continue;
    let sy=horizonY+(groundY*fov)/curZ;
    let alpha=Math.max(0,1-curZ/1500);
    g.strokeStyle='rgba(255,0,128,'+(alpha*0.8)+')';
    g.beginPath();g.moveTo(0,sy);g.lineTo(W,sy);g.stroke();
  }

  // Longitudinal lines extending into distance
  g.strokeStyle='rgba(0,240,255,0.6)';
  for(let x=-1400;x<=1400;x+=100){
    g.beginPath();
    let first=true;
    for(let z=60;z<1600;z+=120){
      let px=x-camX;
      // Add wireframe mountain ridges on edges
      let distFromCenter=Math.abs(x);
      let mHeight=0;
      if(distFromCenter>300){
        mHeight=Math.sin(x*0.015+z*0.01)*80+Math.cos(x*0.008)*120*(distFromCenter/800);
      }
      let sy=horizonY+((groundY-mHeight)*fov)/z;
      let sx=W/2+(px*fov)/z;
      if(first){g.moveTo(sx,sy);first=false;}
      else g.lineTo(sx,sy);
    }
    g.stroke();
  }

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 3. CYBER CITY 3D - 3D Perspective Skyscraper Avenue with Illuminated Facades
  'nexus://procedural/cyber-city': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#03020c"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0,buildings=[],traffic=[];
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  buildings=[];
  // Layout buildings along left and right side of central avenue
  for(let i=0;i<28;i++){
    const side=i%2===0?-1:1;
    const z=(Math.floor(i/2)+1)*140+Math.random()*40;
    const x=side*(220+Math.random()*120);
    const w=120+Math.random()*80;
    const h=320+Math.random()*260;
    const hue=i%3===0?185:(i%3===1?320:270);
    buildings.push({x,w,h,z,side,hue,seed:Math.random()});
  }
  traffic=[];
  for(let i=0;i<35;i++){
    traffic.push({
      x:(Math.random()-0.5)*180,
      y:105,
      z:Math.random()*2000+80,
      speed:Math.random()*8+12,
      side:Math.random()>0.5?1:-1,
      color:Math.random()>0.5?'#00f0ff':'#ff0055'
    });
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.016;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-tiltY*0.4)*str;
  const yaw=(tiltX*0.45)*str;
  const fov=520*(1+imp*0.14);
  const camX=yaw*W*0.45;
  const horizonY=H*0.48+pitch*H*0.35;

  g.fillStyle='#020108';g.fillRect(0,0,W,H);

  // Distant neon skyline glow
  const grad=g.createRadialGradient(W/2-camX*0.2,horizonY,0,W/2-camX*0.2,horizonY,W*0.6);
  grad.addColorStop(0,'rgba(168,85,247,0.22)');
  grad.addColorStop(0.5,'rgba(0,240,255,0.08)');
  grad.addColorStop(1,'transparent');
  g.fillStyle=grad;g.fillRect(0,0,W,H);

  // Sort 3D buildings back to front
  buildings.sort((a,b)=>b.z-a.z);

  buildings.forEach(b=>{
    const z=b.z;
    if(z<60)return;
    const px=b.x-camX;
    const sx=W/2+(px*fov)/z;
    const sw=(b.w*fov)/z;
    const groundY=110;
    const sy=horizonY+(groundY*fov)/z;
    const sh=(b.h*fov)/z;

    const alpha=Math.max(0.2,1-z/2200);

    // Dark building body
    g.fillStyle='rgba(6,5,16,'+(0.85*alpha)+')';
    g.fillRect(sx-sw/2,sy-sh,sw,sh);

    // Neon edge lighting
    g.strokeStyle='hsla('+b.hue+',100%,60%,'+(0.6*alpha)+')';
    g.lineWidth=1.4;
    g.strokeRect(sx-sw/2,sy-sh,sw,sh);

    // Window grid
    g.fillStyle='hsla('+b.hue+',100%,75%,'+(0.4*alpha)+')';
    const rows=8, cols=4;
    const winW=sw/cols*0.45, winH=sh/rows*0.35;
    for(let r=1;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(Math.sin(b.seed*100+r*7+c*13)>0.1){
          const wx=sx-sw/2+c*(sw/cols)+winW*0.5;
          const wy=sy-sh+r*(sh/rows);
          g.fillRect(wx,wy,winW,winH);
        }
      }
    }
  });

  // 3D Flying Traffic Trails
  traffic.forEach(t=>{
    t.z-=t.speed;
    if(t.z<50)t.z=2100;
    const sx=W/2+((t.x-camX)*fov)/t.z;
    const sy=horizonY+(t.y*fov)/t.z;
    const len=Math.max(4,(60*fov)/t.z);
    g.strokeStyle=t.color;
    g.lineWidth=Math.max(1,(2.5*fov)/t.z);
    g.beginPath();g.moveTo(sx,sy);g.lineTo(sx,sy-len*0.2);g.stroke();
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 4. MATRIX 3D - Volumetric 3D Digital Rain with True Z-Depth Projection
  'nexus://procedural/matrix': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000400"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0,columns=[];
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
const glyphs="01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンXYZ789";
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  columns=[];
  for(let i=0;i<120;i++){
    columns.push({
      x:(Math.random()-0.5)*2200,
      z:Math.random()*1200+80,
      y:Math.random()*-1500,
      speed:Math.random()*4+5,
      chars:[],
      len:Math.floor(Math.random()*16+10)
    });
    for(let j=0;j<26;j++){
      columns[i].chars.push(glyphs[Math.floor(Math.random()*glyphs.length)]);
    }
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.016;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-tiltY*0.45)*str;
  const yaw=(tiltX*0.45)*str;
  const cosP=Math.cos(pitch), sinP=Math.sin(pitch);
  const cosY=Math.cos(yaw), sinY=Math.sin(yaw);
  const fov=560*(1+imp*0.15);

  g.fillStyle='rgba(0,3,1,0.2)';g.fillRect(0,0,W,H);

  columns.forEach(col=>{
    col.y+=col.speed;
    if(col.y>1200)col.y=-1200;

    // Rotate with 3D camera
    const cz=col.z-imp*100;
    const x1=col.x*cosY-cz*sinY;
    const z1=col.x*sinY+cz*cosY;
    const y1=col.y*cosP-z1*sinP;
    const z2=col.y*sinP+z1*cosP;

    if(z2>50){
      const scale=fov/z2;
      const sx=W/2+x1*scale;
      const sy=H/2+y1*scale;
      const fontSize=Math.max(6,Math.floor(18*scale));
      g.font=fontSize+'px monospace';

      for(let j=0;j<col.len;j++){
        const cy=sy-j*fontSize*1.15;
        if(cy>=-20&&cy<=H+20){
          if(j===0){
            g.fillStyle='#ffffff';
          } else {
            const alpha=(1-j/col.len)*(1-z2/1400);
            g.fillStyle='rgba(0,255,110,'+Math.max(0.05,alpha)+')';
          }
          const ch=col.chars[(j+Math.floor(time*5))%col.chars.length];
          g.fillText(ch,sx,cy);
        }
      }
    }
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 5. WARP TUNNEL 3D - Hyperspace Infinite Hexagonal Cyber Tunnel
  'nexus://procedural/tunnel': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0;
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
  time+=0.02;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=500*(1+imp*0.18);
  const steerX=tiltX*str*W*0.35;
  const steerY=-tiltY*str*H*0.35;

  g.fillStyle='#010106';g.fillRect(0,0,W,H);

  const sides=6;
  const tunnelR=320;
  const speed=(time*320)%120;

  // Concentric tunnel rings flying toward viewer
  for(let z=60;z<1600;z+=120){
    const curZ=z-speed;
    if(curZ<40)continue;
    const r=(tunnelR*fov)/curZ;
    // Curved tunnel trajectory
    const cx=W/2+steerX*(1-curZ/1600);
    const cy=H/2+steerY*(1-curZ/1600);
    const rot=time*0.4+curZ*0.002;
    const alpha=Math.max(0,1-curZ/1500);

    g.strokeStyle='hsla('+(180+curZ*0.1)+',100%,65%,'+(alpha*0.85)+')';
    g.lineWidth=Math.max(1,(2.5*fov)/curZ);
    g.beginPath();
    for(let s=0;s<=sides;s++){
      const a=rot+(s/sides)*Math.PI*2;
      const px=cx+Math.cos(a)*r;
      const py=cy+Math.sin(a)*r;
      s===0?g.moveTo(px,py):g.lineTo(px,py);
    }
    g.stroke();
  }

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 6. SPIRAL GALAXY 3D - 3D Logarithmic Stellar Disk in Deep Space
  'nexus://procedural/galaxy': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000005"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,stars=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  stars=[];
  const count=1600;
  for(let i=0;i<count;i++){
    const arm=i%2===0?0:Math.PI;
    const dist=Math.pow(Math.random(),2)*750+20;
    const angle=arm+dist*0.0065+(Math.random()-0.5)*0.55;
    const x=Math.cos(angle)*dist;
    const y=Math.sin(angle)*dist;
    const z=(Math.random()-0.5)*75*(1-dist/850);
    const hue=dist<180?45:(dist<420?190:280);
    stars.push({x,y,z,hue,sz:Math.random()*1.4+0.5});
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.006;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-0.75-tiltY*0.4)*str;
  const yaw=(time*0.5+tiltX*0.45)*str;
  const cosP=Math.cos(pitch), sinP=Math.sin(pitch);
  const cosY=Math.cos(yaw), sinY=Math.sin(yaw);
  const fov=620*(1+imp*0.15);

  g.fillStyle='#010106';g.fillRect(0,0,W,H);

  // Core Glow
  const coreGrad=g.createRadialGradient(W/2,H/2,0,W/2,H/2,160);
  coreGrad.addColorStop(0,'rgba(255,235,180,0.25)');
  coreGrad.addColorStop(0.5,'rgba(0,240,255,0.06)');
  coreGrad.addColorStop(1,'transparent');
  g.fillStyle=coreGrad;g.fillRect(0,0,W,H);

  for(let i=0;i<stars.length;i++){
    const s=stars[i];
    // Rotate around galactic center
    const x1=s.x*cosY-s.y*sinY;
    const y1=s.x*sinY+s.y*cosY;
    const z1=s.z;

    // Pitch inclination
    const y2=y1*cosP-z1*sinP;
    const z2=y1*sinP+z1*cosP+900-imp*140;

    if(z2>50){
      const sx=W/2+(x1*fov)/z2;
      const sy=H/2+(y2*fov)/z2;
      const radius=Math.max(0.6,(s.sz*fov)/z2);
      const alpha=(1-z2/1800);
      g.fillStyle='hsla('+s.hue+',90%,85%,'+alpha+')';
      g.beginPath();g.arc(sx,sy,radius,0,Math.PI*2);g.fill();
    }
  }

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 7. OCEAN SWELL 3D - 3D Perspective Wave Grid with Atmospheric Moonlight
  'nexus://procedural/ocean': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000a16"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0;
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
  time+=0.024;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const pitch=(-tiltY*0.4)*str;
  const yaw=(tiltX*0.4)*str;
  const fov=520*(1+imp*0.14);
  const horizonY=H*0.44+pitch*H*0.35;
  const camX=yaw*W*0.35;

  g.fillStyle='#000812';g.fillRect(0,0,W,H);

  // Distant Moon & Specular Reflection
  const moonX=W/2-camX*0.2;
  const moonY=horizonY-H*0.14;
  const moonGrad=g.createRadialGradient(moonX,moonY,0,moonX,moonY,H*0.3);
  moonGrad.addColorStop(0,'rgba(210,245,255,0.22)');
  moonGrad.addColorStop(1,'transparent');
  g.fillStyle=moonGrad;g.fillRect(0,0,W,H);

  // 3D Wave Grid
  const rows=32, cols=28;
  const spacingX=80, spacingZ=50;

  for(let r=rows;r>=1;r--){
    const z=r*spacingZ+50;
    g.beginPath();
    for(let c=-cols/2;c<=cols/2;c++){
      const x=c*spacingX-camX;
      const waveH=Math.sin(c*0.4+time*1.8)*22+Math.cos(r*0.3-time*1.2)*18+Math.sin((c+r)*0.25+time)*12;
      const sx=W/2+(x*fov)/z;
      const sy=horizonY+((80-waveH)*fov)/z;
      c===-cols/2?g.moveTo(sx,sy):g.lineTo(sx,sy);
    }
    const alpha=Math.max(0.1,1-z/1600);
    g.strokeStyle='rgba(56,189,248,'+(alpha*0.7)+')';
    g.lineWidth=Math.max(0.8,(1.8*fov)/z);
    g.stroke();
  }

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 8. ISOMETRIC HEXAGONS 3D - 3D Honeycomb Floating Terrain with Wave Displacement
  'nexus://procedural/hexagons': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#050510"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0;
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
  time+=0.02;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=500*(1+imp*0.14);
  const rotX=tiltX*str*0.35;
  const rotY=tiltY*str*0.35;

  g.fillStyle='#04040c';g.fillRect(0,0,W,H);

  const hexR=34;
  const dx=hexR*Math.sqrt(3);
  const dy=hexR*1.5;
  const cols=Math.ceil(W/dx)+4;
  const rows=Math.ceil(H/dy)+4;

  for(let r=-2;r<rows;r++){
    for(let c=-2;c<cols;c++){
      const x=c*dx+(r%2===0?0:dx/2)+rotX*40;
      const y=r*dy+rotY*40;
      const dist=Math.hypot(x-W/2,y-H/2);
      const wave=Math.sin(dist*0.015-time*2.5)*18;
      const curR=Math.max(4,hexR-2+wave*0.15);

      g.beginPath();
      for(let s=0;s<6;s++){
        const a=(s/6)*Math.PI*2+Math.PI/6;
        const px=x+Math.cos(a)*curR;
        const py=y+Math.sin(a)*curR-wave;
        s===0?g.moveTo(px,py):g.lineTo(px,py);
      }
      g.closePath();
      const alpha=0.35+Math.sin(dist*0.01-time)*0.3;
      g.strokeStyle='hsla('+(210+wave*3)+',100%,65%,'+alpha+')';
      g.fillStyle='rgba(10,14,35,0.7)';
      g.fill();
      g.lineWidth=1.2;
      g.stroke();
    }
  }

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 9. AURORA BOREALIS 3D - 3D Mountain Horizon & Shimmering Polar Curtains
  'nexus://procedural/aurora': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#010408"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,stars=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  stars=[];
  for(let i=0;i<180;i++){
    stars.push({x:Math.random()*W,y:Math.random()*H*0.7,r:Math.random()*1.2+0.4,a:Math.random()});
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.012;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const shiftX=tiltX*str*35;
  const shiftY=tiltY*str*25;

  g.fillStyle='#01030a';g.fillRect(0,0,W,H);

  // Background Stars
  stars.forEach(s=>{
    g.fillStyle='rgba(255,255,255,'+(s.a*(0.6+Math.sin(time*2+s.x)*0.4))+')';
    g.beginPath();g.arc((s.x+shiftX*0.3+W)%W,(s.y+shiftY*0.3+H)%H,s.r,0,Math.PI*2);g.fill();
  });

  // 3 Layers of 3D Aurora Curtains
  const curtains=[
    {color:'rgba(16,185,129,',speed:0.8,depth:0.4,yOff:0.3},
    {color:'rgba(56,189,248,',speed:1.2,depth:0.7,yOff:0.38},
    {color:'rgba(168,85,247,',speed:1.5,depth:1.0,yOff:0.46}
  ];

  curtains.forEach(c=>{
    const ox=shiftX*c.depth;
    const oy=shiftY*c.depth;
    g.beginPath();
    for(let x=-40;x<=W+40;x+=16){
      const y=H*c.yOff+Math.sin(x*0.006+time*c.speed)*H*0.14+Math.sin(x*0.012-time*0.6)*H*0.06+oy;
      x===-40?g.moveTo(x+ox,y):g.lineTo(x+ox,y);
    }
    g.lineTo(W+40,H);g.lineTo(-40,H);g.closePath();
    const grad=g.createLinearGradient(0,H*0.15,0,H*0.75);
    grad.addColorStop(0,'transparent');
    grad.addColorStop(0.3,c.color+'0.08)');
    grad.addColorStop(0.6,c.color+'0.22)');
    grad.addColorStop(1,'transparent');
    g.fillStyle=grad;g.fill();
    g.strokeStyle=c.color+'0.55)';g.lineWidth=1.5+c.depth;g.stroke();
  });

  // Foreground Silhouetted Mountains
  g.fillStyle='#020508';
  g.beginPath();
  g.moveTo(0,H);
  for(let x=0;x<=W;x+=20){
    const my=H*0.82-Math.sin(x*0.005)*55-Math.sin(x*0.012)*30+shiftY*1.2;
    g.lineTo(x,my);
  }
  g.lineTo(W,H);g.closePath();g.fill();

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 10. HYPERSPACE STARLIGHT 3D - 3D Warp Speed Star Flight
  'nexus://procedural/starlight': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,stars=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  stars=[];
  for(let i=0;i<800;i++){
    stars.push({
      x:(Math.random()-0.5)*2000,
      y:(Math.random()-0.5)*1600,
      z:Math.random()*1500+20,
      pz:0
    });
    stars[i].pz=stars[i].z;
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.016;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=480;
  const speed=18+imp*45;
  const steerX=tiltX*str*300;
  const steerY=tiltY*str*300;

  g.fillStyle='rgba(0,0,4,0.25)';g.fillRect(0,0,W,H);

  stars.forEach(s=>{
    s.pz=s.z;
    s.z-=speed;
    if(s.z<=10){
      s.z=1500;
      s.pz=1500;
      s.x=(Math.random()-0.5)*2000;
      s.y=(Math.random()-0.5)*1600;
    }
    const sx=W/2+((s.x-steerX)*fov)/s.z;
    const sy=H/2+((s.y-steerY)*fov)/s.z;
    const px=W/2+((s.x-steerX)*fov)/s.pz;
    const py=H/2+((s.y-steerY)*fov)/s.pz;

    if(sx>=0&&sx<=W&&sy>=0&&sy<=H){
      const alpha=Math.min(1,(1-s.z/1500)*1.5);
      g.strokeStyle='rgba(200,240,255,'+alpha+')';
      g.lineWidth=Math.max(1,(2.5*fov)/s.z);
      g.beginPath();g.moveTo(px,py);g.lineTo(sx,sy);g.stroke();
    }
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 11. QUANTUM CORE 3D - 3D Oblique Motherboard Processor Bus
  'nexus://procedural/circuit': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000812"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,time=0,traces=[];
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  traces=[];
  for(let i=0;i<45;i++){
    const x=(i-22)*38;
    traces.push({x,z:Math.random()*800+100,speed:Math.random()*6+8,color:i%2===0?'#00f0ff':'#10b981'});
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.02;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=520*(1+imp*0.14);
  const horizonY=H*0.48+(-tiltY*0.4)*str*H*0.3;
  const camX=tiltX*str*W*0.35;

  g.fillStyle='#01070e';g.fillRect(0,0,W,H);

  // Central Die
  const dieZ=380;
  const dieX=W/2-camX;
  const dieY=horizonY+(60*fov)/dieZ;
  const dieW=(280*fov)/dieZ, dieH=(160*fov)/dieZ;

  g.fillStyle='rgba(6,22,38,0.9)';
  g.fillRect(dieX-dieW/2,dieY-dieH/2,dieW,dieH);
  g.strokeStyle='#00f0ff';g.lineWidth=2;
  g.strokeRect(dieX-dieW/2,dieY-dieH/2,dieW,dieH);

  // Traces spreading out from chip in 3D
  traces.forEach(t=>{
    const px=t.x-camX;
    g.strokeStyle='rgba(0,240,255,0.4)';
    g.lineWidth=1.2;
    g.beginPath();
    const sx1=W/2+(px*fov)/100;
    const sy1=horizonY+(110*fov)/100;
    const sx2=W/2+(px*fov)/900;
    const sy2=horizonY+(110*fov)/900;
    g.moveTo(sx1,sy1);g.lineTo(sx2,sy2);g.stroke();

    // Data packet
    t.z-=t.speed;
    if(t.z<80)t.z=900;
    const bx=W/2+(px*fov)/t.z;
    const by=horizonY+(110*fov)/t.z;
    g.fillStyle=t.color;
    g.beginPath();g.arc(bx,by,Math.max(1.5,(3*fov)/t.z),0,Math.PI*2);g.fill();
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 12. SAKURA PETALS 3D - 3D Tumbling Blossom Petals in Spring Breeze
  'nexus://procedural/petals': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#14050d"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,petals=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  petals=[];
  for(let i=0;i<140;i++){
    petals.push({
      x:(Math.random()-0.5)*2000,
      y:(Math.random()-0.5)*1800,
      z:Math.random()*1200+60,
      pitch:Math.random()*Math.PI*2,
      yaw:Math.random()*Math.PI*2,
      roll:Math.random()*Math.PI*2,
      speed:Math.random()*1.5+1.2,
      sz:Math.random()*6+12
    });
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.016;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=550*(1+imp*0.14);
  const windX=tiltX*str*60+Math.sin(time)*20;
  const windY=tiltY*str*40;

  g.fillStyle='rgba(18,5,12,0.3)';g.fillRect(0,0,W,H);

  petals.forEach(p=>{
    p.y+=p.speed*(1+imp*0.4);
    p.x+=Math.sin(time+p.z)*1.5+windX*0.03;
    p.pitch+=0.02;p.yaw+=0.015;p.roll+=0.025;
    if(p.y>1000){p.y=-1000;p.x=(Math.random()-0.5)*2000;}

    const sx=W/2+(p.x*fov)/p.z;
    const sy=H/2+(p.y*fov)/p.z;
    const scale=fov/p.z;
    const sz=p.sz*scale;

    if(sx>=-50&&sx<=W+50&&sy>=-50&&sy<=H+50){
      g.save();
      g.translate(sx,sy);
      g.rotate(p.roll);
      g.scale(Math.cos(p.pitch),Math.sin(p.yaw));
      const alpha=(1-p.z/1300)*0.85;
      g.fillStyle='rgba(244,143,177,'+Math.max(0.1,alpha)+')';
      g.beginPath();g.ellipse(0,0,sz,sz*0.55,0,0,Math.PI*2);g.fill();
      g.restore();
    }
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 13. ATMOSPHERIC RAIN 3D - 3D Perspective Rain Drops with Ground Ripples
  'nexus://procedural/rain': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#05070e"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,drops=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  drops=[];
  for(let i=0;i<260;i++){
    drops.push({
      x:(Math.random()-0.5)*2200,
      y:(Math.random()-0.5)*1800,
      z:Math.random()*1200+50,
      len:Math.random()*25+35,
      speed:Math.random()*12+18
    });
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.02;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=520*(1+imp*0.14);
  const wind=tiltX*str*40;

  g.fillStyle='rgba(4,6,12,0.25)';g.fillRect(0,0,W,H);

  drops.forEach(d=>{
    d.y+=d.speed*(1+imp*0.5);
    d.x+=wind*0.08;
    if(d.y>900){d.y=-900;d.x=(Math.random()-0.5)*2200;}

    const sx=W/2+(d.x*fov)/d.z;
    const sy=H/2+(d.y*fov)/d.z;
    const dropLen=(d.len*fov)/d.z;

    if(sx>=0&&sx<=W&&sy>=0&&sy<=H){
      const alpha=(1-d.z/1300)*0.75;
      g.strokeStyle='rgba(180,220,255,'+alpha+')';
      g.lineWidth=Math.max(1,(1.6*fov)/d.z);
      g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+wind*0.15,sy+dropLen);g.stroke();
    }
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  // 14. BLIZZARD SNOW 3D - 3D Depth Flakes in Swirling Turbulence
  'nexus://procedural/snow': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#030712"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,flakes=[],time=0;
const g3=()=>window.__nexus3D||{tiltX:0,tiltY:0,impulse:0,strength:0.6};
function init(){
  W=innerWidth;H=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  c.width=Math.floor(W*dpr);c.height=Math.floor(H*dpr);
  c.style.width=W+'px';c.style.height=H+'px';
  g.scale(dpr,dpr);
  flakes=[];
  for(let i=0;i<320;i++){
    flakes.push({
      x:(Math.random()-0.5)*2200,
      y:(Math.random()-0.5)*1800,
      z:Math.random()*1200+60,
      r:Math.random()*2+1.2,
      speed:Math.random()*2+2
    });
  }
}
window.onresize=init;
init();
function draw(){
  time+=0.016;
  const {tiltX,tiltY,impulse:imp,strength:str}=g3();
  const fov=540*(1+imp*0.14);
  const wind=tiltX*str*50;

  g.fillStyle='rgba(3,7,16,0.3)';g.fillRect(0,0,W,H);

  flakes.forEach(f=>{
    f.y+=f.speed*(1+imp*0.4);
    f.x+=Math.sin(time+f.z*0.01)*1.2+wind*0.06;
    if(f.y>900){f.y=-900;f.x=(Math.random()-0.5)*2200;}

    const sx=W/2+(f.x*fov)/f.z;
    const sy=H/2+(f.y*fov)/f.z;
    const rad=Math.max(0.8,(f.r*fov)/f.z);

    if(sx>=0&&sx<=W&&sy>=0&&sy<=H){
      const alpha=(1-f.z/1300)*0.85;
      g.fillStyle='rgba(230,245,255,'+alpha+')';
      g.beginPath();g.arc(sx,sy,rad,0,Math.PI*2);g.fill();
    }
  });

  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,
};

export const isWallpaperHtmlDocument = (wallpaper: string) =>
  wallpaper.startsWith('nexus://procedural/') ||
  wallpaper.startsWith('<!DOCTYPE') ||
  wallpaper.startsWith('<html') ||
  wallpaper.startsWith('/home/') ||   // VFS paths (user-generated wallpapers)
  wallpaper.startsWith('/system/');   // VFS paths (system wallpapers)

export const getDesktopPath = (userId?: string | null) => `/home/${userId || DESKTOP_DIR_FALLBACK_USER}/Desktop`;
