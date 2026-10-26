// ================= Utilities =================
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const fract=x=>x-Math.floor(x);
const TAU=Math.PI*2,D2R=Math.PI/180;
const con=(l,k)=>clamp((l-0.5)*k+0.5);
function hexRgb(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16)||0;return[(n>>16)&255,(n>>8)&255,n&255];}
const c8=v=>v<0?0:v>255?255:v|0;
const rgbS=(r,g,b)=>`rgb(${c8(r)},${c8(g)},${c8(b)})`;
function rng(seed){let a=(Math.imul(seed|0,2654435761)>>>0)||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function hash2(x,y,s=0){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
function vnoise(x,y,s=0){const xi=Math.floor(x),yi=Math.floor(y);let u=x-xi,v=y-yi;u=u*u*(3-2*u);v=v*v*(3-2*v);const a=hash2(xi,yi,s),b=hash2(xi+1,yi,s),c=hash2(xi,yi+1,s),d=hash2(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,y,o=4,s=0){let v=0,a=0.5,f=1,t=0;for(let i=0;i<o;i++){v+=a*vnoise(x*f,y*f,s+i*31);t+=a;f*=2.03;a*=0.5;}return v/t;}
function noiseField(W,H,scale,oct=3,seed=0,step=4){scale=Math.max(1,scale);const gw=Math.ceil(W/step)+2,gh=Math.ceil(H/step)+2,g=new Float32Array(gw*gh);for(let j=0;j<gh;j++)for(let i=0;i<gw;i++)g[j*gw+i]=fbm(i*step/scale,j*step/scale,oct,seed);const f=new Float32Array(W*H);for(let y=0;y<H;y++){const gy=y/step,j=gy|0,fy=gy-j;for(let x=0;x<W;x++){const gx=x/step,i=gx|0,fx=gx-i,k=j*gw+i;f[y*W+x]=(g[k]*(1-fx)+g[k+1]*fx)*(1-fy)+(g[k+gw]*(1-fx)+g[k+gw+1]*fx)*fy;}}return f;}
function rampOf(list){return list.map(c=>typeof c==='string'?hexRgb(c):c);}
function rampAt(R,t,o){t=clamp(t)*(R.length-1);const i=Math.min(R.length-2,t|0),f=t-i,a=R[i],b=R[i+1];o[0]=a[0]+(b[0]-a[0])*f;o[1]=a[1]+(b[1]-a[1])*f;o[2]=a[2]+(b[2]-a[2])*f;return o;}
function hsl(h,s,l){h=(((h%360)+360)%360)/360;const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{t=fract(t);return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255];}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return[h,s,l];}
function satAdj(o,s){const l=0.299*o[0]+0.587*o[1]+0.114*o[2];o[0]=l+(o[0]-l)*s;o[1]=l+(o[1]-l)*s;o[2]=l+(o[2]-l)*s;return o;}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c;}
function nearestCol(pal,o){let best=0,bd=1e18;for(let i=0;i<pal.length;i++){const q=pal[i],rm=(o[0]+q[0])/2,dr=o[0]-q[0],dg=o[1]-q[1],db=o[2]-q[2];const d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;best=i;}}return pal[best];}
function poly(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.closePath();}

function boxH(s,d,w,h,r){const inv=1/(2*r+1);for(let y=0;y<h;y++){const o=y*w;let acc=0;for(let i=-r;i<=r;i++)acc+=s[o+(i<0?0:i>=w?w-1:i)];for(let x=0;x<w;x++){d[o+x]=acc*inv;let a=x-r,b=x+r+1;if(a<0)a=0;if(b>=w)b=w-1;acc+=s[o+b]-s[o+a];}}}
function boxV(s,d,w,h,r){const inv=1/(2*r+1);for(let x=0;x<w;x++){let acc=0;for(let i=-r;i<=r;i++)acc+=s[(i<0?0:i>=h?h-1:i)*w+x];for(let y=0;y<h;y++){d[y*w+x]=acc*inv;let a=y-r,b=y+r+1;if(a<0)a=0;if(b>=h)b=h-1;acc+=s[b*w+x]-s[a*w+x];}}}
function blurF(a,w,h,r,passes=3){r=Math.round(r);if(r<1)return a;const t=new Float32Array(w*h),d=new Float32Array(w*h);boxH(a,t,w,h,r);boxV(t,d,w,h,r);for(let i=1;i<passes;i++){boxH(d,t,w,h,r);boxV(t,d,w,h,r);}return d;}
function dilate(m,w,h,r){r=Math.round(r);if(r<1)return m;const t=new Uint8Array(w*h),o=new Uint8Array(w*h);for(let y=0;y<h;y++){const row=y*w;let last=-1e9;for(let x=0;x<w;x++){if(m[row+x])last=x;if(x-last<=r)t[row+x]=1;}last=1e9;for(let x=w-1;x>=0;x--){if(m[row+x])last=x;if(last-x<=r)t[row+x]=1;}}for(let x=0;x<w;x++){let last=-1e9;for(let y=0;y<h;y++){if(t[y*w+x])last=y;if(y-last<=r)o[y*w+x]=1;}last=1e9;for(let y=h-1;y>=0;y--){if(t[y*w+x])last=y;if(last-y<=r)o[y*w+x]=1;}}return o;}
function maxF(a,w,h,r){r=Math.round(r);if(r<1)return a;const t=new Float32Array(w*h),o=new Float32Array(w*h);for(let y=0;y<h;y++){const row=y*w;for(let x=0;x<w;x++){let m=0;const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);for(let i=x0;i<=x1;i++)if(a[row+i]>m)m=a[row+i];t[row+x]=m;}}for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);for(let x=0;x<w;x++){let m=0;for(let j=y0;j<=y1;j++)if(t[j*w+x]>m)m=t[j*w+x];o[y*w+x]=m;}}return o;}
function lbF(a,w,h,x,y){x=x<0?0:x>w-1?w-1:x;y=y<0?0:y>h-1?h-1:y;const x0=x|0,y0=y|0,x1=x0<w-1?x0+1:x0,y1=y0<h-1?y0+1:y0,fx=x-x0,fy=y-y0;return(a[y0*w+x0]*(1-fx)+a[y0*w+x1]*fx)*(1-fy)+(a[y1*w+x0]*(1-fx)+a[y1*w+x1]*fx)*fy;}
function bilF(f,w,h,x,y,o){x=x<0?0:x>w-1?w-1:x;y=y<0?0:y>h-1?h-1:y;const x0=x|0,y0=y|0,x1=x0<w-1?x0+1:x0,y1=y0<h-1?y0+1:y0,fx=x-x0,fy=y-y0,a=y0*w+x0,b=y0*w+x1,c=y1*w+x0,d=y1*w+x1,w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy;o[0]=(f.R[a]*w0+f.R[b]*w1+f.R[c]*w2+f.R[d]*w3)*255;o[1]=(f.G[a]*w0+f.G[b]*w1+f.G[c]*w2+f.G[d]*w3)*255;o[2]=(f.B[a]*w0+f.B[b]*w1+f.B[c]*w2+f.B[d]*w3)*255;return o;}

// ================= Source image =================
class Src{
  constructor(id){const w=this.w=id.width,h=this.h=id.height,d=this.d=id.data,n=w*h,L=this.L=new Float32Array(n);for(let i=0;i<n;i++){const j=i*4;L[i]=(0.2126*d[j]+0.7152*d[j+1]+0.0722*d[j+2])/255;}this._m={};}
  m(key,fn){return this._m[key]||(this._m[key]=fn());}
  i(x,y){x=x<0?0:x>=this.w?this.w-1:x|0;y=y<0?0:y>=this.h?this.h-1:y|0;return y*this.w+x;}
  l(x,y){return this.L[this.i(x,y)];}
  c(x,y,o){const j=this.i(x,y)*4,d=this.d;o[0]=d[j];o[1]=d[j+1];o[2]=d[j+2];return o;}
  bil(x,y,o){const w=this.w,h=this.h,d=this.d;x=x<0?0:x>w-1?w-1:x;y=y<0?0:y>h-1?h-1:y;const x0=x|0,y0=y|0,x1=x0<w-1?x0+1:x0,y1=y0<h-1?y0+1:y0,fx=x-x0,fy=y-y0,a=(y0*w+x0)*4,b=(y0*w+x1)*4,c=(y1*w+x0)*4,e=(y1*w+x1)*4,w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy;o[0]=d[a]*w0+d[b]*w1+d[c]*w2+d[e]*w3;o[1]=d[a+1]*w0+d[b+1]*w1+d[c+1]*w2+d[e+1]*w3;o[2]=d[a+2]*w0+d[b+2]*w1+d[c+2]*w2+d[e+2]*w3;return o;}
  lb(a,x,y){return lbF(a||this.L,this.w,this.h,x,y);}
  cell(x0,y0,cw,ch,o){const n=Math.max(1,Math.min(4,Math.round(Math.min(cw,ch)/2)));let r=0,g=0,b=0,l=0;const d=this.d,L=this.L;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=this.i(x0+(i+0.5)*cw/n,y0+(j+0.5)*ch/n);r+=d[k*4];g+=d[k*4+1];b+=d[k*4+2];l+=L[k];}const nn=n*n;o[0]=r/nn;o[1]=g/nn;o[2]=b/nn;o[3]=l/nn;return o;}
  blurL(r){r=Math.round(r);return this.m('bl'+r,()=>r<1?this.L:blurF(this.L,this.w,this.h,r));}
  rgbF(){return this.m('rgbF',()=>{const n=this.w*this.h,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),d=this.d;for(let i=0;i<n;i++){R[i]=d[i*4]/255;G[i]=d[i*4+1]/255;B[i]=d[i*4+2]/255;}return{R,G,B};});}
  blurRGB(r){r=Math.round(r);return this.m('brgb'+r,()=>{const f=this.rgbF();if(r<1)return f;return{R:blurF(f.R,this.w,this.h,r),G:blurF(f.G,this.w,this.h,r),B:blurF(f.B,this.w,this.h,r)};});}
  sobel(r){r=Math.round(r);return this.m('sob'+r,()=>{const L=this.blurL(r),w=this.w,h=this.h,n=w*h,gx=new Float32Array(n),gy=new Float32Array(n),mag=new Float32Array(n);for(let y=0;y<h;y++){const ym=(y>0?y-1:0)*w,yc=y*w,yp=(y<h-1?y+1:y)*w;for(let x=0;x<w;x++){const xm=x>0?x-1:0,xp=x<w-1?x+1:x;const a=L[ym+xm],b=L[ym+x],c=L[ym+xp],d=L[yc+xm],f=L[yc+xp],g=L[yp+xm],hh=L[yp+x],ii=L[yp+xp];const X=(c+2*f+ii-a-2*d-g)/8,Y=(g+2*hh+ii-a-2*b-c)/8,k=yc+x;gx[k]=X;gy[k]=Y;mag[k]=Math.sqrt(X*X+Y*Y);}}return{gx,gy,mag};});}
}

// ================= Render helpers =================
function warp(c,f,post){const {W,H,src:s}=c,img=c.img(),o=img.data,q=[0,0],col=[0,0,0];for(let y=0,i=0;y<H;y++)for(let x=0;x<W;x++,i+=4){f(x,y,q);s.bil(q[0],q[1],col);if(post)post(x,y,col,q);o[i]=col[0];o[i+1]=col[1];o[i+2]=col[2];o[i+3]=255;}c.put(img);}
function perPixel(c,f){const {W,H}=c,img=c.img(),o=img.data,col=[0,0,0];for(let y=0,i=0,k=0;y<H;y++)for(let x=0;x<W;x++,i+=4,k++){f(x,y,k,col);o[i]=col[0];o[i+1]=col[1];o[i+2]=col[2];o[i+3]=255;}c.put(img);}
function bloom(c,radius,intensity,thr=0){
  if(intensity<=0||radius<0.5)return;const {W,H,ctx}=c,sc=4,w=Math.max(1,Math.ceil(W/sc)),h=Math.max(1,Math.ceil(H/sc));
  const cv=mk(w,h),x=cv.getContext('2d');x.drawImage(c.canvas,0,0,w,h);const id=x.getImageData(0,0,w,h),d=id.data,n=w*h;
  const R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n);
  for(let i=0;i<n;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2],l=(0.2126*r+0.7152*g+0.0722*b)/255,f=thr>0?sstep(thr,thr+0.15,l):1;R[i]=r*f;G[i]=g*f;B[i]=b*f;}
  const rr=Math.max(1,radius/sc),R2=blurF(R,w,h,rr),G2=blurF(G,w,h,rr),B2=blurF(B,w,h,rr);
  for(let i=0;i<n;i++){d[i*4]=R2[i]*intensity;d[i*4+1]=G2[i]*intensity;d[i*4+2]=B2[i]*intensity;d[i*4+3]=255;}
  x.putImageData(id,0,0);ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;ctx.drawImage(cv,0,0,W,H);ctx.restore();
}
function voronoi(W,H,cell,jit,seed){
  cell=Math.max(2,cell);const cols=Math.ceil(W/cell)+1,rows=Math.ceil(H/cell)+1,n=cols*rows,sx=new Float32Array(n),sy=new Float32Array(n);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*cols+i;sx[k]=(i+0.5+(hash2(i,j,seed)-0.5)*jit)*cell;sy[k]=(j+0.5+(hash2(i,j,seed+7)-0.5)*jit)*cell;}
  const id=new Int32Array(W*H),edge=new Float32Array(W*H);
  for(let y=0,p=0;y<H;y++){const gj=Math.floor(y/cell);for(let x=0;x<W;x++,p++){const gi=Math.floor(x/cell);let b1=1e18,b2=1e18,k1=0,k2=0;for(let dj=-1;dj<=1;dj++){const j=gj+dj;if(j<0||j>=rows)continue;for(let di=-1;di<=1;di++){const i=gi+di;if(i<0||i>=cols)continue;const k=j*cols+i,dx=sx[k]-x,dy=sy[k]-y,d=dx*dx+dy*dy;if(d<b1){b2=b1;k2=k1;b1=d;k1=k;}else if(d<b2){b2=d;k2=k;}}}id[p]=k1;const ex=sx[k2]-sx[k1],ey=sy[k2]-sy[k1],len=Math.sqrt(ex*ex+ey*ey)||1;edge[p]=(b2-b1)/(2*len);}}
  return{id,edge,sx,sy,n};
}
function cellAvg(v,s){const n=v.n,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),C=new Float32Array(n),d=s.d;for(let p=0;p<v.id.length;p++){const k=v.id[p],j=p*4;R[k]+=d[j];G[k]+=d[j+1];B[k]+=d[j+2];C[k]++;}for(let k=0;k<n;k++)if(C[k]){R[k]/=C[k];G[k]/=C[k];B[k]/=C[k];}return{R,G,B};}
function edgeMask(s,blurR,thr,width){const sob=s.sobel(blurR),n=s.w*s.h,m=new Uint8Array(n);for(let i=0;i<n;i++)m[i]=sob.mag[i]>thr?1:0;return dilate(m,s.w,s.h,Math.round((width-1)/2));}

// ================= Effect registry =================
const FX={};
function normP(a){const [key,label]=a;if(Array.isArray(a[2]))return{type:'select',key,label,options:a[2].map(o=>Array.isArray(o)?o:[o,o]),def:a[3]??(Array.isArray(a[2][0])?a[2][0][0]:a[2][0])};if(typeof a[2]==='boolean')return{type:'check',key,label,def:a[2]};if(typeof a[2]==='string')return /^#[0-9a-f]{6}$/i.test(a[2])?{type:'color',key,label,def:a[2]}:{type:'text',key,label,def:a[2]};return{type:'range',key,label,min:a[2],max:a[3],step:a[4],def:a[5],px:a[6]==='px',unit:a[6]==='px'?' px':a[6]==='deg'?'°':a[6]==='s'?' s':a[6]==='%'?' %':''};}
function def(id,params,render,extra={}){FX[id]=Object.assign({id,params:params.map(normP),render},extra);}
const pCX=['cx','Střed X',0,1,0.01,0.5],pCY=['cy','Střed Y',0,1,0.01,0.5];
const pSeed=(d=42)=>['seed','Seed (náhoda)',1,999,1,d];

// ---------- ASCII & Text ----------
const FONTS={plex:'"IBM Plex Mono", ui-monospace, Menlo, monospace',courier:'"Courier New", Courier, monospace',sys:'ui-monospace, Menlo, Consolas, monospace'};
const FONT_OPTS=[['plex','IBM Plex Mono'],['courier','Courier'],['sys','Systémové mono']];
const RAMPS={standard:' .:-=+*#%@',detail:' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',blocks:' ░▒▓█',binary:' 01',letters:' .icoeaxkdbmwM',dots:' ·∙•●'};
const RAMP_OPTS=[['standard','Standard  .:-=+*#%@'],['detail','Detailní (70 znaků)'],['blocks','Bloky ░▒▓█'],['binary','Binární 01'],['letters','Písmena'],['dots','Tečky ·•●']];
function asciiCore(c,anim){
  const {src:s,W,H,ctx,p,t}=c,cs=Math.max(3,p.cellSize),cw=cs*0.6,ch=cs,ramp=[...(RAMPS[p.characterRamp]||RAMPS.standard)],n=ramp.length-1;
  const bgm=p.background||'black',light=bgm==='white';
  ctx.fillStyle=light?'#f3f1ec':'#0a0a0b';ctx.fillRect(0,0,W,H);
  if(bgm==='dim'){ctx.globalAlpha=0.22;ctx.drawImage(c.srcCanvas,0,0,W,H);ctx.globalAlpha=1;}
  ctx.font=`${cs}px ${FONTS[p.font||'plex']}`;ctx.textBaseline='top';
  const mode=p.colorMode||p.palette||'mono',cols=Math.ceil(W/cw),rows=Math.ceil(H/ch),o=[0,0,0,0],frame=anim?Math.floor(t*p.fps):0;let last='';
  for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
    const x0=q*cw,y0=r*ch;s.cell(x0,y0,cw,ch,o);let l=con(o[3],p.contrast);
    if(anim)l=clamp(l+0.16*Math.sin(q*0.21+r*0.13-t*2.4));
    if(p.invert)l=1-l;
    let idx=Math.round((light?1-l:l)*n);
    if(anim&&hash2(q,r,frame)>p.temporalStability)idx=Math.round(hash2(r,q,frame+3)*n*(0.3+l*0.9));
    idx=clamp(idx,0,n);const chr=ramp[idx];if(chr===' ')continue;
    let col;
    if(mode==='source'){const b=light?0.85:1.2;col=rgbS(o[0]*b,o[1]*b,o[2]*b);}
    else if(mode==='green')col=rgbS(30+60*l,110+145*l,60+70*l);
    else if(mode==='amber')col=rgbS(150+105*l,80+120*l,10+40*l);
    else col=light?'#141414':'#f1f1ee';
    if(col!==last){ctx.fillStyle=col;last=col;}
    ctx.fillText(chr,x0,y0);
  }
}
def(1,[['cellSize','Velikost buňky',4,40,1,10,'px'],['characterRamp','Znaková sada',RAMP_OPTS,'standard'],['font','Písmo',FONT_OPTS,'plex'],['colorMode','Barvy',[['source','Podle fotky'],['mono','Jednobarevně'],['green','Terminál zelená'],['amber','Jantarová']],'source'],['contrast','Kontrast',0.3,3,0.05,1.3],['background','Pozadí',[['black','Černé'],['white','Bílé'],['dim','Ztmavená fotka']],'black'],['invert','Invertovat jas',false]],c=>asciiCore(c,false));
def(11,[['fps','Rychlost změn (snímky/s)',1,30,1,10],['cellSize','Velikost buňky',4,40,1,10,'px'],['characterRamp','Znaková sada',RAMP_OPTS,'detail'],['palette','Paleta',[['green','Terminál zelená'],['source','Podle fotky'],['amber','Jantarová'],['mono','Bílá']],'green'],['temporalStability','Stabilita znaků',0,1,0.01,0.85],['contrast','Kontrast',0.3,3,0.05,1.3]],c=>asciiCore(c,true),{anim:true});
def(16,[['glyphSets','Sada glyfů',[['mix','Smíšená'],['text','Text'],['symbols','Symboly ○◎●'],['geometry','Geometrie ▪◆■']],'mix'],['cellSize','Velikost buňky',4,40,1,11,'px'],['contrast','Kontrast',0.3,3,0.05,1.3],['edgeWeight','Váha hran',0,3,0.05,1],['colorMode','Barvy',[['source','Podle fotky'],['mono','Bílá'],['duo','Dvoubarevně']],'source']],c=>{
  const {src:s,W,H,ctx,p}=c,sets={mix:' .·:+×◇○▪■@',text:' .,:;+*xX#@',symbols:' ·∘○◎◉●',geometry:' ·▫▪□◇◆■'},ramp=[...sets[p.glyphSets]],n=ramp.length-1,sob=s.sobel(2);
  const cs=Math.max(3,p.cellSize),cw=cs*0.62,ch=cs;ctx.fillStyle='#0b0b0c';ctx.fillRect(0,0,W,H);ctx.font=`${cs}px ${FONTS.plex}`;ctx.textBaseline='top';
  const o=[0,0,0,0];let last='';
  for(let y0=0;y0<H;y0+=ch)for(let x0=0;x0<W;x0+=cw){
    s.cell(x0,y0,cw,ch,o);const l=con(o[3],p.contrast),gi=s.i(x0+cw/2,y0+ch/2),e=sob.mag[gi]*p.edgeWeight*5;let chr;
    if(e>0.6&&l>0.08){const a=(Math.atan2(sob.gy[gi],sob.gx[gi])+Math.PI/2+TAU)%Math.PI;chr='-\\|/'[Math.round(a/(Math.PI/4))%4];}else chr=ramp[Math.round(l*n)];
    if(chr===' ')continue;
    const col=p.colorMode==='source'?rgbS(o[0]*1.25,o[1]*1.25,o[2]*1.25):p.colorMode==='duo'?(l>0.5?'#ffd166':'#ef476f'):'#eeeeea';
    if(col!==last){ctx.fillStyle=col;last=col;}ctx.fillText(chr,x0,y0);
  }
});
def(17,[['glyphType','Typ značky',[['circles','Kruhy'],['chars','Znaky'],['squares','Čtverce'],['plus','Plusy']],'circles'],['density','Hustota (buňka)',4,30,1,9,'px'],['shapeScale','Velikost tvarů',0.3,1.6,0.05,1],['palette','Paleta',[['white','Bílá'],['sodium','Sodíková oranž'],['ice','Ledová modrá'],['duo','Růžová / tyrkys'],['source','Podle fotky (omezená)']],'white'],['background','Pozadí','#050506'],['contrast','Kontrast',0.3,3,0.05,1.4]],c=>{
  const {src:s,W,H,ctx,p}=c,cs=Math.max(3,p.density),chars=p.glyphType==='chars',cw=chars?cs*0.6:cs,src=p.palette==='source';
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);
  const pal={white:['#3a3a3a','#7a7a7a','#b5b5b5','#e6e6e6','#ffffff'],sodium:['#4a1a05','#a33a0a','#ff7a1a','#ffb46b','#ffe9cf'],ice:['#06263a','#0f5e85','#3ad1ff','#a6ecff','#f0fcff'],duo:['#5a0d2a','#ff2e63','#ff8fab','#7ff3f0','#08d9d6'],source:[]}[p.palette];
  const LV=5,buckets=Array.from({length:LV},()=>new Path2D()),ramp=' .:-=+*#%@',o=[0,0,0,0];
  const quant=o=>rgbS(Math.round(o[0]/85)*85*1.1,Math.round(o[1]/85)*85*1.1,Math.round(o[2]/85)*85*1.1);
  if(chars){ctx.font=`${cs}px ${FONTS.plex}`;ctx.textBaseline='top';}
  for(let y0=0;y0<H;y0+=cs)for(let x0=0;x0<W;x0+=cw){
    s.cell(x0,y0,cw,cs,o);const l=con(o[3],p.contrast);if(l<0.04)continue;const lv=Math.min(LV-1,Math.floor(l*LV));
    if(chars){const chr=ramp[Math.round(l*9)];if(chr===' ')continue;ctx.fillStyle=src?quant(o):pal[lv];ctx.fillText(chr,x0,y0);continue;}
    const sz=cs*p.shapeScale*Math.sqrt(l),cx=x0+cw/2,cy=y0+cs/2,path=src?new Path2D():buckets[lv];
    if(p.glyphType==='circles'){path.moveTo(cx+sz/2,cy);path.arc(cx,cy,sz/2,0,TAU);}
    else if(p.glyphType==='squares')path.rect(cx-sz/2,cy-sz/2,sz,sz);
    else{const w=Math.max(1,sz*0.24);path.rect(cx-sz/2,cy-w/2,sz,w);path.rect(cx-w/2,cy-sz/2,w,sz);}
    if(src){ctx.fillStyle=quant(o);ctx.fill(path);}
  }
  if(!src&&!chars)buckets.forEach((b,i)=>{ctx.fillStyle=pal[i];ctx.fill(b);});
});
def(18,[['threshold','Práh',0,1,0.01,0.45],['cellScale','Rozteč bodů',2,10,0.5,4,'px'],['dither','Dithering',true],['invert','Invertovat',false],['monochrome','Jednobarevně',true],['dotColor','Barva bodů','#e9f0ff'],['background','Pozadí','#07090d']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(1.5,p.cellScale),cellW=sp*2.7,cellH=sp*4.9,r=sp*0.36;
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);
  const L=s.blurL(sp*0.5),B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],path=new Path2D(),o=[0,0,0],cols=Math.ceil(W/cellW),rows=Math.ceil(H/cellH);
  for(let cy=0;cy<rows;cy++)for(let cx=0;cx<cols;cx++)for(let dy=0;dy<4;dy++)for(let dx=0;dx<2;dx++){
    const x=cx*cellW+sp*0.7+dx*sp,y=cy*cellH+sp*0.7+dy*sp;if(x>W||y>H)continue;
    let l=s.lb(L,x,y);if(p.invert)l=1-l;
    const gx=cx*2+dx,gy=cy*4+dy,th=p.dither?p.threshold+(B4[(gy&3)*4+(gx&3)]/16-0.47)*0.7:p.threshold;
    if(l<=th)continue;
    if(p.monochrome){path.moveTo(x+r,y);path.arc(x,y,r,0,TAU);}
    else{s.c(x,y,o);ctx.fillStyle=rgbS(o[0]*1.2,o[1]*1.2,o[2]*1.2);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
  }
  if(p.monochrome){ctx.fillStyle=p.dotColor;ctx.fill(path);}
});
def(5,[['cellSize','Šířka znaku',3,30,1,8,'px'],['subpixelLayout','Mřížka subpixelů',[['2x2','2×2 čtvrtbloky ▘▝'],['2x3','2×3 sextanty'],['2x4','2×4 oktanty'],['1x2','1×2 půlbloky ▀▄']],'2x2'],['threshold','Práh',0,1,0.01,0.5],['foreground','Popředí','#e8e6df'],['background','Pozadí','#111214'],['sourceColor','Popředí podle fotky',true],['contrast','Kontrast',0.3,3,0.05,1.2]],c=>{
  const {src:s,W,H,ctx,p}=c,cw=Math.max(2,p.cellSize),chh=cw*2,[sx,sy]=p.subpixelLayout.split('x').map(Number),sw=cw/sx,sh=chh/sy;
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);
  const o=[0,0,0,0],q=[0,0,0,0],path=new Path2D();
  for(let y0=0;y0<H;y0+=chh)for(let x0=0;x0<W;x0+=cw){
    s.cell(x0,y0,cw,chh,o);let any=false;const cp=p.sourceColor?new Path2D():path;
    for(let j=0;j<sy;j++)for(let i=0;i<sx;i++){s.cell(x0+i*sw,y0+j*sh,sw,sh,q);if(con(q[3],p.contrast)>p.threshold){cp.rect(x0+i*sw,y0+j*sh,sw+0.4,sh+0.4);any=true;}}
    if(p.sourceColor&&any){ctx.fillStyle=rgbS(o[0]*1.2,o[1]*1.2,o[2]*1.2);ctx.fill(cp);}
  }
  if(!p.sourceColor){ctx.fillStyle=p.foreground;ctx.fill(path);}
});
def(8,[['spacing','Rozteč',4,40,1,10,'px'],['minRadius','Min. velikost',0,1,0.01,0.05],['maxRadius','Max. velikost',0.2,1.3,0.01,0.9],['invert','Invertovat',false],['inkColor','Inkoust','#15161a'],['paperColor','Papír','#f2eee5'],['angle','Úhel mřížky',0,90,1,45,'deg'],['colorMode','Barva teček',[['ink','Inkoust'],['source','Podle fotky']],'ink']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(2,p.spacing),a=p.angle*D2R,ca=Math.cos(a),sa=Math.sin(a);
  ctx.fillStyle=p.paperColor;ctx.fillRect(0,0,W,H);
  const L=s.blurL(sp*0.35),n=Math.ceil(Math.hypot(W,H)/sp/2)+1,path=new Path2D(),o=[0,0,0];
  for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){
    const u=i*sp,v=j*sp,x=W/2+u*ca-v*sa,y=H/2+u*sa+v*ca;if(x<-sp||y<-sp||x>W+sp||y>H+sp)continue;
    const l=s.lb(L,x,y),d=p.invert?l:1-l,r=sp*0.71*lerp(p.minRadius,p.maxRadius,Math.sqrt(d));if(r<0.25)continue;
    if(p.colorMode==='source'){s.c(x,y,o);ctx.fillStyle=rgbS(o[0],o[1],o[2]);ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
    else{path.moveTo(x+r,y);path.arc(x,y,r,0,TAU);}
  }
  if(p.colorMode!=='source'){ctx.fillStyle=p.inkColor;ctx.fill(path);}
});

// ---------- Pixel & Blocks ----------
def(4,[['pixelSize','Velikost pixelu',2,48,1,12,'px'],['paletteSize','Odstínů na kanál',2,16,1,6],['saturation','Sytost',0,2.5,0.05,1.3],['contrast','Kontrast',0.5,2.5,0.05,1.1],['edgeBoost','Zvýraznění obrysů',0,1,0.01,0.35],['outlineColor','Barva obrysu','#1a1320']],c=>{
  const {src:s,W,H,ctx,p}=c,ps=Math.max(1,p.pixelSize),cols=Math.ceil(W/ps),rows=Math.ceil(H/ps),n=p.paletteSize-1,C=new Float32Array(cols*rows*3),Lg=new Float32Array(cols*rows),o=[0,0,0,0],oc=hexRgb(p.outlineColor);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*cols+i;s.cell(i*ps,j*ps,ps,ps,o);satAdj(o,p.saturation);for(let q=0;q<3;q++){let v=con(o[q]/255,p.contrast);v=Math.round(v*n)/n;C[k*3+q]=v*255;}Lg[k]=(0.299*C[k*3]+0.587*C[k*3+1]+0.114*C[k*3+2])/255;}
  const thr=0.5-p.edgeBoost*0.42;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const k=j*cols+i;let r=C[k*3],g=C[k*3+1],b=C[k*3+2];
    if(p.edgeBoost>0){const l=Lg[k],m=Math.max(i<cols-1?Lg[k+1]:l,j<rows-1?Lg[k+cols]:l,i>0?Lg[k-1]:l,j>0?Lg[k-cols]:l);if(m-l>thr){r=lerp(r,oc[0],0.85);g=lerp(g,oc[1],0.85);b=lerp(b,oc[2],0.85);}}
    ctx.fillStyle=rgbS(r,g,b);const x0=Math.floor(i*ps),y0=Math.floor(j*ps);ctx.fillRect(x0,y0,Math.floor((i+1)*ps)-x0,Math.floor((j+1)*ps)-y0);
  }
});
def(6,[['tileWidth','Šířka dlaždice',4,80,1,22,'px'],['tileHeight','Výška dlaždice',4,80,1,22,'px'],['gap','Spára',0,12,0.5,2,'px'],['border','Zaoblení rohů',0,20,0.5,3,'px'],['quantization','Úrovně barev',2,32,1,32],['gapColor','Barva spáry','#1b1b1d']],c=>{
  const {src:s,W,H,ctx,p}=c,tw=Math.max(2,p.tileWidth),th=Math.max(2,p.tileHeight),g=p.gap,o=[0,0,0,0],n=p.quantization-1;
  ctx.fillStyle=p.gapColor;ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=th)for(let x=0;x<W;x+=tw){
    s.cell(x,y,tw,th,o);const q=v=>n>=31?v:Math.round(v/255*n)/n*255;ctx.fillStyle=rgbS(q(o[0]),q(o[1]),q(o[2]));
    const w=tw-g,h=th-g,r=Math.min(p.border,w/2,h/2);ctx.beginPath();if(ctx.roundRect&&r>0)ctx.roundRect(x+g/2,y+g/2,w,h,r);else ctx.rect(x+g/2,y+g/2,w,h);ctx.fill();
  }
});
const LEGO=rampOf(['#f4f4f4','#a0a5a9','#6c6e68','#1b2a34','#05131d','#c91a09','#720e0f','#fe8a18','#f2cd37','#f8bb3d','#e4cd9e','#958a73','#583927','#bbe90b','#237841','#184632','#a0bcac','#5a93db','#0055bf','#0a3463','#adc3c0','#923978','#fc97ac','#d09168','#a95500','#9ba19d']);
def(7,[['brickSize','Velikost kostky',6,48,1,16,'px'],['studRadius','Poloměr výstupku',0.15,0.45,0.01,0.31],['plasticPalette','Paleta plastu',[['lego','LEGO barvy'],['free','Volné barvy']],'lego'],['bevel','Zkosení a lesk',0,1,0.01,0.6],['lightDirection','Směr světla',0,360,1,225,'deg']],c=>{
  const {src:s,W,H,ctx,p}=c,bs=Math.max(4,p.brickSize),la=p.lightDirection*D2R,lx=Math.cos(la),ly=Math.sin(la),o=[0,0,0,0],bw=Math.max(1,bs*0.09),rr=bs*p.studRadius;
  const shade=(col,f)=>f>=0?rgbS(lerp(col[0],255,f),lerp(col[1],255,f),lerp(col[2],255,f)):rgbS(col[0]*(1+f),col[1]*(1+f),col[2]*(1+f));
  ctx.fillStyle='#0d0d0d';ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=bs)for(let x=0;x<W;x+=bs){
    s.cell(x,y,bs,bs,o);const col=p.plasticPalette==='lego'?nearestCol(LEGO,o):[o[0],o[1],o[2]];
    ctx.fillStyle=rgbS(col[0],col[1],col[2]);ctx.fillRect(x,y,bs,bs);
    if(p.bevel>0)for(const [nx,ny,ex,ey,ew,eh] of [[0,-1,x,y,bs,bw],[0,1,x,y+bs-bw,bs,bw],[-1,0,x,y,bw,bs],[1,0,x+bs-bw,y,bw,bs]]){const d=nx*lx+ny*ly;ctx.fillStyle=shade(col,d>0?d*0.35*p.bevel:d*0.45*p.bevel);ctx.fillRect(ex,ey,ew,eh);}
    const cx=x+bs/2,cy=y+bs/2;
    ctx.fillStyle=shade(col,-0.45);ctx.beginPath();ctx.arc(cx-lx*rr*0.2,cy-ly*rr*0.2,rr*1.06,0,TAU);ctx.fill();
    ctx.fillStyle=rgbS(col[0],col[1],col[2]);ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.fill();
    ctx.fillStyle=shade(col,0.28*p.bevel+0.04);ctx.beginPath();ctx.arc(cx+lx*rr*0.24,cy+ly*rr*0.24,rr*0.55,0,TAU);ctx.fill();
  }
});
def(9,[['cubeSize','Velikost krychle',4,40,1,12,'px'],['gridSpacing','Rozestup',0.8,1.6,0.01,1],['faceShading','Stínování stěn',0,1,0.01,0.6],['outline','Obrys hran',false],['blendMode','Podklad',[['dark','Tmavý'],['photo','Ztmavená fotka'],['light','Světlý']],'dark']],c=>{
  const {src:s,W,H,ctx,p}=c,sz=Math.max(3,p.cubeSize),a=sz*0.866,sp=p.gridSpacing,f=p.faceShading,o=[0,0,0,0];
  ctx.fillStyle=p.blendMode==='light'?'#eceae4':'#0e0f13';ctx.fillRect(0,0,W,H);
  if(p.blendMode==='photo'){ctx.globalAlpha=0.35;ctx.drawImage(c.srcCanvas,0,0,W,H);ctx.globalAlpha=1;}
  ctx.lineJoin='round';ctx.lineWidth=Math.max(0.5,sz*0.05);ctx.strokeStyle='rgba(0,0,0,0.55)';
  const dy=1.5*sz*sp,dx=2*a*sp;
  for(let r=0,y=-sz;y<H+2*sz;r++,y+=dy){const off=(r&1)?dx/2:0;for(let x=-a+off;x<W+2*a;x+=dx){
    s.cell(x-a*0.5,y-sz*0.5,a,sz,o);const [R,G,B]=o;
    const faces=[[[x,y-sz,x+a,y-sz/2,x,y,x-a,y-sz/2],rgbS(lerp(R,255,f*0.3),lerp(G,255,f*0.3),lerp(B,255,f*0.3))],[[x-a,y-sz/2,x,y,x,y+sz,x-a,y+sz/2],rgbS(R*(1-f*0.12),G*(1-f*0.12),B*(1-f*0.12))],[[x,y,x+a,y-sz/2,x+a,y+sz/2,x,y+sz],rgbS(R*(1-f*0.45),G*(1-f*0.45),B*(1-f*0.45))]];
    for(const [pts,col] of faces){poly(ctx,pts);ctx.fillStyle=col;ctx.fill();if(p.outline)ctx.stroke();}
  }}
});
def(19,[['hexRadius','Poloměr šestiúhelníku',4,60,1,14,'px'],['orientation','Orientace',[['pointy','Špičkou nahoru'],['flat','Plochou nahoru']],'pointy'],['groutWidth','Spára',0,8,0.25,1.5,'px'],['groutColor','Barva spáry','#151515']],c=>{
  const {src:s,W,H,ctx,p}=c,R=Math.max(3,p.hexRadius),g=p.groutWidth,o=[0,0,0,0],pointy=p.orientation==='pointy',r3=Math.sqrt(3);
  ctx.fillStyle=p.groutColor;ctx.fillRect(0,0,W,H);
  const dx=pointy?r3*R:1.5*R,dy=pointy?1.5*R:r3*R,rd=g>0?R-g/2:R+0.4,a0=pointy?-90:0;
  const vs=[];for(let i=0;i<6;i++){const a=(a0+60*i)*D2R;vs.push(Math.cos(a)*rd,Math.sin(a)*rd);}
  for(let j=-1;j*dy<H+dy;j++)for(let i=-1;i*dx<W+dx;i++){
    const cx=i*dx+(pointy&&(j&1)?dx/2:0),cy=j*dy+(!pointy&&(i&1)?dy/2:0);
    s.cell(cx-R*0.7,cy-R*0.7,R*1.4,R*1.4,o);ctx.fillStyle=rgbS(o[0],o[1],o[2]);
    ctx.beginPath();for(let k=0;k<6;k++)ctx.lineTo(cx+vs[k*2],cy+vs[k*2+1]);ctx.closePath();ctx.fill();
  }
});
def(20,[['ledType','Typ LED',[['round','Kulaté'],['square','Čtvercové'],['diode','Dioda s rámečkem']],'round'],['pitch','Rozteč LED',4,40,1,10,'px'],['brightness','Jas',0.2,2,0.05,1.2],['glow','Záře',0,1.5,0.01,0.7],['colorMode','Barva',[['source','Podle fotky'],['red','Červená'],['amber','Jantarová'],['green','Zelená'],['white','Bílá']],'source'],['pulseSpeed','Pulzování',0,5,0.1,0]],c=>{
  const {src:s,W,H,ctx,p,t}=c,pt=Math.max(3,p.pitch),r=pt*0.38,o=[0,0,0,0],mono={red:[255,40,30],amber:[255,170,30],green:[60,255,90],white:[240,245,255]}[p.colorMode];
  ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=pt)for(let x=0;x<W;x+=pt){
    s.cell(x,y,pt,pt,o);const cx=x+pt/2,cy=y+pt/2,pulse=p.pulseSpeed>0?0.75+0.25*Math.sin(t*p.pulseSpeed*2+x*0.03+y*0.02):1,b=p.brightness*pulse;
    let R,G,B;if(mono){const l=Math.pow(o[3],1.2)*b;R=mono[0]*l;G=mono[1]*l;B=mono[2]*l;}else{R=o[0]*b;G=o[1]*b;B=o[2]*b;}
    if(p.ledType==='diode'){ctx.fillStyle='#1b1b1b';ctx.fillRect(x+pt*0.06,y+pt*0.06,pt*0.88,pt*0.88);}
    ctx.fillStyle='#161616';
    if(p.ledType==='square'){ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.fillStyle=rgbS(R,G,B);ctx.fillRect(cx-r,cy-r,r*2,r*2);}
    else{ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();ctx.fillStyle=rgbS(R,G,B);ctx.fill();}
  }
  bloom(c,pt*1.5*p.glow+2,p.glow*0.9,0.15);
},{anim:p=>p.pulseSpeed>0});

// ---------- Print & Paper ----------
const PALS={bw:['#0d0d0d','#f2f0e8'],gray4:['#000000','#555555','#aaaaaa','#ffffff'],gameboy:['#0f380f','#306230','#8bac0f','#9bbc0f'],cga:['#000000','#55ffff','#ff55ff','#ffffff'],pico8:['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'],sepia:['#2b1d0e','#6b4a2b','#b58b5a','#f1e3c6'],rgb8:['#000000','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ffffff']};
(()=>{const a=[];for(const r of [0,128,255])for(const g of [0,128,255])for(const b of [0,128,255])a.push([r,g,b]);PALS.rgb27=a;})();
function bayer(n){if(n===1)return[0];const m=bayer(n/2),h=n/2,o=new Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=m[(y%h)*h+(x%h)]*4;o[y*n+x]=(v+[0,2,3,1][(y<h?0:2)+(x<h?0:1)])/(n*n);}return o;}
const BAYER={4:bayer(4),8:bayer(8)};
const KERN={fs:[16,[1,0,7],[-1,1,3],[0,1,5],[1,1,1]],falsefs:[8,[1,0,3],[0,1,3],[1,1,2]],atkinson:[8,[1,0,1],[2,0,1],[-1,1,1],[0,1,1],[1,1,1],[0,2,1]],jjn:[48,[1,0,7],[2,0,5],[-2,1,3],[-1,1,5],[0,1,7],[1,1,5],[2,1,3],[-2,2,1],[-1,2,3],[0,2,5],[1,2,3],[2,2,1]],stucki:[42,[1,0,8],[2,0,4],[-2,1,2],[-1,1,4],[0,1,8],[1,1,4],[2,1,2],[-2,2,1],[-1,2,2],[0,2,4],[1,2,2],[2,2,1]],burkes:[32,[1,0,8],[2,0,4],[-2,1,2],[-1,1,4],[0,1,8],[1,1,4],[2,1,2]],sierra:[32,[1,0,5],[2,0,3],[-2,1,2],[-1,1,4],[0,1,5],[1,1,4],[2,1,2],[-1,2,2],[0,2,3],[1,2,2]],sierra2:[16,[1,0,4],[2,0,3],[-2,1,1],[-1,1,2],[0,1,3],[1,1,2],[2,1,1]],sierralite:[4,[1,0,2],[-1,1,1],[0,1,1]]};
def(2,[['algorithm','Algoritmus',[['fs','Floyd–Steinberg'],['falsefs','False Floyd–Steinberg'],['atkinson','Atkinson'],['jjn','Jarvis–Judice–Ninke'],['stucki','Stucki'],['burkes','Burkes'],['sierra','Sierra'],['sierra2','Two-Row Sierra'],['sierralite','Sierra Lite'],['bayer2','Bayer 2×2'],['bayer4','Bayer 4×4'],['bayer8','Bayer 8×8'],['bayer16','Bayer 16×16'],['random','Náhodný práh'],['threshold','Prostý práh']],'fs'],['palette','Paleta',[['bw','1-bit černobílá'],['gray4','4 odstíny šedi'],['gameboy','Game Boy'],['cga','CGA'],['pico8','PICO-8'],['sepia','Sépie'],['rgb8','RGB 8 barev'],['rgb27','RGB 27 barev']],'bw'],['pixelScale','Velikost pixelu',1,12,1,3,'px'],['threshold','Posun jasu',-0.5,0.5,0.01,0],['contrast','Kontrast',0.5,2.5,0.05,1.15],['animation','Animovat šum',false]],c=>{
  const {src:s,W,H,ctx,p,t}=c,ps=Math.max(1,Math.round(p.pixelScale)),gw=Math.ceil(W/ps),gh=Math.ceil(H/ps),N=gw*gh,R=new Float32Array(N),G=new Float32Array(N),B=new Float32Array(N),o=[0,0,0,0];
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=j*gw+i;s.cell(i*ps,j*ps,ps,ps,o);R[k]=con(o[0]/255+p.threshold,p.contrast)*255;G[k]=con(o[1]/255+p.threshold,p.contrast)*255;B[k]=con(o[2]/255+p.threshold,p.contrast)*255;}
  const pal=rampOf(PALS[p.palette]),spread=255/Math.max(1,Math.round(Math.cbrt(pal.length))),frame=p.animation?Math.floor(t*12):0,nz=p.animation?rng(frame+1):null;
  const sm=mk(gw,gh),sx=sm.getContext('2d'),id=sx.createImageData(gw,gh),d=id.data,alg=p.algorithm,bn=alg.startsWith('bayer')?+alg.slice(5):0,bm=bn?(BAYER[bn]||(BAYER[bn]=bayer(bn))):null,rr=alg==='random'?rng(7+frame):null,kern=KERN[alg],q=[0,0,0];
  const add=(i,j,er,eg,eb,f)=>{if(i<0||i>=gw||j>=gh)return;const k=j*gw+i;R[k]+=er*f;G[k]+=eg*f;B[k]+=eb*f;};
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){
    const k=j*gw+i;let r=R[k],g=G[k],b=B[k];
    if(bm){const m=bm[((j+frame)%bn)*bn+((i+frame*3)%bn)]-0.5;r+=m*spread;g+=m*spread;b+=m*spread;}
    else if(rr){const m=(rr()-0.5)*spread;r+=m;g+=m;b+=m;}
    else if(nz){const m=(nz()-0.5)*28;r+=m;g+=m;b+=m;}
    q[0]=r;q[1]=g;q[2]=b;const c2=nearestCol(pal,q);d[k*4]=c2[0];d[k*4+1]=c2[1];d[k*4+2]=c2[2];d[k*4+3]=255;
    if(kern){const er=r-c2[0],eg=g-c2[1],eb=b-c2[2],dv=kern[0];for(let q=1;q<kern.length;q++){const K=kern[q];add(i+K[0],j+K[1],er,eg,eb,K[2]/dv);}}
  }
  sx.putImageData(id,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(sm,0,0,gw*ps,gh*ps);
},{anim:p=>p.animation});
def(21,[['cellSize','Rastr',3,30,0.5,8,'px'],['screenAngles','Úhly rastrů',[['classic','Klasické 15/75/0/45°'],['same','Všechny 45°'],['moire','Moaré 15/18/0/21°']],'classic'],['inkGain','Nános barvy',0.5,1.8,0.05,1.05],['dotType','Tvar bodu',[['circle','Kruh'],['square','Čtverec'],['line','Linka']],'circle'],['softness','Měkkost hrany',0.3,3,0.1,0.8,'px'],['paperColor','Papír','#f6f2e9']],c=>{
  const {src:s,p}=c,cs=Math.max(2,p.cellSize),soft=Math.max(0.2,p.softness),paper=hexRgb(p.paperColor),inks=[[0,174,239],[236,0,140],[255,236,0],[30,28,30]];
  const trig={classic:[15,75,0,45],same:[45,45,45,45],moire:[15,18,0,21]}[p.screenAngles].map(a=>[Math.cos(a*D2R),Math.sin(a*D2R)]),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    let r=paper[0],g=paper[1],b=paper[2];
    for(let ch=0;ch<4;ch++){
      const [ca,sa]=trig[ch],u=x*ca+y*sa,v=-x*sa+y*ca,cu=(Math.floor(u/cs)+0.5)*cs,cv=(Math.floor(v/cs)+0.5)*cs;
      s.c(cu*ca-cv*sa,cu*sa+cv*ca,col);const R=col[0]/255,G=col[1]/255,B=col[2]/255,K=1-Math.max(R,G,B),den=1-K||1;
      const val=ch===3?K:ch===0?(1-R-K)/den:ch===1?(1-G-K)/den:(1-B-K)/den,a=clamp(val*p.inkGain);if(a<=0.001)continue;
      const du=u-cu,dv=v-cv;let d,rad;
      if(p.dotType==='square'){d=Math.max(Math.abs(du),Math.abs(dv));rad=cs*0.5*Math.sqrt(a);}else if(p.dotType==='line'){d=Math.abs(dv);rad=cs*0.5*a;}else{d=Math.sqrt(du*du+dv*dv);rad=cs*0.7071*Math.sqrt(a);}
      const cov=clamp((rad-d)/soft+0.5);if(cov<=0)continue;const ink=inks[ch];
      r*=1-cov*(1-ink[0]/255);g*=1-cov*(1-ink[1]/255);b*=1-cov*(1-ink[2]/255);
    }
    o[0]=r;o[1]=g;o[2]=b;
  });
});
def(22,[['paletteSize','Počet úrovní barev',2,8,1,4],['edgeThreshold','Citlivost obrysů',0.02,0.4,0.01,0.09],['outlineWidth','Tloušťka obrysu',0,6,0.5,2,'px'],['dotSpacing','Rozteč Ben-Day teček',3,20,0.5,7,'px'],['contrast','Kontrast',0.5,2,0.05,1.25],['saturation','Sytost',0.5,2.5,0.05,1.4]],c=>{
  const {src:s,W,H,p}=c,n=p.paletteSize-1,ds=Math.max(2,p.dotSpacing),mask=p.outlineWidth>0?edgeMask(s,1.5,p.edgeThreshold,p.outlineWidth):null,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    if(mask&&mask[k]){o[0]=20;o[1]=18;o[2]=24;return;}
    s.c(x,y,col);satAdj(col,p.saturation);
    for(let q=0;q<3;q++)col[q]=Math.round(con(col[q]/255,p.contrast)*n)/n*255;
    const L=s.L[k],u=(x+y)*0.7071/ds,v=(y-x)*0.7071/ds,du=fract(u)-0.5,dv=fract(v)-0.5,d=Math.sqrt(du*du+dv*dv),rad=0.55*(1-L);
    const f=L<0.85&&d<rad?0.7:1;o[0]=col[0]*f;o[1]=col[1]*f;o[2]=col[2]*f;
  });
});
def(23,[['strokeSpacing','Rozteč tahů',3,20,0.5,6,'px'],['layerCount','Počet vrstev šrafování',1,4,1,4],['angles','Základní úhel',0,180,1,45,'deg'],['strokeWidth','Tloušťka tahu',0.5,4,0.1,1.2,'px'],['contrast','Kontrast',0.5,2.5,0.05,1.2],['inkColor','Inkoust','#1b1b22'],['paperColor','Papír','#f2eee4']],c=>{
  const {src:s,p}=c,sp=Math.max(2,p.strokeSpacing),L=s.blurL(1),ink=hexRgb(p.inkColor),paper=hexRgb(p.paperColor),n=p.layerCount;
  const lay=[0,90,-45,45].slice(0,n).map((a,i)=>{const r=(p.angles+a)*D2R;return{ca:Math.cos(r),sa:Math.sin(r),thr:(i+1)/(n+1)*0.95};});
  perPixel(c,(x,y,k,o)=>{
    const d=1-con(L[k],p.contrast);let cov=0;
    for(const l of lay){if(d<=l.thr)continue;const q=(x*l.ca+y*l.sa)/sp,dist=Math.abs(fract(q)-0.5)*sp,w=p.strokeWidth*(0.6+0.8*(d-l.thr));const cv=clamp(w/2-dist+0.5);if(cv>cov)cov=cv;}
    o[0]=lerp(paper[0],ink[0],cov);o[1]=lerp(paper[1],ink[1],cov);o[2]=lerp(paper[2],ink[2],cov);
  });
});
def(24,[['blueTint','Modř',"#123f78"],['threshold','Práh',0,1,0.01,0.5],['edgeStrength','Zvýraznění hran',0,3,0.05,1],['paperGrain','Zrno papíru',0,1,0.01,0.4],['contrast','Kontrast',0.5,2.5,0.05,1.3],['paper','Papír','#eef1ec']],c=>{
  const {src:s,W,H,p,k:K}=c,bl=s.blurL(2*K),blue=hexRgb(p.blueTint),R=rampOf([blue.map(v=>v*0.45),blue,hexRgb(p.paper)]),stain=noiseField(W,H,90*K,3,9),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{let g=s.L[k]+p.edgeStrength*(s.L[k]-bl[k]);g=con(g+(0.5-p.threshold),p.contrast);g=clamp(g+(hash2(x,y,3)-0.5)*0.12*p.paperGrain+(stain[k]-0.5)*0.3*p.paperGrain);rampAt(R,g,col);o[0]=col[0];o[1]=col[1];o[2]=col[2];});
});
def(25,[['lineSpacing','Rozteč linek',3,16,0.5,6,'px'],['curvature','Zakřivení',0,3,0.05,1.2],['strokeWidth','Tloušťka',0.3,1.6,0.05,1],['toneLevels','Tónové stupně',2,16,1,10],['paperTone','Papír','#efe8d8'],['ink','Inkoust','#1d2a26']],c=>{
  const {src:s,p,k:K}=c,sp=Math.max(2,p.lineSpacing),lb=s.blurL(3*K),ink=hexRgb(p.ink),paper=hexRgb(p.paperTone),n=p.toneLevels;
  perPixel(c,(x,y,k,o)=>{
    const l=Math.round(lb[k]*n)/n,d=1-l,u=y+p.curvature*sp*(1.5*Math.sin(x/(sp*14)))+p.curvature*(lb[k]-0.5)*sp*6;
    let cov=clamp(d*sp*0.5*p.strokeWidth-Math.abs(fract(u/sp)-0.5)*sp+0.5);
    if(d>0.7){const v=(x*0.7071+y*0.7071)/sp;cov=Math.max(cov,clamp((d-0.7)/0.3*sp*0.35*p.strokeWidth-Math.abs(fract(v)-0.5)*sp+0.5));}
    o[0]=lerp(paper[0],ink[0],cov);o[1]=lerp(paper[1],ink[1],cov);o[2]=lerp(paper[2],ink[2],cov);
  });
});
def(26,[['dotPitch','Rozteč rastru',3,30,0.5,8,'px'],['dotShape','Tvar bodu',[['circle','Kruh'],['square','Čtverec'],['diamond','Kosočtverec'],['line','Linka']],'circle'],['screenAngle','Úhel rastru',0,90,1,45,'deg'],['invert','Invertovat',false],['inkColor','Inkoust','#141414'],['paperColor','Papír','#f1ede3']],c=>{
  const {src:s,p}=c,cs=Math.max(2,p.dotPitch),a=p.screenAngle*D2R,ca=Math.cos(a),sa=Math.sin(a),L=s.blurL(cs*0.3),ink=hexRgb(p.inkColor),paper=hexRgb(p.paperColor);
  perPixel(c,(x,y,k,o)=>{
    const u=x*ca+y*sa,v=-x*sa+y*ca,cu=(Math.floor(u/cs)+0.5)*cs,cv=(Math.floor(v/cs)+0.5)*cs,l=s.lb(L,cu*ca-cv*sa,cu*sa+cv*ca),dk=p.invert?l:1-l,du=u-cu,dv=v-cv;let d,r;
    switch(p.dotShape){case'square':d=Math.max(Math.abs(du),Math.abs(dv));r=cs*0.5*Math.sqrt(dk);break;case'diamond':d=Math.abs(du)+Math.abs(dv);r=cs*Math.sqrt(dk/2)*1.2;break;case'line':d=Math.abs(dv);r=cs*0.5*dk;break;default:d=Math.sqrt(du*du+dv*dv);r=cs*0.7071*Math.sqrt(dk);}
    const cov=clamp(r-d+0.5);o[0]=lerp(paper[0],ink[0],cov);o[1]=lerp(paper[1],ink[1],cov);o[2]=lerp(paper[2],ink[2],cov);
  });
});
def(27,[['grainDensity','Velikost zrna',1,4,0.1,1.4,'px'],['noiseSeed','Seed šumu',1,999,1,7],['contrast','Kontrast',0.5,2.5,0.05,1.3],['tonalBias','Tónové vychýlení',0.4,2.5,0.05,1],['inkColor','Inkoust','#16120f'],['paper','Papír','#efe7d6']],c=>{
  const {src:s,p}=c,gs=Math.max(0.7,p.grainDensity),ink=hexRgb(p.inkColor),paper=hexRgb(p.paper),sd=p.noiseSeed;
  perPixel(c,(x,y,k,o)=>{const nz=0.6*hash2(Math.floor(x/gs),Math.floor(y/gs),sd)+0.4*vnoise(x/(gs*2.5),y/(gs*1.2),sd),d=Math.pow(1-con(s.L[k],p.contrast),p.tonalBias),cov=clamp((d-nz)*8+0.5);o[0]=lerp(paper[0],ink[0],cov);o[1]=lerp(paper[1],ink[1],cov);o[2]=lerp(paper[2],ink[2],cov);});
});
def(28,[['dotCount','Počet teček (tisíce)',2,60,1,18],['dotSize','Velikost tečky',2,20,0.5,6,'px'],['radiusJitter','Rozptyl velikosti',0,1,0.01,0.5],['colorJitter','Rozptyl barvy',0,1,0.01,0.35],['edgeBias','Zahuštění u hran',0,1,0.01,0.4],pSeed(42),['background','Podklad',[['paper','Papír'],['dark','Tmavý'],['blur','Rozmazaná fotka']],'paper']],c=>{
  const {src:s,W,H,ctx,p,k:K}=c,rnd=rng(p.seed),sob=s.sobel(2),o=[0,0,0];
  if(p.background==='blur'){const f=s.blurRGB(10*K),img=c.img(),d=img.data;for(let i=0;i<W*H;i++){d[i*4]=f.R[i]*255;d[i*4+1]=f.G[i]*255;d[i*4+2]=f.B[i]*255;d[i*4+3]=255;}c.put(img);}
  else{ctx.fillStyle=p.background==='dark'?'#121212':'#f3efe5';ctx.fillRect(0,0,W,H);}
  const target=p.dotCount*1000;let placed=0;
  for(let tries=0;placed<target&&tries<target*4;tries++){
    const x=rnd()*W,y=rnd()*H,e=Math.min(1,sob.mag[s.i(x,y)]*6);if(rnd()>(1-p.edgeBias)+p.edgeBias*e)continue;
    s.c(x,y,o);satAdj(o,1.2);const j=p.colorJitter*120;
    ctx.fillStyle=rgbS(o[0]+(rnd()-0.5)*j,o[1]+(rnd()-0.5)*j,o[2]+(rnd()-0.5)*j);
    const r=p.dotSize*(1-p.radiusJitter*rnd()*0.75)*(1-e*0.35);ctx.beginPath();ctx.arc(x,y,Math.max(0.5,r),0,TAU);ctx.fill();placed++;
  }
});
function kmeans(s,k,seed){const rnd=rng(seed),S=[],o=[0,0,0];for(let i=0;i<3000;i++){s.c(rnd()*s.w,rnd()*s.h,o);S.push([o[0],o[1],o[2],0.299*o[0]+0.587*o[1]+0.114*o[2]]);}S.sort((a,b)=>a[3]-b[3]);let C=[];for(let i=0;i<k;i++)C.push(S[Math.floor((i+0.5)/k*S.length)].slice(0,3));
  for(let it=0;it<8;it++){const acc=C.map(()=>[0,0,0,0]);for(const v of S){let b=0,bd=1e18;for(let i=0;i<k;i++){const d=(v[0]-C[i][0])**2+(v[1]-C[i][1])**2+(v[2]-C[i][2])**2;if(d<bd){bd=d;b=i;}}const a=acc[b];a[0]+=v[0];a[1]+=v[1];a[2]+=v[2];a[3]++;}C=C.map((c2,i)=>acc[i][3]?[acc[i][0]/acc[i][3],acc[i][1]/acc[i][3],acc[i][2]/acc[i][3]]:c2);}return C;}
def(29,[['colorLevels','Počet úrovní',2,12,1,4],['palette','Způsob',[['channels','Po kanálech RGB'],['kmeans','Chytrá paleta (k-means)'],['gray','Odstíny šedi']],'channels'],['contrast','Kontrast',0.5,2,0.05,1.1],['saturation','Sytost',0,2.5,0.05,1.2],['edgeThreshold','Obrys (0 = vypnuto)',0,0.4,0.01,0]],c=>{
  const {src:s,p}=c,n=p.colorLevels,mask=p.edgeThreshold>0?edgeMask(s,1.5,p.edgeThreshold,1.5*c.k):null,C=p.palette==='kmeans'?kmeans(s,n,5):null,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    if(mask&&mask[k]){o[0]=o[1]=o[2]=18;return;}
    s.c(x,y,col);satAdj(col,p.saturation);for(let q=0;q<3;q++)col[q]=con(col[q]/255,p.contrast)*255;
    if(C){let b=C[0],bd=1e18;for(const q of C){const d=(col[0]-q[0])**2+(col[1]-q[1])**2+(col[2]-q[2])**2;if(d<bd){bd=d;b=q;}}o[0]=b[0];o[1]=b[1];o[2]=b[2];}
    else if(p.palette==='gray'){const l=Math.round((0.299*col[0]+0.587*col[1]+0.114*col[2])/255*(n-1))/(n-1)*255;o[0]=o[1]=o[2]=l;}
    else for(let q=0;q<3;q++)o[q]=Math.round(col[q]/255*(n-1))/(n-1)*255;
  });
});
def(30,[['ink1','Barva 1','#ff48b0'],['ink2','Barva 2','#0078bf'],['misregistration','Posun soutisku',0,20,0.5,4,'px'],['grainSize','Velikost zrna',1,5,0.1,1.5,'px'],['threshold','Hustota barvy',0.5,1.5,0.01,1],['paperTexture','Textura papíru',0,1,0.01,0.5],['paper','Papír','#f4efe4']],c=>{
  const {src:s,W,H,p,k:K}=c,a1=hexRgb(p.ink1).map(v=>1-v/255),a2=hexRgb(p.ink2).map(v=>1-v/255),paper=hexRgb(p.paper),gs=Math.max(0.7,p.grainSize),mis=p.misregistration;
  const A11=a1[0]*a1[0]+a1[1]*a1[1]+a1[2]*a1[2],A12=a1[0]*a2[0]+a1[1]*a2[1]+a1[2]*a2[2],A22=a2[0]*a2[0]+a2[1]*a2[1]+a2[2]*a2[2],det=A11*A22-A12*A12||1e-6,tex=noiseField(W,H,40*K,3,4),col=[0,0,0];
  const sep=(x,y)=>{s.c(x,y,col);const y0=1-col[0]/255,y1=1-col[1]/255,y2=1-col[2]/255,b1=a1[0]*y0+a1[1]*y1+a1[2]*y2,b2=a2[0]*y0+a2[1]*y1+a2[2]*y2;return[clamp((A22*b1-A12*b2)/det*p.threshold),clamp((A11*b2-A12*b1)/det*p.threshold)];};
  perPixel(c,(x,y,k,o)=>{
    const c1=sep(x,y)[0],c2=sep(x-mis,y-mis*0.6)[1],gx=Math.floor(x/gs),gy=Math.floor(y/gs);
    const g1=lerp(c1,c1>hash2(gx,gy,11)?1:0,0.65),g2=lerp(c2,c2>hash2(gx,gy,29)?1:0,0.65),pt=1-(tex[k]-0.5)*0.12*p.paperTexture-(hash2(x,y,5)-0.5)*0.05*p.paperTexture;
    for(let q=0;q<3;q++)o[q]=paper[q]*pt*(1-g1*a1[q])*(1-g2*a2[q]);
  });
});
def(31,[['strokeStrength','Síla tahů',0.5,4,0.05,1.6],['blurRadius','Šířka tahu',2,30,1,8,'px'],['threshold','Práh bílé',0.6,1,0.005,0.96],['paperGrain','Zrno papíru',0,1,0.01,0.4],['contrast','Kontrast',0.5,2,0.05,1.1],['hatching','Šrafování stínů',0,1,0.01,0.5]],c=>{
  const {src:s,W,H,p,k:K}=c,lb=s.blurL(p.blurRadius),lb2=s.blurL(6*K),grain=noiseField(W,H,3*K,2,8,2),hs=5*K;
  perPixel(c,(x,y,k,o)=>{
    let v=Math.min(1,s.L[k]/(lb[k]+0.004));v=Math.pow(v,p.strokeStrength);if(v>p.threshold)v=1;v=con(v,p.contrast);
    if(lb2[k]<0.5&&p.hatching>0&&fract((x+y)/hs)<0.3)v*=1-p.hatching*(0.5-lb2[k])*1.4;
    v*=1-(grain[k]-0.5)*0.25*p.paperGrain;
    o[0]=lerp(40,246,v);o[1]=lerp(42,244,v);o[2]=lerp(48,239,v);
  });
});
def(32,[['dotCount','Počet bodů (tisíce)',2,80,1,25],['minDistance','Min. vzdálenost',0,10,0.25,2,'px'],['dotRadius','Poloměr bodu',0.4,4,0.05,1.1,'px'],['densityGamma','Gama hustoty',0.5,3,0.05,1.4],pSeed(42),['ink','Inkoust','#141414'],['paper','Papír','#f5f2ea']],c=>{
  const {src:s,W,H,ctx,p}=c,rnd=rng(p.seed),md=p.minDistance,md2=md*md,cell=Math.max(1,md),gc=Math.ceil(W/cell),gr=Math.ceil(H/cell),grid=md>0?new Array(gc*gr):null,path=new Path2D(),r=p.dotRadius,L=s.blurL(1);
  ctx.fillStyle=p.paper;ctx.fillRect(0,0,W,H);
  const target=p.dotCount*1000;let placed=0;
  for(let tries=0;placed<target&&tries<target*8;tries++){
    const x=rnd()*W,y=rnd()*H;if(rnd()>Math.pow(1-L[s.i(x,y)],p.densityGamma))continue;
    if(grid){const gi=Math.floor(x/cell),gj=Math.floor(y/cell);let ok=true;for(let dj=-1;dj<=1&&ok;dj++)for(let di=-1;di<=1&&ok;di++){const i=gi+di,j=gj+dj;if(i<0||j<0||i>=gc||j>=gr)continue;const b=grid[j*gc+i];if(b)for(let q=0;q<b.length;q+=2){const dx=b[q]-x,dy=b[q+1]-y;if(dx*dx+dy*dy<md2){ok=false;break;}}}if(!ok)continue;const key=gj*gc+gi;(grid[key]||(grid[key]=[])).push(x,y);}
    path.moveTo(x+r,y);path.arc(x,y,r,0,TAU);placed++;
  }
  ctx.fillStyle=p.ink;ctx.fill(path);
});
def(33,[['gridCount','Mřížka',[['2','2 × 2'],['3','3 × 3']],'2'],['paletteSets','Sada palet',[['classic','Klasický pop-art'],['neon','Neon'],['pastel','Pastel'],['retro','Retro']],'classic'],['levels','Tónové úrovně',2,5,1,3],['contrast','Kontrast',0.5,2.5,0.05,1.4],['outline','Černý obrys',true]],c=>{
  const {src:s,W,H,p}=c,g=+p.gridCount,tw=W/g,th=H/g,n=p.levels,L=s.blurL(1.5*g*c.k/2),hues=[330,52,190,120,280,18,160,230,0];
  const sets={classic:[0.95,0.48,0.2],neon:[1,0.55,0.12],pastel:[0.55,0.7,0.35],retro:[0.6,0.5,0.22]}[p.paletteSets];
  const pals=hues.slice(0,g*g).map((h,i)=>{const r=[hsl(h+180,0.7,sets[2])];for(let q=1;q<n;q++)r.push(hsl(h+q*(p.paletteSets==='retro'?18:38),sets[0],Math.min(0.92,sets[1]+0.4*(q-1)/Math.max(1,n-2))));return r;});
  const smp=[];for(let i=0;i<L.length;i+=97)smp.push(L[i]);smp.sort((a,b)=>a-b);const lo=smp[Math.floor(smp.length*0.03)],hi=smp[Math.floor(smp.length*0.97)],sp=Math.max(0.05,hi-lo);
  const lev=(u,v)=>Math.min(n-1,Math.floor(con((s.lb(L,u,v)-lo)/sp,p.contrast)*n));
  perPixel(c,(x,y,k,o)=>{
    const ti=Math.min(g-1,Math.floor(x/tw)),tj=Math.min(g-1,Math.floor(y/th)),u=(x-ti*tw)/tw*W,v=(y-tj*th)/th*H,lv=lev(u,v);
    if(p.outline&&(lev(u+g*1.4,v)!==lv||lev(u,v+g*1.4)!==lv)){o[0]=o[1]=o[2]=14;return;}
    const q=pals[tj*g+ti][lv];o[0]=q[0];o[1]=q[1];o[2]=q[2];
  });
});
def(34,[['colorCount','Barev na kanál',2,6,1,4],['contourWidth','Tloušťka kontur',0,5,0.25,1.5,'px'],['inkBleed','Rozpití barvy',0,12,0.5,4,'px'],['grain','Kresba dřeva',0,1,0.01,0.5],['textureScale','Měřítko textury',4,40,1,14,'px'],['paper','Papír','#efe3c8']],c=>{
  const {src:s,W,H,p}=c,n=p.colorCount-1,f=s.blurRGB(p.inkBleed),paper=hexRgb(p.paper),Q=new Float32Array(W*H*3),Lq=new Float32Array(W*H),col=[0,0,0];
  for(let i=0;i<W*H;i++){col[0]=f.R[i]*255;col[1]=f.G[i]*255;col[2]=f.B[i]*255;satAdj(col,1.25);for(let q=0;q<3;q++){Q[i*3+q]=lerp(Math.round(clamp(col[q]/255)*n)/n*255,paper[q],0.14);}Lq[i]=Q[i*3]*0.3+Q[i*3+1]*0.59+Q[i*3+2]*0.11;}
  let mask=null;if(p.contourWidth>0){const m=new Uint8Array(W*H);for(let y=0;y<H-1;y++)for(let x=0;x<W-1;x++){const i=y*W+x;if(Math.abs(Lq[i]-Lq[i+1])>8||Math.abs(Lq[i]-Lq[i+W])>8)m[i]=1;}mask=dilate(m,W,H,Math.round((p.contourWidth-1)/2));}
  const ts=Math.max(2,p.textureScale),wood=noiseField(W,H,ts*3,3,13);
  perPixel(c,(x,y,k,o)=>{
    if(mask&&mask[k]){o[0]=31;o[1]=34;o[2]=51;return;}
    const w=0.5+0.5*Math.sin((y/ts+wood[k]*8)*Math.PI),m=1-p.grain*(0.2*w+0.08*hash2(x>>1,y,3));
    o[0]=Q[k*3]*m;o[1]=Q[k*3+1]*m;o[2]=Q[k*3+2]*m;
  });
});

// ---------- Geometric ----------
def(12,[['glyphType','Glyf',[['plus','Plus +'],['x','Křížek ×'],['mix','Mix podle jasu']],'plus'],['spacing','Rozteč',4,40,1,11,'px'],['strokeWidth','Tloušťka tahu',0.5,6,0.1,1.6,'px'],['scale','Měřítko',0.3,1.6,0.05,1],['invert','Invertovat',false],['colorMode','Barvy',[['mono','Jednobarevně'],['source','Podle fotky']],'mono'],['ink','Barva','#f0eee8'],['background','Pozadí','#111113']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(3,p.spacing),L=s.blurL(sp*0.35),o=[0,0,0],path=new Path2D();
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);ctx.lineCap='square';ctx.lineWidth=p.strokeWidth;
  for(let y=sp/2;y<H;y+=sp)for(let x=sp/2;x<W;x+=sp){
    const l=s.lb(L,x,y),d=p.invert?1-l:l,arm=sp*0.5*p.scale*d;if(arm<0.4)continue;
    const type=p.glyphType==='mix'?(l>0.55?'x':'plus'):p.glyphType,pt=p.colorMode==='source'?new Path2D():path,a=type==='x'?arm*0.8:arm;
    if(type==='x'){pt.moveTo(x-a,y-a);pt.lineTo(x+a,y+a);pt.moveTo(x+a,y-a);pt.lineTo(x-a,y+a);}else{pt.moveTo(x-a,y);pt.lineTo(x+a,y);pt.moveTo(x,y-a);pt.lineTo(x,y+a);}
    if(p.colorMode==='source'){s.c(x,y,o);ctx.strokeStyle=rgbS(o[0]*1.2,o[1]*1.2,o[2]*1.2);ctx.stroke(pt);}
  }
  if(p.colorMode!=='source'){ctx.strokeStyle=p.ink;ctx.stroke(path);}
});
def(13,[['spacing','Rozteč',4,40,1,9,'px'],['angle','Sklon',[['slash','/ doprava'],['back','\\ doleva'],['flow','Podle kontur']],'slash'],['strokeLength','Délka tahu',0.2,2.5,0.05,1.2],['strokeWidth','Tloušťka',0.5,6,0.1,1.6,'px'],['contrast','Kontrast',0.3,3,0.05,1.3],['colorMode','Barvy',[['ink','Inkoust na papíře'],['light','Světlé na tmavém'],['source','Podle fotky na tmavém']],'ink']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(3,p.spacing),L=s.blurL(sp*0.35),sob=s.sobel(3),ink=p.colorMode==='ink',o=[0,0,0],buckets=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];
  ctx.fillStyle=ink?'#f1ede4':'#0d0d10';ctx.fillRect(0,0,W,H);ctx.lineCap='round';
  for(let y=sp/2;y<H;y+=sp)for(let x=sp/2;x<W;x+=sp){
    const l=con(s.lb(L,x,y),p.contrast),v=ink?1-l:l;if(v<0.05)continue;
    let a;if(p.angle==='flow'){const gi=s.i(x,y);a=Math.atan2(sob.gy[gi],sob.gx[gi])+Math.PI/2;}else a=p.angle==='slash'?-Math.PI/4:Math.PI/4;
    const len=sp*p.strokeLength*v*0.5,dx=Math.cos(a)*len,dy=Math.sin(a)*len,b=Math.min(3,Math.floor(v*4));
    if(p.colorMode==='source'){s.c(x,y,o);ctx.strokeStyle=rgbS(o[0]*1.2,o[1]*1.2,o[2]*1.2);ctx.lineWidth=p.strokeWidth*(0.5+v*0.8);ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x+dx,y+dy);ctx.stroke();}
    else{buckets[b].moveTo(x-dx,y-dy);buckets[b].lineTo(x+dx,y+dy);}
  }
  if(p.colorMode!=='source')buckets.forEach((b,i)=>{ctx.strokeStyle=ink?'#18181c':'#f0efe9';ctx.lineWidth=p.strokeWidth*(0.5+(i+0.5)/4*0.8);ctx.stroke(b);});
});
def(14,[['spacing','Rozteč',4,48,1,12,'px'],['diamondSize','Velikost',0.3,1.6,0.05,1],['rotation','Rotace',0,90,1,0,'deg'],['colorMode','Barvy',[['source','Podle fotky'],['mono','Bílá na černé'],['ink','Inkoust na papíře']],'source'],['threshold','Práh viditelnosti',0,0.6,0.01,0.04]],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(3,p.spacing),L=s.blurL(sp*0.35),ink=p.colorMode==='ink',a=p.rotation*D2R,ca=Math.cos(a),sa=Math.sin(a),o=[0,0,0],path=new Path2D();
  ctx.fillStyle=ink?'#f1ede4':'#0b0b0d';ctx.fillRect(0,0,W,H);
  for(let y=sp/2;y<H;y+=sp)for(let x=sp/2;x<W;x+=sp){
    const l=s.lb(L,x,y),v=ink?1-l:l;if(v<p.threshold)continue;const h=sp*0.5*p.diamondSize*Math.sqrt(v)*1.05;
    const pts=[[0,-h],[h,0],[0,h],[-h,0]].map(([u,w])=>[x+u*ca-w*sa,y+u*sa+w*ca]);
    if(p.colorMode==='source'){s.c(x,y,o);ctx.fillStyle=rgbS(o[0]*1.1,o[1]*1.1,o[2]*1.1);ctx.beginPath();pts.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.closePath();ctx.fill();}
    else{path.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<4;i++)path.lineTo(pts[i][0],pts[i][1]);path.closePath();}
  }
  if(p.colorMode!=='source'){ctx.fillStyle=ink?'#141416':'#f3f2ee';ctx.fill(path);}
});
def(15,[['spacing','Rozteč čar',3,30,0.5,7,'px'],['lineHeight','Výška buňky',4,80,1,18,'px'],['strokeWidth','Max. tloušťka (podíl rozteče)',0.2,1,0.01,0.85],['edgeInfluence','Vliv hran',0,2,0.05,0.6],['threshold','Práh',0,0.5,0.01,0.03],['ink','Inkoust','#121214'],['paper','Papír','#f3f0e8']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(2,p.spacing),lh=Math.max(3,p.lineHeight),sob=s.sobel(2),o=[0,0,0,0],path=new Path2D(),gap=lh*0.12;
  ctx.fillStyle=p.paper;ctx.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=lh)for(let x=0;x<W;x+=sp){s.cell(x,y,sp,lh,o);const v=clamp(1-o[3]+sob.mag[s.i(x+sp/2,y+lh/2)]*p.edgeInfluence*3);if(v<p.threshold)continue;const w=sp*p.strokeWidth*v;path.rect(x+sp/2-w/2,y+gap/2,w,lh-gap);}
  ctx.fillStyle=p.ink;ctx.fill(path);
});
def(35,[['recursionDepth','Hloubka rekurze',1,8,1,5],['scaleFactor','Zmenšení vnořené kopie',0.2,0.8,0.01,0.45],['rotation','Rotace na úroveň',-45,45,1,8,'deg'],pCX,pCY,['spiralStrength','Spirála',0,1,0.01,0.25]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,lsf=Math.log(p.scaleFactor);
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,d=Math.max(Math.abs(dx)/((dx<0?Cx:W-Cx)||1),Math.abs(dy)/((dy<0?Cy:H-Cy)||1));if(d<1e-6){o[0]=Cx;o[1]=Cy;return;}
    const lev=Math.max(0,Math.log(d)/lsf),n=Math.min(p.recursionDepth,Math.floor(lev)),sc=Math.pow(p.scaleFactor,-n),ang=n*p.rotation*D2R+p.spiralStrength*lev*TAU*0.25,ca=Math.cos(ang),sa=Math.sin(ang);
    o[0]=Cx+(dx*ca-dy*sa)*sc;o[1]=Cy+(dx*sa+dy*ca)*sc;});
});
def(36,[['particleCount','Počet částic (tisíce)',0.5,20,0.5,6],['stepLength','Délka kroku',0.5,6,0.1,2,'px'],['steps','Délka dráhy (kroky)',5,80,1,28],['fieldStrength','Vliv fotky na pole',0,1,0.01,0.75],['strokeWidth','Tloušťka',0.3,4,0.1,1,'px'],pSeed(42),['background','Pozadí',[['dark','Tmavé'],['paper','Papír'],['dim','Ztmavená fotka']],'dark']],c=>{
  const {src:s,W,H,ctx,p,k:K}=c,sob=s.sobel(4*K),rnd=rng(p.seed),o=[0,0,0],fs=p.fieldStrength;
  ctx.fillStyle=p.background==='paper'?'#f2eee6':'#0b0b0e';ctx.fillRect(0,0,W,H);
  if(p.background==='dim'){ctx.globalAlpha=0.25;ctx.drawImage(c.srcCanvas,0,0,W,H);ctx.globalAlpha=1;}
  ctx.lineWidth=p.strokeWidth;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=0.8;
  const N=p.particleCount*1000,b=p.background==='paper'?0.95:1.2;
  for(let n=0;n<N;n++){
    let x=rnd()*W,y=rnd()*H;s.c(x,y,o);ctx.strokeStyle=rgbS(o[0]*b,o[1]*b,o[2]*b);ctx.beginPath();ctx.moveTo(x,y);
    for(let st=0;st<p.steps;st++){const gi=s.i(x,y),m=sob.mag[gi],na=fbm(x/(220*K),y/(220*K),2,p.seed)*TAU*2,w=fs*Math.min(1,m*25);let vx=Math.cos(na)*(1-w),vy=Math.sin(na)*(1-w);if(m>1e-6){vx+=-sob.gy[gi]/m*w;vy+=sob.gx[gi]/m*w;}const len=Math.hypot(vx,vy)||1;x+=vx/len*p.stepLength;y+=vy/len*p.stepLength;if(x<0||y<0||x>=W||y>=H)break;ctx.lineTo(x,y);}
    ctx.stroke();
  }
  ctx.globalAlpha=1;
});
const BAUHAUS=rampOf(['#d1302b','#1f4f9f','#f2be2c','#151515']);
def(37,[['shapeSet','Sada tvarů',[['bauhaus','Bauhaus mix'],['circles','Kruhy'],['squares','Čtverce'],['triangles','Trojúhelníky']],'bauhaus'],['cellSize','Velikost buňky',8,80,1,26,'px'],['rotation','Náhodná rotace',0,1,0.01,0.6],['shapeScale','Velikost tvarů',0.3,1.4,0.05,0.95],['palette','Paleta',[['bauhaus','Bauhaus'],['source','Podle fotky'],['mono','Černá']],'bauhaus'],['background','Pozadí','#ece5d3'],pSeed(7)],c=>{
  const {src:s,W,H,ctx,p}=c,cs=Math.max(4,p.cellSize),o=[0,0,0,0];
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);
  for(let j=0,y=0;y<H;j++,y+=cs)for(let i=0,x=0;x<W;i++,x+=cs){
    s.cell(x,y,cs,cs,o);const d=1-o[3],sz=cs*p.shapeScale*(0.25+0.75*d);if(d<0.08)continue;
    let col;if(p.palette==='source')col=rgbS(o[0],o[1],o[2]);else if(p.palette==='mono')col='#151515';else{const [,sat]=rgb2hsl(o[0],o[1],o[2]);col=sat<0.18||o[3]<0.18?'#151515':rgbS(...nearestCol(BAUHAUS.slice(0,3),o));}
    const h=hash2(i,j,p.seed),shape=p.shapeSet==='bauhaus'?['circle','square','tri','half','quarter'][Math.floor(h*5)]:{circles:'circle',squares:'square',triangles:'tri'}[p.shapeSet];
    const rot=hash2(i,j,p.seed+1)<p.rotation?Math.floor(hash2(j,i,p.seed+2)*4)*Math.PI/2:0,r=sz/2;
    ctx.save();ctx.translate(x+cs/2,y+cs/2);ctx.rotate(rot);ctx.fillStyle=col;ctx.beginPath();
    if(shape==='circle')ctx.arc(0,0,r,0,TAU);else if(shape==='square')ctx.rect(-r,-r,sz,sz);else if(shape==='tri'){ctx.moveTo(-r,r);ctx.lineTo(r,r);ctx.lineTo(-r,-r);}else if(shape==='half'){ctx.arc(0,r*0.4,r,Math.PI,0);}else{ctx.moveTo(-r,r);ctx.arc(-r,r,sz,-Math.PI/2,0);}
    ctx.closePath();ctx.fill();ctx.restore();
  }
});
def(38,[['blockSize','Velikost bloku',4,40,1,12,'px'],['heightScale','Výška sloupců',0,80,1,30,'px'],['lightDirection','Světlo',[['left','Zleva'],['right','Zprava']],'left'],['outlines','Obrysy hran',true],['palette','Paleta',[['source','Podle fotky'],['mono','Monochrom'],['sunset','Západ slunce']],'source']],c=>{
  const {src:s,W,H,ctx,p}=c,bs=Math.max(3,p.blockSize),hm=p.heightScale,offY=hm*0.85,gw=W-hm*0.55,gh=H-offY,cols=Math.max(1,Math.floor(gw/bs)),rows=Math.max(1,Math.floor(gh/bs)),o=[0,0,0,0],sun=rampOf(['#2d1b4e','#a13d63','#f47c48','#ffd36e']),lf=p.lightDirection==='left';
  ctx.fillStyle='#0f1014';ctx.fillRect(0,0,W,H);ctx.lineWidth=Math.max(0.5,bs*0.05);ctx.strokeStyle='rgba(0,0,0,0.45)';ctx.lineJoin='round';
  const sh=(col,f)=>rgbS(col[0]*f,col[1]*f,col[2]*f);
  for(let r=0;r<rows;r++)for(let q=cols-1;q>=0;q--){
    const x=q*bs,y=offY+r*bs;s.cell(q/cols*W,r/rows*H,W/cols,H/rows,o);const l=o[3],h=l*hm,tx=x+h*0.55,ty=y-h*0.85;
    let col=p.palette==='source'?[o[0],o[1],o[2]]:p.palette==='mono'?[230*l+20,230*l+20,230*l+24]:rampAt(sun,l,[0,0,0]);
    poly(ctx,[x,y,x,y+bs,tx,ty+bs,tx,ty]);ctx.fillStyle=sh(col,lf?0.85:0.42);ctx.fill();if(p.outlines)ctx.stroke();
    poly(ctx,[x,y+bs,x+bs,y+bs,tx+bs,ty+bs,tx,ty+bs]);ctx.fillStyle=sh(col,0.58);ctx.fill();if(p.outlines)ctx.stroke();
    ctx.fillStyle=sh(col,1.08);ctx.fillRect(tx,ty,bs,bs);if(p.outlines)ctx.strokeRect(tx,ty,bs,bs);
  }
});
def(39,[['gridSpacing','Rozteč mřížky',4,40,1,12,'px'],['warpStrength','Síla deformace',0,2,0.01,0.8],['lineWidth','Tloušťka drátu',0.5,6,0.1,2.2,'px'],['weaveDepth','Hloubka výpletu',0,1,0.01,0.6],['colorMode','Barvy',[['source','Podle fotky'],['gold','Zlatý drát'],['white','Bílý drát']],'source']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(3,p.gridSpacing),L=s.blurL(sp*0.3),step=Math.max(2,sp/3),o=[0,0,0],bg='#0c0c0e',mono={gold:[226,180,90],white:[238,238,232]}[p.colorMode];
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.lineCap='round';
  const seg=(x0,y0,x1,y1)=>{const mx=(x0+x1)/2,my=(y0+y1)/2,l=s.lb(L,mx,my);let col;if(mono)col=rgbS(mono[0]*(0.35+l*0.8),mono[1]*(0.35+l*0.8),mono[2]*(0.35+l*0.8));else{s.c(mx,my,o);col=rgbS(o[0]*1.15,o[1]*1.15,o[2]*1.15);}ctx.strokeStyle=col;ctx.lineWidth=p.lineWidth*(0.35+l*0.9);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();};
  const hy=(x,y0)=>y0+p.warpStrength*sp*(s.lb(L,x,y0)-0.5)*1.6,vx=(x0,y)=>x0+p.warpStrength*sp*(s.lb(L,x0,y)-0.5)*1.6;
  for(let y0=sp/2;y0<H;y0+=sp)for(let x=0;x<W;x+=step)seg(x,hy(x,y0),x+step,hy(x+step,y0));
  for(let x0=sp/2;x0<W;x0+=sp)for(let y=0;y<H;y+=step)seg(vx(x0,y),y,vx(x0,y+step),y+step);
  if(p.weaveDepth>0){let j=0;for(let y0=sp/2;y0<H;y0+=sp,j++){let i=0;for(let x0=sp/2;x0<W;x0+=sp,i++){if((i+j)&1)continue;const a=x0-sp*0.38,b=x0+sp*0.38;ctx.strokeStyle=`rgba(12,12,14,${p.weaveDepth})`;ctx.lineWidth=p.lineWidth*2.2;ctx.beginPath();ctx.moveTo(a,hy(a,y0));ctx.lineTo(x0,hy(x0,y0));ctx.lineTo(b,hy(b,y0));ctx.stroke();for(let x=a;x<b-0.01;x+=step/2)seg(x,hy(x,y0),Math.min(b,x+step/2),hy(Math.min(b,x+step/2),y0));}}}
});
def(40,[['triangleCount','Hustota (trojúhelníků na šířku)',6,90,1,34],['edgeBias','Přichycení k hranám',0,1,0.01,0.6],['randomness','Nahodilost',0,1,0.01,0.7],['outlines','Obrysy',false],pSeed(42)],c=>{
  const {src:s,W,H,ctx,p}=c,cell=W/p.triangleCount,cols=Math.ceil(W/cell),rows=Math.ceil(H/cell),sob=s.sobel(1),P=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){let x=Math.min(W,i*cell),y=Math.min(H,j*cell);
    if(i>0&&i<cols&&j>0&&j<rows){x+=(hash2(i,j,p.seed)-0.5)*cell*p.randomness*0.9;y+=(hash2(i,j,p.seed+5)-0.5)*cell*p.randomness*0.9;
      if(p.edgeBias>0){let bm=0,bx=x,by=y;for(let b=0;b<4;b++)for(let a=0;a<4;a++){const sx=x+(a/3-0.5)*cell*0.8,sy=y+(b/3-0.5)*cell*0.8,m=sob.mag[s.i(sx,sy)];if(m>bm){bm=m;bx=sx;by=sy;}}if(bm>0.02){x=lerp(x,bx,p.edgeBias);y=lerp(y,by,p.edgeBias);}}}
    P.push([x,y]);}
  const at=(i,j)=>P[j*(cols+1)+i],o=[0,0,0],acc=[0,0,0],cd=(a,b)=>{s.c(a[0],a[1],o);const r=o[0],g=o[1],bb=o[2];s.c(b[0],b[1],o);return Math.abs(r-o[0])+Math.abs(g-o[1])+Math.abs(bb-o[2]);};
  const tri=(a,b,d)=>{const cx=(a[0]+b[0]+d[0])/3,cy=(a[1]+b[1]+d[1])/3;acc[0]=acc[1]=acc[2]=0;for(const q of [[cx,cy],[(cx+a[0])/2,(cy+a[1])/2],[(cx+b[0])/2,(cy+b[1])/2],[(cx+d[0])/2,(cy+d[1])/2]]){s.c(q[0],q[1],o);acc[0]+=o[0];acc[1]+=o[1];acc[2]+=o[2];}const col=rgbS(acc[0]/4,acc[1]/4,acc[2]/4);poly(ctx,[a[0],a[1],b[0],b[1],d[0],d[1]]);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=p.outlines?'rgba(255,255,255,0.28)':col;ctx.lineWidth=p.outlines?0.7:1;ctx.stroke();};
  ctx.lineJoin='round';
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const A=at(i,j),B=at(i+1,j),C=at(i,j+1),D=at(i+1,j+1);if(cd(A,D)<cd(B,C)){tri(A,B,D);tri(A,D,C);}else{tri(A,B,C);tri(B,D,C);}}
});
def(41,[['gridSpacing','Rozteč mřížky',4,40,1,14,'px'],['warpStrength','Síla deformace',0,3,0.05,1.2],['neonColor','Neonová barva','#ff3df0'],['glowWidth','Šířka záře',0,40,1,12,'px'],['colorMode','Barvy',[['neon','Neonová barva'],['rainbow','Duhový přechod'],['source','Podle fotky']],'neon']],c=>{
  const {src:s,W,H,ctx,p}=c,sp=Math.max(3,p.gridSpacing),L=s.blurL(sp*0.3),nc=hexRgb(p.neonColor),step=Math.max(2,sp/3),o=[0,0,0];
  ctx.fillStyle='#07060c';ctx.fillRect(0,0,W,H);ctx.lineCap='round';ctx.lineWidth=Math.max(0.8,1.4*c.k);
  const col=(x,y,l)=>{if(p.colorMode==='source'){s.c(x,y,o);return rgbS(o[0]*(0.4+l),o[1]*(0.4+l),o[2]*(0.4+l));}if(p.colorMode==='rainbow'){const q=hsl(x/W*300+y/H*60,1,0.55);return rgbS(q[0]*(0.25+l),q[1]*(0.25+l),q[2]*(0.25+l));}return rgbS(nc[0]*(0.25+l),nc[1]*(0.25+l),nc[2]*(0.25+l));};
  const d=(x,y)=>p.warpStrength*sp*(s.lb(L,x,y)-0.5)*1.6;
  for(let y0=0;y0<=H;y0+=sp)for(let x=0;x<W;x+=step){const l=s.lb(L,x,y0),a=y0-d(x,y0),b=y0-d(x+step,y0);ctx.strokeStyle=col(x,y0,l);ctx.beginPath();ctx.moveTo(x,a);ctx.lineTo(x+step,b);ctx.stroke();}
  for(let x0=0;x0<=W;x0+=sp)for(let y=0;y<H;y+=step){const l=s.lb(L,x0,y),a=x0+d(x0,y),b=x0+d(x0,y+step);ctx.strokeStyle=col(x0,y,l);ctx.beginPath();ctx.moveTo(a,y);ctx.lineTo(b,y+step);ctx.stroke();}
  bloom(c,p.glowWidth,1.3);
});
def(42,[['edgeSensitivity','Citlivost hran',0.01,0.3,0.005,0.03],['nodeCount','Počet uzlů',0,200,1,60],['lineWidth','Tloušťka linek',0.5,3,0.1,1,'px'],['labelDensity','Hustota popisků',0,1,0.01,0.5],['theme','Vzhled',[['blueprint','Modrotisk'],['paper','Technický papír'],['terminal','Terminál']],'blueprint'],pSeed(42)],c=>{
  const {src:s,W,H,ctx,p,k:K}=c,th={blueprint:['#0d2a4a','#cfe3ff','rgba(207,227,255,0.10)'],paper:['#f2f0ea','#1f3b73','rgba(31,59,115,0.10)'],terminal:['#07110b','#58f29a','rgba(88,242,154,0.09)']}[p.theme],sob=s.sobel(2),rnd=rng(p.seed);
  ctx.fillStyle=th[0];ctx.fillRect(0,0,W,H);ctx.strokeStyle=th[2];ctx.lineWidth=1;const gs=20*K;ctx.beginPath();for(let x=0;x<W;x+=gs){ctx.moveTo(x,0);ctx.lineTo(x,H);}for(let y=0;y<H;y+=gs){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();
  const g=Math.max(3,6*K),path=new Path2D();
  for(let y=0;y<H;y+=g)for(let x=0;x<W;x+=g){let bm=0,bi=0;for(let b=0;b<3;b++)for(let a=0;a<3;a++){const i=s.i(x+a*g/3,y+b*g/3);if(sob.mag[i]>bm){bm=sob.mag[i];bi=i;}}if(bm<p.edgeSensitivity)continue;
    const ang=Math.round((Math.atan2(sob.gy[bi],sob.gx[bi])+Math.PI/2)/(Math.PI/4))*(Math.PI/4),dx=Math.cos(ang)*g*0.55,dy=Math.sin(ang)*g*0.55,cx=x+g/2,cy=y+g/2;path.moveTo(cx-dx,cy-dy);path.lineTo(cx+dx,cy+dy);}
  ctx.strokeStyle=th[1];ctx.lineWidth=p.lineWidth;ctx.lineCap='square';ctx.stroke(path);
  const cand=[],cg=40*K;for(let y=cg/2;y<H;y+=cg)for(let x=cg/2;x<W;x+=cg){let bm=0,bx=x,by=y;for(let b=0;b<5;b++)for(let a=0;a<5;a++){const sx=x+(a/4-0.5)*cg,sy=y+(b/4-0.5)*cg,m=sob.mag[s.i(sx,sy)];if(m>bm){bm=m;bx=sx;by=sy;}}cand.push([bm+rnd()*0.02,bx,by]);}
  cand.sort((a,b)=>b[0]-a[0]);const nodes=cand.slice(0,p.nodeCount);
  ctx.lineWidth=p.lineWidth*0.9;ctx.beginPath();for(let i=1;i<nodes.length;i++){const a=nodes[i],b=nodes[Math.floor(rnd()*i)];if(Math.hypot(a[1]-b[1],a[2]-b[2])>W*0.25)continue;ctx.moveTo(a[1],a[2]);ctx.lineTo(b[1],a[2]);ctx.lineTo(b[1],b[2]);}ctx.stroke();
  ctx.font=`${Math.round(10*K)}px ${FONTS.plex}`;ctx.textBaseline='middle';const pre=['R','C','U','Q','L','D','J','TP'],val=['4.7k','10µ','100n','2N3904','1k','3V3','GND','74HC'];
  for(const n of nodes){const r=3.2*K;ctx.fillStyle=th[0];ctx.fillRect(n[1]-r,n[2]-r,r*2,r*2);ctx.strokeRect(n[1]-r,n[2]-r,r*2,r*2);ctx.fillStyle=th[1];ctx.beginPath();ctx.arc(n[1],n[2],r*0.45,0,TAU);ctx.fill();
    if(rnd()<p.labelDensity){const q=Math.floor(rnd()*pre.length);ctx.fillText(`${pre[q]}${1+Math.floor(rnd()*48)} ${val[q]}`,n[1]+r*2,n[2]-r*1.6);}}
});
def(43,[['gridSize','Počet sloupců',3,16,1,7],['swatchPadding','Okraj vzorku',0,20,0.5,6,'px'],['borderWidth','Rámeček',0,4,0.25,1,'px'],['labels','Popisky HEX',true],['background','Podklad',[['paper','Papír'],['dark','Tmavý']],'paper']],c=>{
  const {src:s,W,H,ctx,p,k:K}=c,cols=p.gridSize,rows=Math.max(1,Math.round(cols*H/W)),cw=W/cols,ch=H/rows,pad=p.swatchPadding,dark=p.background==='dark',o=[0,0,0,0],lh=p.labels?Math.max(12,Math.min(28*K,ch*0.22)):0;
  ctx.fillStyle=dark?'#141416':'#efede6';ctx.fillRect(0,0,W,H);ctx.font=`${Math.round(lh*0.5)}px ${FONTS.plex}`;ctx.textBaseline='middle';
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const x=i*cw+pad,y=j*ch+pad,w=cw-pad*2,h=ch-pad*2;s.cell(i*cw,j*ch,cw,ch,o);
    const hex='#'+[o[0],o[1],o[2]].map(v=>c8(v).toString(16).padStart(2,'0')).join('').toUpperCase();
    ctx.fillStyle=rgbS(o[0],o[1],o[2]);ctx.fillRect(x,y,w,h-lh);
    if(p.labels){ctx.fillStyle=dark?'#1f1f22':'#ffffff';ctx.fillRect(x,y+h-lh,w,lh);ctx.fillStyle=dark?'#d8d8d4':'#1a1a1a';ctx.fillText(`${String(j*cols+i+1).padStart(2,'0')}  ${hex}`,x+lh*0.35,y+h-lh/2);}
    if(p.borderWidth>0){ctx.strokeStyle=dark?'#3a3a3e':'#1a1a1a';ctx.lineWidth=p.borderWidth;ctx.strokeRect(x,y,w,h);}
  }
});
def(44,[['contourCount','Počet vrstevnic',4,60,1,22],['strokeWidth','Tloušťka',0.5,4,0.1,1.2,'px'],['smoothing','Vyhlazení',0,20,0.5,5,'px'],['heightContrast','Kontrast výšek',0.3,3,0.05,1.1],['colorMode','Vzhled',[['ink','Inkoust na papíře'],['hypso','Barevná mapa'],['dark','Světlé na tmavém'],['source','Barvy fotky']],'ink']],c=>{
  const {src:s,W,H,p}=c,h=s.blurL(p.smoothing),n=p.contourCount,hyp=rampOf(['#2f6b4f','#8fae6a','#e8d9a0','#c9945c','#8a5a3c','#f4f1ea']),col=[0,0,0],src=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    const v=con(h[k],p.heightContrast),hx=(con(h[k+(x<W-1?1:0)],p.heightContrast)-con(h[k-(x>0?1:0)],p.heightContrast))*0.5,hy=(con(h[k+(y<H-1?W:0)],p.heightContrast)-con(h[k-(y>0?W:0)],p.heightContrast))*0.5,gm=Math.sqrt(hx*hx+hy*hy)*n+1e-6,f=fract(v*n),dist=Math.min(f,1-f)/gm,band=Math.floor(v*n),w=p.strokeWidth*(Math.round(v*n)%5===0?1.8:1);
    const cov=clamp(w/2-dist+0.5);
    if(p.colorMode==='hypso'){rampAt(hyp,band/n,col);o[0]=col[0]*(1-cov*0.7);o[1]=col[1]*(1-cov*0.7);o[2]=col[2]*(1-cov*0.7);}
    else if(p.colorMode==='dark'){o[0]=lerp(12,235,cov);o[1]=lerp(14,240,cov);o[2]=lerp(18,236,cov);}
    else if(p.colorMode==='source'){s.c(x,y,src);o[0]=lerp(14,src[0]*1.2,cov);o[1]=lerp(14,src[1]*1.2,cov);o[2]=lerp(16,src[2]*1.2,cov);}
    else{o[0]=lerp(242,70,cov);o[1]=lerp(238,46,cov);o[2]=lerp(228,30,cov);}
  });
});
def(45,[['tileSize','Velikost dlaždice',6,60,1,18,'px'],['arcWidth','Tloušťka oblouku',0.05,0.9,0.01,0.45],['orientationMode','Orientace dlaždic',[['brightness','Podle jasu'],['random','Náhodně'],['mix','Kombinace']],'brightness'],pSeed(42),['colors','Barvy',[['duo','Dvoubarevně'],['source','Podle fotky']],'duo'],['foreground','Popředí','#1d1d22'],['background','Pozadí','#efe9dc']],c=>{
  const {src:s,W,H,ctx,p}=c,t=Math.max(4,p.tileSize),o=[0,0,0,0];
  ctx.fillStyle=p.background;ctx.fillRect(0,0,W,H);ctx.lineCap='butt';
  for(let j=0,y=0;y<H;j++,y+=t)for(let i=0,x=0;x<W;i++,x+=t){
    s.cell(x,y,t,t,o);const d=1-o[3],r=hash2(i,j,p.seed);
    const ori=p.orientationMode==='random'?r<0.5:p.orientationMode==='mix'?(r<0.3?r<0.15:o[3]>0.5):o[3]>0.5;
    ctx.lineWidth=t*p.arcWidth*(0.15+d*0.85);ctx.strokeStyle=p.colors==='source'?rgbS(o[0],o[1],o[2]):p.foreground;ctx.beginPath();
    if(ori){ctx.arc(x,y,t/2,0,Math.PI/2);ctx.moveTo(x+t/2,y+t);ctx.arc(x+t,y+t,t/2,Math.PI,Math.PI*1.5);}else{ctx.arc(x+t,y,t/2,Math.PI/2,Math.PI);ctx.moveTo(x+t/2,y);ctx.arc(x,y+t,t/2,-Math.PI/2,0);}
    ctx.stroke();
  }
});

// ---------- Glass ----------
def(46,[['ribWidth','Šířka žebra',6,80,1,26,'px'],['refractionStrength','Lom',0,2,0.01,0.8],['highlightWidth','Odlesk',0,1,0.01,0.45],['blur','Rozostření',0,12,0.5,2,'px'],['orientation','Orientace',[['v','Svislá žebra'],['h','Vodorovná žebra']],'v']],c=>{
  const {src:s,W,H,p}=c,rw=Math.max(3,p.ribWidth),f=s.blurRGB(p.blur),vert=p.orientation==='v',m=1-0.8*p.refractionStrength;
  perPixel(c,(x,y,k,o)=>{const a=vert?x:y,u=fract(a/rw),ac=(Math.floor(a/rw)+0.5)*rw,sa=ac+(a-ac)*m;if(vert)bilF(f,W,H,sa,y,o);else bilF(f,W,H,x,sa,o);
    const hl=Math.exp(-((u-0.22)**2)/(0.002+0.02*p.highlightWidth))*p.highlightWidth*120,dk=1-sstep(0.8,1,u)*0.28;for(let q=0;q<3;q++)o[q]=o[q]*dk+hl;});
});
def(47,[['blurRadius','Rozmazání',0,30,0.5,8,'px'],['noiseScale','Zrnitost skla',0.5,10,0.1,2,'px'],['refractionStrength','Rozptyl',0,30,0.5,8,'px'],['opacity','Mléčnost',0,0.8,0.01,0.18],['tint','Tón skla','#eef4f8']],c=>{
  const {src:s,W,H,p}=c,f=s.blurRGB(p.blurRadius),ns=Math.max(0.5,p.noiseScale),r=p.refractionStrength,t=hexRgb(p.tint);
  perPixel(c,(x,y,k,o)=>{const gx=Math.floor(x/ns),gy=Math.floor(y/ns);bilF(f,W,H,x+(hash2(gx,gy,1)-0.5)*2*r,y+(hash2(gx,gy,2)-0.5)*2*r,o);for(let q=0;q<3;q++)o[q]=lerp(o[q],t[q],p.opacity);});
});
def(48,[['radius','Velikost koule',0.1,0.7,0.01,0.36],['refractionIndex','Index lomu',1,2.5,0.01,1.5],['edgeHighlight','Odlesky hran',0,1,0.01,0.6],['shadow','Stín',0,1,0.01,0.5],pCX,pCY,['invert','Převrácený obraz',true]],c=>{
  const {src:s,W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,R=Math.min(W,H)*p.radius,fm=lerp(1,0.3,(p.refractionIndex-1)/1.5),sg=p.invert?-1:1,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    const dx=x-Cx,dy=y-Cy,d=Math.sqrt(dx*dx+dy*dy)/R;s.c(x,y,o);
    if(d>=1){const sx=dx/R,sy=(dy-R*0.95)/(R*0.22),dk=p.shadow*0.6*Math.exp(-(sx*sx*0.8+sy*sy)*2.5);for(let q=0;q<3;q++)o[q]*=1-dk;}
    const a=clamp((1-d)*R+0.5);if(a<=0)return;
    const z=Math.sqrt(Math.max(0,1-d*d)),m=fm*(1+(1-z)*1.2)*sg;s.bil(Cx+dx*m,Cy+dy*m,col);
    const nx=dx/R,ny=dy/R,rim=Math.pow(d,6)*p.edgeHighlight*170,spec=Math.exp(-((nx+0.35)**2+(ny+0.4)**2)/0.012)*p.edgeHighlight*240;
    for(let q=0;q<3;q++)o[q]=lerp(o[q],col[q]*0.93+rim+spec,a);
  });
});
def(49,[['fragmentCount','Počet střepů',10,600,5,120],['displacement','Posun střepů',0,40,0.5,10,'px'],['rotation','Natočení',0,20,0.5,4,'deg'],['crackWidth','Šířka prasklin',0,4,0.1,1.2,'px'],pSeed(42)],c=>{
  const {src:s,W,H,p}=c,v=voronoi(W,H,Math.sqrt(W*H/p.fragmentCount),1,p.seed),cw=p.crackWidth,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    const id=v.id[k],sx=v.sx[id],sy=v.sy[id],ang=(hash2(id,2,p.seed)-0.5)*2*p.rotation*D2R,ca=Math.cos(ang),sa=Math.sin(ang),lx=x-sx,ly=y-sy;
    s.bil(sx+lx*ca-ly*sa+(hash2(id,0,p.seed)-0.5)*2*p.displacement,sy+lx*sa+ly*ca+(hash2(id,1,p.seed)-0.5)*2*p.displacement,col);
    const e=v.edge[k];let r=col[0],g=col[1],b=col[2];
    if(cw>0){const rim=clamp(cw*1.8-e+0.5)*0.4;r=lerp(r,245,rim);g=lerp(g,248,rim);b=lerp(b,252,rim);const core=clamp(cw*0.5-e+0.5);r=lerp(r,18,core);g=lerp(g,20,core);b=lerp(b,24,core);}
    o[0]=r;o[1]=g;o[2]=b;
  });
});
def(50,[['cellCount','Počet sklíček',20,800,5,220],['colorQuantization','Úrovně barev',2,10,1,5],['leadWidth','Olověné pásky',0.5,8,0.1,2.5,'px'],['saturation','Sytost',0.5,2.5,0.05,1.6],['glow','Prosvícení',0,1,0.01,0.5],pSeed(42)],c=>{
  const {src:s,W,H,p}=c,cell=Math.sqrt(W*H/p.cellCount),v=voronoi(W,H,cell,0.9,p.seed),A=cellAvg(v,s),n=p.colorQuantization-1,C=new Float32Array(v.n*3),col=[0,0,0];
  for(let i=0;i<v.n;i++){col[0]=A.R[i];col[1]=A.G[i];col[2]=A.B[i];satAdj(col,p.saturation);for(let q=0;q<3;q++)C[i*3+q]=Math.round(clamp(col[q]/255*1.08)*n)/n*255;}
  perPixel(c,(x,y,k,o)=>{const id=v.id[k],e=v.edge[k],lead=clamp(p.leadWidth/2-e+0.5),lit=(0.78+0.35*p.glow*sstep(0,cell*0.45,e))*(0.96+0.08*hash2(x>>1,y>>1,3));for(let q=0;q<3;q++)o[q]=lerp(C[id*3+q]*lit,16,lead);});
});
def(51,[['facetSize','Velikost facet',6,80,1,24,'px'],['refraction','Lom',0,1,0.01,0.5],['bevel','Reliéf',0,1,0.01,0.5],['highlightIntensity','Odlesky',0,1,0.01,0.5],pSeed(42)],c=>{
  const {src:s,W,H,p,k:K}=c,fs=Math.max(4,p.facetSize),v=voronoi(W,H,fs,0.85,p.seed),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{
    const id=v.id[k],sx=v.sx[id],sy=v.sy[id],lx=x-sx,ly=y-sy,a=hash2(id,4,p.seed)*TAU;
    s.bil(sx+lx*(1-p.refraction*1.4)+Math.cos(a)*fs*0.3*p.refraction,sy+ly*(1-p.refraction*1.4)+Math.sin(a)*fs*0.3*p.refraction,col);
    const nx=lx/(fs*0.5),ny=ly/(fs*0.5),sh=1+p.bevel*0.28*(nx*0.6+ny*0.6)*-1,hl=clamp(2*K-v.edge[k]+0.5)*p.highlightIntensity*150;
    for(let q=0;q<3;q++)o[q]=col[q]*sh+hl;
  });
});

// ---------- Light & Color ----------
def(10,[['sphereRadius','Velikost koule',0.2,0.95,0.01,0.72],['tileCount','Počet pásů dlaždic',8,60,1,26],['reflectivity','Odrazivost',0,1,0.01,0.6],['bloom','Záře',0,1.5,0.01,0.6],['flare','Záblesky',0,1,0.01,0.5],pSeed(42)],c=>{
  const {src:s,W,H,ctx,p}=c;ctx.fillStyle='#050407';ctx.fillRect(0,0,W,H);ctx.globalAlpha=0.16;ctx.drawImage(c.srcCanvas,0,0,W,H);ctx.globalAlpha=1;
  const Cx=W/2,Cy=H/2,R=Math.min(W,H)/2*p.sphereRadius,bands=p.tileCount,img=ctx.getImageData(0,0,W,H),d=img.data,col=[0,0,0];
  let Lx=-0.45,Ly=-0.55,Lz=0.7;const ll=Math.hypot(Lx,Ly,Lz);Lx/=ll;Ly/=ll;Lz/=ll;
  const x0=Math.max(0,Math.floor(Cx-R)),x1=Math.min(W,Math.ceil(Cx+R)),y0=Math.max(0,Math.floor(Cy-R)),y1=Math.min(H,Math.ceil(Cy+R));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const nx=(x-Cx)/R,ny=(y-Cy)/R,d2=nx*nx+ny*ny;if(d2>=1)continue;const nz=Math.sqrt(1-d2),lat=Math.asin(-ny),lon=Math.atan2(nx,nz);
    const bf=(lat/Math.PI+0.5)*bands,bi=Math.floor(bf),fv=bf-bi,latC=((bi+0.5)/bands-0.5)*Math.PI,nT=Math.max(6,Math.round(bands*2*Math.cos(latC))),stp=TAU/nT,tf=(lon+Math.PI)/stp,ti=Math.floor(tf),fu=tf-ti,lonC=(ti+0.5)*stp-Math.PI;
    const tnx=Math.cos(latC)*Math.sin(lonC),tny=-Math.sin(latC),tnz=Math.cos(latC)*Math.cos(lonC),diff=Math.max(0,tnx*Lx+tny*Ly+tnz*Lz);
    let r,g,b;const gr=0.09;
    if(fu<gr||fu>1-gr||fv<gr||fv>1-gr){r=g=b=14+20*diff;}
    else{s.c((lonC/Math.PI+0.5)*W,(0.5-latC/Math.PI)*H,col);const rx=2*tnz*tnx,ry=2*tnz*tny,rz=2*tnz*tnz-1,spec=Math.pow(Math.max(0,rx*Lx+ry*Ly+rz*Lz),30)*p.reflectivity,h=hash2(bi,ti,p.seed),sp=h>0.95?p.reflectivity*(h-0.95)*20:0,add=255*(spec*1.2+sp*0.6),sh=0.25+0.85*diff;r=col[0]*sh+add;g=col[1]*sh+add;b=col[2]*sh+add;}
    const a=clamp((1-Math.sqrt(d2))*R),i=(y*W+x)*4;d[i]=lerp(d[i],r,a);d[i+1]=lerp(d[i+1],g,a);d[i+2]=lerp(d[i+2],b,a);
  }
  ctx.putImageData(img,0,0);
  if(p.flare>0){const rnd=rng(p.seed);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const a=rnd()*TAU,rr=Math.sqrt(rnd())*0.85,x=Cx+Math.cos(a)*rr*R,y=Cy+Math.sin(a)*rr*R,L2=R*(0.08+rnd()*0.22)*p.flare;const g=ctx.createRadialGradient(x,y,0,x,y,L2*0.5);g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(x-L2,y-L2,L2*2,L2*2);ctx.strokeStyle='rgba(255,250,235,0.7)';ctx.lineWidth=Math.max(1,R*0.004);ctx.beginPath();ctx.moveTo(x-L2,y);ctx.lineTo(x+L2,y);ctx.moveTo(x,y-L2);ctx.lineTo(x,y+L2);ctx.stroke();}ctx.restore();}
  bloom(c,R*0.08,p.bloom,0.55);
});
def(52,[['channelOffset','Posun kanálů',0,40,0.5,8,'px'],['radialStrength','Radiálnost',0,1,0.01,0.7],pCX,pCY,['edgeFalloff','Nárůst k okrajům',0.5,4,0.05,2]],c=>{
  const {src:s,W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,hd=Math.hypot(W,H)/2,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const dx=x-Cx,dy=y-Cy,len=Math.hypot(dx,dy),r=len/hd,amt=p.channelOffset*(Math.pow(r,p.edgeFalloff)*p.radialStrength+(1-p.radialStrength)),ux=len>0?dx/len:1,uy=len>0?dy/len:0;
    s.bil(x+ux*amt,y+uy*amt,col);o[0]=col[0];s.bil(x,y,col);o[1]=col[1];s.bil(x-ux*amt,y-uy*amt,col);o[2]=col[2];});
});
def(53,[['eyeSeparation','Rozestup očí',0,40,0.5,10,'px'],['depthMap','Hloubka',[['luma','Podle jasu'],['flat','Plochá'],['radial','Ze středu']],'luma'],['redGain','Zisk červené',0,1.5,0.01,1],['cyanGain','Zisk azurové',0,1.5,0.01,1],['mode','Režim',[['color','Barevný'],['gray','Šedý (klasický)']],'color']],c=>{
  const {src:s,W,H,p}=c,L=s.blurL(2*c.k),a=[0,0,0],b=[0,0,0],hd=Math.hypot(W,H)/2;
  perPixel(c,(x,y,k,o)=>{const dp=p.depthMap==='flat'?1:p.depthMap==='radial'?1-Math.hypot(x-W/2,y-H/2)/hd:L[k],sh=p.eyeSeparation*dp*0.5;s.bil(x+sh,y,a);s.bil(x-sh,y,b);
    if(p.mode==='gray'){o[0]=(0.299*a[0]+0.587*a[1]+0.114*a[2])*p.redGain;const g=(0.299*b[0]+0.587*b[1]+0.114*b[2])*p.cyanGain;o[1]=g;o[2]=g;}else{o[0]=a[0]*p.redGain;o[1]=b[1]*p.cyanGain;o[2]=b[2]*p.cyanGain;}});
});
def(54,[['particleCount','Počet částic',50,3000,10,700],['particleSize','Velikost částic',1,20,0.5,5,'px'],['driftSpeed','Rychlost unášení',0,3,0.05,0.6],['glow','Záře',0,1.5,0.01,0.6],pSeed(42),['tint','Barva prachu','#ffe9b8'],['darken','Ztmavení fotky',0,0.8,0.01,0.3]],c=>{
  const {src:s,W,H,ctx,p,t,k:K}=c,rnd=rng(p.seed),tc=hexRgb(p.tint),sz=Math.max(4,Math.ceil(p.particleSize*4)),spr=mk(sz*2,sz*2),sx=spr.getContext('2d'),g=sx.createRadialGradient(sz,sz,0,sz,sz,sz);
  g.addColorStop(0,`rgba(${tc},1)`);g.addColorStop(0.25,`rgba(${tc},0.6)`);g.addColorStop(1,`rgba(${tc},0)`);sx.fillStyle=g;sx.fillRect(0,0,sz*2,sz*2);
  ctx.drawImage(c.srcCanvas,0,0,W,H);ctx.fillStyle=`rgba(5,4,10,${p.darken})`;ctx.fillRect(0,0,W,H);ctx.save();ctx.globalCompositeOperation='lighter';
  let placed=0;for(let tries=0;placed<p.particleCount&&tries<p.particleCount*20;tries++){const x=rnd()*W,y=rnd()*H,ph=rnd()*TAU,sc=0.4+rnd()*0.9;if(rnd()>Math.pow(s.l(x,y),1.6)+0.03)continue;placed++;
    const px=x+Math.sin(t*p.driftSpeed+ph)*14*K,py=((y-t*p.driftSpeed*18*K*sc)%H+H)%H,a=0.35+0.65*(0.5+0.5*Math.sin(t*3*p.driftSpeed+ph*3)),r=p.particleSize*sc;ctx.globalAlpha=a;ctx.drawImage(spr,px-r*2,py-r*2,r*4,r*4);}
  ctx.restore();bloom(c,10*K,p.glow*0.7,0.5);
},{anim:p=>p.driftSpeed>0});
def(55,[['shadowColor','Barva stínů','#1b1446'],['highlightColor','Barva světel','#ffb38a'],['contrast','Kontrast',0.5,2.5,0.05,1.2],['midpoint','Střed tónů',0.2,0.8,0.01,0.5]],c=>{
  const {src:s,p}=c,a=hexRgb(p.shadowColor),b=hexRgb(p.highlightColor);
  perPixel(c,(x,y,k,o)=>{let t=clamp((s.L[k]-p.midpoint)*p.contrast+0.5);t=t*t*(3-2*t);o[0]=lerp(a[0],b[0],t);o[1]=lerp(a[1],b[1],t);o[2]=lerp(a[2],b[2],t);});
});
def(56,[['edgeThreshold','Práh hran',0.01,0.3,0.005,0.03],['neonColor','Neonová barva','#39f0ff'],['colorMode','Barvy',[['neon','Neonová barva'],['source','Barvy fotky'],['rainbow','Duha podle směru']],'neon'],['glowRadius','Poloměr záře',0,40,0.5,12,'px'],['lineWidth','Tloušťka linky',0,4,0.5,1,'px'],['base','Podkladová fotka',0,0.5,0.01,0.06]],c=>{
  const {src:s,W,H,p}=c,sob=s.sobel(1),n=W*H,E=new Float32Array(n),nc=hexRgb(p.neonColor),col=[0,0,0];
  for(let i=0;i<n;i++)E[i]=sstep(p.edgeThreshold,p.edgeThreshold*2.2,sob.mag[i]);const E2=maxF(E,W,H,p.lineWidth);
  perPixel(c,(x,y,k,o)=>{const e=E2[k];s.c(x,y,col);const b=p.base;
    if(p.colorMode==='source'){satAdj(col,1.6);o[0]=col[0]*b+col[0]*e*1.5;o[1]=col[1]*b+col[1]*e*1.5;o[2]=col[2]*b+col[2]*e*1.5;}
    else{const q=p.colorMode==='rainbow'?hsl(Math.atan2(sob.gy[k],sob.gx[k])/D2R*2,1,0.55):nc;o[0]=col[0]*b+q[0]*e;o[1]=col[1]*b+q[1]*e;o[2]=col[2]*b+q[2]*e;}});
  bloom(c,p.glowRadius,1.1,0.1);
});
const GMAPS={sunset:['#140a2e','#6d1f63','#e5485e','#f9a66c','#fff3d6'],ocean:['#020c18','#0b3a5b','#1c8a98','#9fe2d3','#f4fff9'],acid:['#0e0221','#5a00b8','#ff2f9e','#ffe600'],forest:['#0b1a12','#24553a','#8fb45a','#f1eac4'],noir:['#050505','#4a4a4a','#cfcfcf','#ffffff']};
def(57,[['preset','Předvolba',[['sunset','Západ slunce'],['ocean','Oceán'],['acid','Acid'],['forest','Les'],['noir','Noir'],['custom','Vlastní (3 barvy níže)']],'sunset'],['color1','Vlastní: stíny','#10213f'],['color2','Vlastní: středy','#e2557b'],['color3','Vlastní: světla','#fff1c7'],['contrast','Kontrast',0.5,2.5,0.05,1.1],['brightness','Jas',-0.5,0.5,0.01,0],['interpolation','Přechod',[['linear','Plynulý'],['steps','Stupňovitý']],'linear'],['steps','Počet stupňů',2,10,1,5]],c=>{
  const {src:s,p}=c,R=rampOf(p.preset==='custom'?[p.color1,p.color2,p.color3]:GMAPS[p.preset]);
  perPixel(c,(x,y,k,o)=>{let t=con(s.L[k]+p.brightness,p.contrast);if(p.interpolation==='steps')t=Math.min(p.steps-1,Math.floor(t*p.steps))/(p.steps-1);rampAt(R,t,o);});
});
def(58,[['segments','Počet výsečí',2,24,1,8],['rotation','Rotace',0,360,1,0,'deg'],pCX,pCY,['zoom','Přiblížení',0.3,3,0.01,1]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,seg=TAU/p.segments,rot=p.rotation*D2R;
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy)/p.zoom;let a=((Math.atan2(dy,dx)%seg)+seg)%seg;if(a>seg/2)a=seg-a;o[0]=W/2+r*Math.cos(a+rot);o[1]=H/2+r*Math.sin(a+rot);});
});
def(59,[['direction','Směr',0,360,1,0,'deg'],['streakLength','Délka stop',10,400,1,140,'px'],['threshold','Práh světel',0.3,1,0.01,0.7],['glow','Intenzita',0,3,0.05,1.2]],c=>{
  const {src:s,W,H,p}=c,sc=2,w=Math.ceil(W/sc),h=Math.ceil(H/sc),n=w*h,o=[0,0,0];let R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;s.c(x*sc,y*sc,o);const f=sstep(p.threshold,p.threshold+0.12,s.l(x*sc,y*sc));R[i]=o[0]/255*f;G[i]=o[1]/255*f;B[i]=o[2]/255*f;}
  const a=p.direction*D2R,dx=Math.cos(a),dy=Math.sin(a),total=p.streakLength/sc,fall=Math.exp(-3/Math.max(1,total));
  for(let step=1;step<total;step*=2){const ox=Math.round(dx*step),oy=Math.round(dy*step),dec=Math.pow(fall,step),R2=new Float32Array(n),G2=new Float32Array(n),B2=new Float32Array(n);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,xs=x-ox,ys=y-oy;let r=R[i],g=G[i],b=B[i];if(xs>=0&&ys>=0&&xs<w&&ys<h){const j=ys*w+xs;r=Math.max(r,R[j]*dec);g=Math.max(g,G[j]*dec);b=Math.max(b,B[j]*dec);}R2[i]=r;G2[i]=g;B2[i]=b;}R=R2;G=G2;B=B2;}
  const f={R,G,B},q=[0,0,0];perPixel(c,(x,y,k,out)=>{s.c(x,y,out);bilF(f,w,h,x/sc,y/sc,q);for(let i=0;i<3;i++)out[i]+=q[i]*p.glow;});
});
def(60,[['dispersionStrength','Síla rozkladu',0,40,0.5,20,'px'],['prismAngle','Úhel hranolu',0,360,1,0,'deg'],['mode','Režim',[['linear','Lineární'],['radial','Radiální od středu']],'radial'],pCX,pCY,['blend','Míra efektu',0,1,0.01,0.85]],c=>{
  const {src:s,W,H,p}=c,NB=7,bands=[];let sw=[0,0,0];for(let b=0;b<NB;b++){const t=b/(NB-1),w=hsl(270*t,1,0.5).map(v=>v/255);bands.push({t,w});sw=sw.map((v,i)=>v+w[i]);}
  bands.forEach(b=>b.w=b.w.map((v,i)=>v/sw[i]));
  const a=p.prismAngle*D2R,ca=Math.cos(a),sa=Math.sin(a),Cx=p.cx*W,Cy=p.cy*H,hd=Math.hypot(W,H)/2,col=[0,0,0],base=[0,0,0];
  perPixel(c,(x,y,k,o)=>{let dx=ca,dy=sa;if(p.mode==='radial'){dx=(x-Cx)/hd;dy=(y-Cy)/hd;}let r=0,g=0,b=0;for(const B of bands){const off=(B.t-0.5)*p.dispersionStrength;s.bil(x+dx*off,y+dy*off,col);r+=col[0]*B.w[0];g+=col[1]*B.w[1];b+=col[2]*B.w[2];}s.c(x,y,base);o[0]=lerp(base[0],r,p.blend);o[1]=lerp(base[1],g,p.blend);o[2]=lerp(base[2],b,p.blend);});
});
def(61,[['threshold','Práh světel',0.3,1,0.01,0.65],['bloomRadius','Poloměr záře',4,80,1,30,'px'],['warpStrength','Deformace',0,1,0.01,0.5],['intensity','Intenzita',0,3,0.05,1.4]],c=>{
  const {src:s,W,H,p,k:K}=c,sc=4,w=Math.ceil(W/sc),h=Math.ceil(H/sc),n=w*h,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),o=[0,0,0];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;s.cell(x*sc,y*sc,sc,sc,o);const f=sstep(p.threshold,p.threshold+0.15,(0.2126*o[0]+0.7152*o[1]+0.0722*o[2])/255);R[i]=o[0]/255*f;G[i]=o[1]/255*f;B[i]=o[2]/255*f;}
  const rr=p.bloomRadius/sc,f={R:blurF(R,w,h,rr),G:blurF(G,w,h,rr),B:blurF(B,w,h,rr)},n1=noiseField(W,H,160*K,2,3,8),n2=noiseField(W,H,160*K,2,7,8),amp=p.warpStrength*60*K,q=[0,0,0];
  perPixel(c,(x,y,k,out)=>{s.c(x,y,out);bilF(f,w,h,(x+(n1[k]-0.5)*2*amp)/sc,(y+(n2[k]-0.5)*2*amp)/sc,q);for(let i=0;i<3;i++)out[i]+=q[i]*p.intensity*1.6;});
});

// ---------- Material ----------
function normals(s,r,strength,k){const h=s.blurL(r),w=s.w,H=s.h,n=w*H,NX=new Float32Array(n),NY=new Float32Array(n),NZ=new Float32Array(n),f=strength*6*k;for(let y=0;y<H;y++)for(let x=0;x<w;x++){const i=y*w+x,gx=(h[i+(x<w-1?1:0)]-h[i-(x>0?1:0)])*f,gy=(h[i+(y<H-1?w:0)]-h[i-(y>0?w:0)])*f,l=Math.sqrt(gx*gx+gy*gy+1);NX[i]=-gx/l;NY[i]=-gy/l;NZ[i]=1/l;}return{NX,NY,NZ,h};}
def(62,[['metalness','Kovovost',0,1,0.01,0.9],['reflectionContrast','Kontrast odrazů',0.5,3,0.05,1.4],['normalStrength','Síla reliéfu',0.5,12,0.1,6],['highlightShape','Prostředí',[['sky','Nebe a horizont'],['studio','Studiové pruhy'],['gold','Zlatý chrom']],'sky'],['smoothing','Vyhlazení',1,10,0.5,3,'px']],c=>{
  const {src:s,p,k:K}=c,N=normals(s,p.smoothing,p.normalStrength,K),env={sky:rampOf(['#5b8fd6','#a9cdf5','#f7fbff','#2a221c','#6e5e4f','#c9b8a2']),gold:rampOf(['#6b4a12','#e0b04f','#fff4cf','#2a1a06','#8a5d1c','#e8c27a'])}[p.highlightShape],col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const nx=N.NX[k],ny=N.NY[k],nz=N.NZ[k],ry=2*nz*ny,rx=2*nz*nx;let e=clamp(0.5+ry*0.9+(s.L[k]-0.5)*0.6+rx*0.1);
    if(p.highlightShape==='studio'){const v=0.5+0.5*Math.sin(e*14);col[0]=col[1]=col[2]=Math.pow(v,1.5)*245+8;}else rampAt(env,e,col);
    const spec=Math.pow(Math.max(0,-nx*0.4-ny*0.5+nz*0.77),40)*255,g=s.L[k]*255;
    for(let q=0;q<3;q++){let v=lerp(g,col[q],p.metalness)/255;v=con(v,p.reflectionContrast)*255+spec;o[q]=v;}});
});
def(63,[['seedCount','Počet krystalů',30,2000,10,400],['cellVariation','Nepravidelnost',0,1,0.01,0.9],['facetShading','Stínování facet',0,1,0.01,0.5],['outline','Obrys',0,3,0.1,0.6,'px'],pSeed(42)],c=>{
  const {src:s,W,H,p}=c,cell=Math.sqrt(W*H/p.seedCount),v=voronoi(W,H,cell,p.cellVariation,p.seed),A=cellAvg(v,s);
  perPixel(c,(x,y,k,o)=>{const id=v.id[k],lx=(x-v.sx[id])/cell,ly=(y-v.sy[id])/cell,sh=1+p.facetShading*(-(lx*0.7+ly*0.7))*0.6,ol=clamp(p.outline/2-v.edge[k]+0.5)*0.55;o[0]=A.R[id]*sh*(1-ol);o[1]=A.G[id]*sh*(1-ol);o[2]=A.B[id]*sh*(1-ol);});
});
def(64,[['depth','Hloubka',0.5,10,0.1,3],['lightDirection','Směr světla',0,360,1,225,'deg'],['metalTint','Kov',[['silver','Stříbro'],['gold','Zlato'],['copper','Měď'],['gray','Šedá'],['source','Barvy fotky']],'silver'],['contrast','Kontrast',0.5,2.5,0.05,1.2]],c=>{
  const {src:s,W,H,p,k:K}=c,h=s.blurL(K),a=p.lightDirection*D2R,lx=Math.cos(a),ly=Math.sin(a),T={silver:['#2a2d31','#9aa1a8','#f4f6f8'],gold:['#2a1a05','#c9962e','#fff1c4'],copper:['#2a0f06','#b5653a','#ffd9c2'],gray:['#1a1a1a','#808080','#f0f0f0']}[p.metalTint],R=T&&rampOf(T),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const gx=(h[k+(x<W-1?1:0)]-h[k-(x>0?1:0)])*K,gy=(h[k+(y<H-1?W:0)]-h[k-(y>0?W:0)])*K,v=con(0.5-(gx*lx+gy*ly)*p.depth*6,p.contrast);if(R)rampAt(R,v,o);else{s.c(x,y,col);o[0]=col[0]*v*1.5;o[1]=col[1]*v*1.5;o[2]=col[2]*v*1.5;}});
});
const STONES={carrara:[['#8f8a84','#cfcac3','#f6f4f0'],'#4d4a47'],nero:[['#0e0e0e','#262626','#3d3d3d'],'#e8e2d5'],verde:[['#0d2e24','#2f6a50','#5c9a7c'],'#d6e8dc'],rosa:[['#b9847a','#d8aca1','#efd5cc'],'#7a3e36'],gold:[['#0f0f10','#202022','#323236'],'#c9a24a']};
def(65,[['veinFrequency','Hustota žilek',0.5,10,0.1,3],['turbulence','Turbulence',0,10,0.1,4],['stonePalette','Kámen',[['carrara','Carrara'],['nero','Nero Marquina'],['verde','Verde'],['rosa','Rosa'],['gold','Černá se zlatem']],'carrara'],['contrast','Kontrast',0.5,2,0.05,1],['photoInfluence','Vliv fotky',0,1,0.01,0.6]],c=>{
  const {src:s,W,H,p,k:K}=c,[base,vein]=STONES[p.stonePalette],R=rampOf(base),V=hexRgb(vein),n1=noiseField(W,H,260*K,4,21),n2=noiseField(W,H,120*K,3,5),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const L=s.L[k],t=((x*0.7+y*0.3)/W)*p.veinFrequency*4+p.turbulence*n1[k]+L*p.photoInfluence*3,vn=(1-sstep(0,0.09,Math.abs(Math.sin(t*Math.PI))))*(0.5+0.5*n2[k]);
    rampAt(R,con(L*p.photoInfluence+(1-p.photoInfluence)*n2[k],p.contrast),col);for(let q=0;q<3;q++)o[q]=lerp(col[q],V[q],vn*0.85);});
});
const HEAT={lava:['#000000','#3a0300','#a01500','#ff5a00','#ffb52e','#fff3c4'],plasma:['#000000','#00113d','#0a3ad6','#3fa3ff','#bfe9ff','#ffffff'],toxic:['#000000','#0d2a00','#2f8a00','#8cff2e','#eaffb8','#ffffff']};
def(66,[['heatColor','Žár',[['lava','Láva'],['plasma','Modrá plazma'],['toxic','Toxická zeleň']],'lava'],['emissionThreshold','Práh žhnutí',0.2,0.95,0.01,0.45],['normalStrength','Síla reliéfu',0.5,12,0.1,5],['bloom','Záře',0,1.5,0.01,0.7]],c=>{
  const {src:s,p,k:K}=c,N=normals(s,3*K,p.normalStrength,K),H2=rampOf(HEAT[p.heatColor]),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const nx=N.NX[k],ny=N.NY[k],nz=N.NZ[k],d=Math.max(0,-nx*0.5-ny*0.5+nz*0.7),sp=Math.pow(Math.max(0,-nx*0.4-ny*0.5+nz*0.77),24),m=30+60*d+sp*180,L=N.h[k],e=clamp((L-p.emissionThreshold)/(1-p.emissionThreshold));rampAt(H2,e,col);o[0]=m*0.85+col[0];o[1]=m*0.88+col[1];o[2]=m*0.95+col[2];});
  bloom(c,16*K,p.bloom,0.45);
});
def(67,[['brushSize','Velikost štětce',1,10,0.5,4,'px'],['strokeDirection','Směr tahů',0,180,1,35,'deg'],['textureStrength','Reliéf barvy',0,1,0.01,0.45],['colorLevels','Posterizace (0 = vypnuto)',0,16,1,0]],c=>{
  const {src:s,W,H,p,k:K}=c,q=Math.max(1,Math.round(p.brushSize)),f=s.rgbF(),n=W*H,L2=new Float32Array(n);for(let i=0;i<n;i++)L2[i]=s.L[i]*s.L[i];
  const mR=blurF(f.R,W,H,q,1),mG=blurF(f.G,W,H,q,1),mB=blurF(f.B,W,H,q,1),mL=blurF(s.L,W,H,q,1),mL2=blurF(L2,W,H,q,1),a=p.strokeDirection*D2R,ca=Math.cos(a),sa=Math.sin(a),lv=p.colorLevels;
  const out=new Float32Array(n*3);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let best=1e9,bi=0;for(const [dx,dy] of [[-q,-q],[q,-q],[-q,q],[q,q]]){const xx=Math.min(W-1,Math.max(0,x+dx)),yy=Math.min(H-1,Math.max(0,y+dy)),i=yy*W+xx,v=mL2[i]-mL[i]*mL[i];if(v<best){best=v;bi=i;}}const i=y*W+x;out[i*3]=mR[bi];out[i*3+1]=mG[bi];out[i*3+2]=mB[bi];}
  const tl=new Float32Array(n);for(let i=0;i<n;i++)tl[i]=out[i*3]*0.3+out[i*3+1]*0.59+out[i*3+2]*0.11;
  perPixel(c,(x,y,k,o)=>{const u=x*ca+y*sa,v=-x*sa+y*ca,str=vnoise(u/(q*3),v/(q*0.6),9),gx=tl[k+(x<W-1?1:0)]-tl[k-(x>0?1:0)],gy=tl[k+(y<H-1?W:0)]-tl[k-(y>0?W:0)],rel=1+(-(gx+gy)*3+(str-0.5)*0.25)*p.textureStrength;
    for(let c2=0;c2<3;c2++){let v2=out[k*3+c2];if(lv>1)v2=Math.round(v2*(lv-1))/(lv-1);o[c2]=v2*255*rel;}});
});
def(68,[['filmThickness','Tloušťka filmu',0.5,6,0.05,2.2],['iridescenceStrength','Intenzita duhy',0,1,0.01,0.75],['viewAngle','Úhel pohledu',0,1,0.01,0.5],['blend','Míra efektu',0,1,0.01,0.7]],c=>{
  const {src:s,W,H,p,k:K}=c,N=normals(s,3*K,4,K),nf=noiseField(W,H,180*K,3,17),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{s.c(x,y,col);const t=(s.L[k]*0.6+nf[k]*0.8)*p.filmThickness*(1+p.viewAngle*(1-N.NZ[k])*4),sat=p.iridescenceStrength;
    for(let q=0;q<3;q++){const ir=(0.5+0.5*Math.cos(TAU*(t+q*0.33)))*255,g=128,v=lerp(g,ir,sat)*(0.35+0.75*s.L[k]);o[q]=lerp(col[q],v,p.blend);}});
});
def(69,[['bleedRadius','Rozpití',1,20,0.5,5,'px'],['pigmentStrength','Síla pigmentu',0.2,1,0.01,0.75],['paperTexture','Textura papíru',0,1,0.01,0.55],['edgeSoftness','Měkkost okrajů',0,1,0.01,0.5]],c=>{
  const {src:s,W,H,p,k:K}=c,f=s.blurRGB(p.bleedRadius),l1=s.blurL(p.bleedRadius*0.5),l2=s.blurL(p.bleedRadius*2.5),n1=noiseField(W,H,60*K,3,2),n2=noiseField(W,H,60*K,3,6),pap=noiseField(W,H,6*K,2,10,2),amp=p.edgeSoftness*18*K,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{bilF(f,W,H,x+(n1[k]-0.5)*2*amp,y+(n2[k]-0.5)*2*amp,col);for(let q=0;q<3;q++)col[q]=Math.round(col[q]/255*7)/7*255;
    const rim=clamp(Math.abs(l1[k]-l2[k])*4),a=p.pigmentStrength*(0.75+0.25*n1[k]),gr=1-(pap[k]-0.5)*0.35*p.paperTexture;
    for(let q=0;q<3;q++){const pig=col[q]*(1-rim*0.35);o[q]=lerp(250,pig,a)*gr;}});
});
def(70,[['amplitude','Amplituda',0,60,0.5,14,'px'],['wavelength','Vlnová délka',10,400,1,120,'px'],['direction','Směr',0,360,1,0,'deg'],['speed','Rychlost animace',0,5,0.05,0]],c=>{
  const {p,t}=c,a=p.direction*D2R,dx=Math.cos(a),dy=Math.sin(a),ph=t*p.speed*2;
  warp(c,(x,y,o)=>{const u=x*dx+y*dy,v=-x*dy+y*dx,off=p.amplitude*(Math.sin(TAU*u/p.wavelength+ph)+0.3*Math.sin(TAU*v/(p.wavelength*1.7)-ph*0.7));o[0]=x-dy*off;o[1]=y+dx*off;});
},{anim:p=>p.speed>0});

// ---------- Glitch ----------
function glitchCore(c,g){
  const {src:s,W,H,k:K}=c,rnd=rng(g.seed*977+g.frame*131),off=new Float32Array(H),d=s.d,ps=Math.max(1,g.pixel||1);
  for(let i=0;i<g.slices;i++){const y0=Math.floor(rnd()*H),h=Math.floor((0.004+rnd()*0.06)*H),o=(rnd()-0.5)*2*g.intensity*W*0.2;for(let y=y0;y<Math.min(H,y0+h);y++)off[y]+=o;}
  const drops=[];for(let i=0;i<(g.drop||0)*24;i++)drops.push([rnd()*W,rnd()*H,(0.02+rnd()*0.12)*W,(0.005+rnd()*0.03)*H,rnd()]);
  const sp=Math.max(2,3*K),px=x=>ps>1?Math.floor(x/ps)*ps+ps/2:x;
  perPixel(c,(x,y,k,o)=>{
    const yy=ps>1?Math.floor(y/ps)*ps+ps/2:y,xo=x+off[y],cr=g.chroma*((x/W)-0.5)*20*K,smp=xx=>{xx=((px(xx)%W)+W)%W;return s.i(xx,yy)*4;};
    o[0]=d[smp(xo+g.rgb+cr)];o[1]=d[smp(xo)+1];o[2]=d[smp(xo-g.rgb-cr)+2];
    if(g.scan>0&&(y%sp)<sp/2){const m=1-g.scan*0.5;o[0]*=m;o[1]*=m;o[2]*=m;}
    if(g.noise>0){const n=(hash2(x,y,g.frame)-0.5)*g.noise*110;o[0]+=n;o[1]+=n;o[2]+=n;}
  });
  if(drops.length){const ctx=c.ctx;for(const [x,y,w,h,r] of drops){ctx.fillStyle=r<0.3?'#000':r<0.55?`hsl(${r*900},100%,55%)`:'rgba(255,255,255,0.85)';ctx.fillRect(x,y,w,h);}}
}
def(3,[['sliceCount','Počet řezů',0,80,1,22],['glitchIntensity','Síla posunu',0,1,0.01,0.35],['rgbOffset','RGB posun',0,40,0.5,6,'px'],['chromaticStrength','Chromatická aberace',0,1,0.01,0.3],['scanlines','Řádkování',0,1,0.01,0.5],['pixelSize','Základní pixelizace',1,24,1,1,'px'],pSeed(42),['animate','Animovat',false]],c=>{
  const {p,t}=c;glitchCore(c,{slices:p.sliceCount,intensity:p.glitchIntensity,rgb:p.rgbOffset,chroma:p.chromaticStrength,scan:p.scanlines,noise:0.08,drop:0.15,seed:p.seed,frame:p.animate?Math.floor(t*10):0,pixel:Math.round(p.pixelSize)});
},{anim:p=>p.animate});
def(74,[['sliceCount','Počet řezů',0,120,1,40],['offsetStrength','Síla posunu',0,1,0.01,0.5],['rgbOffset','RGB posun',0,40,0.5,9,'px'],['noise','Šum',0,1,0.01,0.25],['scanlines','Řádkování',0,1,0.01,0.3],['dropout','Výpadky bloků',0,1,0.01,0.4],pSeed(7),['animate','Animovat',true]],c=>{
  const {p,t}=c;glitchCore(c,{slices:p.sliceCount,intensity:p.offsetStrength,rgb:p.rgbOffset,chroma:0.15,scan:p.scanlines,noise:p.noise,drop:p.dropout,seed:p.seed,frame:p.animate?Math.floor(t*8):0});
},{anim:p=>p.animate});
def(71,[['threshold','Práh světel',0.4,1,0.01,0.72],['rayDirection','Paprsky',[['radial','Ze středu'],['angle','Rovnoběžné']],'radial'],['angle','Úhel (rovnoběžné)',0,360,1,90,'deg'],['length','Délka paprsků',0.05,1,0.01,0.45],['intensity','Intenzita',0,3,0.05,1.2],pCX,['cy','Střed Y',0,1,0.01,0.45]],c=>{
  const {src:s,W,H,p}=c,sc=2,w=Math.ceil(W/sc),h=Math.ceil(H/sc),n=w*h,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),o=[0,0,0];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;s.c(x*sc,y*sc,o);const f=sstep(p.threshold,p.threshold+0.1,s.l(x*sc,y*sc));R[i]=o[0]/255*f;G[i]=o[1]/255*f;B[i]=o[2]/255*f;}
  const NS=28,Cx=p.cx*w,Cy=p.cy*h,a=p.angle*D2R,rays={R:new Float32Array(n),G:new Float32Array(n),B:new Float32Array(n)};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let vx,vy;if(p.rayDirection==='radial'){vx=(Cx-x)*p.length;vy=(Cy-y)*p.length;}else{vx=-Math.cos(a)*p.length*w*0.5;vy=-Math.sin(a)*p.length*w*0.5;}let r=0,g=0,b=0,wt=1,ws=0;
    for(let i=0;i<NS;i++){const sx=Math.round(x+vx*i/NS),sy=Math.round(y+vy*i/NS);if(sx>=0&&sy>=0&&sx<w&&sy<h){const j=sy*w+sx;r+=R[j]*wt;g+=G[j]*wt;b+=B[j]*wt;}ws+=wt;wt*=0.94;}const i=y*w+x;rays.R[i]=r/ws;rays.G[i]=g/ws;rays.B[i]=b/ws;}
  const q=[0,0,0];perPixel(c,(x,y,k,out)=>{s.c(x,y,out);bilF(rays,w,h,x/sc,y/sc,q);for(let i=0;i<3;i++)out[i]+=q[i]*p.intensity*2.2;});
});
def(72,[['curvature','Zakřivení',0,0.5,0.01,0.18],['scanlineDensity','Rozteč řádků',2,8,0.25,3,'px'],['phosphorMask','Maska luminoforu',0,1,0.01,0.5],['bloom','Záře',0,1,0.01,0.4],['noise','Šum',0,1,0.01,0.15],['vignette','Vinětace',0,1,0.01,0.5]],c=>{
  const {src:s,W,H,p,k:K}=c,col=[0,0,0],per=Math.max(1.5,p.scanlineDensity),mw=Math.max(1,Math.round(K));
  perPixel(c,(x,y,k,o)=>{const nx=x/W*2-1,ny=y/H*2-1,r2=nx*nx+ny*ny,f=1+p.curvature*r2,ux=nx*f,uy=ny*f;
    if(Math.abs(ux)>1||Math.abs(uy)>1){o[0]=o[1]=o[2]=4;return;}
    s.bil((ux+1)/2*W,(uy+1)/2*H,col);const edge=sstep(1,0.97,Math.max(Math.abs(ux),Math.abs(uy))),scan=1-0.5*(0.5-0.5*Math.cos(TAU*((uy+1)/2*H)/per)),m=Math.floor(x/mw)%3,vig=1-p.vignette*r2*0.45,nz=(hash2(x,y,9)-0.5)*p.noise*60;
    for(let q=0;q<3;q++){const mask=q===m?1:1-p.phosphorMask*0.55;o[q]=(col[q]*scan*mask*1.15*vig+nz)*edge;}});
  bloom(c,8*K,p.bloom*0.8,0.3);
});
def(73,[['blockSize','Velikost bloku',8,64,1,16,'px'],['temporalPersistence','Délka šmouh',0,1,0.01,0.55],['displacement','Posun bloků',0,1,0.01,0.5],['artifactStrength','Kompresní artefakty',0,1,0.01,0.5],pSeed(42)],c=>{
  const {src:s,W,H,p}=c,bs=Math.max(4,Math.round(p.blockSize)),img=c.img(),d=img.data;d.set(s.d);const rnd=rng(p.seed),bw=Math.ceil(W/bs),bh=Math.ceil(H/bs);
  const copy=(sx,sy,dx,dy)=>{for(let y=0;y<bs;y++){const ty=dy+y,fy=Math.min(H-1,Math.max(0,sy+y));if(ty>=H)break;for(let x=0;x<bs;x++){const tx=dx+x,fx=Math.min(W-1,Math.max(0,sx+x));if(tx>=W)break;const a=(ty*W+tx)*4,b=(fy*W+fx)*4;d[a]=d[b];d[a+1]=d[b+1];d[a+2]=d[b+2];}}};
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const x=i*bs,y=j*bs,r=rnd(),mvx=Math.round((vnoise(i/4,j/4,p.seed)-0.5)*2*p.displacement*bs*3),mvy=Math.round((vnoise(i/4,j/4,p.seed+9)-0.5)*2*p.displacement*bs*2);
    if(r<p.artifactStrength*0.22){let R=0,G=0,B=0,n=0;for(let yy=y;yy<Math.min(H,y+bs);yy++)for(let xx=x;xx<Math.min(W,x+bs);xx++){const a=(yy*W+xx)*4;R+=d[a];G+=d[a+1];B+=d[a+2];n++;}R/=n;G/=n;B/=n;for(let yy=y;yy<Math.min(H,y+bs);yy++)for(let xx=x;xx<Math.min(W,x+bs);xx++){const a=(yy*W+xx)*4,gr=Math.round((xx-x)/bs*3)/3*16-8;d[a]=R+gr;d[a+1]=G+gr;d[a+2]=B+gr;}}
    else if(r<p.artifactStrength*0.22+p.displacement*0.4)copy(x+mvx,y+mvy,x,y);
    if(rnd()<p.temporalPersistence*0.12){const len=1+Math.floor(rnd()*p.temporalPersistence*10);for(let q=1;q<=len&&j+q<bh;q++)copy(x,y+bs-1,x+Math.round(mvx*q*0.3),y+q*bs);}
  }
  c.put(img);
});
const THEAT={ela:['#000000','#2b0a5a','#8a1a7a','#e0352b','#ffc229','#ffffff'],green:['#000000','#003311','#00a845','#a6ff6b','#ffffff'],gray:['#000000','#ffffff']};
def(75,[['differenceGain','Zesílení rozdílů',1,40,0.5,12],['compressionQuality','Simulovaná kvalita JPEG',0,1,0.01,0.6],['heatPalette','Paleta',[['ela','ELA (fialová–žlutá)'],['green','Zelená'],['gray','Šedá']],'ela'],['threshold','Práh šumu',0,0.2,0.005,0.02],['base','Podkladová fotka',0,0.5,0.01,0.12]],c=>{
  const {src:s,W,H,p}=c,f=s.rgbF(),b=s.blurRGB(1),n=W*H,res=new Float32Array(n),R=rampOf(THEAT[p.heatPalette]),col=[0,0,0];
  for(let i=0;i<n;i++)res[i]=(Math.abs(f.R[i]-b.R[i])+Math.abs(f.G[i]-b.G[i])+Math.abs(f.B[i]-b.B[i]))/3;
  const bm=new Float32Array(Math.ceil(W/8)*Math.ceil(H/8)),bw=Math.ceil(W/8);for(let i=0;i<n;i++){const x=i%W,y=(i/W)|0;bm[(y>>3)*bw+(x>>3)]+=res[i]/64;}
  perPixel(c,(x,y,k,o)=>{let v=lerp(res[k],bm[(y>>3)*bw+(x>>3)],1-p.compressionQuality);v=Math.max(0,v-p.threshold)*p.differenceGain;rampAt(R,v,col);const g=s.L[k]*255*p.base;o[0]=col[0]+g;o[1]=col[1]+g;o[2]=col[2]+g;});
});
def(76,[['saturation','Sytost',0,1.5,0.01,0.7],['grain','Zrno',0,1,0.01,0.35],['blur','Barevné rozmazání',0,10,0.5,3,'px'],['trackingJitter','Kolísání řádků',0,1,0.01,0.35],['noiseSpeed','Rychlost šumu',0,3,0.05,0]],c=>{
  const {src:s,W,H,p,t,k:K}=c,f=s.blurRGB(p.blur),fr=p.noiseSpeed>0?Math.floor(t*12*p.noiseSpeed):0,col=[0,0,0],ch=[0,0,0],band=fract(t*0.13*p.noiseSpeed+0.3)*H;
  perPixel(c,(x,y,k,o)=>{const jit=(vnoise(y/(40*K),fr*0.3,4)-0.5)*p.trackingJitter*14*K+(Math.abs(y-band)<12*K?p.trackingJitter*20*K:0);s.bil(x+jit,y,col);bilF(f,W,H,x+jit+2*K,y,ch);
    const Y=0.299*col[0]+0.587*col[1]+0.114*col[2],cY=0.299*ch[0]+0.587*ch[1]+0.114*ch[2];
    for(let q=0;q<3;q++){let v=Y+(ch[q]-cY)*p.saturation;v=v*0.82+28;o[q]=v;}o[0]*=1.06;o[2]*=0.92;
    const vg=1-0.35*((x/W-0.5)**2+(y/H-0.5)**2)*2,gn=(hash2(x,y,fr)-0.5)*p.grain*70;for(let q=0;q<3;q++)o[q]=o[q]*vg+gn;});
},{anim:p=>p.noiseSpeed>0});
def(77,[['thresholdLow','Dolní práh jasu',0,1,0.01,0.25],['thresholdHigh','Horní práh jasu',0,1,0.01,0.85],['sortDirection','Směr',[['h','Vodorovně'],['v','Svisle']],'h'],['sortKey','Řadit podle',[['lum','Jasu'],['hue','Odstínu'],['sat','Sytosti']],'lum'],['maxSegment','Max. délka úseku',10,1000,5,300,'px'],['randomness','Náhodné přerušení',0,1,0.01,0.3],['reverse','Obrátit pořadí',false]],c=>{
  const {src:s,W,H,p}=c,img=c.img(),d=img.data;d.set(s.d);const rnd=rng(11),hor=p.sortDirection==='h',len=hor?W:H,lines=hor?H:W,idx=new Int32Array(len),key=new Float32Array(len);
  const kf=(r,g,b)=>p.sortKey==='lum'?0.299*r+0.587*g+0.114*b:p.sortKey==='hue'?rgb2hsl(r,g,b)[0]:rgb2hsl(r,g,b)[1];
  for(let ln=0;ln<lines;ln++){let st=-1;
    for(let q=0;q<=len;q++){const pi=q<len?(hor?ln*W+q:q*W+ln):-1,l=pi>=0?s.L[pi]:-1,inR=pi>=0&&l>=p.thresholdLow&&l<=p.thresholdHigh;
      if(inR&&st<0)st=q;
      const seg=st>=0&&(q-st>=p.maxSegment*(1-p.randomness*rnd()));
      if(st>=0&&(!inR||seg)){const n=q-st;if(n>1){const arr=[];for(let i=0;i<n;i++){const pp=hor?ln*W+st+i:(st+i)*W+ln,j=pp*4;arr.push([kf(s.d[j],s.d[j+1],s.d[j+2]),s.d[j],s.d[j+1],s.d[j+2]]);}arr.sort((a,b)=>p.reverse?b[0]-a[0]:a[0]-b[0]);for(let i=0;i<n;i++){const pp=hor?ln*W+st+i:(st+i)*W+ln,j=pp*4;d[j]=arr[i][1];d[j+1]=arr[i][2];d[j+2]=arr[i][3];}}st=inR?q:-1;}
    }}
  c.put(img);
});
def(78,[['redOffset','Posun červené',-40,40,0.5,8,'px'],['greenOffset','Posun zelené',-40,40,0.5,0,'px'],['blueOffset','Posun modré',-40,40,0.5,-8,'px'],['direction','Směr',0,360,1,0,'deg']],c=>{
  const {src:s,p}=c,a=p.direction*D2R,dx=Math.cos(a),dy=Math.sin(a),col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{s.bil(x-dx*p.redOffset,y-dy*p.redOffset,col);o[0]=col[0];s.bil(x-dx*p.greenOffset,y-dy*p.greenOffset,col);o[1]=col[1];s.bil(x-dx*p.blueOffset,y-dy*p.blueOffset,col);o[2]=col[2];});
});
def(79,[['lineSpacing','Rozteč řádků',2,16,0.25,4,'px'],['lineOpacity','Tmavost řádků',0,1,0.01,0.5],['phase','Fáze',0,1,0.01,0],['interlace','Prokládání (animace)',false],['noise','Šum',0,1,0.01,0.1]],c=>{
  const {src:s,p,t}=c,sp=Math.max(1.5,p.lineSpacing),ph=p.phase+(p.interlace?(Math.floor(t*25)%2)*0.5:0),fr=p.interlace?Math.floor(t*25):0;
  perPixel(c,(x,y,k,o)=>{s.c(x,y,o);const f=fract(y/sp+ph),m=1-p.lineOpacity*sstep(0.35,0.6,f)*(1-sstep(0.85,1,f)),n=(hash2(x,y,fr)-0.5)*p.noise*60;for(let q=0;q<3;q++)o[q]=o[q]*m+n;});
},{anim:p=>p.interlace});
const THERM={iron:['#000000','#1b0a5a','#7a0f8c','#d02a3a','#ff8c1a','#ffe04a','#ffffff'],rainbow:['#000080','#0050ff','#00e0ff','#30ff60','#ffff00','#ff6000','#ff0000'],whitehot:['#000000','#ffffff'],blackhot:['#ffffff','#000000']};
def(80,[['heatPalette','Paleta',[['iron','Iron (klasická)'],['rainbow','Duhová'],['whitehot','White hot'],['blackhot','Black hot']],'iron'],['minLevel','Dolní mez',0,0.9,0.01,0.05],['maxLevel','Horní mez',0.1,1,0.01,0.95],['contrast','Kontrast',0.5,2.5,0.05,1.1],['noise','Šum senzoru',0,1,0.01,0.15],['blur','Měkkost',0,10,0.5,2,'px']],c=>{
  const {src:s,p}=c,L=s.blurL(p.blur),R=rampOf(THERM[p.heatPalette]),span=Math.max(0.01,p.maxLevel-p.minLevel);
  perPixel(c,(x,y,k,o)=>{const v=con((L[k]-p.minLevel)/span+(hash2(x,y,2)-0.5)*p.noise*0.08,p.contrast);rampAt(R,v,o);});
});

// ---------- Blur ----------
def(81,[['radius','Poloměr rozmazání',0,60,0.5,8,'px']],c=>{const {src:s,W,H,p}=c,f=s.blurRGB(p.radius);perPixel(c,(x,y,k,o)=>{o[0]=f.R[k]*255;o[1]=f.G[k]*255;o[2]=f.B[k]*255;});});
def(82,[['angle','Úhel pohybu',0,360,1,0,'deg'],['length','Délka šmouhy',0,200,1,40,'px'],['sampleCount','Počet vzorků',4,64,1,24],['opacity','Míra efektu',0,1,0.01,1]],c=>{
  const {src:s,W,H,p}=c,a=p.angle*D2R,n=p.sampleCount,offs=[];for(let i=0;i<n;i++){const t=(i/(n-1)-0.5)*p.length;offs.push([Math.round(Math.cos(a)*t),Math.round(Math.sin(a)*t)]);}const d=s.d;
  perPixel(c,(x,y,k,o)=>{let r=0,g=0,b=0;for(const [dx,dy] of offs){const j=s.i(x+dx,y+dy)*4;r+=d[j];g+=d[j+1];b+=d[j+2];}const j=k*4;o[0]=lerp(d[j],r/n,p.opacity);o[1]=lerp(d[j+1],g/n,p.opacity);o[2]=lerp(d[j+2],b/n,p.opacity);});
});
def(83,[['mode','Režim',[['zoom','Přiblížení'],['spin','Rotace']],'zoom'],pCX,pCY,['amount','Síla',0,1,0.01,0.25],['samples','Počet vzorků',4,48,1,20]],c=>{
  const {src:s,W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,n=p.samples,d=s.d;
  perPixel(c,(x,y,k,o)=>{const dx=x-Cx,dy=y-Cy;let r=0,g=0,b=0;for(let i=0;i<n;i++){const t=(i/(n-1)-0.5)*p.amount;let sx,sy;if(p.mode==='zoom'){sx=Cx+dx*(1-t*0.6);sy=Cy+dy*(1-t*0.6);}else{const a=t*0.6,ca=Math.cos(a),sa=Math.sin(a);sx=Cx+dx*ca-dy*sa;sy=Cy+dx*sa+dy*ca;}const j=s.i(sx,sy)*4;r+=d[j];g+=d[j+1];b+=d[j+2];}o[0]=r/n;o[1]=g/n;o[2]=b/n;});
});
def(84,[['focusPosition','Poloha ostrého pásu',0,1,0.01,0.55],['focusWidth','Šířka ostrého pásu',0,0.8,0.01,0.18],['blurRadius','Rozmazání',0,40,0.5,10,'px'],['falloff','Přechod',0.02,0.6,0.01,0.2],['angle','Úhel pásu',-90,90,1,0,'deg'],['saturation','Sytost (efekt miniatury)',0.5,2,0.05,1.3]],c=>{
  const {src:s,W,H,p}=c,f=s.blurRGB(p.blurRadius),a=p.angle*D2R,nx=-Math.sin(a),ny=Math.cos(a),fy=p.focusPosition*H,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{const dist=Math.abs((x-W/2)*nx+(y-fy)*ny)/H,m=sstep(p.focusWidth/2,p.focusWidth/2+p.falloff,dist);s.c(x,y,col);o[0]=lerp(col[0],f.R[k]*255,m);o[1]=lerp(col[1],f.G[k]*255,m);o[2]=lerp(col[2],f.B[k]*255,m);satAdj(o,p.saturation);});
});

// ---------- Distort ----------
def(85,[pCX,pCY,['radius','Poloměr',0.05,1,0.01,0.45],['strength','Síla',0,1,0.01,0.8],['falloff','Útlum',0.5,3,0.05,1.5]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,R=Math.min(W,H)*p.radius;
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy);if(r>=R||r===0){o[0]=x;o[1]=y;return;}const t=r/R,kk=1-p.strength*0.8*Math.pow(1-t,p.falloff);o[0]=Cx+dx/kk;o[1]=Cy+dy/kk;});
});
def(86,[['mode','Směr převodu',[['toPolar','Obdélník → kruh'],['toRect','Kruh → obdélník']],'toPolar'],pCX,pCY,['rotation','Rotace',0,360,1,0,'deg'],['radialScale','Radiální měřítko',0.3,3,0.01,1],['repeat','Opakování',1,6,1,1]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,rmax=Math.hypot(Math.max(Cx,W-Cx),Math.max(Cy,H-Cy)),rot=p.rotation*D2R;
  warp(c,(x,y,o)=>{if(p.mode==='toPolar'){const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy)/rmax*p.radialScale,a=fract((Math.atan2(dy,dx)-rot)/TAU*p.repeat);o[0]=a*(W-1);o[1]=clamp(1-r)*(H-1);}else{const a=(x/W)*TAU/p.repeat+rot,r=(1-y/H)*rmax/p.radialScale;o[0]=Cx+Math.cos(a)*r;o[1]=Cy+Math.sin(a)*r;}});
});
def(87,[pCX,pCY,['amplitude','Amplituda',0,40,0.5,10,'px'],['frequency','Vlnová délka',8,200,1,48,'px'],['speed','Rychlost animace',0,5,0.05,0],['damping','Útlum k okrajům',0,4,0.05,1]],c=>{
  const {W,H,p,t}=c,Cx=p.cx*W,Cy=p.cy*H,md=Math.hypot(W,H)/2;
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy)||1,off=p.amplitude*Math.sin(TAU*r/p.frequency-t*p.speed*4)*Math.exp(-p.damping*r/md);o[0]=x+dx/r*off;o[1]=y+dy/r*off;});
},{anim:p=>p.speed>0});
def(88,[['shearX','Zkosení X',-1,1,0.01,0.25],['shearY','Zkosení Y',-1,1,0.01,0],['pivot','Osa',[['center','Střed'],['top','Horní hrana'],['bottom','Dolní hrana']],'center'],['borderMode','Okraje',[['clamp','Protáhnout'],['wrap','Opakovat'],['black','Černé']],'wrap']],c=>{
  const {src:s,W,H,p}=c,py=p.pivot==='top'?0:p.pivot==='bottom'?H:H/2,px=W/2,col=[0,0,0];
  perPixel(c,(x,y,k,o)=>{let sx=x-(y-py)*p.shearX,sy=y-(x-px)*p.shearY;if(p.borderMode==='wrap'){sx=((sx%W)+W)%W;sy=((sy%H)+H)%H;}else if(p.borderMode==='black'&&(sx<0||sy<0||sx>=W||sy>=H)){o[0]=o[1]=o[2]=0;return;}s.bil(sx,sy,col);o[0]=col[0];o[1]=col[1];o[2]=col[2];});
});
def(89,[['brushRadius','Poloměr štětce',4,80,1,24,'px'],['dragLength','Délka tahu',10,600,5,180,'px'],['strength','Síla',0,1,0.01,0.8],['direction','Směr tahů',0,360,1,20,'deg'],['strokes','Počet tahů',1,60,1,16],pSeed(42)],c=>{
  const {src:s,W,H,p}=c,n=W*H,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),rnd=rng(p.seed),rad=Math.max(2,Math.round(p.brushRadius)),d=s.d;
  for(let i=0;i<n;i++){R[i]=d[i*4];G[i]=d[i*4+1];B[i]=d[i*4+2];}
  const size=rad*2+1,pr=new Float32Array(size*size),pg=new Float32Array(size*size),pb=new Float32Array(size*size);
  for(let st=0;st<p.strokes;st++){let x=Math.round(rnd()*W),y=Math.round(rnd()*H);const a=(p.direction+(rnd()-0.5)*50)*D2R,stepL=Math.max(1,rad*0.25),steps=Math.round(p.dragLength/stepL);
    for(let j=-rad;j<=rad;j++)for(let i=-rad;i<=rad;i++){const q=(j+rad)*size+i+rad,k=s.i(x+i,y+j);pr[q]=R[k];pg[q]=G[k];pb[q]=B[k];}
    for(let t=1;t<=steps;t++){const cx=Math.round(x+Math.cos(a)*stepL*t),cy=Math.round(y+Math.sin(a)*stepL*t);
      for(let j=-rad;j<=rad;j++){const yy=cy+j;if(yy<0||yy>=H)continue;for(let i=-rad;i<=rad;i++){const xx=cx+i;if(xx<0||xx>=W)continue;const dd=(i*i+j*j)/(rad*rad);if(dd>1)continue;const w=p.strength*(1-dd)*(1-dd),k=yy*W+xx,q=(j+rad)*size+i+rad;R[k]=lerp(R[k],pr[q],w);G[k]=lerp(G[k],pg[q],w);B[k]=lerp(B[k],pb[q],w);pr[q]=lerp(R[k],pr[q],p.strength*0.96);pg[q]=lerp(G[k],pg[q],p.strength*0.96);pb[q]=lerp(B[k],pb[q],p.strength*0.96);}}}}
  perPixel(c,(x,y,k,o)=>{o[0]=R[k];o[1]=G[k];o[2]=B[k];});
});
def(90,[pCX,pCY,['radius','Poloměr',0.05,1,0.01,0.45],['bulgeStrength','Vyboulení',-1,1,0.01,0.6],['edgeSoftness','Měkkost okraje',0,1,0.01,0.3]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,R=Math.min(W,H)*p.radius,b=p.bulgeStrength;
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy);if(r>=R||r===0){o[0]=x;o[1]=y;return;}const t=r/R;let sr=b>=0?R*Math.pow(t,1+b*1.2):R*Math.pow(t,1/(1-b*0.7));sr=lerp(sr,r,sstep(1-p.edgeSoftness,1.0001,t));o[0]=Cx+dx/r*sr;o[1]=Cy+dy/r*sr;});
});
def(91,[pCX,pCY,['radius','Poloměr',0.05,1,0.01,0.5],['angle','Úhel zatočení',-720,720,5,240,'deg'],['falloff','Útlum',0.5,4,0.05,2]],c=>{
  const {W,H,p}=c,Cx=p.cx*W,Cy=p.cy*H,R=Math.min(W,H)*p.radius,A=p.angle*D2R;
  warp(c,(x,y,o)=>{const dx=x-Cx,dy=y-Cy,r=Math.hypot(dx,dy);if(r>=R){o[0]=x;o[1]=y;return;}const th=A*Math.pow(1-r/R,p.falloff),ca=Math.cos(th),sa=Math.sin(th);o[0]=Cx+dx*ca-dy*sa;o[1]=Cy+dx*sa+dy*ca;});
});
def(92,[['amplitude','Amplituda',0,60,0.5,12,'px'],['frequency','Perioda',6,300,1,60,'px'],['orientation','Orientace',[['h','Vodorovné vlnění'],['v','Svislé vlnění']],'h'],['phase','Fáze',0,1,0.01,0],['waveform','Průběh',[['triangle','Trojúhelník'],['saw','Pila'],['sine','Sinus'],['square','Obdélník']],'triangle']],c=>{
  const {p}=c,wf=u=>{u=fract(u);switch(p.waveform){case'saw':return u*2-1;case'sine':return Math.sin(u*TAU);case'square':return u<0.5?1:-1;default:return 1-4*Math.abs(u-0.5);}};
  warp(c,(x,y,o)=>{if(p.orientation==='h'){o[0]=x+p.amplitude*wf(y/p.frequency+p.phase);o[1]=y;}else{o[0]=x;o[1]=y+p.amplitude*wf(x/p.frequency+p.phase);}});
});
