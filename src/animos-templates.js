// ================= Motion catalog: independent implementations =================
// u = loop position 0..1, E = easing from the template's easing setting. All loops are seamless at u=0/1.
const AIMPL={};
function anim(id,d,b){AIMPL[id]={d,b};}
const seg=(u,a,b)=>cl((u-a)/(b-a));
const hsh=(k,s=0)=>hash2(k,s,913);
function bez(x1,y1,x2,y2){return t=>{let s=t;for(let i=0;i<8;i++){const x=3*(1-s)*(1-s)*s*x1+3*(1-s)*s*s*x2+s*s*s-t,dx=3*(1-s)*(1-s)*x1+6*(1-s)*s*(x2-x1)+3*s*s*(1-x2);if(Math.abs(dx)<1e-6)break;s=cl(s-x/dx);}return 3*(1-s)*(1-s)*s*y1+3*(1-s)*s*s*y2+s*s*s;};}
const outBounce=t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375;};
const EZ={smooth:EASE.io,natural:EASE.sine,slowdown:t=>1-Math.pow(1-t,5),snappy:t=>t<.5?16*t**5:1-Math.pow(-2*t+2,5)/2,accelerate:t=>t*t*t,elastic:t=>t<=0||t>=1?t:Math.pow(2,-10*t)*Math.sin((t*10-.75)*TAU/3)+1,bounce:outBounce,overshoot:EASE.ob,impulse:t=>(1-Math.pow(2,-10*t))/(1-Math.pow(2,-10)),swing:t=>{const c=1.70158*1.525;return t<.5?(Math.pow(2*t,2)*((c+1)*2*t-c))/2:(Math.pow(2*t-2,2)*((c+1)*(t*2-2)+c)+2)/2;},linear:t=>t};
function easeOf(p){if(!p.easing)return EASE.io;if(p.easing==='custom'){const a=String(p.easeBezier||'').split(',').map(Number);return a.length===4&&a.every(isFinite)?bez(...a):EASE.io;}return EZ[p.easing]||EASE.io;}
function stepPos(u,n,E,hold=0.45){const x=u*n,k=Math.floor(x),f=x-k;return k+(f<hold?0:E((f-hold)/(1-hold)));}
function tickPos(u,n,E,ant,ovs,hold){const x=u*n,k=Math.floor(x),f=x-k,h=hold/100;if(f<h)return k;const q=(f-h)/(1-h),a=ant/100*0.35,o=ovs/100*0.4;if(q<0.22)return k-a*Math.sin(q/0.22*Math.PI/2);const r=(q-0.22)/0.78;return k-a*(1-EASE.o(Math.min(1,r*2)))+(1+o)*E(Math.min(1,r/0.65))-o*(r>0.65?EASE.io((r-0.65)/0.35):0);}
const pulseU=(u,p,k=4)=>p.motion==='pulse'?u-(p.pulse/100)/(TAU*k)*Math.sin(TAU*k*u):u;
function asp(S,p,it){const a=p.cardAspect||'1:1';if(a==='auto')return it.w/it.h;if(a==='frame')return S.W/S.H;const [x,y]=a.split(':').map(Number);return x/y;}
function wh(S,p,it,pct){const b=pct/100*(S.W+S.H)/2,a=asp(S,p,it);return[b*Math.sqrt(a),b/Math.sqrt(a)];}
function persp(S,p,max){if(p.perspective!=null)S.persp=4-3.1*cl(p.perspective/max);}
function bent(S,o,R,n=6){if(!isFinite(R)||Math.abs(R)>1e5||n<2){S.card(o);return;}const uv=o.uv||fitUV(o.item,o.w,o.h,'crop').uv;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,a=((t0+t1)/2-0.5)*o.w/R;S.card(Object.assign({},o,{m:M4.chain(o.m,M4.T(0,0,-R),M4.RY(a),M4.T(0,0,R)),w:o.w/n*1.02,uv:[lerp(uv[0],uv[2],t0),uv[1],lerp(uv[0],uv[2],t1),uv[3]],radius:0,noDevice:true}));}}
function tiles(S,item,x,y,w,h,cols,rows,prog,opt={}){const uv=fitUV(item,w,h,'crop').uv;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const e=prog(c,r);if(e<=0.001)continue;const tw=w/cols,th=h/rows,u0=lerp(uv[0],uv[2],c/cols),u1=lerp(uv[0],uv[2],(c+1)/cols),v0=lerp(uv[1],uv[3],r/rows),v1=lerp(uv[1],uv[3],(r+1)/rows);S.card(Object.assign({item,uv:[u0,v0,u1,v1],x:x-w/2+tw*(c+0.5),y:y-h/2+th*(r+0.5),w:tw*1.004,h:th*1.004,s:opt.scale?e:1,opacity:opt.scale?1:e,radius:0,noShadow:true},opt.card||{}));}}
function orderVal(pattern,c,r,cols,rows,k){const cx=(cols-1)/2,cy=(rows-1)/2,mx=cols+rows-2||1;switch(pattern){case'diagonal':return(c+r)/mx;case'radial':return Math.hypot(c-cx,r-cy)/(Math.hypot(cx,cy)||1);case'spiral':{const a=(Math.atan2(r-cy,c-cx)/TAU+0.5),d=Math.hypot(c-cx,r-cy)/(Math.hypot(cx,cy)||1);return(a*0.5+d*0.5);}case'random':return hsh(c*31+r*7,k);default:return(r*cols+c)/(cols*rows-1||1);}}
function wipeTiles(S,p,item,x,y,w,h,e,k){const stg=p.stagger/100;if(p.style==='blinds'){const n=p.slats,hor=p.orientation==='horizontal';tiles(S,item,x,y,w,h,hor?1:n,hor?n:1,(c,r)=>{const i=hor?r:c;let o=i/(n-1||1);if(p.openFrom==='end')o=1-o;else if(p.openFrom==='center')o=Math.abs(o-0.5)*2;else if(p.openFrom==='alternate')o=i%2?0.5+o/2:o/2;const sv=1+(hsh(i,k)-0.5)*p.speedVariation/100;return EASE.io(cl((e-o*stg)/((1-stg)*sv||0.01)));},{scale:true});return;}
  const cols=p.columns||4,rows=p.rows||4;tiles(S,item,x,y,w,h,cols,rows,(c,r)=>{const o=orderVal(p.pattern,c,r,cols,rows,k),sv=1+(hsh(c*13+r,k)-0.5)*p.speedVariation/100;return EASE.io(cl((e-o*stg)/((1-stg)*sv||0.01)));},{scale:true});}

// ---------- 3D & Perspective ----------
anim('showcase-stream','Karty ohnuté kolem nakloněného 3D prstence.',(S,p,u,E)=>{const {W}=S,N=S.slots,Rx=p.ringWidth/100*W/2;persp(S,p,40);const G=M4.chain(M4.T(0,0,-Rx*0.3),M4.RX(-p.ringTilt*D2R),M4.S(1,1,p.ringDepth/55));
  for(let k=0;k<N;k++){const it=S.I(k),[w,h]=wh(S,p,it,p.cardSize),a=k/N*TAU+u*TAU,c=Math.cos(a);bent(S,{item:it,m:M4.chain(G,M4.T(Rx*Math.sin(a),0,Rx*c),M4.RY(a)),w,h,fade:p.backFade/100*(1-(c+1)/2)},Rx,5);}});
function wall(S,p,u,E,vert){
  const {W,H}=S,N=S.slots,it0=S.I(0),ch=p.zoom/100*H*1.25,cw=ch*asp(S,p,it0),g=p.gap/100*H*0.5,along=vert?ch+g:cw+g,across=vert?cw+g:ch+g,span=vert?H:W,other=vert?W:H;
  let M=Math.max(N,Math.ceil(span*1.9/along)+2);const wp=p.motion&&p.motion!=='continuous';if(wp)M=p.stops*Math.ceil(M/p.stops);const L=M*along,lines=(Math.ceil(other/across)+2)|1;
  let off,zoom=1,spot=0;if(!wp)off=u*L;else{const k=stepPos(u,p.stops,E,0.5),f=u*p.stops-Math.floor(u*p.stops);off=k*L/p.stops;const hz=Math.sin(cl((f-0.04)/0.44)*Math.PI);if(p.motion==='waypoints')zoom=1+(p.focusZoom-1)*hz*0.6;if(p.focusStyle==='spotlight')spot=hz;}
  const R=Math.abs(p.curvature)<1?Infinity:span*1.15*100/Math.abs(p.curvature),sg=p.curvature<0?-1:1;S.persp=2.2;
  for(let l=0;l<lines;l++){const lc=(l-(lines-1)/2)*across,d=p.direction==='alternate'?(l%2?-1:1):(p.direction==='right'||p.direction==='down'?-1:1);
    for(let k=0;k<M;k++){const s=((k*along-d*off+(l%2)*along*0.5)%L+L)%L-L/2;if(Math.abs(s)>span*0.9)continue;const th=s/R,pa=isFinite(R)?R*Math.sin(th):s,pz=isFinite(R)?-sg*(R-R*Math.cos(th)):0,rot=isFinite(R)?th*sg:0;
      const ef=p.edgeFade>0?cl((1-Math.abs(pa)/(span/2))/(p.edgeFade/100)):1,ctr=Math.abs(s)<along/2&&Math.abs(lc)<across/2;
      S.card({item:S.I(k*lines+l),m:vert?M4.chain(M4.T(lc,pa,pz),M4.RX(-rot)):M4.chain(M4.T(pa,lc,pz),M4.RY(rot)),w:cw,h:ch,opacity:ef,fade:ctr?0:spot*0.65});}}
  S.group=M4.chain(S.group,M4.S(zoom,zoom,zoom),vert?M4.RY(p.tilt*D2R):M4.RX(-p.tilt*D2R));}
anim('sphere-wall','Zakřivená 3D stěna z karet, která se posouvá do strany.',(S,p,u,E)=>wall(S,p,u,E,false));
anim('sphere-cascade','Zakřivená 3D stěna z karet, která roluje svisle.',(S,p,u,E)=>wall(S,p,u,E,true));
function globe(S,p,u,E,bill){
  const {W,H}=S,R=p.globeSize/100*Math.min(W,H)*0.5,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.55),g=p.gap/100*R*0.6,bands=Math.max(3,Math.round(Math.PI*R/(ch+g)));
  let rot,zoom=1,spot=0;const wp=p.motion&&p.motion!=='continuous';
  if(!wp)rot=p.direction==='alternate'?Math.sin(u*TAU)*Math.PI*0.6:u*TAU*(p.direction==='right'?-1:1);else{const st=p.stops||5,k=stepPos(u,st,E,0.5),f=u*st-Math.floor(u*st);rot=k/st*TAU;const hz=Math.sin(cl((f-0.04)/0.44)*Math.PI);if(p.motion==='waypoints'&&p.zoom)zoom=1+(p.zoom-1)*hz*0.45;if(p.focusStyle==='spotlight')spot=hz;}
  S.persp=2.4;const Rm=M4.chain(M4.RX(-p.tilt*D2R),M4.RY(rot)),G=M4.mul(M4.T(0,0,-R*0.25),Rm);let idx=0;
  for(let b=0;b<bands;b++){const lat=((b+0.5)/bands-0.5)*Math.PI,cr=Math.cos(lat),cnt=Math.max(1,Math.round(TAU*R*cr/(cw+g)));
    for(let j=0;j<cnt;j++){const lon=(j+(b%2)*0.5)/cnt*TAU,dx=Math.sin(lon)*cr,dy=Math.sin(lat),dz=Math.cos(lon)*cr,nz=xf(Rm,dx,dy,dz)[2],item=S.I(idx++),fd=nz<0?p.backFade/100*Math.min(1,-nz*3):(spot*0.6*(nz<0.9?1:0));
      if(bill){const q=xf(G,dx*R,dy*R,dz*R);S.card({item,x:q[0],y:q[1],z:q[2],w:cw,h:ch,fade:fd,order:q[2]});}
      else S.card({item,m:M4.chain(G,M4.T(dx*R,dy*R,dz*R),M4.RY(lon),M4.RX(-lat)),w:cw,h:ch,fade:fd,flipX:nz<0});}}
  S.group=M4.mul(S.group,M4.S(zoom,zoom,zoom));}
anim('sphere-globe','Otáčející se 360° koule z karet, zadní strana prosvítá.',(S,p,u,E)=>globe(S,p,u,E,false));
anim('orbit-globe','360° koule ze vzpřímených karet, které jsou stále čelem k divákovi.',(S,p,u,E)=>globe(S,p,u,E,true));
function drum(S,p,u,E,scatter){
  const {W,H}=S,it0=S.I(0),ch=p.zoom/100*H*0.75,cw=ch*asp(S,p,it0),g=p.gap/100*H*0.4,R=H*0.75*100/Math.max(30,Math.abs(p.curvature)),rows=Math.max(6,Math.floor(TAU*R/(ch+g))),cols=Math.ceil(W/(cw+g))+1,sg=p.curvature<0?-1:1;S.persp=2.4;
  const layers=scatter?3:1;
  for(let L=0;L<layers;L++){const df=scatter?1-L*p.parallax/100*0.35:1,RL=R*df,rowsL=Math.max(5,Math.floor(rows*df));
    for(let c=0;c<cols;c++){const d=p.direction==='alternate'?(c%2?-1:1):(p.direction==='down'?-1:1);
      for(let r=0;r<rowsL;r++){const key=L*1000+r*cols+c;if(scatter&&hsh(key,3)>0.62)continue;const a=(r/rowsL)*TAU+(scatter?hsh(key,4)*0.5:0)-d*u*TAU,ca=Math.cos(a);if(ca<0.05)continue;
        const sz=scatter?1+(hsh(key,5)-0.5)*p.sizeVar/50:1,x=(c-(cols-1)/2)*(cw+g)+(scatter?(hsh(key,6)-0.5)*(cw+g)*p.scatter/100*1.5:0),y=RL*Math.sin(a),z=sg>0?RL*ca-RL:-(RL*ca-RL)*0.6-L*H*0.15,ef=p.edgeFade>0?cl((1-Math.abs(y)/(H/2))/(p.edgeFade/100)):1;
        S.card({item:S.I(key),m:M4.chain(M4.T(x,y,z),M4.RX(sg>0?-a:a*0.6)),w:cw*sz,h:ch*sz,opacity:ef*sstep(0.05,0.3,ca),fade:(1-ca)*0.4+L*0.15});}}}
  S.group=M4.mul(S.group,M4.RY(p.tilt?p.tilt*D2R:0));}
anim('totem-wall','Vícesloupcový válec z karet, který se otáčí svisle.',(S,p,u,E)=>drum(S,p,u,E,false));
anim('parallax-totem','Rozházené karty na otáčejícím se válci, unášené v hloubkových vrstvách.',(S,p,u,E)=>drum(S,p,u,E,true));
anim('card-tunnel','Průlet chodbou z karet směrem k úběžníku.',(S,p,u,E)=>{const {W,H}=S,ts=p.tunnelSize/100,Wt=W*ts,Ht=H*ts,cl2=p.cardLength/100*Ht*1.2,g=p.gap/100*Ht*0.5,sp=cl2+g,rows=Math.ceil(Ht*5/sp),L=rows*sp,D=H*0.9,d=p.direction==='backward'?-1:1;S.persp=0.9;let idx=0;
  for(let j=0;j<rows;j++){const z=((j*sp+d*u*L)%L+L)%L-L+D*0.2,f=cl((z+L)/(L*0.4)),near=cl((D*0.2-z)/(sp*0.8));
    for(const [wx,wy,Rm,len,ax] of [[-Wt/2,0,M4.RY(Math.PI/2),Ht,'y'],[Wt/2,0,M4.RY(-Math.PI/2),Ht,'y'],[0,-Ht/2,M4.RX(-Math.PI/2),Wt,'x'],[0,Ht/2,M4.RX(Math.PI/2),Wt,'x']]){const per=Math.max(1,Math.round(len/(cl2*1.1)));const cw=len/per;
      for(let q=0;q<per;q++){const o=-len/2+cw*(q+0.5);S.card({item:S.I(idx++),m:M4.chain(M4.T(ax==='x'?o:wx,ax==='y'?o:wy,z),Rm),w:ax==='y'?cl2:cw-g,h:ax==='y'?cw-g:cl2,opacity:f*near,fade:p.depthFade/100*(1-f)});}}}});
anim('spiral-stream','Karty se vinou dolů po svislé 3D spirále.',(S,p,u,E)=>{const {W,H}=S,N=p.cardCount,Rb=p.ringSize/100*Math.min(W,H)*0.55,Hs=H*(0.7+p.gap/50*0.9),d=p.direction==='up'?-1:1;persp(S,p,40);
  const flow=p.motion==='steps'?stepPos(u,N,E,0.4)/N:pulseU(u,p);
  for(let k=0;k<N;k++){const s=fract(k/N+d*flow),ang=s*p.turns*TAU,r=Rb*(1+p.taper/100*(s-0.5)),x=r*Math.sin(ang),z=r*Math.cos(ang),y=(s-0.5)*Hs,sc=1+p.scalePulse/100*0.5*Math.sin(TAU*(s*2+u)),it=S.I(k),[w,h]=wh(S,p,it,p.cardSize*0.55*sc),op=sstep(0,0.08,s)*sstep(1,0.92,s),fd=p.backFade/100*(1-(Math.cos(ang)+1)/2);
    if(p.cardStyle==='upright')S.card({item:it,x,y,z,w,h,opacity:op,fade:fd});else bent(S,{item:it,m:M4.chain(M4.T(x,y,z),M4.RY(ang)),w,h,opacity:op,fade:fd},r,4);}
  S.group=M4.mul(S.group,M4.RX(-p.tilt*D2R));});
anim('depth-stack-scroll','Přímý průlet ustupujícím balíkem karet.',(S,p,u,E)=>{const {W,H}=S,N=p.cardCount,sp=p.spacing/100*H*1.4,L=N*sp,d=p.direction==='backward'?-1:1;S.persp=1.25;
  for(let k=0;k<N;k++){const z=((k*sp+d*u*L)%L+L)%L-L+H*0.3,it=S.I(k),[w,h]=wh(S,p,it,p.size*0.9);let x,y;
    if(p.layout==='fan'){const t=(k/N-0.5)*2,a=p.spreadAngle*D2R;x=Math.cos(a)*t*p.spread/100*W*0.5;y=Math.sin(a)*t*p.spread/100*H*0.5;}else{x=(hsh(k,1)-0.5)*p.spread/100*W;y=(hsh(k,2)-0.5)*p.spread/100*H;}
    S.card({item:it,x,y,z,w,h,rz:Math.sin(u*TAU*2+k)*p.wobble/100*0.35,opacity:sstep(-L,-L+sp*2,z)*sstep(H*0.3,H*0.1,z),fade:p.depthFade/100*cl(-z/L)});}});
function coverRing(S,p,u,E,vert){const N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.95),R=p.ringSize/100*(vert?ch:cw)*1.1,d=(p.direction==='left'||p.direction==='down')?-1:1;persp(S,p,100);
  const rot=(p.motion==='flow'?u*N:stepPos(u,N,E,0.45))/N*TAU*d,G=vert?M4.chain(M4.T(0,0,-R*0.55),M4.RY((p.rotate||0)*D2R),M4.RX(-p.tilt*D2R)):M4.chain(M4.T(0,0,-R*0.55),M4.RX(-p.tilt*D2R));
  for(let k=0;k<N;k++){const a=k/N*TAU-rot,c=Math.cos(a);S.card({item:S.I(k),m:vert?M4.chain(G,M4.T(0,R*Math.sin(a),R*c),M4.RX(-a)):M4.chain(G,M4.T(R*Math.sin(a),0,R*c),M4.RY(a)),w:cw,h:ch,fade:p.backFade/100*(1-(c+1)/2),flipX:!vert&&c<0,flipY:vert&&c<0});}}
anim('cover-ring','Ploché karty obíhají celý nakloněný 360° prstenec.',(S,p,u,E)=>coverRing(S,p,u,E,false));
anim('cover-ring-vertical','Ploché karty obíhají svislý 360° prstenec jako ruské kolo.',(S,p,u,E)=>coverRing(S,p,u,E,true));

// ---------- Multiscene ----------
anim('grid-dive','Kamera se po dlaždicích noří do stěny, řady se posouvají jako hlavolam a nakonec proletí rozházenými kousky.',(S,p,u,E)=>{const {W,H}=S,cols=5,rows=3,ts=p.tileSize/100,tw=W/(cols-1.2)*0.82*ts,th=tw*H/W,g=p.gap/100*tw*0.4,cz=1+p.cameraZoom/100*1.1;
  const a=seg(u,0,0.6),k=stepPos(a,4,E,0.45),stepI=Math.min(3,Math.floor(k)),path=[[1,1],[2,1],[3,1],[2,0]],P=(i)=>path[Math.min(3,Math.max(0,i))],fk=k-stepI,c0=P(stepI),c1=P(stepI+1);
  const camX=a<1?lerp(c0[0],c1[0],fk):2,camY=a<1?lerp(c0[1],c1[1],fk):1,inZ=EASE.io(seg(u,0,0.08))*(1-EASE.io(seg(u,0.56,0.66))),dv=seg(u,0.62,0.86),back=EASE.io(seg(u,0.84,1));
  const zoom=lerp(1,cz,inZ),flipA=p.flip?(k%1)*Math.PI:0;
  for(let r=0;r<rows;r++){const shift=(r%2?1:-1)*(tw+g)*Math.min(4,k)*0.5*(1-back)*(a<1?1:1);for(let c=-2;c<cols+2;c++){const key=r*20+c+40,bx=(c-(cols-1)/2)*(tw+g),x=((bx+shift+(cols+4)*(tw+g)*10)%((cols+4)*(tw+g)))-(cols+4)*(tw+g)/2,y=(r-(rows-1)/2)*(th+g),sc=EASE.io(dv)*(1-back),z=sc*(hsh(key,1)-0.3)*H*1.6,yy=y-sc*H*0.9*(hsh(key,2));
    S.card({item:S.I(r*cols+c+10),x:x-(camX-(cols-1)/2)*(tw+g)*inZ,y:yy-(camY-(rows-1)/2)*(th+g)*inZ,z,ry:flipA*(r%2?1:-1)*0,rz:sc*(hsh(key,3)-0.5)*0.8,w:tw,h:th,opacity:1-sc*0.4});}}
  S.persp=1.6;S.group=M4.mul(S.group,M4.S(zoom,zoom,zoom));});
anim('pop-parade','Karty naskočí na hromádku uprostřed, rozloží se do řady, ta odjede a druhá vlna naskočí a pluje přes záběr.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,n1=Math.min(5,Math.max(2,Math.floor(N/3))),n2=Math.min(10,N-n1),it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.2),z=0.7+p.cameraZoom/100*0.3;
  for(let i=0;i<n1;i++){const pop=EASE.ob(seg(u,0.02+i*0.022,0.07+i*0.022)),fan=EASE.io(seg(u,0.16,0.27)),sw=EASE.i(seg(u,0.3,0.44));if(pop<=0||sw>=1)continue;const rx=(i-(n1-1)/2)*(cw*1.08);
    S.card({item:S.I(i),x:lerp((i-(n1-1)/2)*cw*0.06,rx,fan)-sw*W*1.3,y:lerp((hsh(i,1)-0.5)*ch*0.1,0,fan),rz:lerp((hsh(i,2)-0.5)*0.35,0,fan),ry:p.flip?(1-fan)*Math.PI*0:0,w:cw,h:ch,s:pop,order:i});}
  const rows=2,per=Math.ceil(n2/rows);for(let i=0;i<n2;i++){const r=i%rows,c=Math.floor(i/rows),pop=EASE.ob(seg(u,0.46+i*0.015,0.52+i*0.015)),dr=EASE.i(seg(u,0.62+r*0.04,0.97+r*0.02));if(pop<=0)continue;
    S.card({item:S.I(n1+i),x:(c-(per-1)/2)*cw*1.1+(r?cw*0.55:0)+dr*W*1.4*(r?1:1),y:(r-0.5)*ch*1.15,w:cw,h:ch,s:pop,rz:(hsh(i,4)-0.5)*0.08});}
  S.group=M4.mul(S.group,M4.S(z,z,z));if(p.motionAxis==='rotate')S.group=M4.mul(S.group,M4.RZ(Math.PI/2*(S.H>S.W?1:0)));});
anim('triple-scene','Tři scény v jedné smyčce: posouvání hlavních karet, pás sloupců a nakonec šikmá řada, která přistane na hlavní kartě.',(S,p,u,E)=>{const {W,H}=S,hh=p.heroSize/100*H,it0=S.I(0),a0=asp(S,p,it0),hw=hh*a0,hg=p.heroGap/100*W;
  if(u<0.34){const a=seg(u,0,0.34),k=stepPos(a,3,E,0.5),out=EASE.i(seg(u,0.3,0.34));for(let i=-1;i<5;i++){const x=(i-k)*(hw+hg);if(Math.abs(x)>W)continue;S.card({item:S.I(i),x,y:0,w:hw,h:hh,s:1-out*0.4,opacity:1-out});}return;}
  if(u<0.67){const a=seg(u,0.34,0.67),cols=p.columns,cw=W/(cols+0.6)*0.9,ch=cw/a0,g=p.gap/100*W,inn=EASE.o(seg(a,0,0.15)),out=EASE.i(seg(a,0.88,1));for(let c=0;c<cols;c++){const d=c%2?1:-1,L=p.perColumn*(ch+g);for(let j=0;j<p.perColumn;j++){const y=((j*(ch+g)+d*E(a)*p.columnDrift/100*L*1.5+L*10)%L)-L/2;S.card({item:S.I(c*p.perColumn+j+3),x:(c-(cols-1)/2)*(cw+g),y:y+(1-inn)*H*d,w:cw,h:ch,opacity:inn*(1-out)});}}return;}
  const a=seg(u,0.67,1),n=7,cw=W/5,ch=cw/a0,land=EASE.io(seg(a,0.55,1)),tilt=p.rowTilt*D2R*(1-land),rise=p.rowRise/100*H*(1-E(seg(a,0,0.6)));
  for(let i=0;i<n;i++){const ctr=i===3,x=(i-3)*(cw*1.05)*(1-land*(ctr?1:0))+(i-3)*W*0.4*land*(ctr?0:1),y=rise+(i-3)*Math.sin(tilt)*cw;S.card({item:ctr?S.I(0):S.I(i+20),x,y,rz:-tilt,w:ctr?lerp(cw,hw,land):cw,h:ctr?lerp(ch,hh,land):ch,opacity:ctr?1:1-land,order:ctr?1:0});}});
anim('collage-reel','Odstupňovaná koláž se rozestoupí kolem hlavní karty, ta proběhne všemi obrázky a koláž se znovu složí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),a0=asp(S,p,it0),ch=p.zoom/100*H*0.75,cw=ch*a0,rp=p.rowPitch/100*ch*1.7,cs=p.cardSpacing/100*cw*0.6,hh=p.heroSize/100*H,hw=hh*a0;
  const part=EASE.io(seg(u,0.12,0.25))*(1-EASE.io(seg(u,0.85,0.97))),reel=seg(u,0.25,0.85),k=stepPos(reel,N,E,0.4),rows=3,per=Math.ceil(9/rows);
  for(let r=0;r<rows;r++)for(let c=-1;c<=per;c++){const ctr=r===1&&c===1,x=(c-(per-1)/2)*cs+(r%2?p.staggerX/100*cw*0.5:0),y=(r-1)*rp,ang=Math.atan2(y,x||1),push=part*W*0.75;
    if(ctr){const rd=p.reelDirection,ax=rd==='left'||rd==='right'?1:0,sg2=rd==='up'||rd==='left'?-1:1,fk=k-Math.floor(k),idx=Math.floor(k);if(part>0.01){for(const [off,ii] of [[0,idx],[1,idx+1]]){const e=fk-off;S.card({item:S.I(ii),x:lerp(x,0,part)+(ax?sg2*e*hw*1.1:0),y:lerp(y,0,part)+(ax?0:sg2*e*hh*1.1),w:lerp(cw,hw,part),h:lerp(ch,hh,part),[ax?'ry':'rx']:-e*p.reelSpin*D2R*sg2,opacity:1-Math.abs(e)*0.8,order:5});}continue;}}
    S.card({item:S.I(r*per+c+5),x:x+Math.cos(ang)*push,y:y+Math.sin(ang)*push,w:cw,h:ch,opacity:1-part*0.6});}});
anim('fan-shuffle','Balíček se rozevře do vějíře, kolem projede stěna karet s posouvanými řadami a balíček se zase složí.',(S,p,u,E)=>{const {W,H}=S,it0=S.I(0),a0=asp(S,p,it0),ch=H*0.42,cw=ch*a0,n=p.deckCards,fan=E(seg(u,0.03,0.18))*(1-E(seg(u,0.85,0.98))),wallT=seg(u,0.2,0.84),wIn=EASE.o(seg(wallT,0,0.12)),wOut=EASE.i(seg(wallT,0.88,1));
  const deckVis=1-cl(wIn*1.5)+cl((wallT-0.85)*8)*(wallT>0.85?1:0);
  if(deckVis>0.01)for(let i=0;i<n;i++){const t=n>1?i/(n-1)-0.5:0,ang=(p.fanAngle*D2R)*0+t*p.fanSpread*D2R*4*fan;S.card({item:S.I(i),m:M4.chain(M4.T(0,ch*0.5,0),M4.RZ(ang+p.fanAngle*D2R*fan*0.2),M4.T(0,-ch*0.5,0)),w:cw,h:ch,opacity:deckVis,order:i});}
  if(wallT>0&&wallT<1){const cols=p.columns,gz=p.gridZoom/100,gw=W*gz/cols,gh=gw/a0,g=p.gap/100*W,rows=Math.ceil(H/(gh+g))+3,climb=E(wallT)*(gh+g)*4;for(let r=0;r<rows+2;r++){const sh=(r%2?1:-1)*p.rowShift/100*gw*0.5*Math.sin(wallT*Math.PI);for(let c=-1;c<=cols;c++)S.card({item:S.I(r*cols+c+n),x:(c-(cols-1)/2)*(gw+g)+sh,y:H*0.5+gh+(r-rows/2)*(gh+g)-climb+(1-wIn)*H*1.2-wOut*H*1.4,w:gw,h:gh});}}});
anim('sweep-ring','Hromádka se rozloží do ubíhající řady a ta se pak shromáždí do otáčejícího se prstence.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),a0=asp(S,p,it0),rh=p.rowCard/100*H*0.6,rw=rh*a0,gr=p.cardGap/100*W,R=p.ringSize/100*Math.min(W,H),ringH=p.ringCard/100*H*0.6,ringW=ringH*a0;
  const fan=E(seg(u,0.05,0.22)),sweep=E(seg(u,0.22,0.45)),gather=E(seg(u,0.47,0.62)),spin=seg(u,0.55,0.9),back=E(seg(u,0.88,1));
  for(let i=0;i<N;i++){const st=[(N-1-i)*p.deckDepth*0.4,-(N-1-i)*p.deckDepth*0.4],row=[(i-(N-1)/2)*(rw+gr)-sweep*((N-1)/2)*(rw+gr)*1.0,0],a=i/N*TAU+E(spin)*TAU-Math.PI/2,ring=[Math.cos(a)*R,Math.sin(a)*R];
    let x=lerp(st[0],row[0],fan),y=lerp(st[1],row[1],fan);x=lerp(x,ring[0],gather);y=lerp(y,ring[1],gather);x=lerp(x,st[0],back);y=lerp(y,st[1],back);const w=lerp(lerp(rw,ringW,gather),rw,back),h=lerp(lerp(rh,ringH,gather),rh,back);
    S.card({item:S.I(i),x,y,w,h,rz:gather*(1-back)*(a+Math.PI/2),order:i});}});
anim('scatter-dial','Rozházené karty se seskupí do kruhu, ten klesne ke spodnímu okraji a tiká dokola jako ciferník.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),a0=asp(S,p,it0),sh=p.scatterSize/100*H*0.6,sw=sh*a0,ch=p.cardSize/100*H*0.6,cw=ch*a0,R=p.ringSize/100*Math.min(W,H)*1.1;
  const gather=E(seg(u,0.08,0.25))*(1-E(seg(u,0.88,1))),sink=E(seg(u,0.27,0.4))*(1-E(seg(u,0.8,0.9))),tick=tickPos(seg(u,0.4,0.8),N,E,20,10,40),cy=lerp(0,H/2+R*0.25,sink);
  for(let i=0;i<N;i++){const sx=(hsh(i,1)-0.5)*W*0.75,sy=(hsh(i,2)-0.5)*H*0.6,a=(i+tick)/N*TAU-Math.PI/2,rx=Math.cos(a)*R,ry=Math.sin(a)*R+cy;
    S.card({item:S.I(i),x:lerp(sx,rx,gather),y:lerp(sy,ry,gather),w:lerp(sw,cw,gather),h:lerp(sh,ch,gather),rz:lerp((hsh(i,3)-0.5)*0.6,a+Math.PI/2,gather*sink),order:i});}});
anim('grid-zoom-strip','Mřížka 3×3 se přiblíží na pruh, projede všechny karty a zase se oddálí.',(S,p,u,E)=>{const {W,H}=S,g=p.gridGap/100*W,a0=p.cardAspect==='frame'?W/H:asp(S,p,S.I(0)),ch=(H*0.8-2*g)/3,cw=Math.min(ch*a0,(W*0.8-2*g)/3),chh=cw/a0,vert=p.direction==='vertical';
  const zin=E(seg(u,0.05,0.2))*(1-E(seg(u,0.82,0.95))),tr=seg(u,0.2,0.82),path=p.movement==='stepped'?stepPos(tr,8,E,0.45)/8:E(tr),start=p.focusMode==='center'?4:0,idx=start+path*8,ci=Math.floor(idx)%9,cr=Math.floor((idx%9)/3),cc=(idx%9)%3;
  const fx=(vert?Math.floor(ci/3)*0+ (Math.floor(idx)%3):cc)-1,fy=(vert?(Math.floor(idx/3)%3):cr)-1,tx=-(((idx%9)%3)-1)*(cw+g),ty=-(Math.floor((idx%9)/3)-1)*(chh+g);
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const i=r*3+c,act=Math.abs(i-(idx%9))<0.6;S.card({item:S.I(i),x:(c-1)*(cw+g)+tx*zin,y:(r-1)*(chh+g)+ty*zin,w:cw,h:chh,opacity:p.fade&&zin>0.5&&!act?1-zin*0.7:1});}
  const z=lerp(1,p.zoom,zin);S.group=M4.mul(S.group,M4.S(z,z,z));});
function spread(S,p,u,E,cols){const {W,H}=S,N=S.slots,it0=S.I(0),a0=asp(S,p,it0),lines=p.stackStyle==='rowEdges'?p.rowsOdd:p.rows,per=Math.ceil(N/lines),z=p.zoom/100,cw=W*0.85/per*(0.5+z),ch=cw/a0,rg=p.rowGap/100*H,cg=p.cardGap/100*W;
  for(let r=0;r<lines;r++){const d0=r*p.rowDelay/100,open=E(seg(u,0.05+d0,0.35+d0)),close=E(seg(u,0.65+d0*0.5,0.92+d0*0.5)),e=open*(1-close),drift=Math.sin(seg(u,0.3,0.7)*Math.PI)*p.drift/100*W*0.4*(r%2?1:-1);
    for(let c=0;c<per;c++){const i=r*per+c,ox=(c-(per-1)/2)*(cw+cg)+drift,oy=(r-(lines-1)/2)*(ch+rg),sx=p.stackStyle==='rowEdges'&&r%2?(c<per/2?-W*0.3:W*0.3):0,ss=p.stackScale/100;
      const X=lerp(sx,ox,e),Y=lerp(0,oy,e),Wc=lerp(cw*ss*1.4,cw,e),Hc=lerp(ch*ss*1.4,ch,e);S.card({item:S.I(i),x:cols?Y:X,y:cols?X:Y,w:Wc,h:Hc,order:-i});}}}
anim('spread-rows','Řady karet se rozevřou z hromádky, chvíli plují a pak zase zaklapnou.',(S,p,u,E)=>spread(S,p,u,E,false));
anim('spread-columns','Sloupce karet se rozevřou z hromádky, chvíli plují a pak zase zaklapnou.',(S,p,u,E)=>spread(S,p,u,E,true));

// ---------- Isometric ----------
const isoM=(f,rot=-Math.PI/4)=>M4.mul(M4.S(1,f,1),M4.RZ(rot));
anim('iso-cascade','Šikmá stuha izometricky zkosených karet.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.size*0.42),sp=cw*(0.45+p.spacing/100),L=Math.max(N,Math.ceil(Math.hypot(W,H)*1.6/sp))*sp,f=1-p.skew/100*0.6,dmap={up:[1,0],down:[-1,0],'down-right':[0,1],'up-left':[0,-1]},dd=dmap[p.direction]||[1,0];
  const off=(p.motion==='stepped'?stepPos(u,Math.round(L/sp),E,0.45)*sp:u*L),G=isoM(f);
  for(let k=0;k*sp<L;k++){const s=((k*sp+off*(dd[0]||dd[1]))%L+L)%L-L/2,px=dd[1]?0:s,py=dd[1]?s:0,q=xf(G,px+(dd[1]?0:0),py,0);S.card({item:S.I(k),m:M4.mul(M4.T(q[0],q[1],0),G),w:cw,h:ch,order:-q[1]});}});
anim('iso-focus','Izometrické hromádky karet postupně projíždějí reflektorem uprostřed.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.size*0.5),sp=ch*(0.5+p.spacing/100),fg=p.focusGap/100*ch,f=1-p.skew/100*0.6,G=isoM(f,-Math.PI/6),d=p.direction==='up'?-1:1,k=stepPos(u,N,E,0.5);
  for(let i=-4;i<=N+4;i++){const rel=i-k*d,ad=Math.abs(rel),pos=rel*sp+Math.sign(rel)*Math.min(1,ad)*fg,ctr=Math.max(0,1-ad),sc=1+(p.centerScale/100-1)*ctr,q=xf(G,0,pos,0);if(Math.abs(q[1])>H*0.9)continue;S.card({item:S.I(((i%N)+N)%N),m:M4.chain(M4.T(q[0],q[1]-ctr*ch*0.25,0),G),w:cw*sc,h:ch*sc,order:ctr*10-ad,fade:(1-ctr)*0.35});}});
anim('iso-orbit','Izometrická mřížka karet, která se kolébá na orbitě a karty se vznášejí.',(S,p,u,E)=>{const {W,H}=S,it0=S.I(0),base=p.size/100*Math.min(W,H)*0.32,a0=asp(S,p,it0),cw=base*Math.sqrt(a0),ch=base/Math.sqrt(a0),g=p.spacing/100*base,f=1-p.tilt/100*0.55,rot=p.motion==='spin'?-Math.PI/4+u*TAU:-Math.PI/4+Math.sin(u*TAU)*p.swingAngle*D2R,G=isoM(f,rot);
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const i=r*3+c,x=(c-1)*(cw+g),y=(r-1)*(ch+g),q=xf(G,x,y,0),fl=Math.sin(u*TAU*2+i*0.9)*p.float/100*Math.min(W,H);S.card({item:S.I(i),m:M4.chain(M4.T(q[0],q[1]-fl,0),G),w:cw,h:ch,order:q[1]});}});

// ---------- Orbit ----------
anim('orbit-showcase','Ploché karty obíhají s perspektivou: vepředu velké, vzadu malé.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,uu=pulseU(u,p),d=p.direction==='left'?-1:1,rw=p.ringWidth/100*W/2,rh=p.ringHeight/100*H/2,ps=p.perspective/100;
  for(let k=0;k<N;k++){const a=(k/N*p.spread/100+d*uu)*TAU,c=Math.cos(a),it=S.I(k),[w,h]=wh(S,p,it,p.cardSize),sc=1+c*ps*0.45,x=rw*Math.sin(a),y=rh*c;const q=xf(M4.RZ(p.ringTilt*D2R),x,y,0);S.card({item:it,x:q[0],y:q[1],w,h,s:sc,order:c,fade:p.backFade/100*(1-(c+1)/2)});}});
anim('orbit-bloom','Karty obíhají jako paprsky kola: vnitřní hranou k náboji, vršky se naklánějí jako okvětní lístky.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,uu=pulseU(u,p),d=p.direction==='left'?-1:1,rw=p.ringWidth/100*W/2,rh=p.ringHeight/100*H/2;persp(S,p,100);const G=M4.RX(-p.ringTilt*D2R);
  for(let k=0;k<N;k++){const a=(k/N+d*uu)*TAU,it=S.I(k),[w,h]=wh(S,p,it,p.cardSize),x=Math.sin(a)*rw,y=-Math.cos(a)*rh,z=Math.cos(a)*rh*0.6,lean=p.lean/100*0.9,rz=Math.atan2(x,-y*(rw/Math.max(1,rh)));
    S.card({item:it,m:M4.chain(G,M4.T(x+Math.sin(a)*h*0.5,y-Math.cos(a)*h*0.5*(rh/Math.max(rw,1)),z),M4.RZ(rz),M4.RX(lean)),w,h,fade:p.backFade/100*(1-(Math.cos(a)+1)/2)*0.6});}});
anim('orbit-carousel','Návrhy obíhají v hloubce, přední karta je zaostřená.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=stepPos(u,N,E,0.55),sp=p.spread/100*W*0.5,dp=p.depth/100;
  for(let i=0;i<N;i++){const a=(i-k)/N*TAU,c=Math.cos(a),it=S.I(i),[w,h]=p.cardAspect==='frame'?[W*0.42,H*0.42]:wh(S,p,it,34);S.card({item:it,x:Math.sin(a)*sp,y:-c*H*0.04,w,h,s:1-dp*0.55*(1-c)/2,order:c,fade:(1-c)/2*0.55,shadow:0});}});
anim('photo-orbit','Shluk karet pomalu obíhá kolem středu.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,d=p.direction==='left'?-1:1,uu=p.motion==='steps'?stepPos(u,N,E,0.5)/N:pulseU(u,p),rw=p.ringWidth/100*W/2,rh=p.ringHeight/100*H/2;
  for(let k=0;k<N;k++){const a=(k/N+d*uu)*TAU,it=S.I(k),[w,h]=wh(S,p,it,p.cardSize);S.card({item:it,x:Math.cos(a)*rw,y:Math.sin(a)*rh,rz:(hsh(k,1)-0.5)*0.35+Math.sin(a)*0.05,w,h,order:Math.sin(a)});}});
anim('focus-orbit','Orbitující moodboard se přiblíží na kartu, otočí se a zase se oddálí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,R=p.ringSize/100*Math.min(W,H)*0.5,d=p.direction==='left'?-1:1,st=p.spinStops,k=stepPos(u,st,E,0.5),f=u*st-Math.floor(u*st),hz=p.motion==='pulse'?Math.sin(f*Math.PI)*p.pulse/100:Math.sin(cl((f-0.05)/0.42)*Math.PI);persp(S,p,80);
  const rot=d*k/st*TAU,ry=(p.rotateYScope==='zoom'?hz:1)*p.rotateY*D2R;
  for(let i=0;i<N;i++){const a=i/N*TAU+rot+Math.PI/2,x=Math.cos(a)*R,y=Math.sin(a)*R,it=S.I(i),[w,h]=wh(S,p,it,p.cardSize),front=Math.abs(((a-Math.PI/2)%TAU+TAU)%TAU-Math.PI)>Math.PI-0.3/N*TAU;
    S.card({item:it,x,y,rz:p.cardFacing==='follow'?a-Math.PI/2:0,w,h,order:front?2:0,fade:p.zoomStyle==='spotlight'&&!front?hz*0.65:0});}
  const z=1+(p.zoom-1)*hz;S.group=M4.chain(S.group,M4.T(0,-R*hz*z*0.98,0),M4.S(z,z,z),M4.RY(ry));});
anim('vortex-spin','Prstence karet se v hloubce točí proti sobě.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,base=p.ringSize/100*Math.min(W,H)*0.5,S2=1.6;S.persp=1.8;
  for(let r=0;r<p.rings;r++){const R=base*(1+r*0.55),dir=p.direction==='alternate'?(r%2?-1:1):(p.direction==='ccw'?-1:1),cnt=Math.max(4,Math.round(N*(1+r*0.6))),z=-r*p.depth/100*H*0.6;
    for(let k=0;k<cnt;k++){const a=k/cnt*TAU+dir*u*TAU,it=S.I(k+r*7),[w,h]=wh(S,p,it,p.cardSize*1.5*(1+r*0.25));S.card({item:it,x:Math.cos(a)*R,y:Math.sin(a)*R,z,rz:p.cardStyle==='curved'?a+Math.PI/2:0,w,h,fade:p.backFade/100*r/(p.rings-1||1)});}}});
function wheel(S,p,u,E,bottom){const {W,H}=S,N=S.slots,m=Math.min(W,H),R=p.wheelSize/100*m*(bottom?0.95:0.42),d=p.direction==='left'?-1:1,rots=p.rotations;
  let rot=p.movement==='stepped'?tickPos(u,N*rots,E,p.anticipation,p.overshoot,p.hold)/N*TAU:u*rots*TAU;rot*=d;const cy=bottom?H/2+R*0.18:0;
  const rings=bottom?[[R,1],[R*0.66,0.8]]:[[R,1]];
  rings.forEach(([rr,sc],ri)=>{for(let k=0;k<N;k++){const a=k/N*TAU+rot*(ri?-1:1)*(ri?0.8:1),it=S.I(k+ri*N),[w,h]=wh(S,p,it,p.cardSize*sc),x=Math.sin(a)*rr,y=cy-Math.cos(a)*rr;if(bottom&&y>H/2+h)continue;
    let rz=a,ry=0,rx=0;const spin=TAU*p.spinRate*u*(ri?-1:1);if(p.spinStyle==='self')rz=a+spin;if(p.spinStyle==='flip'){if(p.flipAxis==='x')rx=spin;else ry=spin;}
    const bk=Math.cos(ry||rx)<0;S.card({item:it,x,y,rz,ry,rx,w,h,flipX:bk&&!!ry,flipY:bk&&!!rx});}});}
anim('wheel-spin','Celé kolo v záběru se točí stálým plynulým tempem.',(S,p,u,E)=>wheel(S,p,u,E,false));
anim('wheel-spin-bottom','Půlkruhová kupole ze dvou kruhů karet, která se točí nad nábojem pod záběrem.',(S,p,u,E)=>wheel(S,p,u,E,true));

// ---------- Carousel & Flow ----------
function curvedStrip(S,p,u,E,vert){const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*1.1),g=p.gap/100*(W+H)/2,along=(vert?ch:cw)+g,span=vert?H:W,M=Math.max(N,Math.ceil(span*1.6/along)+2),Mn=N*Math.ceil(M/N),L=Mn*along;
  const pos=p.motion==='steps'?stepPos(u,Mn,E,0.5)*along:u*L,R=Math.abs(p.curve)<1?Infinity:span*0.9*100/Math.abs(p.curve),sg=p.curve<0?-1:1;S.persp=2;
  for(let k=0;k<Mn;k++){const s=((k*along-pos)%L+L)%L-L/2;if(Math.abs(s)>span)continue;const th=s/R,pa=isFinite(R)?R*Math.sin(th):s,pz=isFinite(R)?-sg*(R-R*Math.cos(th)):0,rot=isFinite(R)?th*sg:0;
    S.card({item:S.I(k),m:vert?M4.chain(M4.T(0,pa,pz),M4.RX(-rot)):M4.chain(M4.T(pa,0,pz),M4.RY(rot)),w:cw,h:ch,fade:cl(Math.abs(s)/span)*0.5});}}
anim('card-totem','Svislý 3D zakřivený pás karet procházející středem.',(S,p,u,E)=>curvedStrip(S,p,u,E,true));
anim('film-strip','3D zakřivený pás karet klouzající středem záběru.',(S,p,u,E)=>curvedStrip(S,p,u,E,false));
anim('wheel-carousel','Karty na obřím kole, které poskakuje vpřed s nápřahem a přešvihem.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,R=p.wheelSize/100*H*0.9,cy=R*0.92,d=p.direction==='left'?-1:1,steps=N,k=tickPos(u,steps,E,p.anticipation,p.overshoot,p.hold),ang=TAU/(N*1.6);
  for(let i=-3;i<=N+3;i++){const a=(i-k*d)*ang,it=S.I(((i%N)+N)%N),[w,h]=wh(S,p,it,p.cardSize*0.55);if(Math.abs(a)>Math.PI*0.6)continue;S.card({item:it,x:Math.sin(a)*R,y:cy-Math.cos(a)*R,rz:a,w,h,order:-Math.abs(a)});}});
function coverFlow(S,p,u,E,vert){const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.8),g=p.gap/100*(W+H)/2,d=(p.direction==='right'||p.direction==='down')?-1:1,c=(p.motion==='flow'?u*N:stepPos(u,N,E,0.5))*d;S.persp=2;
  for(let k=Math.floor(c)-5;k<=Math.floor(c)+6;k++){const dd=k-c,ad=Math.abs(dd),sg=Math.sign(dd),off=ad<1?dd*(vert?ch:cw)*0.75:sg*((vert?ch:cw)*0.75+(ad-1)*((vert?ch:cw)*0.32+g)),tilt=-cl(dd,-1,1)*p.sideTilt*D2R*1.4;
    S.card({item:S.I(((k%N)+N)%N),x:vert?0:off,y:vert?off:0,z:-Math.min(1,ad)*cw*0.45,ry:vert?0:tilt,rx:vert?-tilt:0,w:cw,h:ch,order:-ad,fade:Math.min(0.5,ad*0.1)});}
  if(!vert&&p.flowAngle)S.group=M4.mul(S.group,M4.RZ(-p.flowAngle*D2R));}
anim('cover-flow','Karusel s plochou kartou uprostřed a sousedy natočenými do 3D.',(S,p,u,E)=>coverFlow(S,p,u,E,false));
anim('cover-flow-vertical','Svislý karusel s plochou kartou uprostřed a sousedy natočenými do 3D.',(S,p,u,E)=>coverFlow(S,p,u,E,true));
anim('carousel-flow','Klouzající pás karet; prostřední karta je v popředí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,vert=p.direction==='vertical',it0=S.I(0),a0=p.cardAspect==='frame'?W/H:asp(S,p,it0),cw=vert?H*0.5*a0:W*0.48,ch=cw/a0,g=p.gap/100*W,c=stepPos(u,N,E,0.5),stp=(vert?ch:cw)*(1+p.sideScale)/2+g;
  for(let k=Math.floor(c)-3;k<=Math.floor(c)+3;k++){const dd=k-c,ad=Math.min(1,Math.abs(dd));S.card({item:S.I(((k%N)+N)%N),x:vert?0:dd*stp,y:vert?dd*stp:0,w:cw,h:ch,s:lerp(1,p.sideScale,ad),order:-Math.abs(dd),fade:ad*0.3});}});
anim('diagonal-carousel','Překrývající se karty kloužou po diagonále jako rozložený balíček.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.75),ov=1-p.overlap/100,dm={downRight:[1,1],downLeft:[-1,1],upRight:[1,-1],upLeft:[-1,-1]}[p.direction]||[1,1],stx=cw*ov*dm[0],sty=ch*ov*dm[1]*0.7,M=Math.max(N,Math.ceil(Math.hypot(W,H)/Math.hypot(stx,sty))+3),Mn=N*Math.ceil(M/N);
  const c=p.movement==='stepped'?stepPos(u,Mn,E,p.stagger/100*0.8):u*Mn;
  for(let k=0;k<Mn;k++){const s=((k-c)%Mn+Mn)%Mn-Mn/2;S.card({item:S.I(k),x:s*stx,y:s*sty,w:cw,h:ch,order:s*dm[1],shadow:0.25});}});
anim('focus-slider','Karty se posouvají do strany cik-cak; prostřední je větší než sousedé.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,vert=p.direction==='vertical',it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.25),g=p.gap/100*W,step=(vert?ch:cw)*1.25+g,c=stepPos(u,N,E,1-p.glide/100);
  for(let k=Math.floor(c)-6;k<=Math.floor(c)+6;k++){const dd=k-c,ad=Math.abs(dd),ctr=Math.max(0,1-ad),zz=(p.weave==='alternate'?((k%2+2)%2?1:-1):1)*p.offset/100*(vert?cw:ch)*(1-ctr),sc=1+(p.centerScale/100-1)*ctr,along=dd*step+Math.sign(dd)*Math.min(1,ad)*(vert?ch:cw)*(p.centerScale/100-1)*0.5;
    S.card({item:S.I(((k%N)+N)%N),x:vert?zz:along,y:vert?along:zz,w:cw,h:ch,s:sc,order:ctr});}});
anim('mosaic-marquee','Vodorovný masonry pás karet různých velikostí, který ubíhá do strany.',(S,p,u,E)=>{const {W,H}=S,bh=p.size/100*H,g=p.gap/100*H,pat={1:[[2],[1,1],[1.5],[1,1],[2]],2:[[1,1],[2],[1,1,1],[1.5]],3:[[1.5],[1,1],[2],[1,1],[1.5],[1]]}[p.variant]||[[2],[1,1]];
  const cols=[];let x=0,idx=0;while(x<W*2.2){for(const col of pat){const n=col.length,wcol=n===1?bh*col[0]*0.75:bh*0.75;cols.push({x,w:wcol,n,start:idx});idx+=n;x+=wcol+g;}}const L=x,d=p.direction==='right'?-1:1;
  for(const cc of cols){const xx=((cc.x-d*u*L)%L+L)%L-L/2+cc.w/2;if(Math.abs(xx)>W*0.7)continue;const h=(bh-g*(cc.n-1))/cc.n;for(let j=0;j<cc.n;j++)S.card({item:S.I(cc.start+j),x:xx,y:-bh/2+h/2+j*(h+g),w:cc.w,h});}});
anim('hero-reel','Aktivní náhled se zvedne a pozadí přes celý záběr se k němu přestírá.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=Math.floor(u*N),f=u*N-k,mv=seg(f,p.hold/100,1),e=E(mv),tw=Math.min(W*0.8/N,H*0.2)-p.gap/100*W,th=tw*0.75,y0=H/2-th*0.9;
  const kb=s=>1+p.kenBurns/100*0.12*s;S.card({item:S.I(k),x:0,y:0,w:W,h:H,abs:true,layer:-50,radius:0,noShadow:true,s:kb(f),fade:1-p.heroOpacity/100,fadeColor:'#000000'});
  if(mv>0){const nx=S.I(k+1);wipeTiles(S,Object.assign({},p,{columns:p.columns,rows:p.rows}),nx,0,0,W*kb(0),H*kb(0),e,k);for(const c of S.cards.slice(-200))if(c.item===nx&&!c.layer){c.abs=true;c.layer=-49;c.fade=1-p.heroOpacity/100;c.fadeColor='#000000';}}
  for(let i=0;i<N;i++){const act=i===k?1-e:i===(k+1)%N?e:0,x=(i-(N-1)/2)*(tw+p.gap/100*W);S.card({item:S.I(i),x,y:y0-act*p.lift/100*H,w:tw,h:th,s:1+(p.activeScale/100-1)*act,order:act,shadow:0.3});}});

// ---------- Grid ----------
function gridDims(n,W,H){let best=null;for(let c=1;c<=n;c++){const r=Math.ceil(n/c),s=Math.min(W/c,H/r);if(!best||s>best.s)best={c,r,s};}return best;}
anim('grid-reveal','Mřížka se poskládá dlaždici po dlaždici, chvíli drží a pak se rozletí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,gd=gridDims(N,W,H),g=p.gap/100*W,cw=(W-g*(gd.c+1))/gd.c,ch=(H-g*(gd.r+1))/gd.r;
  for(let i=0;i<N;i++){const r=Math.floor(i/gd.c),c=i%gd.c,o=p.order==='column'?(c*gd.r+r)/N:p.order==='diagonal'?(r+c)/(gd.c+gd.r-1):i/N,ein=E(seg(u,o*0.25,o*0.25+0.15)),eout=E(seg(u,0.6+o*0.2,0.75+o*0.2)),x=-W/2+g+cw/2+c*(cw+g),y=-H/2+g+ch/2+r*(ch+g);
    S.card({item:S.I(i),x:x+eout*(x)*1.6,y:y+(1-ein)*H*0.25+eout*y*1.6,w:cw,h:ch,s:lerp(0.85,1,ein),opacity:ein*(1-eout)});}});
anim('spotlight-zoom','Dlaždice mřížky se postupně zvětší přes celý záběr.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,gd=gridDims(N,W,H),g=p.gap/100*W,cw=(W-g*(gd.c+1))/gd.c,ch=(H-g*(gd.r+1))/gd.r,k=Math.floor(u*N),f=u*N-k,e=E(seg(f,0.1,0.35))*(1-E(seg(f,0.7,0.95)));
  for(let i=0;i<N;i++){const r=Math.floor(i/gd.c),c=i%gd.c,x=-W/2+g+cw/2+c*(cw+g),y=-H/2+g+ch/2+r*(ch+g),act=i===k;S.card({item:S.I(i),x:act?lerp(x,0,e):x,y:act?lerp(y,0,e):y,w:act?lerp(cw,W,e):cw,h:act?lerp(ch,H,e):ch,order:act?5:0,fade:act?0:e*p.dimming/100,radius:act?lerp(S.style&&S.style.radius!=null?S.style.radius/100*Math.min(cw,ch)/S.u:0,0,e):undefined});}});
anim('flip-grid','Dlaždice se ve vlně překlápějí mezi dvěma sadami návrhů.',(S,p,u,E)=>{const {W,H}=S,N=Math.max(2,Math.floor(S.slots/2)),gd=gridDims(N,W,H),g=p.gap/100*W,cw=(W-g*(gd.c+1))/gd.c,ch=(H-g*(gd.r+1))/gd.r;S.persp=2.4;
  for(let i=0;i<N;i++){const r=Math.floor(i/gd.c),c=i%gd.c,o=(r+c)/(gd.c+gd.r-1)*0.18,ang=(E(seg(u,0.1+o,0.3+o))+E(seg(u,0.6+o,0.8+o)))*Math.PI,back=Math.cos(ang)<0;
    S.card({item:S.I(back?N+i:i),x:-W/2+g+cw/2+c*(cw+g),y:-H/2+g+ch/2+r*(ch+g),ry:p.axis==='horizontal'?ang:0,rx:p.axis==='vertical'?ang:0,w:cw,h:ch,flipX:back&&p.axis==='horizontal',flipY:back&&p.axis==='vertical'});}});
anim('pop-grid','Dlaždice mřížky naskakují a mizí ve vlastních nepravidelných cyklech.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,gd=gridDims(N,W,H),g=p.gap/100*W,cw=(W-g*(gd.c+1))/gd.c,ch=(H-g*(gd.r+1))/gd.r,vis=p.visible/100;
  for(let i=0;i<N;i++){const r=Math.floor(i/gd.c),c=i%gd.c,ph=hsh(i,2),cyc=1+Math.floor(hsh(i,3)*2),f=fract(u*cyc+ph),inn=EASE.ob(cl(f/0.08)),out=EASE.i(cl((f-vis)/0.08)),s=f<vis?inn:1-out;if(s<=0.001)continue;S.card({item:S.I(i+Math.floor(u*cyc+ph)*N),x:-W/2+g+cw/2+c*(cw+g),y:-H/2+g+ch/2+r*(ch+g),w:cw,h:ch,s});}});
anim('ticker-loop','Protiběžné šikmé řady marquee v neustálém pohybu.',(S,p,u,E)=>{const {W,H}=S,it0=S.I(0),vert=p.orientation==='vertical',ch=p.zoom/100*H*0.6,cw=ch*asp(S,p,it0),g=p.rowGap/100*H,along=(vert?ch:cw)+g,span=Math.hypot(W,H)*1.1,M=Math.ceil(span/along)+2,L=M*along,lines=Math.ceil(span/((vert?cw:ch)+g))|1;
  let z=1;if(p.movement==='zoomPulse')z=1+p.zoomPulseAmount/100*Math.max(0,Math.sin(u*TAU*p.pulseCount));const creep=p.movement==='zoomWaypoints'?(stepPos(u,p.stops,E,p.pause/100)/p.stops):u;if(p.movement==='zoomWaypoints'){const f=u*p.stops%1;z=1+(p.waypointZoom-1)*Math.sin(cl(f/(p.pause/100+0.01))*Math.PI);}
  for(let l=0;l<lines;l++){const lc=(l-(lines-1)/2)*((vert?cw:ch)+g),d=p.direction==='same'?1:(l%2?-1:1);for(let k=0;k<M;k++){const s=((k*along+d*creep*L+(l%3)*along*0.33)%L+L)%L-L/2;S.card({item:S.I(l*M+k),x:vert?lc:s,y:vert?s:lc,w:cw,h:ch});}}
  S.group=M4.chain(S.group,M4.S(z,z,z),M4.RZ(p.angle*D2R));});
anim('ticker-tilt','Řady marquee na 3D nakloněné rovině ustupující do perspektivy.',(S,p,u,E)=>{const {W,H}=S,it0=S.I(0),ch=p.zoom/100*H*0.7,cw=ch*asp(S,p,it0),g=p.rowGap/100*H,along=cw+g,M=Math.ceil(W*2.4/along)+2,L=M*along,lines=Math.ceil(H*2/(ch+g))|1,d0=p.direction==='right'?-1:1;persp(S,p,100);
  for(let l=0;l<lines;l++){const lc=(l-(lines-1)/2)*(ch+g),d=p.flow==='same'?d0:p.flow==='staggered'?d0:(l%2?-d0:d0),dl=p.flow==='staggered'?l*p.staggerDelay/100:0;for(let k=0;k<M;k++){const s=((k*along+d*(u+dl)*L)%L+L)%L-L/2;S.card({item:S.I(l*M+k),x:s,y:lc,w:cw,h:ch,fade:cl(Math.abs(lc)/(H*1.2))*0.5});}}
  S.group=M4.mul(S.group,M4.RX(p.tilt*D2R));});
anim('column-drift','Tři sloupce karet plují proti sobě.',(S,p,u,E)=>{const {W,H}=S,cols=3,g=p.gap/100*W,cw=(W*0.86-g*2)/cols,ch=cw/asp(S,p,S.I(0)),M=Math.ceil(H*1.4/(ch+g))+2,L=M*(ch+g);
  for(let c=0;c<cols;c++){const d=c%2?-1:1;for(let k=0;k<M;k++){const y=((k*(ch+g)+d*u*L)%L+L)%L-L/2;S.card({item:S.I(c*M+k),x:(c-1)*(cw+g),y,w:cw,h:ch});}}});
anim('feed-scroll','Odstupňovaný sloupec karet odsouvaný nahoru jako feed.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),cw=p.cardSize/100*W*0.55,ch=cw/asp(S,p,it0),sp=p.spacing/100*ch*1.6,L=N*sp,pos=p.motion==='flicks'?stepPos(u,N,E,1-p.move/100)*sp:u*L;
  for(let k=0;k<N;k++){const y=((k*sp-pos)%L+L)%L-L/2,lane=((k%2)?1:-1)*p.lanes/100*cw*0.35,fd=p.fade/100,op=cl((H/2+ch*0.3-Math.abs(y))/(H*0.35*fd+1));S.card({item:S.I(k),x:lane,y,w:cw,h:ch,opacity:op,shadow:0.25});}});

// ---------- Spotlight & Focus ----------
anim('center-stage','Jeden návrh po druhém se dostane do světla reflektoru.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=Math.floor(u*N),f=u*N-k,ein=E(seg(f,0,0.3)),eout=E(seg(f,0.72,1)),cw=W*p.cardSize/100*0.62,ch=cw/(W/H),tr=p.travel/100*W;
  if(p.ghosts)for(const [o,a] of [[-1,0.12],[1,0.12]])S.card({item:S.I(k+o),x:o*tr*0.9,y:0,w:cw*0.8,h:ch*0.8,opacity:a,order:-1});
  S.card({item:S.I(k),x:lerp(tr,0,ein)-eout*tr,y:0,w:cw,h:ch,s:lerp(0.9,1,ein)-eout*0.1,opacity:ein*(1-eout),order:1});});
anim('focus-shift','Náhledy v liště se střídají a postupně se zvětší do hlavní plochy.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,rw=p.railSize/100*W,g=p.gap/100*W,th=(H*0.86-g*(N-1))/N,tw=Math.min(rw,th*1.4),rx=-W/2+g*2+tw/2,mw=W-tw-g*5,mh=H*0.86,mx=W/2-g*2-mw/2,k=Math.floor(u*N),f=u*N-k,e=E(seg(f,0,0.3)),back=E(seg(f,0.75,1));
  for(let i=0;i<N;i++){const y=-H*0.43+th/2+i*(th+g),act=i===k?e*(1-back):0;S.card({item:S.I(i),x:lerp(rx,mx,act),y:lerp(y,0,act),w:lerp(tw,mw,act),h:lerp(th,mh,act),order:act,fade:i===k?0:0.3});}});
anim('deck-peel','Balíček uprostřed, ze kterého postupně odpadává přední karta.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,it0=S.I(0),[cw,ch]=wh(S,p,it0,p.cardSize*0.7),pk=p.peek/100*ch,k=Math.floor(u*N),f=u*N-k,e=E(seg(f,0.45,1));S.persp=2;
  for(let s=4;s>=0;s--){const it=S.I(k+s);if(s===0){S.card({item:it,x:e*cw*0.15,y:EASE.i(e)*H*0.9,z:e*80,rz:e*0.35,rx:-e*0.6,w:cw,h:ch,opacity:1-cl((e-0.7)/0.3),order:10});continue;}const ef=s-e;S.card({item:it,x:0,y:-ef*pk,w:cw,h:ch,s:1-ef*0.04,fade:ef*0.12,order:-s,opacity:s===4?e:1});}});
anim('zoom-parallax','Pomalý Ken Burns pohyb s paralaxními prolínačkami.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=Math.floor(u*N),f=u*N-k,x=E(seg(f,0.72,1)),za=p.zoomAmount/100,dir=i=>p.panDir==='left'?-1:p.panDir==='right'?1:(i%2?-1:1);
  for(const [i,lf,a] of [[k,f,1],[k+1,f-1,x]]){if(a<=0)continue;const t=lf+1;S.card({item:S.I(i),x:dir(i)*W*za*0.25*(t-0.5)+(i!==k?(1-x)*W*0.08*dir(i):0),y:0,w:W*(1+za),h:H*(1+za),s:1+za*0.5*t*0.5,radius:0,opacity:i===k?1:x,order:i===k?0:1,noShadow:true});}});

// ---------- Reveal & Wipe ----------
const full=(S,o)=>S.card(Object.assign({x:0,y:0,w:S.W,h:S.H,noShadow:true},o));
anim('diagonal-wipe','Snímky odhaluje šikmá stírající hrana.',(S,p,u,E)=>{const N=S.slots,k=Math.floor(u*N),f=u*N-k,e=E(seg(f,0.55,1));full(S,{item:S.I(k),order:0});if(e>0)full(S,{item:S.I(k+1),order:1,mask:[5,e*1.04-0.02,p.angle*D2R,p.edgeGlow/100*0.9]});});
anim('stripe-reveal','Obrázky se skládají z vysouvajících se pruhů.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=Math.floor(u*N),f=u*N-k,n=p.strips;full(S,{item:S.I(k),order:0});const nx=S.I(k+1),uv=fitUV(nx,W,H,'crop').uv;
  for(let i=0;i<n;i++){const e=E(seg(f,0.5+i/n*0.25,0.75+i/n*0.25));if(e<=0)continue;const sw=W/n,d=i%2?1:-1;S.card({item:nx,uv:[lerp(uv[0],uv[2],i/n),uv[1],lerp(uv[0],uv[2],(i+1)/n),uv[3]],x:-W/2+sw*(i+0.5),y:(1-e)*H*d,w:sw*1.004,h:H,radius:0,order:1,noShadow:true});}});
anim('split-reveal','Dvojice panelů přijíždí z protilehlých stran.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,pairs=Math.max(1,Math.floor(N/2)),k=Math.floor(u*pairs),f=u*pairs-k,ein=E(seg(f,0,0.35)),eout=E(seg(f,0.75,1)),g=p.gap/100*W,lw=(W-g)*p.splitRatio/100,rw=W-g-lw;
  S.card({item:S.I(k*2),x:-W/2+lw/2-(1-ein)*lw-eout*0,y:eout*H*0,w:lw,h:H,opacity:1-eout,noShadow:true});S.card({item:S.I(k*2+1),x:W/2-rw/2+(1-ein)*rw,y:0,w:rw,h:H,opacity:1-eout,noShadow:true});});
anim('mosaic-wipe','Obrázky se skládají clonou z dlaždic nebo žaluziemi.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,k=Math.floor(u*N),f=u*N-k,e=seg(f,0.45,1);full(S,{item:S.I(k),order:0});if(e>0)wipeTiles(S,p,S.I(k+1),0,0,W,H,e,k);});

// ---------- Stack & Scatter ----------
anim('stack-slide','Karty vyjíždějí jedna přes druhou s pružným dosednutím.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,a0=p.cardAspect==='frame'?W/H:asp(S,p,S.I(0)),ins=p.inset/100,ch=H*(1-ins*2)*0.9,cw=Math.min(ch*a0,W*(1-ins*2)),chh=cw/a0,k=Math.floor(u*N),f=u*N-k,e=EASE.ob(seg(f,0.5,0.95));
  for(let s=-2;s<=0;s++){const d=-s-(s===0?0:e);S.card({item:S.I(k+s),x:0,y:-d*chh*0.04,w:cw,h:chh,s:Math.pow(p.depthScale,d),fade:d*0.15,order:s});}if(e>0)S.card({item:S.I(k+1),x:0,y:(1-e)*H,w:cw,h:chh,order:5});});
anim('cascade-drop','Karty se skutálejí do volné hromádky a pak je to smete pryč.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,a0=p.cardAspect==='frame'?W/H:asp(S,p,S.I(0)),ch=p.cardSize/100*H*0.8,cw=Math.min(ch*a0,W*0.8),chh=cw/a0,sweep=EASE.i(seg(u,0.82,0.97));
  for(let i=0;i<N;i++){const e=EASE.o(seg(u,i*0.16,i*0.16+0.16)),rot=(hsh(i,1)-0.5)*p.rotation/100*0.5;if(e<=0)continue;S.card({item:S.I(i),x:(hsh(i,2)-0.5)*W*0.05+sweep*W*1.3,y:lerp(-H*1.1,(hsh(i,3)-0.5)*H*0.04,e),rz:rot+(1-e)*p.rotation/100*2.5*(i%2?1:-1)+sweep*0.4,w:cw,h:chh,order:i,shadow:0.3});}});
anim('cascade-deck','Karty vyjedou z hromádky do šikmého balíčku, diagonála se překlopí a pak se zase složí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,[cw,ch]=wh(S,p,S.I(0),p.cardSize*0.38),ov=1-p.overlap/100,out=p.motion==='together'?E(seg(u,0.05,0.3)):1,flip=E(seg(u,0.4,0.6)),back=E(seg(u,0.78,0.98));
  for(let i=0;i<N;i++){const t=i-(N-1)/2,st=p.motion==='staggered'?E(seg(u,0.05+i/N*0.2,0.2+i/N*0.2)):out,bk=p.motion==='staggered'?E(seg(u,0.78+(N-1-i)/N*0.12,0.88+(N-1-i)/N*0.12)):back,dx=t*cw*ov,dy=t*ch*ov*0.6*lerp(1,-1,flip),e=st*(1-bk);S.card({item:S.I(i),x:dx*e,y:dy*e,w:cw,h:ch,order:i*(flip>0.5?-1:1),shadow:0.3});}});
anim('image-trail','Stopa karet naskakuje podél obloukové dráhy a pak se rozplývá.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,M=p.trailLength*2,path=t=>[Math.sin(t*TAU)*W*0.36,Math.sin(t*TAU*2)*H*0.25];
  for(let j=0;j<M;j++){const birth=j/M,age=fract(u-birth),life=p.trailLength/M;if(age>life)continue;const a=age/life,[x,y]=path(birth),pop=EASE.ob(cl(a/0.12)),melt=EASE.i(cl((a-0.6)/0.4)),it=S.I(j),[w,h]=wh(S,p,it,p.cardSize);S.card({item:it,x,y:y+melt*h*0.2,w,h,s:pop*(1-melt*0.5)*(p.popFrom>0?lerp(1-p.popFrom/100,1,cl(a/0.12)):1),opacity:1-melt,order:-age});}});
anim('poster-burst','Obrázky vybuchují ze středu a rostou, až zakryjí předchozí.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,a0=p.cardAspect==='frame'?W/H:asp(S,p,S.I(0)),cw=Math.max(W,H*a0)*1.05,ch=cw/a0;
  let starts;if(p.flow==='staggered')starts=i=>i/N*(1-p.overlap/100*0.5);else if(p.flow==='volley')starts=i=>Math.floor(i/p.groupSize)*p.groupSize/N+(i%p.groupSize)*0.02;else starts=i=>i/N;const dur=p.flow==='sequential'?1/N*(1-p.hold/100*0.8):1/N*1.3;
  S.card({item:S.I(N-1),x:0,y:0,w:cw,h:ch,radius:0,order:-1,noShadow:true});for(let i=0;i<N;i++){const e=EASE.o(seg(u,starts(i),starts(i)+dur));if(e<=0)continue;S.card({item:S.I(i),x:0,y:0,w:cw,h:ch,s:Math.max(0.01,e),order:i,radius:lerp(40,0,e)});}});
anim('card-toss','Karty vyletí zespodu, chvíli visí ve vzduchu a zase spadnou.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,ht=p.throwHeight/100*H*1.2;
  for(let i=0;i<N;i++){const st=p.flow==='one'?0:i/N*0.5,t=seg(u,st,st+0.5),y=H/2+H*0.35-ht*4*t*(1-t)*(1+0*(hsh(i,1)-0.5)),it=S.I(i),[w,h]=wh(S,p,it,p.cardSize*(1+(hsh(i,2)-0.5)*p.sizeVar/50));if(t<=0||t>=1)continue;
    S.card({item:it,x:(hsh(i,3)-0.5)*p.spread/100*W*0.85,y,rz:(hsh(i,4)-0.5)*p.spin*D2R*2+(t-0.5)*p.spin*D2R,w,h,order:i,shadow:0.3});}});
anim('position-dance','Karty plynule kolují mezi třemi pozicemi a velikostmi.',(S,p,u,E)=>{const {W,H}=S,N=S.slots,[cw,ch]=wh(S,p,S.I(0),p.cardSize*1.45),sx=cw*(1.0+p.spacing/100),P=[[-sx,0,0.62,0.35],[0,0,1,0],[sx,0,0.62,0.35],[0,-ch*0.12,0.45,0.7]],k=stepPos(u,4,E,0.4);
  for(let i=0;i<4;i++){const pos=(i+k)%4,a=Math.floor(pos),f=pos-a,A=P[a],B=P[(a+1)%4];S.card({item:S.I(i+Math.floor((i+k)/4)*4),x:lerp(A[0],B[0],f),y:lerp(A[1],B[1],f),w:cw,h:ch,s:lerp(A[2],B[2],f),fade:lerp(A[3],B[3],f),order:lerp(A[2],B[2],f)});}});

// ---------- registration ----------
const AEXCL=new Set(['background','backgroundType','backgroundGradient','backgroundGradientCustom','backgroundImage']);
function aParam(s){const label=CZ_LBL[s.l]||s.l,vis=s.v||null,group=s.g?(CZ_GROUP[s.g]||s.g):null;
  if(s.t==='number'){const st=s.st||+(((s.mx-s.mn)/100).toPrecision(2));return{type:'range',key:s.id,label,min:s.mn,max:s.mx,step:st,def:s.d,unit:s.u==='%'?' %':s.u==='°'?'°':'',vis,group};}
  if(s.t==='select')return{type:'select',key:s.id,label,options:s.o.map(([v,l])=>[v,CZ_OPT[l]||l]),def:s.d,vis,group};
  if(s.t==='toggle')return{type:'check',key:s.id,label,def:!!s.d,vis,group};
  if(s.t==='color')return{type:'color',key:s.id,label,def:String(s.d).slice(0,7),vis,group};
  return{type:'text',key:s.id,label,def:s.d==null?'':String(s.d),vis,group};}
for(const a of ANIMOS){const im=AIMPL[a.id];if(!im)continue;
  const params=[{type:'range',key:'duration',label:'Délka smyčky',min:2,max:60,step:0.5,def:a.dur,unit:' s'}];
  if(a.smin!=null&&a.smax>a.smin)params.push({type:'range',key:'slots',label:'Počet karet',min:a.smin,max:a.smax,step:a.sst||1,def:a.slots,unit:''});
  for(const s of a.set)if(!AEXCL.has(s.id))params.push(aParam(s));
  TPL.push({id:'a-'+a.id,name:a.name,kind:'loop',cat:a.cat,desc:im.d,params,dur:(n,p)=>p.duration,
    build(S){const p=S.p,u=fract(S.t/p.duration),fs=1-2*(p.padding||0)/100;S.slots=p.slots||a.slots;S.group=M4.chain(M4.T((p.offsetX||0)*S.W/100,(p.offsetY||0)*S.H/100,0),M4.S(fs,fs,fs));
      S.style={radius:p.cornerRadius!=null?p.cornerRadius*1.6:null,shadow:p.shadowEnabled?{x:p.shadowX,y:p.shadowY,blur:p.shadowBlur,spread:p.shadowSpread,op:p.shadowOpacity,color:p.shadowColor}:null};
      im.b(S,p,u,easeOf(p));S.text(x=>drawChrome(x,S,null));}});}
