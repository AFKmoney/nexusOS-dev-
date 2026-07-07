const fs = require('fs');

const wps = {
  'nexus://procedural/hyperspace': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#000"><canvas id="c"></canvas><script>
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
</script></body></html>`,

  'nexus://procedural/geometry': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#111"><canvas id="c"></canvas><script>
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
</script></body></html>`,

  'nexus://procedural/lava': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#200"><canvas id="c"></canvas><script>
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
</script></body></html>`,

  'nexus://procedural/blocks': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#eee"><canvas id="c"></canvas><script>
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
</script></body></html>`,

  'nexus://procedural/nodes': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#101"><canvas id="c"></canvas><script>
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
</script></body></html>`,

  'nexus://procedural/ocean': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#001a33"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,t=0;
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(0,26,51,0.2)';g.fillRect(0,0,W,H);
  t+=0.02;
  for(let i=0;i<4;i++){
    g.fillStyle=\`hsla(200,100%,\${50-i*10}%,0.4)\`;
    g.beginPath();g.moveTo(0,H);
    for(let x=0;x<=W;x+=20){
      g.lineTo(x,H*0.5+i*40+Math.sin(x*0.01+t+i)*50+Math.sin(x*0.02-t*1.5)*20);
    }
    g.lineTo(W,H);g.fill();
  }
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`,

  'nexus://procedural/petals': `<!DOCTYPE html><html><body style="margin:0;overflow:hidden;background:#fce4ec"><canvas id="c"></canvas><script>
const c=document.getElementById('c'),g=c.getContext('2d');
let W,H,p=[];
function init(){W=innerWidth;H=innerHeight;c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;c.style.width=W+'px';c.style.height=H+'px';g.scale(devicePixelRatio,devicePixelRatio);
p=[];for(let i=0;i<50;i++)p.push({x:Math.random()*W,y:Math.random()*H,a:Math.random()*Math.PI*2,v:Math.random()*2+1,s:Math.random()*10+5});}
window.onresize=init;init();
function draw(){
  g.fillStyle='rgba(252,228,236,0.2)';g.fillRect(0,0,W,H);
  p.forEach(i=>{
    i.x+=Math.cos(i.a)*i.v;i.y+=Math.sin(i.a)*i.v+1;i.a+=0.05;
    if(i.y>H+20){i.y=-20;i.x=Math.random()*W;}
    g.fillStyle='#f48fb1';
    g.save();g.translate(i.x,i.y);g.rotate(i.a);
    g.beginPath();g.ellipse(0,0,i.s,i.s*0.5,0,0,7);g.fill();
    g.restore();
  });
  requestAnimationFrame(draw);
}
draw();
</script></body></html>`
};

let content = fs.readFileSync('appShellConstants.ts', 'utf8');
const closingBraceIndex = content.indexOf('};', content.indexOf('PROCEDURAL_WALLPAPERS'));
let inject = '';
for (const [key, val] of Object.entries(wps)) {
  inject += `,\n  '${key}': \`${val.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``;
}
content = content.slice(0, closingBraceIndex) + inject + '\n' + content.slice(closingBraceIndex);
fs.writeFileSync('appShellConstants.ts', content);
console.log('Done');
