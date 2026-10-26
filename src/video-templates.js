// ================= Video: templates =================
// Coordinates: px from frame centre, x right, y down, z towards the viewer. Sizes scale with S.u (1 at 1080 px short side).
const TPL=[];
function tpl(o){o.params=o.params.map(normP);TPL.push(o);}
const lerp2=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const cl=(v,a=0,b=1)=>v<a?a:v>b?b:v;
const pFit=['mediaFit','Ořez prací',[['crop','Oříznout do rámečku'],['contain','Celé dílo']],'crop'];

// ---------- Showreels: one piece after another ----------
tpl({id:'lupa',name:'Lupa',kind:'reel',desc:'Kapka tekutého skla putuje po ditherovaném kontaktním archu. Práce, na které se zastaví, se ukáže v plných barvách.',
  params:[['holdDuration','Zastavení na práci',0.2,3,0.05,0.9,'s'],['moveDuration','Přesun lupy',0.2,2,0.05,0.7,'s'],['ditherSize','Velikost ditheru',1,12,1,4],['lensSize','Velikost lupy',0.1,0.5,0.01,0.26],['refraction','Lom',0,1,0.01,0.6],['dispersion','Rozklad barev',0,1,0.01,0.5],['depthFade','Ztmavení ostatních',0,0.9,0.01,0.45],['ending','Závěr',[['absorb','Lupa pohltí poslední práci'],['none','Bez závěru']],'absorb']],
  dur:(n,p)=>0.6+n*(p.moveDuration+p.holdDuration)+(p.ending==='absorb'?1.6:0.3),
  build(S){const {W,H,u,t,items,p}=S,n=items.length,G=grid(n,W,H,W*0.07,W*0.012),seg=p.moveDuration+p.holdDuration,R0=p.lensSize*Math.min(W,H)*0.5,q=seq(t,0.6,seg,n);
    const start=[-W/2-R0*1.3,G.pos(0)[1]];let pos,R=R0,focus=-1,absorb=0,intro=cl(t/0.6);
    if(q.i<0)pos=start;else if(q.end){const te=t-0.6-n*seg;absorb=p.ending==='absorb'?EASE.io(cl(te/1.3)):0;pos=lerp2(G.pos(n-1),[0,0],absorb);R=lerp(R0,Math.hypot(W,H)*0.6,absorb);focus=n-1;}
    else{const e=EASE.io(cl(q.f/p.moveDuration));pos=lerp2(q.i===0?start:G.pos(q.i-1),G.pos(q.i),e);if(q.f>=p.moveDuration*0.65)focus=q.i;}
    for(let k=0;k<n;k++){const [x,y]=G.pos(k),last=k===n-1&&absorb>0;S.card({item:items[k],x:last?lerp(x,0,absorb):x,y:last?lerp(y,0,absorb):y,w:last?lerp(G.w,W,absorb):G.w,h:last?lerp(G.h,H,absorb):G.h,radius:last?lerp(S.c.radius,0,absorb):undefined,z:last?1:0,dither:p.ditherSize*u,fade:k===focus?0:p.depthFade*(1-absorb),opacity:intro*(last?1:1-absorb)});}
    S.lens={x:pos[0],y:pos[1],r:R,refr:p.refraction*(1-absorb),disp:p.dispersion*(1-absorb)};
    S.text(x=>{drawChrome(x,S,focus>=0?focus:null);if(focus>=0)drawLabel(x,S,items[focus],q.end?1-absorb*0.3:cl((q.f-p.moveDuration*0.65)/0.25));});}});

tpl({id:'kurzor',name:'Kurzor',kind:'reel',desc:'Kurzor přejíždí po mřížce prací. Práce pod ním se zvedne, ostatní ustoupí a poslední se otevře přes celé video.',
  params:[['headingText','Nadpis','Vybrané práce'],['holdDuration','Zastavení',0.2,3,0.05,0.7,'s'],['moveDuration','Přesun kurzoru',0.2,2,0.05,0.5,'s'],['openDuration','Otevření poslední práce',0.3,3,0.05,1,'s'],['showTrail','Stopa kurzoru',true],['showCursor','Zobrazit kurzor',true]],
  dur:(n,p)=>0.6+n*(p.moveDuration+p.holdDuration)+p.openDuration+0.6,
  build(S){const {W,H,u,t,items,p}=S,n=items.length,G=grid(n,W,H*0.86,W*0.08,W*0.016),oy=H*0.06,seg=p.moveDuration+p.holdDuration;
    const C=k=>{const a=G.pos(k);return[a[0],a[1]+oy];},start=[W*0.6,H*0.6];
    const cur=tt=>{const q=seq(tt,0.6,seg,n);if(q.i<0)return start;if(q.end)return C(n-1);return lerp2(q.i===0?start:C(q.i-1),C(q.i),EASE.io(cl(q.f/p.moveDuration)));};
    const pos=cur(t),q=seq(t,0.6,seg,n),te=q.end?t-0.6-n*seg:0,open=q.end?EASE.io(cl(te/p.openDuration)):0;let maxw=0;const ws=[];
    for(let k=0;k<n;k++){const c=C(k),d=Math.hypot(pos[0]-c[0],pos[1]-c[1]);const w=cl(1-d/(G.w*0.55));ws.push(w*w*(3-2*w));maxw=Math.max(maxw,ws[k]);}
    for(let k=0;k<n;k++){const [x,y]=C(k),w=ws[k],last=k===n-1;
      if(last&&open>0){S.card({item:items[k],x:lerp(x,0,open),y:lerp(y,0,open),w:lerp(G.w*1.12,W,open),h:lerp(G.h*1.12,H,open),z:60*u,radius:lerp(S.c.radius,0,open),shadow:0.35*(1-open)});continue;}
      S.card({item:items[k],x,y,w:G.w,h:G.h,s:1+0.12*w-0.05*(maxw-w),z:w*40*u,shadow:0.4*w,fade:0.38*(maxw-w),opacity:cl(t/0.6)*(1-open)});}
    S.text(x=>{drawChrome(x,S,q.i>=0&&!q.end?q.i:q.end?n-1:null);x.globalAlpha=1-open;x.fillStyle=S.c.textColor;x.font=`600 ${Math.round(58*u)}px ${fontOf(S)}`;x.textBaseline='top';x.fillText(p.headingText,60*u,100*u);x.globalAlpha=1;
      const hov=ws.indexOf(maxw);if(maxw>0.6&&!q.end)drawLabel(x,S,items[hov],(maxw-0.6)/0.4*(1-open));if(q.end)drawLabel(x,S,items[n-1],open);
      if(p.showCursor&&open<1){const tr=p.showTrail?10:0;for(let j=tr;j>=0;j--){const c=cur(t-j*0.035),X=W/2+c[0],Y=H/2+c[1];if(j>0){x.globalAlpha=(1-j/tr)*0.35*(1-open);x.fillStyle=S.c.textColor;x.beginPath();x.arc(X,Y,7*u*(1-j/tr*0.6),0,TAU);x.fill();continue;}
        x.globalAlpha=1-open;const s=1.5*u;x.beginPath();x.moveTo(X,Y);x.lineTo(X,Y+26*s);x.lineTo(X+7*s,Y+19*s);x.lineTo(X+12*s,Y+30*s);x.lineTo(X+16*s,Y+28*s);x.lineTo(X+11*s,Y+17*s);x.lineTo(X+20*s,Y+17*s);x.closePath();x.fillStyle='#ffffff';x.fill();x.lineWidth=1.6*s;x.strokeStyle='#111';x.stroke();}}
      x.globalAlpha=1;});}});

tpl({id:'montaz',name:'Montáž',kind:'reel',desc:'Robotické rameno skládá obrazovku z panelů vašich prací, řádek po řádku. Hotová obrazovka chvíli drží a odletí.',
  params:[['rowCount','Počet řádků',1,5,1,3],['placeDuration','Rozestup panelů',0.15,1.5,0.05,0.45,'s'],['flyDuration','Let panelu',0.3,2,0.05,0.8,'s'],['holdDuration','Držení hotové obrazovky',0.3,4,0.1,1.4,'s'],['armColor','Barva ramene','#f0512e'],['shadowIntensity','Stíny',0,1,0.01,0.35],['gridOpacity','Viditelnost mřížky',0,1,0.01,0.2],['buildOrder','Pořadí',[['top-down','Shora dolů'],['random','Náhodně']],'top-down']],
  layout(n,p,W,H){const rows=p.rowCount,cols=Math.max(1,Math.round(rows*W/H*0.85)),K=rows*cols;return{rows,cols,K,screens:Math.max(1,Math.ceil(n/K))};},
  dur(n,p,W=1920,H=1080){const L=this.layout(n,p,W,H);return L.screens*(L.K*p.placeDuration+p.flyDuration+p.holdDuration+0.7);},
  build(S){const {W,H,u,t,items,p}=S,n=items.length,L=this.layout(n,p,W,H),mg=W*0.06,gap=W*0.012,cw=(W-2*mg-gap*(L.cols-1))/L.cols,ch=(H-2*mg-gap*(L.rows-1))/L.rows,sd=L.K*p.placeDuration+p.flyDuration+p.holdDuration+0.7;
    const s=Math.min(L.screens-1,Math.floor(t/sd)),ts=t-s*sd,exitT=L.K*p.placeDuration+p.flyDuration+p.holdDuration,ex=cl((ts-exitT)/0.6);
    const order=[...Array(L.K).keys()];if(p.buildOrder==='random')order.sort((a,b)=>hash2(a,s,7)-hash2(b,s,7));
    for(let r=0;r<=L.rows;r++)S.card({color:S.c.textColor,x:0,y:-H/2+mg-gap/2+r*(ch+gap),w:W,h:Math.max(1,1.2*u),opacity:p.gridOpacity*0.6,radius:0,layer:-1});
    for(let c=0;c<=L.cols;c++)S.card({color:S.c.textColor,x:-W/2+mg-gap/2+c*(cw+gap),y:0,w:Math.max(1,1.2*u),h:H,opacity:p.gridOpacity*0.6,radius:0,layer:-1});
    let active=null;
    for(let j=0;j<L.K;j++){const st=order.indexOf(j)*p.placeDuration,e=cl((ts-st)/p.flyDuration);if(e<=0)continue;const r=Math.floor(j/L.cols),c=j%L.cols,tx=-W/2+mg+cw/2+c*(cw+gap),ty=-H/2+mg+ch/2+r*(ch+gap),fx=tx+(hash2(j,s,3)-0.5)*W*0.4,fy=-H*0.85;
      const ee=EASE.ob(e),x=lerp(fx,tx,EASE.o(e)),y=lerp(fy,ty,ee),rot=(1-EASE.o(e))*(hash2(j,s,5)-0.5)*0.7,exy=-EASE.i(cl(ex*1.4-r*0.15))*H*1.3;
      S.card({item:S.I(s*L.K+j),x,y:y+exy,w:cw,h:ch,rz:rot,s:1+0.08*(1-e),z:(1-e)*80*u,shadow:p.shadowIntensity*(0.5+(1-e)),fit:p.mediaFit});if(e<1)active=[x,y-ch/2];}
    S.text(x=>{drawChrome(x,S,null);if(!active)return;const sx=W/2+active[0]*0.35,sy=-20*u,hx=W/2+active[0],hy=H/2+active[1],Lseg=H*0.48,dx=hx-sx,dy=hy-sy,d=Math.min(Math.hypot(dx,dy),Lseg*1.98),a=Math.atan2(dy,dx),hh=Math.sqrt(Math.max(0,Lseg*Lseg-d*d/4)),mx=sx+Math.cos(a)*d/2,my=sy+Math.sin(a)*d/2,ex2=mx+Math.cos(a-Math.PI/2)*hh,ey2=my+Math.sin(a-Math.PI/2)*hh;
      x.lineCap='round';x.strokeStyle=p.armColor;x.lineWidth=22*u;x.beginPath();x.moveTo(sx,sy);x.lineTo(ex2,ey2);x.lineTo(hx,hy);x.stroke();x.fillStyle='#1b1b1e';for(const [px,py,r] of [[ex2,ey2,13],[hx,hy,10]]){x.beginPath();x.arc(px,py,r*u,0,TAU);x.fill();}
      x.fillStyle=p.armColor;x.fillRect(hx-22*u,hy-6*u,44*u,8*u);});}});

tpl({id:'balicek',name:'Balíček',kind:'reel',desc:'Karty s pracemi padají shora a skládají se do volně pootočené hromádky.',
  params:[['transitionDuration','Pád karty',0.15,1.5,0.01,0.45,'s'],['holdDuration','Zastavení',0.1,3,0.05,0.6,'s'],['transitionStyle','Pohyb',[['drop','Pád shora'],['slide','Příjezd zboku']],'drop'],['backRotation','Natočení karet',0,15,0.5,5,'deg'],['stackDepth','Viditelná hloubka',1,10,1,4],['scaleIntensity','Velikost karet',0.3,1,0.01,0.62],['shadowIntensity','Stíny',0,1,0.01,0.3],pFit],
  dur:(n,p)=>n*(p.transitionDuration+p.holdDuration)+0.5,
  build(S){const {W,H,u,t,items,p}=S,n=items.length,seg=p.transitionDuration+p.holdDuration,q=seq(t,0,seg,n),cur=Math.min(n-1,q.i),bw=Math.min(W,H*1.5)*p.scaleIntensity,bh=bw*0.68;
    for(let k=Math.max(0,cur-p.stackDepth);k<=cur;k++){const e=k<cur||q.end?1:cl(q.f/p.transitionDuration),rz=(hash2(k,1,9)-0.5)*2*p.backRotation*D2R,ox=(hash2(k,2,9)-0.5)*W*0.03,oy=(hash2(k,3,9)-0.5)*H*0.03,drop=p.transitionStyle==='drop';
      const ee=EASE.o(e);S.card({item:items[k],x:drop?ox:lerp(W*0.9,ox,ee),y:drop?lerp(-H*1.1,oy,ee):oy,w:bw,h:bh,rz:rz+(1-ee)*(drop?0.35:-0.25),s:lerp(1.12,1,ee),order:k,shadow:p.shadowIntensity*(1+(1-e)),fade:Math.min(0.5,(cur-k)*0.07),fit:p.mediaFit});}
    S.text(x=>{drawChrome(x,S,cur);drawLabel(x,S,items[cur],q.end?1:cl((q.f-p.transitionDuration*0.6)/0.25));});}});

tpl({id:'kometa',name:'Kometa',kind:'reel',desc:'Každá práce přiletí po oblouku, chvíli ostře drží uprostřed a odletí nahoru. Za nimi je velký nápis.',
  params:[['transitionDuration','Přílet a odlet',0.2,1.5,0.01,0.55,'s'],['holdDuration','Zastavení',0,2,0.05,0.35,'s'],['arcRadius','Poloměr oblouku',10,100,1,40],['arcSide','Strana příletu',[['left','Zleva'],['right','Zprava']],'left'],['rotationIntensity','Natočení v letu',0,30,1,10,'deg'],['motionBlurAmount','Rozmazání pohybem',0,1,0.01,0.5],['scaleIntensity','Velikost',0.2,1,0.01,0.55],['text','Text v pozadí','Portfolio'],['textOpacity','Viditelnost textu',0,1,0.01,0.14],pFit],
  dur:(n,p)=>n*(p.transitionDuration*2+p.holdDuration)+0.3,
  build(S){const {W,H,u,t,items,p}=S,n=items.length,T=p.transitionDuration,seg=T*2+p.holdDuration,sd=p.arcSide==='left'?-1:1,bw=Math.min(W,H*1.5)*p.scaleIntensity,bh=bw*0.68,R=p.arcRadius/100*W;
    const at=(k,tt)=>{const f=tt-k*seg;if(f<0||f>seg)return null;if(f<T){const e=EASE.o(f/T),a=(1-e)*1.1;return{x:sd*(R-R*Math.cos(a))+sd*(1-e)*W*0.25,y:R*Math.sin(a)*0.8,rz:sd*(1-e)*p.rotationIntensity*D2R*-1,a:1,v:1-e};}if(f<T+p.holdDuration)return{x:0,y:0,rz:0,a:1,v:0};const e=EASE.i((f-T-p.holdDuration)/T);return{x:0,y:-e*H*1.1,rz:-sd*e*p.rotationIntensity*D2R*0.5,a:1,v:e};};
    S.bgDraw(x=>{x.globalAlpha=p.textOpacity;x.fillStyle=S.c.textColor;x.textAlign='center';x.textBaseline='middle';let fs=Math.round(H*0.42);x.font=`700 ${fs}px ${fontOf(S)}`;const w=x.measureText(p.text).width;if(w>W*0.95){fs=Math.floor(fs*W*0.95/w);x.font=`700 ${fs}px ${fontOf(S)}`;}x.fillText(p.text,W/2,H/2);});
    let cur=null;for(let k=0;k<n;k++){const a=at(k,t);if(!a)continue;cur=k;const ghosts=Math.round(p.motionBlurAmount*5*a.v);
      for(let g=ghosts;g>=1;g--){const b=at(k,t-g*0.018);if(b)S.card({item:items[k],x:b.x,y:b.y,rz:b.rz,w:bw,h:bh,opacity:0.18*(1-g/(ghosts+1)),order:-g,fit:p.mediaFit});}
      S.card({item:items[k],x:a.x,y:a.y,rz:a.rz,w:bw,h:bh,order:1,shadow:0.25,fit:p.mediaFit});}
    const ci=Math.min(n-1,Math.floor(t/seg)),f=t-ci*seg;S.text(x=>{drawChrome(x,S,ci);drawLabel(x,S,items[ci],cl((f-T*0.7)/0.2)*cl((T+p.holdDuration+0.15-f)/0.2));});}});

tpl({id:'odhaleni',name:'Odhalení',kind:'reel',desc:'Obdélníková nebo kruhová maska se otevírá a obraz se přitom zvětšuje přes celý záběr.',
  params:[['transitionDuration','Přechod',0.2,2,0.05,0.7,'s'],['holdDuration','Zastavení',0,3,0.05,0.7,'s'],['startScale','Počáteční velikost',0.4,1,0.01,0.8],['maskShape','Tvar masky',[['rect','Obdélník'],['circle','Kruh']],'rect'],['scaleIntensity','Velikost obrazu',0.4,1,0.01,1]],
  dur:(n,p)=>n*(p.transitionDuration+p.holdDuration)+0.2,
  build(S){const {W,H,t,items,p}=S,n=items.length,seg=p.transitionDuration+p.holdDuration,q=seq(t,0,seg,n),i=Math.min(n-1,q.i),e=q.end?1:EASE.io(cl(q.f/p.transitionDuration)),bw=W*p.scaleIntensity,bh=H*p.scaleIntensity,rr=p.scaleIntensity>=1?0:undefined;
    if(i>0)S.card({item:items[i-1],x:0,y:0,w:bw,h:bh,radius:rr,order:0});
    S.card({item:items[i],x:0,y:0,w:bw,h:bh,s:lerp(p.startScale,1,e),mask:[p.maskShape==='circle'?2:1,p.maskShape==='circle'?e*1.02:e],radius:rr,order:1});
    S.text(x=>{drawChrome(x,S,i);drawLabel(x,S,items[i],cl((e-0.6)/0.4));});}});

tpl({id:'vytah',name:'Výtah',kind:'reel',desc:'Uprostřed stojí hlavní obraz a každá další práce vyjede zespodu přes něj.',
  params:[['transitionDuration','Výjezd',0.2,2,0.05,0.8,'s'],['holdDuration','Zastavení',0,3,0.05,0.6,'s'],['scaleIntensity','Velikost',0.4,1,0.01,0.82],['pushBack','Ustoupení předchozí',0,0.3,0.01,0.08],pFit],
  dur:(n,p)=>n*(p.transitionDuration+p.holdDuration)+0.2,
  build(S){const {W,H,t,items,p}=S,n=items.length,seg=p.transitionDuration+p.holdDuration,q=seq(t,0,seg,n),i=Math.min(n-1,q.i),e=q.end?1:EASE.io(cl(q.f/p.transitionDuration)),bw=W*p.scaleIntensity,bh=H*p.scaleIntensity;
    if(i>0)S.card({item:items[i-1],x:0,y:-e*H*0.04,w:bw,h:bh,s:1-p.pushBack*e,fade:0.55*e,order:0,fit:p.mediaFit});
    S.card({item:items[i],x:0,y:lerp(H*1.05,0,e),w:bw,h:bh,order:1,shadow:0.4,fit:p.mediaFit});
    S.text(x=>{drawChrome(x,S,i);drawLabel(x,S,items[i],cl((e-0.7)/0.3));});}});

tpl({id:'karty',name:'Balíček karet',kind:'reel',desc:'Balíček karet, ve kterém se přední karta protlačí dopředu k divákovi a odhalí další.',
  params:[['holdDuration','Zastavení',0.2,3,0.05,1,'s'],['transitionDuration','Průchod karty',0.2,1.5,0.05,0.6,'s'],['stackDepth','Karet v balíčku',2,6,1,4],['scaleIntensity','Velikost',0.3,0.9,0.01,0.62],pFit],
  dur:(n,p)=>n*(p.transitionDuration+p.holdDuration),
  build(S){const {W,H,u,t,items,p}=S,n=items.length,seg=p.transitionDuration+p.holdDuration,i=Math.floor(t/seg),f=t-i*seg,e=EASE.io(cl((f-p.holdDuration)/p.transitionDuration)),bw=Math.min(W,H*1.5)*p.scaleIntensity,bh=bw*0.68;
    for(let s=p.stackDepth;s>=0;s--){const eff=s-e,item=S.I(i+s);if(s===0){S.card({item,x:0,y:0,w:bw,h:bh,z:e*H*0.5,s:1+0.1*e,opacity:1-e,shadow:0.3*(1-e),fit:p.mediaFit});continue;}
      S.card({item,x:0,y:-eff*bh*0.075,w:bw,h:bh,z:-eff*30*u,s:1-eff*0.07,fade:Math.min(0.6,eff*0.14),opacity:cl(p.stackDepth+0.999-eff),shadow:0.2,fit:p.mediaFit});}
    S.text(x=>{drawChrome(x,S,i%n);drawLabel(x,S,S.I(i+(e>0.5?1:0)),Math.abs(e-0.5)*2);});}});

tpl({id:'posun',name:'Posun',kind:'reel',desc:'Práce v řadě vyjíždějí z jedné strany, zastaví se uprostřed a odjedou na druhou.',
  params:[['slideDirection','Směr',[['ltr','Zleva doprava'],['rtl','Zprava doleva']],'rtl'],['transitionSpeed','Přejezd',0.2,2,0.05,0.8,'s'],['holdDuration','Zastavení',0.1,3,0.05,1,'s'],['scaleIntensity','Velikost',0.3,0.9,0.01,0.6],['gap','Mezera',0,400,5,150],['scaleOnScroll','Zmenšit sousední',true],pFit],
  dur:(n,p)=>n*(p.transitionSpeed+p.holdDuration),
  build(S){const {W,H,u,t,items,p}=S,n=items.length,seg=p.transitionSpeed+p.holdDuration,i=Math.floor(t/seg),f=t-i*seg,c=i+EASE.io(cl((f-p.holdDuration)/p.transitionSpeed)),bw=W*p.scaleIntensity,bh=Math.min(bw*0.66,H*0.75),sp=bw+p.gap*u,dir=p.slideDirection==='rtl'?1:-1;
    for(let k=Math.floor(c)-3;k<=Math.floor(c)+3;k++){const d=k-c,ad=Math.min(1,Math.abs(d));S.card({item:S.I(k),x:d*sp*dir,y:0,w:bw,h:bh,s:p.scaleOnScroll?1-0.16*ad:1,fade:0.35*ad,fit:p.mediaFit});}
    const ci=Math.round(c);S.text(x=>{drawChrome(x,S,((ci%n)+n)%n);drawLabel(x,S,S.I(ci),1-Math.min(1,Math.abs(c-ci)*3));});}});

tpl({id:'preklopeni',name:'Překlopení',kind:'reel',desc:'Každý obraz se překlopí dolů jako stránka nebo letištní tabule a odhalí další.',
  params:[['transitionSpeed','Překlopení',0.3,2,0.05,0.9,'s'],['holdDuration','Zastavení',0.1,3,0.05,1,'s'],['scaleIntensity','Velikost',0.4,1.2,0.01,0.85]],
  dur:(n,p)=>n*(p.transitionSpeed+p.holdDuration),
  build(S){const {W,H,u,t,items,p}=S,n=items.length,seg=p.transitionSpeed+p.holdDuration,i=Math.floor(t/seg),f=t-i*seg,e=cl((f-p.holdDuration)/p.transitionSpeed),bw=Math.min(W*0.62,H*0.8*1.5)*p.scaleIntensity,bh=bw*0.66,hh=bh/2;S.persp=2.2;
    const cur=S.I(i),nxt=S.I(i+1),uc=fitUV(cur,bw,bh,'crop').uv,un=fitUV(nxt,bw,bh,'crop').uv,half=(uv,top)=>{const m=(uv[1]+uv[3])/2;return top?[uv[0],uv[1],uv[2],m]:[uv[0],m,uv[2],uv[3]];};
    S.card({item:nxt,uv:half(un,true),x:0,y:-hh/2,w:bw,h:hh,order:0});S.card({item:cur,uv:half(uc,false),x:0,y:hh/2,w:bw,h:hh,order:0});
    if(e<0.5){const a=EASE.i(e*2)*Math.PI/2;S.card({item:cur,uv:half(uc,true),m:M4.chain(M4.RX(-a),M4.T(0,-hh/2,0)),w:bw,h:hh,fade:Math.sin(a)*0.5,fadeColor:'#000000',order:2});}
    else{const b=(1-EASE.o((e-0.5)*2))*Math.PI/2;S.card({item:nxt,uv:half(un,false),m:M4.chain(M4.RX(b),M4.T(0,hh/2,0)),w:bw,h:hh,fade:Math.sin(b)*0.5,fadeColor:'#000000',order:2});}
    S.card({color:'#000000',x:0,y:0,w:bw,h:Math.max(1,2*u),opacity:0.5,radius:0,order:3});
    S.text(x=>{drawChrome(x,S,(e>0.5?i+1:i)%n);drawLabel(x,S,e>0.5?nxt:cur,Math.abs(e-0.5)*2);});}});

tpl({id:'rozevreni',name:'Rozevření',kind:'reel',desc:'Každý obraz se rozevře ze středové linky až do plné velikosti.',
  params:[['transitionDuration','Rozevření',0.2,2,0.05,0.7,'s'],['holdDuration','Zastavení',0,3,0.05,0.8,'s'],['direction','Linka',[['h','Vodorovná (otevírá se nahoru a dolů)'],['v','Svislá (otevírá se do stran)']],'h'],['scaleIntensity','Velikost',0.4,1,0.01,1]],
  dur:(n,p)=>n*(p.transitionDuration+p.holdDuration)+0.2,
  build(S){const {W,H,t,items,p}=S,n=items.length,seg=p.transitionDuration+p.holdDuration,q=seq(t,0,seg,n),i=Math.min(n-1,q.i),e=q.end?1:EASE.io(cl(q.f/p.transitionDuration)),bw=W*p.scaleIntensity,bh=H*p.scaleIntensity,rr=p.scaleIntensity>=1?0:undefined;
    if(i>0)S.card({item:items[i-1],x:0,y:0,w:bw,h:bh,radius:rr,fade:0.3*e,order:0});
    S.card({item:items[i],x:0,y:0,w:bw,h:bh,s:lerp(1.06,1,e),mask:[p.direction==='h'?3:4,e],radius:rr,order:1});
    S.text(x=>{drawChrome(x,S,i);drawLabel(x,S,items[i],cl((e-0.6)/0.4));});}});

tpl({id:'cvak',name:'Cvak',kind:'reel',desc:'Obrázky naskakují okamžitě s krátkým odskokem, bez pomalého prolínání. Rychlé a rytmické.',
  params:[['holdDuration','Délka záběru',0.15,2,0.05,0.5,'s'],['popScale','Síla odskoku',1,1.4,0.01,1.12],['flash','Záblesk při střihu',true],['scaleIntensity','Velikost',0.3,1,0.01,0.75],pFit],
  dur:(n,p)=>n*p.holdDuration,
  build(S){const {W,H,t,items,p}=S,n=items.length,i=Math.min(n-1,Math.floor(t/p.holdDuration)),f=t-i*p.holdDuration,e=cl(f/0.22),bw=W*p.scaleIntensity,bh=H*p.scaleIntensity;
    S.card({item:items[i],x:0,y:0,w:bw,h:bh,s:1+(p.popScale-1)*(1-EASE.o(e)),radius:p.scaleIntensity>=1?0:undefined,fit:p.mediaFit});
    S.text(x=>{if(p.flash&&f<0.09){x.fillStyle='#ffffff';x.globalAlpha=(1-f/0.09)*0.55;x.fillRect(0,0,W,H);x.globalAlpha=1;}drawChrome(x,S,i);drawLabel(x,S,items[i],1);});}});

tpl({id:'tani',name:'Tání',kind:'reel',desc:'Práce jedou po prstenci a jedna po druhé se roztékají jako tekutina.',
  params:[['headingText','Nadpis',"Práce '26"],['holdDuration','Natočení k další práci',0.3,3,0.05,0.9,'s'],['meltDuration','Roztečení',0.3,3,0.05,0.9,'s'],['tilt','Náklon prstence',0,40,1,12,'deg'],['scaleIntensity','Velikost karet',0.4,1.5,0.01,1]],
  dur:(n,p)=>Math.max(n,6)*(p.holdDuration+p.meltDuration)+1.2,
  build(S){const {W,H,u,t,items,p}=S,n=items.length,N=Math.max(n,6),seg=p.holdDuration+p.meltDuration,i=Math.floor(t/seg),f=t-i*seg,w=300*u*p.scaleIntensity,h=w*1.25,R=Math.max(N*(w+40*u)/TAU,W*0.28);S.persp=2.4;
    const rot=-(TAU/N)*(Math.min(i,N)+EASE.io(cl(f/p.holdDuration))-1),G=M4.chain(M4.T(0,H*0.05,-R*0.35),M4.RX(-p.tilt*D2R));
    for(let k=0;k<N;k++){const mt=(t-(k)*seg-seg-p.holdDuration)/p.meltDuration;if(mt>=1)continue;const a=k*TAU/N+rot,z=Math.cos(a);
      S.card({item:S.I(k),m:M4.chain(G,M4.T(R*Math.sin(a),0,R*Math.cos(a)),M4.RY(a)),w,h,warp:cl(mt),opacity:1-EASE.i(cl(mt)),fade:0.55*(1-(z+1)/2),flipX:z<0});}
    const fin=cl((t-N*seg)/0.8);S.text(x=>{drawChrome(x,S,null);x.fillStyle=S.c.textColor;x.textAlign='center';x.textBaseline='middle';x.globalAlpha=0.35+0.65*fin;x.font=`700 ${Math.round(lerp(64,150,EASE.io(fin))*u)}px ${fontOf(S)}`;x.fillText(p.headingText,W/2,lerp(H*0.14,H/2,EASE.io(fin)));x.globalAlpha=1;});}});

// ---------- Loops: continuous motion ----------
tpl({id:'prstenec',name:'Prstenec',kind:'loop',desc:'Práce obepínají nakloněný 3D prstenec, který se pomalu otáčí prostorem.',
  params:[['spinDuration','Délka otáčky',4,40,0.5,18,'s'],['tilt','Náklon',-60,60,1,18,'deg'],['roll','Natočení',-45,45,1,-17,'deg'],['perspective','Perspektiva',1,8,0.1,4],['gap','Mezera',0,120,1,20],['spinDirection','Směr',[['cw','Po směru hodin'],['ccw','Proti směru hodin']],'cw'],['depthFade','Ztmavení vzadu',0,1,0.01,0.5],['scaleIntensity','Velikost karet',0.4,2,0.01,1]],
  dur:(n,p)=>p.spinDuration,
  build(S){const {W,H,u,t,items,p}=S,n=items.length,N=Math.max(n,10),w=320*u*p.scaleIntensity,h=w*0.7,R=N*(w+p.gap*u)/TAU;S.persp=0.6+p.perspective*0.3;
    const rot=(p.spinDirection==='cw'?1:-1)*TAU*t/p.spinDuration,G=M4.chain(M4.T(0,0,-R*0.55),M4.RZ(p.roll*D2R),M4.RX(-p.tilt*D2R));
    for(let k=0;k<N;k++){const a=k*TAU/N+rot,z=Math.cos(a);S.card({item:S.I(k),m:M4.chain(G,M4.T(R*Math.sin(a),0,R*z),M4.RY(a)),w,h,fade:p.depthFade*(1-(z+1)/2),flipX:z<0});}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'rolodex',name:'Rolodex',kind:'loop',desc:'Práce plynule rolují svisle s jemným 3D naklopením. Videa se přehrávají ve středu.',
  params:[['scrollSpeed','Rychlost',0.1,1.5,0.01,0.5],['scrollDirection','Směr',[['up','Zdola nahoru'],['down','Shora dolů']],'up'],['gap','Mezera',0,120,1,35],['tiltAngle','Naklopení',0,70,1,35,'deg'],['scaleIntensity','Velikost',0.3,1,0.01,0.7],['mediaFit','Formát karet',[['contain','Původní poměr stran'],['crop','Jednotný rámeček']],'contain']],
  loopLen(n,p,H,u){const h=H*0.42*p.scaleIntensity,step=h+p.gap*u;let m=n;while(m*step<H*1.6)m+=n;return{h,step,m,L:m*step};},
  build(S){const {W,H,u,t,items,p}=S,n=items.length,{h,step,m,L}=this.loopLen(n,p,H,u),v=p.scrollSpeed*H*0.5,dur=L/v,off=(t%dur)*v*(p.scrollDirection==='up'?1:-1);S.persp=1.8;
    for(let k=0;k<m;k++){let y=((k*step-off)%L+L)%L;if(y>L/2)y-=L;if(Math.abs(y)>H*0.9)continue;const it=S.I(k),bw=p.mediaFit==='contain'?Math.min(W*0.8,h*it.w/it.h):h*1.5;
      S.card({item:it,x:0,y,z:-Math.abs(y)*0.25,rx:-(y/H)*p.tiltAngle*D2R*1.6,w:bw,h,fit:p.mediaFit,fade:cl(Math.abs(y)/(H*0.6))*0.55,s:1+0.06*(1-cl(Math.abs(y)/(h*0.6)))});}
    S.text(x=>drawChrome(x,S,null));},
  dur(n,p,W=1920,H=1080){const u=Math.min(W,H)/1080,{L}=this.loopLen(n,p,H,u);return L/(p.scrollSpeed*H*0.5);}});

tpl({id:'spirala',name:'Spirála',kind:'loop',desc:'Práce se točí po spirále dovnitř nebo ven a mizí v hloubce.',
  params:[['loopDuration','Délka smyčky',4,30,0.5,12,'s'],['turns','Počet závitů',1,6,0.1,3.5],['spacing','Hustota karet',1,10,0.5,4],['spread','Rozevření',2,12,0.1,7],['depthFalloff','Hloubka',0,5,0.1,2],['direction','Směr',[['inward','Dovnitř'],['outward','Ven']],'inward'],['scaleIntensity','Velikost karet',0.1,0.5,0.01,0.23],['fadeIn','Náběh na okraji',0,50,1,20,'%']],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,u,t,items,p}=S,N=Math.max(items.length,Math.round(p.turns*p.spacing*2.2)),R0=Math.max(W,H)*0.5*p.spread/7,w=H*p.scaleIntensity*1.1,h=w*0.72,dir=p.direction==='inward'?1:-1;S.persp=1.4;
    for(let k=0;k<N;k++){const s=fract(k/N+dir*t/p.loopDuration),th=s*p.turns*TAU,r=R0*Math.pow(1-s,1.1),fi=cl(s/(p.fadeIn/100+1e-3)),fo=cl((1-s)/0.08);
      S.card({item:S.I(k),x:r*Math.cos(th),y:r*Math.sin(th)*0.82,z:-s*p.depthFalloff*H*0.45,rz:th+Math.PI/2,w,h,opacity:fi*fo,fade:s*0.4,order:-s});}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'oko',name:'Oko',kind:'loop',desc:'Řady prací plují vodorovně po obloucích, které se k okrajům sbíhají do tvaru oka.',
  params:[['loopDuration','Délka smyčky',4,40,0.5,14,'s'],['rows','Počet řad',1,7,1,3],['spacing','Mezera',0,120,1,32],['arc','Zakřivení',0,100,1,63],['rowGap','Mezera mezi řadami',0,100,1,0],['direction','Směr',[['right','Doprava'],['left','Doleva']],'right'],['edgeFade','Zeslabení u okrajů',0,100,1,40,'%'],['scaleIntensity','Velikost karet',0.1,0.5,0.01,0.23]],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,u,t,items,p}=S,h=H*p.scaleIntensity,w=h*1.3,st=w+p.spacing*u,M=Math.ceil(W/st)+3,L=M*st,v=L/p.loopDuration,dir=p.direction==='right'?1:-1,rs=h+p.rowGap*u+h*0.12,a=p.arc/100*0.75;
    for(let r=0;r<p.rows;r++){const rr=r-(p.rows-1)/2;for(let k=0;k<M;k++){let x=((k*st+dir*v*t+(r%2)*st/2)%L+L)%L-L/2;const nx=x/(W/2),y=rr*rs*(1-a*nx*nx),slope=rr*rs*(-a*2*nx/(W/2)),ef=p.edgeFade>0?cl((1-Math.abs(nx))/(p.edgeFade/100)):1;
      S.card({item:S.I(r*M+k),x,y,rz:Math.atan(slope),w,h,s:1-0.25*a*nx*nx,opacity:ef});}}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'marquee',name:'Marquee',kind:'loop',desc:'Několik řad prací ubíhá střídavě doleva a doprava, celé mírně natočené.',
  params:[['loopDuration','Délka smyčky',4,40,0.5,16,'s'],['rows','Počet řad',1,6,1,3],['tilt','Natočení',-30,30,1,-8,'deg'],['gap','Mezera',0,80,1,24],['scaleIntensity','Velikost karet',0.1,0.6,0.01,0.3],['alternate','Střídat směr řad',true]],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,u,t,items,p}=S,h=H*p.scaleIntensity,w=h*1.4,st=w+p.gap*u,diag=Math.hypot(W,H),M=Math.ceil(diag/st)+3,L=M*st,v=L/p.loopDuration,rs=h+p.gap*u,G=M4.RZ(p.tilt*D2R);
    for(let r=0;r<p.rows;r++){const rr=r-(p.rows-1)/2,dir=p.alternate&&r%2?-1:1;for(let k=0;k<M;k++){const x=((k*st+dir*v*t)%L+L)%L-L/2;S.card({item:S.I(r*M+k+r*3),m:M4.mul(G,M4.T(x,rr*rs,0)),w,h});}}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'coverflow',name:'Cover Flow',kind:'loop',desc:'Klasický proud obalů: prostřední práce čelem, sousední natočené do stran, s odrazem pod sebou.',
  params:[['holdDuration','Zastavení',0.2,3,0.05,1.1,'s'],['transitionDuration','Přesun',0.2,2,0.05,0.6,'s'],['sideAngle','Natočení stran',20,85,1,62,'deg'],['spacing','Hustota stran',0.05,0.4,0.01,0.13],['reflection','Odraz',true],['scaleIntensity','Velikost',0.2,0.8,0.01,0.46]],
  dur:(n,p)=>n*(p.holdDuration+p.transitionDuration),
  build(S){const {W,H,u,t,items,p}=S,n=items.length,seg=p.holdDuration+p.transitionDuration,i=Math.floor(t/seg),f=t-i*seg,c=i+EASE.io(cl((f-p.holdDuration)/p.transitionDuration)),bw=H*p.scaleIntensity*1.15,bh=bw,yc=-H*0.04;S.persp=2;
    for(let k=Math.floor(c)-6;k<=Math.floor(c)+7;k++){const d=k-c,ad=Math.abs(d),sg=Math.sign(d),x=ad<1?d*bw*0.62:sg*(bw*0.62+(ad-1)*W*p.spacing),ry=-cl(d,-1,1)*p.sideAngle*D2R,z=-Math.min(1,ad)*bw*0.5,it=S.I(k);
      S.card({item:it,x,y:yc,z,ry,w:bw,h:bh,order:-ad,fade:Math.min(0.5,ad*0.08),radius:6});
      if(p.reflection)S.card({item:it,x,y:yc+bh+4*u,z,ry,w:bw,h:bh,flipY:true,opacity:0.16,order:-ad-0.5,fade:0.35,radius:6});}
    const ci=Math.round(c);S.text(x=>{drawChrome(x,S,((ci%n)+n)%n);drawLabel(x,S,S.I(ci),1-Math.min(1,Math.abs(c-ci)*3),{align:'center',y:H-50*u});});}});

tpl({id:'globus',name:'Glóbus',kind:'loop',desc:'Práce pokrývají otáčející se kouli. Zadní strana prosvítá ztlumeně.',
  params:[['loopDuration','Délka otáčky',6,40,0.5,20,'s'],['cardCount','Počet karet',12,90,1,42],['radius','Velikost koule',0.2,0.6,0.01,0.4],['scaleIntensity','Velikost karet',0.05,0.3,0.005,0.15],['tiltX','Náklon osy',-40,40,1,14,'deg'],['backFade','Ztlumení zadní strany',0,1,0.01,0.75]],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,t,p}=S,N=p.cardCount,R=Math.min(W,H)*p.radius,w=Math.min(W,H)*p.scaleIntensity,h=w*0.72,spin=TAU*t/p.loopDuration,G=M4.mul(M4.T(0,0,-R*0.3),M4.RX(-p.tiltX*D2R)),ga=Math.PI*(3-Math.sqrt(5));S.persp=1.9;
    for(let j=0;j<N;j++){const yv=1-2*(j+0.5)/N,rr=Math.sqrt(1-yv*yv),ph=j*ga+spin,dx=Math.cos(ph)*rr,dz=Math.sin(ph)*rr,dy=yv,yaw=Math.atan2(dx,dz),pitch=-Math.asin(dy);
      S.card({item:S.I(j),m:M4.chain(G,M4.T(dx*R,dy*R,dz*R),M4.RY(yaw),M4.RX(pitch)),w,h,fade:dz<0?p.backFade:0.15*(1-dz),flipX:dz<0});}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'tunel',name:'Tunel',kind:'loop',desc:'Práce pokrývají stěny tunelu a plynule letí proti divákovi.',
  params:[['loopDuration','Délka smyčky',3,30,0.5,10,'s'],['depthRows','Hloubka tunelu',4,16,1,9],['perRow','Karet na stěnu',1,4,1,2],['tunnelSize','Šířka tunelu',0.6,1.6,0.01,1],['endGlow','Světlo na konci',0,1,0.01,0.5]],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,u,t,p}=S,Wt=W*p.tunnelSize,Ht=H*p.tunnelSize,sp=Ht*0.62,L=p.depthRows*sp,D=H*0.9,off=(t/p.loopDuration)*L;S.persp=0.9;
    S.card({color:S.c.textColor,x:0,y:0,z:-L-sp,w:Wt*1.2,h:Ht*1.2,opacity:p.endGlow*0.5,soft:Ht*0.4,radius:0,order:-1e9});
    let idx=0;for(let j=0;j<p.depthRows;j++){const z=((j*sp+off)%L)-L+D*0.25,f=cl((z+L)/(L*0.35)),nearFade=cl((D*0.25-z)/(sp*0.9));
      const walls=[[-Wt/2,0,M4.RY(Math.PI/2),Ht,'y'],[Wt/2,0,M4.RY(-Math.PI/2),Ht,'y'],[0,-Ht/2,M4.RX(-Math.PI/2),Wt,'x'],[0,Ht/2,M4.RX(Math.PI/2),Wt,'x']];
      for(const [wx,wy,R,len,ax] of walls){const cw=len/p.perRow;for(let q=0;q<p.perRow;q++){const o=-len/2+cw*(q+0.5),x=ax==='x'?o:wx,y=ax==='y'?o:wy;
        S.card({item:S.I(idx++),m:M4.chain(M4.T(x,y,z),R),w:ax==='y'?sp*0.92:cw*0.92,h:ax==='y'?cw*0.92:sp*0.92,opacity:f*nearFade,fade:0.6*(1-f)});}}}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'film',name:'Filmový pás',kind:'loop',desc:'Práce běží v okénkách filmového pásu s perforací, celý pás je mírně natočený.',
  params:[['loopDuration','Délka smyčky',4,40,0.5,12,'s'],['tilt','Natočení',-30,30,1,-9,'deg'],['frameScale','Velikost okének',0.2,0.7,0.01,0.4],['stripColor','Barva pásu','#121214'],['holeColor','Barva perforace','#e9e5dc'],['direction','Směr',[['left','Doleva'],['right','Doprava']],'left']],
  dur:(n,p)=>p.loopDuration,
  build(S){const {W,H,u,t,p}=S,fh=H*p.frameScale,fw=fh*1.4,g=fh*0.08,st=fw+g,M=Math.ceil(Math.hypot(W,H)/st)+3,L=M*st,v=L/p.loopDuration,dir=p.direction==='left'?-1:1,G=M4.RZ(p.tilt*D2R),sh=fh*1.42;
    S.card({color:p.stripColor,m:G,w:L+st*2,h:sh,radius:0,order:-2});
    for(let k=0;k<M;k++){const x=((k*st+dir*v*t)%L+L)%L-L/2;S.card({item:S.I(k),m:M4.mul(G,M4.T(x,0,0)),w:fw,h:fh,radius:4,order:0});
      for(let hI=0;hI<4;hI++){const hx=x-st/2+(hI+0.5)*st/4;for(const yy of [-sh/2+fh*0.1,sh/2-fh*0.1])S.card({color:p.holeColor,m:M4.mul(G,M4.T(hx,yy,0)),w:st/4*0.5,h:fh*0.09,radius:3,order:1});}}
    S.text(x=>drawChrome(x,S,null));}});

tpl({id:'popgrid',name:'Pop mřížka',kind:'loop',desc:'Mřížka, ve které práce postupně naskakují a zase mizí po diagonále.',
  params:[['columns','Sloupců',2,8,1,4],['popDuration','Naskočení',0.15,1,0.01,0.45,'s'],['stagger','Zpoždění mezi kartami',0.02,0.3,0.01,0.08,'s'],['holdDuration','Držení mřížky',0.3,4,0.1,1.6,'s'],['gap','Mezera',0,60,1,16]],
  layout(n,p,W,H){const cols=p.columns,rows=Math.max(1,Math.round(cols*H/W*1.05));return{cols,rows,K:cols*rows};},
  cycle(p,L){return(L.cols+L.rows-2)*p.stagger*2+p.popDuration*2+p.holdDuration;},
  dur(n,p,W=1920,H=1080){const L=this.layout(n,p,W,H);return this.cycle(p,L)*Math.max(2,Math.ceil(n/L.K));},
  build(S){const {W,H,u,t,items,p}=S,n=items.length,L=this.layout(n,p,W,H),cy=this.cycle(p,L),ci=Math.floor(t/cy),f=t-ci*cy,mg=60*u,gp=p.gap*u,cw=(W-2*mg-gp*(L.cols-1))/L.cols,ch=(H-2*mg-gp*(L.rows-1))/L.rows,outStart=(L.cols+L.rows-2)*p.stagger+p.popDuration+p.holdDuration;
    for(let r=0;r<L.rows;r++)for(let c=0;c<L.cols;c++){const d=(r+c)*p.stagger,ein=cl((f-d)/p.popDuration),eout=cl((f-outStart-d)/p.popDuration),s=EASE.ob(ein)*(1-EASE.i(eout));if(s<=0.001)continue;
      S.card({item:S.I(ci*L.K+r*L.cols+c),x:-W/2+mg+cw/2+c*(cw+gp),y:-H/2+mg+ch/2+r*(ch+gp),w:cw,h:ch,s});}
    S.text(x=>drawChrome(x,S,null));}});

function tplDur(T,n,p,W,H){return T.dur(n,p,W,H);}
{const CATMAP={prstenec:'3D a perspektiva',spirala:'3D a perspektiva',globus:'3D a perspektiva',tunel:'3D a perspektiva',rolodex:'Karusel a proud',oko:'Karusel a proud',coverflow:'Karusel a proud',film:'Karusel a proud',marquee:'Mřížka',popgrid:'Mřížka'};
 const REN={coverflow:'Cover Flow s odrazem',globus:'Glóbus z karet',tunel:'Tunel čtyř stěn',film:'Filmový pás s perforací',popgrid:'Pop mřížka po diagonále',marquee:'Marquee natočené'};
 for(const T of TPL){T.cat=T.kind==='reel'?'Showreel s popisky':CATMAP[T.id]||'Mřížka';if(REN[T.id])T.name=REN[T.id];}
 for(let i=TPL.length-1;i>=0;i--)if(TPL[i].kind==='reel')TPL.splice(i,1);}
