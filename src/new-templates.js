// ================= New templates from the extension proposals =================
function newTpl(o){o.params=o.params.map(normP);o.kind='loop';TPL.push(o);}
const BENTO=[[[0,0,.5,.62],[.5,0,.5,.32],[.5,.32,.25,.3],[.75,.32,.25,.3],[0,.62,.32,.38],[.32,.62,.68,.38]],
  [[0,0,.34,1],[.34,0,.4,.5],[.34,.5,.33,.5],[.67,.5,.33,.25],[.67,.75,.33,.25],[.74,0,.26,.5]],
  [[0,0,1,.45],[0,.45,.25,.55],[.25,.45,.25,.55],[.5,.45,.25,.3],[.75,.45,.25,.3],[.5,.75,.5,.25]]];
newTpl({id:'n-bento',name:'Bento Morph',cat:'Mřížka',desc:'Nestejně velké buňky se plynule přeskupují mezi dvěma až třemi bento rozvrženími. Každá práce zůstává ve své buňce.',
  params:[['layout','Sled rozvržení',[['ab','A ↔ B'],['abc','A → B → C'],['bca','B → C → A']],'abc'],['gap','Mezera',0,6,0.1,1.2,'%'],['padding','Odsazení od okraje',0,15,0.5,5,'%'],['transitionDuration','Přechod',0.3,3,0.05,1,'s'],['holdDuration','Zastavení',0.2,4,0.05,1.4,'s'],['stagger','Zpoždění mezi buňkami',0,60,1,20,'%'],['easing','Průběh pohybu',[['smooth','Hladce'],['snappy','Svižně'],['overshoot','Přešvih'],['elastic','Pružně']],'smooth']],
  dur:(n,p)=>(p.layout==='ab'?2:3)*(p.transitionDuration+p.holdDuration),
  build(S){const {W,H,t,p}=S,seqL=p.layout==='ab'?[0,1]:p.layout==='bca'?[1,2,0]:[0,1,2],seg=p.transitionDuration+p.holdDuration,k=Math.floor(t/seg)%seqL.length,f=t-Math.floor(t/seg)*seg,E=easeOf(p),A=BENTO[seqL[k]],B=BENTO[seqL[(k+1)%seqL.length]],pd=p.padding/100,iw=W*(1-2*pd),ih=H*(1-2*pd),g=p.gap/100*Math.min(W,H);
    for(let i=0;i<6;i++){const d=i*p.stagger/100*p.transitionDuration/5,e=E(cl((f-p.holdDuration-d)/Math.max(0.05,p.transitionDuration-p.stagger/100*p.transitionDuration))),r=A[i].map((v,j)=>lerp(v,B[i][j],e)),w=r[2]*iw-g,h=r[3]*ih-g;
      S.card({item:S.I(i),x:-iw/2+(r[0]+r[2]/2)*iw,y:-ih/2+(r[1]+r[3]/2)*ih,w:Math.max(2,w),h:Math.max(2,h)});}
    S.text(x=>drawChrome(x,S,null));}});
newTpl({id:'n-beforeafter',name:'Before / After',cat:'Odhalení a stírání',desc:'Dvě práce přes sebe rozdělené posuvnou hranicí, například návrh před a po úpravě.',
  params:[['pair','Pár prací (začíná prací č.)',1,20,1,1],['direction','Směr hranice',[['horizontal','Vodorovně'],['vertical','Svisle']],'horizontal'],['dividerPosition','Střed hranice',20,80,1,50,'%'],['sweep','Rozsah pohybu',0,45,1,32,'%'],['edgeSoftness','Záře hrany',0,1,0.01,0.25],['labels','Popisky Před / Po',true],['duration','Délka smyčky',2,20,0.5,6,'s']],
  dur:(n,p)=>p.duration,
  build(S){const {W,H,t,p,u}=S,ph=fract(t/p.duration),pos=p.dividerPosition/100+p.sweep/100*Math.sin(TAU*ph),hor=p.direction==='horizontal',a=S.I(p.pair-1),b=S.I(p.pair);
    S.card({item:a,x:0,y:0,w:W,h:H,radius:0,noShadow:true,order:0});S.card({item:b,x:0,y:0,w:W,h:H,radius:0,noShadow:true,order:1,mask:[5,1-pos,hor?Math.PI:-Math.PI/2,p.edgeSoftness]});
    S.text(x=>{drawChrome(x,S,null);const X=hor?pos*W:W/2,Y=hor?H/2:pos*H;x.strokeStyle='#ffffff';x.lineWidth=Math.max(2,3*u);x.beginPath();if(hor){x.moveTo(X,0);x.lineTo(X,H);}else{x.moveTo(0,Y);x.lineTo(W,Y);}x.stroke();
      x.fillStyle='#ffffff';x.beginPath();x.arc(X,Y,22*u,0,TAU);x.fill();x.fillStyle='#1c1c1e';x.font=`600 ${Math.round(18*u)}px ${VFONTS.sans}`;x.textAlign='center';x.textBaseline='middle';x.fillText(hor?'‹ ›':'⌃⌄',X,Y+1);
      if(p.labels){x.font=`600 ${Math.round(20*u)}px ${VFONTS.sans}`;const tag=(txt,tx,ty,al)=>{const w=x.measureText(txt).width+28*u;x.textAlign=al;x.fillStyle='rgba(0,0,0,.55)';const bx=al==='left'?tx:tx-w;x.beginPath();x.roundRect?x.roundRect(bx,ty-18*u,w,36*u,18*u):x.rect(bx,ty-18*u,w,36*u);x.fill();x.fillStyle='#fff';x.textAlign='center';x.fillText(txt,bx+w/2,ty+1);};
        if(hor){tag('Před',40*u,H-50*u,'left');tag('Po',W-40*u,H-50*u,'right');}else{tag('Před',40*u,50*u,'left');tag('Po',40*u,H-50*u,'left');}}});}});
newTpl({id:'n-pixeldissolve',name:'Pixel Dissolve',cat:'Odhalení a stírání',desc:'Snímky se rozpadají a skládají přes pixelovou mřížku podle náhodného šumu.',
  params:[['pixelSize','Velikost pixelu',4,120,1,28],['holdDuration','Zastavení',0.2,4,0.05,1.2,'s'],['transitionDuration','Rozpad',0.2,3,0.05,0.9,'s'],['seed','Seed (náhoda)',1,999,1,7],['easing','Průběh',[['linear','Lineárně'],['smooth','Hladce'],['accelerate','Zrychlení']],'linear']],
  dur:(n,p)=>n*(p.holdDuration+p.transitionDuration),
  build(S){const {W,H,t,p,u}=S,seg=p.holdDuration+p.transitionDuration,k=Math.floor(t/seg),f=t-k*seg,e=easeOf(p)(cl((f-p.holdDuration)/p.transitionDuration));
    S.card({item:S.I(k),x:0,y:0,w:W,h:H,radius:0,noShadow:true,order:0});if(e>0)S.card({item:S.I(k+1),x:0,y:0,w:W,h:H,radius:0,noShadow:true,order:1,mask:[6,e,p.pixelSize*u,p.seed+k*13]});
    S.text(x=>drawChrome(x,S,null));}});
newTpl({id:'n-ticketrip',name:'Ticket Rip',cat:'Odhalení a stírání',desc:'Obraz se roztrhne po nepravidelné hraně, obě půlky se rozjedou a odhalí další práci.',
  params:[['roughness','Členitost trhliny',0,1,0.01,0.6],['separation','Rozjetí půlek',0,60,1,28,'%'],['rotation','Natočení půlek',0,30,0.5,9,'deg'],['scaleIntensity','Velikost',0.5,1,0.01,0.86],['holdDuration','Zastavení',0.2,4,0.05,1.2,'s'],['ripDuration','Roztržení',0.3,3,0.05,1,'s']],
  dur:(n,p)=>n*(p.holdDuration+p.ripDuration),
  build(S){const {W,H,t,p}=S,seg=p.holdDuration+p.ripDuration,k=Math.floor(t/seg),f=t-k*seg,e=cl((f-p.holdDuration)/p.ripDuration),bw=W*p.scaleIntensity,bh=H*p.scaleIntensity,sep=EASE.io(e)*p.separation/100*W,rot=EASE.io(e)*p.rotation*D2R,drop=EASE.i(e)*H*0.25,cur=S.I(k),nx=S.I(k+1),gr=e*(1-e)*4;
    S.card({item:nx,x:0,y:0,w:bw,h:bh,s:lerp(0.94,1,EASE.o(e)),fade:0.35*(1-e),order:0,shadow:0.3});
    if(e<1)for(const side of [0,1]){const sg=side?1:-1;S.card({item:cur,x:sg*sep,y:drop*(side?1.2:0.8),rz:sg*rot,w:bw,h:bh,order:2,mask:[7,side,p.roughness*(1+gr*0.2),k*7.3+1],opacity:1-EASE.i(cl((e-0.75)/0.25))});}
    S.text(x=>drawChrome(x,S,null));}});
