// ================= Video module (UI) =================
const VLS='kreativni-dilna-video-v1';
const VC=[
 ['Pozadí',['bgType','Pozadí',[['color','Barva'],['gradient','Přechod'],['image','Obrázek'],['mesh','Mesh']],'color']],
 ['Pozadí',['bg1','Barva pozadí','#101014'],'bgType',['color']],
 ['Pozadí',['gradient','Přechod',[['dusk','Soumrak'],['ember','Žhavé uhlíky'],['mint','Máta'],['grape','Hrozen'],['peach','Broskev'],['slate','Břidlice'],['halo','Halo'],['custom','Vlastní']],'dusk'],'bgType',['gradient']],
 ['Pozadí',['grad1','Barva 1','#2b1055'],'gradient',['custom']],['Pozadí',['grad2','Barva 2','#7597de'],'gradient',['custom']],['Pozadí',['gradAngle','Úhel přechodu',0,360,1,135,'deg'],'gradient',['custom']],['Pozadí',['gradRadial','Kruhový přechod',false],'gradient',['custom']],
 ['Pozadí',['bgDim','Ztmavení obrázku',0,0.9,0.01,0.2],'bgType',['image']],
 ['Pozadí',['mesh1','Barva 1','#e0eaff'],'bgType',['mesh']],['Pozadí',['mesh2','Barva 2','#241d9a'],'bgType',['mesh']],['Pozadí',['mesh3','Barva 3','#f75092'],'bgType',['mesh']],['Pozadí',['mesh4','Barva 4','#9f50d3'],'bgType',['mesh']],
 ['Pozadí',['meshSpeed','Pohyb (cyklů za smyčku)',0,4,1,1],'bgType',['mesh']],['Pozadí',['meshDist','Zvlnění',0,1,0.01,0.6],'bgType',['mesh']],
 ['Filtr přes celé video',['filter','Filtr',[['none','Žádný'],['fluted','Vroubkované sklo'],['dither','Dithering'],['halftone','Halftone'],['paper','Zmačkaný papír'],['lens','Zkreslení objektivu'],['vhs','VHS'],['glitch','Glitch']],'none']],
 ['Filtr přes celé video',['flSize','Šířka pruhů',0,1,0.01,0.45],'filter',['fluted']],['Filtr přes celé video',['flAngle','Úhel pruhů',0,180,1,0,'deg'],'filter',['fluted']],['Filtr přes celé video',['flDistort','Lom',0,1,0.01,0.5],'filter',['fluted']],['Filtr přes celé video',['flShift','Posun pruhů',0,1,0.01,0],'filter',['fluted']],['Filtr přes celé video',['flLight','Stíny a odlesky',0,1,0.01,0.35],'filter',['fluted']],
 ['Filtr přes celé video',['diType','Matice',[['2','2×2'],['4','4×4'],['8','8×8']],'8'],'filter',['dither']],['Filtr přes celé video',['diCell','Velikost bodu',1,16,1,3,'px'],'filter',['dither']],['Filtr přes celé video',['diBias','Práh',-0.5,0.5,0.01,0],'filter',['dither']],['Filtr přes celé video',['diOrig','Původní barvy',false],'filter',['dither']],['Filtr přes celé video',['diSteps','Úrovní barev',1,8,1,2],'filter',['dither']],
 ['Filtr přes celé video',['htCell','Velikost rastru',4,60,1,14,'px'],'filter',['halftone']],['Filtr přes celé video',['htAngle','Úhel rastru',0,90,1,45,'deg'],'filter',['halftone']],['Filtr přes celé video',['htContrast','Kontrast',0,1,0.01,0.4],'filter',['halftone']],['Filtr přes celé video',['htOrig','Původní barvy',false],'filter',['halftone']],
 ['Filtr přes celé video',['fBack','Barva pozadí filtru','#0b1430'],'filter',['dither','halftone']],['Filtr přes celé video',['fFront','Barva popředí filtru','#94ffaf'],'filter',['dither','halftone']],
 ['Filtr přes celé video',['paFolds','Počet záhybů',0,8,1,3],'filter',['paper']],['Filtr přes celé video',['paCrumple','Zmačkání',0,1,0.01,0.3],'filter',['paper']],['Filtr přes celé video',['paGrain','Zrno papíru',0,1,0.01,0.4],'filter',['paper']],['Filtr přes celé video',['paSeed','Seed (náhoda)',1,99,1,4],'filter',['paper']],
 ['Filtr přes celé video',['leAmount','Zkreslení (soudek ⟷ poduška)',-1,1,0.01,0.45],'filter',['lens']],['Filtr přes celé video',['leChroma','Chromatická aberace',0,1,0.01,0.4],'filter',['lens']],
 ['Filtr přes celé video',['glAmount','Síla',0,1,0.01,0.5],'filter',['vhs','glitch']],['Filtr přes celé video',['glSeed','Seed (náhoda)',1,99,1,3],'filter',['glitch']],
 ['Dvojitá expozice',['dxOn','Zapnout dvojitou expozici',false]],
 ['Dvojitá expozice',['dxItem','Překrývající práce č.',1,40,1,2],'dxOn',[true]],['Dvojitá expozice',['dxMode','Režim prolnutí',[['screen','Zesvětlit (screen)'],['multiply','Násobit'],['overlay','Překrýt'],['lighten','Světlejší'],['difference','Rozdíl']],'screen'],'dxOn',[true]],
 ['Dvojitá expozice',['dxOpacity','Krytí',0,1,0.01,0.5],'dxOn',[true]],['Dvojitá expozice',['dxExposure','Expozice',0.3,2,0.01,1],'dxOn',[true]],['Dvojitá expozice',['dxMask','Maska',[['none','Bez masky'],['radial','Kruhová'],['linear','Zleva doprava']],'none'],'dxOn',[true]],['Dvojitá expozice',['dxDrift','Pomalý posun',0,1,0.01,0.5],'dxOn',[true]],
 ['Rám zařízení',['device','Rám',[['none','Žádný'],['phone','Telefon'],['browser','Prohlížeč']],'none']],['Rám zařízení',['deviceColor','Barva rámu','#1a1a1c'],'device',['phone','browser']],['Rám zařízení',['screenRadius','Zaoblení displeje',0,30,0.5,12,'%'],'device',['phone']],
 ['Logo',['logoPos','Umístění',[['tl','Vlevo nahoře'],['tr','Vpravo nahoře'],['bl','Vlevo dole'],['br','Vpravo dole'],['c','Uprostřed']],'br']],['Logo',['logoSize','Velikost loga',3,60,0.5,12,'%']],['Logo',['logoStyle','Styl',[['normal','Původní'],['metal','Tekutý kov']],'normal']],
 ['Logo',['logoTint','Tón kovu','#dfe6ff'],'logoStyle',['metal']],['Logo',['logoSpeed','Rychlost lesku',0.2,3,0.05,1],'logoStyle',['metal']],
 ['Text a pohyb',['radius','Zaoblení karet',0,80,1,14]],['Text a pohyb',['grain','Filmové zrno',0,1,0.01,0.1]],['Text a pohyb',['vignette','Vinětace',0,1,0.01,0.2]],['Text a pohyb',['textColor','Barva textu','#f2efe9']],['Text a pohyb',['font','Písmo nadpisů',[['display','Bricolage Grotesque'],['sans','Instrument Sans'],['mono','IBM Plex Mono']],'display']],['Text a pohyb',['brandText','Text značky v rohu','Studio']],['Text a pohyb',['showLabels','Názvy projektů v obraze',true]],['Text a pohyb',['speed','Rychlost animace',0.5,2,0.05,1]],['Text a pohyb',['loopRepeat','Opakování smyčky v exportu',1,5,1,2]]];
const VCOMMON=VC.map(([g,a,vid,vv])=>{const d=normP(a);d.group=g;if(vid)d.vis={id:vid,values:vv};return d;});
const vs={tpl:'a-showcase-stream',vals:{},common:{aspect:'16:9',quality:'1080',fps:'30'},items:[],playing:true,clock:0,last:0,exporting:false,cancel:false,ready:false};
try{const s=JSON.parse(localStorage.getItem(VLS)||'null');if(s){if(TPL.some(x=>x.id===s.tpl))vs.tpl=s.tpl;vs.vals=s.vals||{};Object.assign(vs.common,s.common||{});}}catch(e){}
VCOMMON.forEach(d=>{const v=vs.common[d.key];if(v===undefined||(d.type==='select'&&!d.options.some(o=>o[0]===v)))vs.common[d.key]=d.def;});
let veng=null,vErr=null;
function vEngine(){if(!veng&&!vErr){try{veng=new VEngine();}catch(e){vErr=e;}}return veng;}
const tplOf=()=>TPL.find(x=>x.id===vs.tpl)||TPL[0];
function tvals(T){const v=vs.vals[T.id]||(vs.vals[T.id]={});for(const d of T.params){if(v[d.key]===undefined)v[d.key]=d.def;else if(d.type==='select'&&!d.options.some(o=>o[0]===v[d.key]))v[d.key]=d.def;}return v;}
function vpersist(){clearTimeout(vpersist.t);vpersist.t=setTimeout(()=>{try{localStorage.setItem(VLS,JSON.stringify({tpl:vs.tpl,vals:vs.vals,common:Object.assign({},vs.common,{bgImage:null,logo:null})}));}catch(e){}},300);}
function outSize(){const [a,b]=vs.common.aspect.split(':').map(Number),q=+vs.common.quality;let W,H;if(a>=b){H=q;W=Math.round(q*a/b);}else{W=q;H=Math.round(q*b/a);}return[W-W%2,H-H%2];}
function prevSize(){const [W,H]=outSize(),s=Math.min(1,960/Math.max(W,H));return[Math.round(W*s/2)*2,Math.round(H*s/2)*2];}
function tplLen(T,W,H){return tplDur(T,vs.items.length,tvals(T),W,H)/vs.common.speed;}
function exportLen(W,H){const T=tplOf();return tplLen(T,W,H)*(T.kind==='loop'?vs.common.loopRepeat:1);}
function renderAt(target,W,H,tReal){const T=tplOf(),p=tvals(T),S=makeScene(W,H,tReal*vs.common.speed,vs.items,p,vs.common);S.phase=fract(S.t/Math.max(0.01,T.dur(vs.items.length,p,W,H)));T.build(S);vEngine().render(S,target);}
const fmtT=s=>`${Math.floor(s/60)}:${(s%60).toFixed(1).padStart(4,'0')}`;

// ---------- sample projects ----------
const SAMPLE_PROJ=[['Atlas','Branding','#ebe5d6','#1d3fbb','#f24d2e'],['Mlha','Fotografie','#a9bccd','#1c2733','#eef3f7'],['Kovárna','Identita','#151515','#f2a33a','#f4efe6'],['Lumen','Motion design','#130f30','#ff4fa3','#7bdcff'],['Pole','Web','#dde7c6','#2f5d3a','#f6f3e7'],['Vír','Kampaň','#ff5a36','#151515','#fff2e4'],['Sklo','Produkt','#d6e2e8','#1f6f8b','#ffffff'],['Echo','Typografie','#f1ede4','#121212','#d9342b']];
function makeProject(i){
  const [name,type,bg,a,b]=SAMPLE_PROJ[i],W=1600,H=1200,c=mk(W,H),x=c.getContext('2d'),r=rng(i*7+3);x.fillStyle=bg;x.fillRect(0,0,W,H);let tc=a;
  switch(i){
    case 0:x.fillStyle=a;x.beginPath();x.arc(1080,520,430,0,TAU);x.fill();x.fillStyle=b;x.fillRect(250,640,190,190);x.strokeStyle=a;x.lineWidth=10;x.strokeRect(160,160,300,300);break;
    case 1:{let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c9d6e2');g.addColorStop(1,'#56687a');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='#2a3a4a';x.beginPath();x.moveTo(0,820);for(let px=0;px<=W;px+=10)x.lineTo(px,820-150*fbm(px/420,1,4,5));x.lineTo(W,H);x.lineTo(0,H);x.fill();for(let k=0;k<70;k++){x.fillStyle=`rgba(240,245,250,${0.05+r()*0.08})`;x.beginPath();x.ellipse(r()*W,600+r()*350,200+r()*300,30+r()*50,0,0,TAU);x.fill();}tc=b;break;}
    case 2:x.lineWidth=28;for(let k=0;k<9;k++){x.strokeStyle=k%2?a:'#5a3a12';x.beginPath();x.arc(1180,980,180+k*70,Math.PI,Math.PI*1.5);x.stroke();}break;
    case 3:for(const [cx,cy,rr,col] of [[520,520,520,'rgba(255,79,163,0.85)'],[1100,700,560,'rgba(123,220,255,0.7)'],[900,300,300,'rgba(255,220,120,0.5)']]){const g=x.createRadialGradient(cx,cy,0,cx,cy,rr);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H);}tc=b;break;
    case 4:x.strokeStyle=a;x.lineWidth=6;for(let k=0;k<26;k++){x.beginPath();for(let px=0;px<=W;px+=12)x.lineTo(px,200+k*36+Math.sin(px/180+k*0.4)*40*(k/26));x.stroke();}break;
    case 5:for(let k=0;k<160;k++){const t=k/160,ang=t*TAU*4,rad=40+t*620;x.fillStyle=a;x.beginPath();x.arc(820+Math.cos(ang)*rad,600+Math.sin(ang)*rad*0.8,6+t*36,0,TAU);x.fill();}tc=b;break;
    case 6:for(let k=0;k<6;k++){x.fillStyle=`rgba(31,111,139,${0.12+k*0.06})`;x.beginPath();x.roundRect?x.roundRect(260+k*150,200+k*60,560,460,40):x.rect(260+k*150,200+k*60,560,460);x.fill();}break;
    case 7:x.font='800 220px "Bricolage Grotesque", system-ui, sans-serif';for(let k=0;k<6;k++){x.fillStyle=`rgba(18,18,18,${1-k*0.16})`;x.fillText('ECHO',120,330+k*150);}x.fillStyle=b;x.fillRect(1250,120,90,960);tc=a;break;
  }
  x.fillStyle=tc;x.font='700 150px "Bricolage Grotesque", system-ui, sans-serif';x.textBaseline='alphabetic';if(i!==7)x.fillText(name,110,H-120);
  x.font='500 34px "IBM Plex Mono", monospace';x.fillText(type.toUpperCase(),116,i===7?H-80:H-60);x.textAlign='right';x.fillText(String(i+1).padStart(2,'0'),W-90,110);
  return{kind:'image',el:c,w:W,h:H,name,type,sample:true,thumb:thumbOf(c,W,H)};
}
function thumbOf(el,w,h){const t=mk(240,180),x=t.getContext('2d'),s=Math.max(240/w,180/h);x.drawImage(el,(240-w*s)/2,(180-h*s)/2,w*s,h*s);return t.toDataURL('image/jpeg',0.8);}
function loadSamples(){vs.items.forEach(it=>{if(veng)veng.forget(it);if(it.kind==='video'){it.el.pause();URL.revokeObjectURL(it.el.src);}});vs.items=SAMPLE_PROJ.map((_,i)=>makeProject(i));vs.clock=0;vAfterItems();}

// ---------- user files ----------
const prettyName=f=>{const s=f.replace(/\.[a-z0-9]+$/i,'').replace(/[-_]+/g,' ').trim();return s.charAt(0).toUpperCase()+s.slice(1);};
async function addFiles(files){
  files=[...files].filter(f=>/^(image|video)\//.test(f.type));if(!files.length){toast('Nahrajte obrázky (JPG, PNG, WebP) nebo videa (MP4, MOV, WebM).');return;}
  if(vs.items.length&&vs.items.every(i=>i.sample)){vs.items.forEach(it=>veng&&veng.forget(it));vs.items=[];}
  let bad=0;
  for(const f of files){if(vs.items.length>=40){toast('Najednou jde použít nejvýš 40 prací.');break;}const url=URL.createObjectURL(f);
    try{
      if(f.type.startsWith('image/')){const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url;});const s=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight)),c=mk(img.naturalWidth*s,img.naturalHeight*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);vs.items.push({kind:'image',el:c,w:c.width,h:c.height,name:prettyName(f.name),type:'',thumb:thumbOf(c,c.width,c.height)});}
      else{const v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.src=url;await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=rej;setTimeout(()=>rej(new Error('timeout')),15000);});v.currentTime=Math.min(0.1,v.duration/2);await new Promise(r=>{v.onseeked=r;setTimeout(r,1500);});
        vs.items.push({kind:'video',el:v,w:v.videoWidth,h:v.videoHeight,name:prettyName(f.name),type:'Video',thumb:thumbOf(v,v.videoWidth,v.videoHeight)});if(view==='video')v.play().catch(()=>{});}
    }catch(e){bad++;URL.revokeObjectURL(url);}
  }
  if(bad)toast(`${bad} ${bad===1?'soubor se nepodařilo':'souborů se nepodařilo'} otevřít. HEIC fotky a ProRes videa převeďte na JPG / MP4.`);
  if(!vs.items.length)loadSamples();else vAfterItems();
}
function vAfterItems(){renderWorks();buildTplList();updateExpInfo();}

// ---------- UI ----------
function plist(box,specs,vals,onChange,pre){
  box.innerHTML='';let grp=null;const wraps=[];
  const vis=()=>{for(const [w,d] of wraps)w.hidden=!!(d.vis&&!d.vis.values.includes(vals[d.vis.id]));};
  const ch=()=>{vis();onChange();};
  for(const d of specs){
    if(d.group&&d.group!==grp){grp=d.group;const g=document.createElement('div');g.className='pgroup';g.textContent=grp;box.append(g);}
    const id=`${pre}-${d.key}`,w=document.createElement('div');w.className='ctl'+(d.type==='check'?' inline':'');
    if(d.type==='range'){w.innerHTML=`<label for="${id}"><span class="name"></span><output></output></label><input type="range" id="${id}" min="${d.min}" max="${d.max}" step="${d.step}">`;const i=w.querySelector('input'),o=w.querySelector('output');i.value=vals[d.key];o.textContent=fmt(d,vals[d.key]);i.oninput=()=>{vals[d.key]=+i.value;o.textContent=fmt(d,i.value);ch();};}
    else if(d.type==='select'){const seg=d.options.length<=3&&d.options.every(o=>o[1].length<=13)||d.options.length===4&&d.options.every(o=>o[1].length<=7);
      if(seg){w.innerHTML=`<div class="lab"><span class="name"></span></div><div class="segm" role="group"></div>`;const sg=w.querySelector('.segm');sg.setAttribute('aria-label',d.label);for(const [v,l] of d.options){const b=document.createElement('button');b.type='button';b.textContent=l;b.title=l;b.setAttribute('aria-pressed',String(vals[d.key]===v));b.onclick=()=>{vals[d.key]=v;sg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));ch();};sg.append(b);}}
      else{w.innerHTML=`<label for="${id}"><span class="name"></span></label><select id="${id}"></select>`;const sel=w.querySelector('select');for(const [v,l] of d.options){const o=document.createElement('option');o.value=v;o.textContent=l;sel.append(o);}sel.value=vals[d.key];sel.onchange=()=>{vals[d.key]=sel.value;ch();};}}
    else if(d.type==='check'){w.innerHTML=`<label for="${id}"><span class="name"></span></label><input type="checkbox" class="tg" id="${id}">`;const cb=w.querySelector('input');cb.checked=!!vals[d.key];cb.onchange=()=>{vals[d.key]=cb.checked;ch();};}
    else if(d.type==='text'){w.innerHTML=`<label for="${id}"><span class="name"></span></label><input type="text" id="${id}" class="txt" autocomplete="off">`;const ti=w.querySelector('input');ti.value=vals[d.key];ti.oninput=()=>{vals[d.key]=ti.value;ch();};}
    else{w.innerHTML=`<div class="lab"><label for="${id}" class="name"></label><span class="colorv"><span></span><input type="color" id="${id}"></span></div>`;const ci=w.querySelector('input'),hx=w.querySelector('.colorv span');ci.value=String(vals[d.key]).slice(0,7);hx.textContent=String(vals[d.key]).slice(0,7).toUpperCase();ci.oninput=()=>{vals[d.key]=ci.value;hx.textContent=ci.value.toUpperCase();ch();};}
    w.querySelector('.name').textContent=d.label;box.append(w);wraps.push([w,d]);
  }
  vis();
}
const vChanged=()=>{vpersist();updateExpInfo();buildTplList();};
const VCATS=['3D a perspektiva','Karusel a proud','Orbit','Mřížka','Více scén','Hromádky a rozptyl','Reflektor a fokus','Odhalení a stírání','Izometrie'];
function buildTplList(){
  const q=$('v-q').value.trim().toLowerCase(),list=$('v-list');list.innerHTML='';const [W,H]=outSize();let any=false;
  for(const cat of VCATS){
    const items=TPL.filter(T=>T.cat===cat&&(!q||(T.name+' '+T.desc+' '+cat).toLowerCase().includes(q)));if(!items.length)continue;any=true;
    const sec=document.createElement('section');sec.className='grp';sec.innerHTML=`<h2>${cat}<span>${items.length}</span></h2>`;const ul=document.createElement('ul');
    for(const T of items){const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='fx';if(T.id===vs.tpl)b.setAttribute('aria-current','true');b.title=T.desc;b.innerHTML='<span></span><span class="no"></span>';b.firstChild.textContent=T.name;b.lastChild.textContent=vs.items.length?tplLen(T,W,H).toFixed(1).replace('.',',')+' s':'';b.onclick=()=>{vs.tpl=T.id;vs.clock=0;vpersist();showTpl();buildTplList();};li.append(b);ul.append(li);}
    sec.append(ul);list.append(sec);}
  if(!any)list.innerHTML='<p class="empty">Žádná animace neodpovídá hledání.</p>';
}
function showTpl(){const T=tplOf();$('v-name').textContent=T.name;$('v-kind').textContent=T.cat;$('v-desc').textContent=T.desc;plist($('v-params'),T.params,tvals(T),vChanged,'vp-'+T.id);updateExpInfo();}
function updateExpInfo(){const [W,H]=outSize(),fast=!!(window.VideoEncoder&&window.Mp4Muxer),T=tplOf();
  $('v-expinfo').textContent=vs.items.length?`${W} × ${H} px · ${vs.common.fps} fps · ${exportLen(W,H).toFixed(1).replace('.',',')} s${T.kind==='loop'?` (${vs.common.loopRepeat}× smyčka)`:''} · ${fast?'MP4 (H.264)':'WebM, nahrává se v reálném čase'}. ${vs.items.some(i=>i.kind==='video')?'S vlastními videi se export počítá snímek po snímku a trvá déle.':''}`:'Nejdřív nahrajte svoje práce.';}
function renderWorks(){
  const box=$('v-works');box.innerHTML='';const sample=vs.items.length&&vs.items.every(i=>i.sample);
  $('v-works-h').innerHTML=`<strong>Vaše práce</strong> <span>${vs.items.length}</span>${sample?' <em>ukázkové projekty — nahrajte vlastní a nahradí je</em>':''}`;
  vs.items.forEach((it,i)=>{const w=document.createElement('div');w.className='work';w.innerHTML=`<div class="wthumb"><img alt=""><span class="wk" ${it.kind==='video'?'':'hidden'}>VIDEO</span></div><input class="wname" aria-label="Název projektu" placeholder="Název projektu"><input class="wtype" aria-label="Typ projektu" placeholder="Typ (např. Branding)"><div class="wacts"><button type="button" aria-label="Posunout dříve">←</button><button type="button" aria-label="Posunout později">→</button><button type="button" aria-label="Odebrat">×</button></div>`;
    w.querySelector('img').src=it.thumb;const [ni,ti]=w.querySelectorAll('input');ni.value=it.name;ti.value=it.type;ni.oninput=()=>{it.name=ni.value;};ti.oninput=()=>{it.type=ti.value;};
    const [bl,br,bx]=w.querySelectorAll('button');bl.disabled=i===0;br.disabled=i===vs.items.length-1;
    bl.onclick=()=>{[vs.items[i-1],vs.items[i]]=[vs.items[i],vs.items[i-1]];renderWorks();};br.onclick=()=>{[vs.items[i+1],vs.items[i]]=[vs.items[i],vs.items[i+1]];renderWorks();};
    bx.onclick=()=>{const [r]=vs.items.splice(i,1);if(veng)veng.forget(r);if(r.kind==='video'){r.el.pause();URL.revokeObjectURL(r.el.src);}if(!vs.items.length)loadSamples();else vAfterItems();};box.append(w);});
  const add=document.createElement('label');add.className='work add';add.htmlFor='v-file';add.innerHTML='<span>+</span>Přidat práce';box.append(add);
}
function vfit(){const vp=$('v-viewport'),fr=$('v-frame');if(!vp.clientWidth)return;const [W,H]=prevSize(),narrow=matchMedia('(max-width:48rem)').matches,pad=narrow?12:24;
  if(narrow){vp.style.height=Math.round(Math.min(innerHeight*0.6,(vp.clientWidth-pad*2)*H/W)+pad*2)+'px';}else vp.style.height='';
  const s=Math.min((vp.clientWidth-pad*2)/W,(vp.clientHeight-pad*2)/H,narrow?99:1.4),w=Math.floor(W*s),h=Math.floor(H*s);Object.assign(fr.style,{width:w+'px',height:h+'px',left:Math.round((vp.clientWidth-w)/2)+'px',top:Math.round((vp.clientHeight-h)/2)+'px'});}
function setPlaying(on){vs.playing=on;$('v-play').textContent=on?'Pauza':'Přehrát';$('v-play').setAttribute('aria-pressed',String(on));}
function vtick(now){requestAnimationFrame(vtick);const dt=Math.min(0.1,(now-(vs.last||now))/1000);vs.last=now;
  if(view==='home'&&homeVid){if(!vs.items.length)return;try{const T=TPL.find(x=>x.id==='prstenec'),S=makeScene(640,360,now/1000,vs.items,tvals(T),Object.assign({},vs.common,{showLabels:false,brandText:''}));T.build(S);vEngine().render(S,homeVid);}catch(e){}return;}
  if(view!=='video'||vs.exporting||!vs.items.length||!vEngine())return;
  const [W,H]=prevSize(),D=tplLen(tplOf(),W,H);if(vs.playing)vs.clock+=dt;if(vs.clock>=D)vs.clock%=D;
  renderAt($('v-out'),W,H,vs.clock);if(!vs.scrubbing)$('v-scrub').value=Math.round(vs.clock/D*1000);$('v-time').textContent=`${fmtT(vs.clock)} / ${fmtT(D)}`;
}
function playVideos(on){vs.items.forEach(it=>{if(it.kind==='video'){if(on)it.el.play().catch(()=>{});else it.el.pause();}});}

// ---------- export ----------
async function pickCodec(W,H,fps,bitrate){const mbs=Math.ceil(W/16)*Math.ceil(H/16),rate=mbs*fps,L=[['1f',108000,3600],['28',245760,8192],['2a',522240,8704],['32',589824,22080],['33',983040,36864],['34',2073600,36864]];
  for(const [lv,maxR,maxF] of L){if(rate>maxR||mbs>maxF)continue;for(const pr of ['6400','4d00','4200']){const codec=`avc1.${pr}${lv}`;try{const s=await VideoEncoder.isConfigSupported({codec,width:W,height:H,bitrate,framerate:fps});if(s.supported)return codec;}catch(e){}}}return null;}
async function seekVideos(t,fps){const vids=vs.items.filter(i=>i.kind==='video');await Promise.all(vids.map(it=>{const v=it.el,d=v.duration||1,target=t%d;if(Math.abs(v.currentTime-target)<0.5/fps)return null;return new Promise(r=>{const done=()=>{v.removeEventListener('seeked',done);r();};v.addEventListener('seeked',done);v.currentTime=target;setTimeout(done,1000);});}));}
function vProgress(f,msg){$('v-bar').style.width=(f*100).toFixed(1)+'%';$('v-busy-s').textContent=msg||`${Math.round(f*100)} %`;}
async function encodeMp4(out,W,H,fps,frames){
  const bitrate=Math.min(40e6,Math.round(W*H*fps*0.14)),codec=await pickCodec(W,H,fps,bitrate);if(!codec)throw new Error('prohlížeč neumí zakódovat H.264 v tomto rozlišení. Zkuste nižší kvalitu.');
  const muxer=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:'avc',width:W,height:H,frameRate:fps},fastStart:'in-memory'});let err=null;
  const enc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:e=>{err=e;}});enc.configure({codec,width:W,height:H,bitrate,framerate:fps,avc:{format:'avc'}});
  const t0=performance.now();
  for(let i=0;i<frames;i++){if(vs.cancel){enc.close();throw new Error('cancel');}if(err)throw err;const t=i/fps;await seekVideos(t*vs.common.speed,fps);renderAt(out,W,H,t);
    const fr=new VideoFrame(out,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});enc.encode(fr,{keyFrame:i%(fps*2)===0});fr.close();
    while(enc.encodeQueueSize>8)await new Promise(r=>setTimeout(r,4));
    if(i%3===0){const el=(performance.now()-t0)/1000,rem=i>5?el/i*(frames-i):0;vProgress(i/frames,`Snímek ${i} z ${frames}${rem>2?` · zbývá asi ${Math.ceil(rem)} s`:''}`);await new Promise(r=>setTimeout(r,0));}}
  await enc.flush();if(err)throw err;muxer.finalize();enc.close();return new Blob([muxer.target.buffer],{type:'video/mp4'});
}
async function recordRealtime(out,W,H,fps,D){
  const mime=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));if(!mime)throw new Error('tento prohlížeč neumí nahrávat video. Zkuste Chrome, Edge nebo Safari.');
  renderAt(out,W,H,0);const rec=new MediaRecorder(out.captureStream(fps),{mimeType:mime,videoBitsPerSecond:Math.min(40e6,W*H*fps*0.14)}),chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  vs.items.forEach(it=>{if(it.kind==='video'){it.el.currentTime=0;it.el.play().catch(()=>{});}});rec.start(250);const t0=performance.now();
  await new Promise((res,rej)=>{const step=()=>{if(vs.cancel){rec.stop();rej(new Error('cancel'));return;}const t=(performance.now()-t0)/1000;if(t>=D){res();return;}renderAt(out,W,H,t);vProgress(t/D,`Nahrávám v reálném čase · ${fmtT(t)} z ${fmtT(D)}`);requestAnimationFrame(step);};step();});
  const stopped=new Promise(r=>rec.onstop=r);rec.stop();await stopped;return new Blob(chunks,{type:mime.split(';')[0]});
}
async function vExport(){
  if(vs.exporting||!vs.items.length)return;if(!vEngine()){toast(vErr.message);return;}
  const [W,H]=outSize(),fps=+vs.common.fps,D=exportLen(W,H),frames=Math.max(1,Math.round(D*fps)),out=mk(W,H);
  vs.exporting=true;vs.cancel=false;$('v-busy').hidden=false;$('v-export').disabled=true;vProgress(0,'Připravuji…');playVideos(false);
  try{
    let blob;if(window.VideoEncoder&&window.Mp4Muxer)blob=await encodeMp4(out,W,H,fps,frames);else blob=await recordRealtime(out,W,H,fps,D);
    const ext=blob.type.includes('mp4')?'mp4':'webm',filename=`portfolio-${tplOf().id}-${vs.common.aspect.replace(':','x')}-${H}p.${ext}`;vProgress(1,'Hotovo');
    if(downloadsApi){try{await downloadsApi.save({filename,data:blob});toast('Video uloženo');}catch(e){toast(e&&e.code==='declined'?'Stahování zrušeno':'Video se nepodařilo uložit: '+(e&&e.message||'neznámá chyba'));}}
    else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),10000);toast(`Stahuji ${filename}`);}
  }catch(e){if(e.message!=='cancel'){console.error(e);toast('Video se nepodařilo vytvořit: '+e.message);}else toast('Export zrušen');}
  finally{vs.exporting=false;$('v-busy').hidden=true;$('v-export').disabled=false;if(view==='video')playVideos(true);}
}

// ---------- wiring ----------
function vInit(){
  if(vs.ready)return;vs.ready=true;
  if(!vEngine()){$('v-err').hidden=false;$('v-err').textContent=vErr.message;}
  for(const [id,key] of [['v-aspect','aspect'],['v-quality','quality'],['v-fps','fps']]){const s=$(id);s.value=vs.common[key];s.onchange=()=>{vs.common[key]=s.value;vpersist();vfit();updateExpInfo();buildTplList();};}
  plist($('v-common'),VCOMMON,vs.common,()=>{vChanged();$('v-bgimg-row').hidden=vs.common.bgType!=='image';},'vc');
  const near=k=>{const el=document.getElementById('vc-'+k);return el?el.closest('.ctl'):null;};
  const row=document.createElement('div');row.className='ctl';row.id='v-bgimg-row';row.innerHTML='<label class="btn" for="v-bgfile">Vybrat obrázek pozadí</label><input type="file" id="v-bgfile" accept="image/*" class="vh">';row.hidden=vs.common.bgType!=='image';near('bgDim').before(row);
  const lrow=document.createElement('div');lrow.className='ctl';lrow.innerHTML='<div style="display:flex;gap:6px;align-items:center"><label class="btn" for="v-logofile">Nahrát logo (PNG, SVG)</label><button class="btn small" id="v-logodel" type="button" hidden>Odebrat</button></div><input type="file" id="v-logofile" accept="image/png,image/svg+xml,image/webp,image/*" class="vh">';near('logoPos').before(lrow);
  const loadImg=async f=>{const url=URL.createObjectURL(f);try{const img=await new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=url;});const iw=img.naturalWidth||1024,ih=img.naturalHeight||1024,s2=Math.min(4,2048/Math.max(iw,ih)),c=mk(iw*s2,ih*s2);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return{kind:'image',el:c,w:c.width,h:c.height};}finally{URL.revokeObjectURL(url);}};
  $('v-bgfile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const it=await loadImg(f);if(vs.common.bgImage&&veng)veng.forget(vs.common.bgImage);vs.common.bgImage=it;toast('Obrázek pozadí nastaven');}catch(err){toast('Obrázek se nepodařilo otevřít.');}};
  $('v-logofile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const it=await loadImg(f);if(vs.common.logo&&veng)veng.forget(vs.common.logo);vs.common.logo=it;$('v-logodel').hidden=false;toast('Logo přidáno');}catch(err){toast('Logo se nepodařilo otevřít. Zkuste PNG nebo SVG.');}};
  $('v-logodel').onclick=()=>{if(vs.common.logo&&veng)veng.forget(vs.common.logo);vs.common.logo=null;$('v-logodel').hidden=true;};
  $('v-reset').onclick=()=>{vs.vals[vs.tpl]={};showTpl();vChanged();};
  $('v-file').onchange=e=>{addFiles(e.target.files);e.target.value='';};
  $('v-sample').onclick=loadSamples;$('v-export').onclick=vExport;$('v-cancel').onclick=()=>{vs.cancel=true;};
  $('v-play').onclick=()=>setPlaying(!vs.playing);$('v-q').oninput=buildTplList;
  const sc=$('v-scrub');sc.oninput=()=>{vs.scrubbing=true;setPlaying(false);const [W,H]=prevSize();vs.clock=sc.value/1000*tplLen(tplOf(),W,H)*0.9999;};sc.onchange=()=>{vs.scrubbing=false;};
  const st=$('v-stage');st.addEventListener('dragover',e=>{e.preventDefault();st.classList.add('dropping');});st.addEventListener('dragleave',e=>{if(!st.contains(e.relatedTarget))st.classList.remove('dropping');});st.addEventListener('drop',e=>{e.preventDefault();st.classList.remove('dropping');addFiles(e.dataTransfer.files);});
  new ResizeObserver(vfit).observe($('v-viewport'));
  if(!vs.items.length)loadSamples();showTpl();buildTplList();renderWorks();setPlaying(true);vfit();
}
requestAnimationFrame(vtick);
