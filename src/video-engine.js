// ================= Video: math, easing =================
const M4={
  id(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;},
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  T(x,y,z){const m=M4.id();m[12]=x;m[13]=y;m[14]=z;return m;},
  S(x,y,z=1){const m=M4.id();m[0]=x;m[5]=y;m[10]=z;return m;},
  RX(a){const m=M4.id(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;},
  RY(a){const m=M4.id(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;},
  RZ(a){const m=M4.id(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;},
  P(fovy,asp,n,f){const t=1/Math.tan(fovy/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m;},
  chain(...ms){return ms.reduce((a,b)=>M4.mul(a,b));}
};
const EASE={lin:t=>t,io:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,o:t=>1-Math.pow(1-t,3),i:t=>t*t*t,ob:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);},sine:t=>-(Math.cos(Math.PI*t)-1)/2,qo:t=>1-(1-t)*(1-t)};
const VFONTS={display:'"Bricolage Grotesque","Avenir Next",system-ui,sans-serif',sans:'"Instrument Sans",system-ui,sans-serif',mono:'"IBM Plex Mono",ui-monospace,Menlo,monospace'};
const hexF=h=>hexRgb(h).map(v=>v/255);
function fitUV(item,w,h,mode){const ia=item.w/item.h,ba=w/h;if(mode==='contain'){if(ia>ba)return{w,h:w/ia,uv:[0,0,1,1]};return{w:h*ia,h,uv:[0,0,1,1]};}if(ia>ba){const s=ba/ia;return{w,h,uv:[(1-s)/2,0,(1+s)/2,1]};}const s=ia/ba;return{w,h,uv:[0,(1-s)/2,1,(1+s)/2]};}

// ================= Video: WebGL renderer =================
const VS_CARD=`#version 300 es
layout(location=0) in vec2 aPos;uniform mat4 uMVP;out vec2 vUv;
void main(){vUv=aPos+.5;gl_Position=uMVP*vec4(aPos,0.,1.);}`;
const FS_CARD=`#version 300 es
precision highp float;in vec2 vUv;out vec4 o;
uniform sampler2D uTex;uniform vec4 uUvR;uniform vec2 uSize;uniform float uRadius,uSoft,uOpacity,uFade,uMode,uDither,uWarp,uTime,uGray;
uniform vec3 uColor,uFadeColor,uLens;uniform vec2 uMask,uMetal;uniform float uMaskA,uMaskG;
float sdR(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float bay(vec2 p){p=mod(floor(p),4.);int i=int(p.y)*4+int(p.x);float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);return (m[i]+.5)/16.;}
void main(){
  vec2 lp=(vUv-.5)*uSize;float r=min(uRadius,min(uSize.x,uSize.y)*.5);float d=sdR(lp,uSize*.5,r);
  float s=max(uSoft,fwidth(d)*.6);float a=1.-smoothstep(-s,s,d);float glow=0.;
  if(uMask.x>.5){vec2 q=abs(vUv-.5);float m=uMask.y;
    if(uMask.x<1.5){a*=step(q.x,.5*m)*step(q.y,.5*m);}
    else if(uMask.x<2.5){float rr=length(lp)/(length(uSize)*.5);float e=fwidth(rr)+.001;a*=1.-smoothstep(m-e,m+e,rr);}
    else if(uMask.x<3.5){a*=step(q.y,.5*m);}else if(uMask.x<4.5){a*=step(q.x,.5*m);}
    else if(uMask.x<5.5){vec2 dr=vec2(cos(uMaskA),sin(uMaskA));float pr=dot(vUv-.5,dr)/(abs(dr.x)+abs(dr.y))+.5;float e=fwidth(pr)+.001;a*=1.-smoothstep(m-e,m+e,pr);glow=uMaskG*exp(-abs(pr-m)*55.);}
    else if(uMask.x<6.5){vec2 cell=floor(vUv*uSize/max(1.,uMaskA));float hh=fract(sin(dot(cell+uMaskG,vec2(12.9898,78.233)))*43758.5453);a*=step(hh,m*1.001);}
    else{float rw=vUv.y*22.,ri=floor(rw);float r1=fract(sin(ri*91.7+uMaskG)*437.5),r2=fract(sin((ri+1.)*91.7+uMaskG)*437.5);float e=.5+uMaskA*(mix(r1,r2,fract(rw))-.5)*.18;float sx=vUv.x-e,ew=fwidth(sx)+.0005;a*=m<.5?1.-smoothstep(-ew,ew,sx):smoothstep(-ew,ew,sx);}}
  vec2 uv=vUv;
  if(uWarp>0.){float w=uWarp;uv.y-=w*(.45+.55*(.5+.5*sin(uv.x*13.+uTime*2.3)))*1.15;uv.x+=w*.04*sin(uv.y*9.+uTime*3.);if(uv.y<0.)a=0.;}
  if(a<=.002)discard;
  vec3 c;if(uMode<.5||uMode>1.5){vec4 tx=texture(uTex,mix(uUvR.xy,uUvR.zw,clamp(uv,0.,1.)));a*=tx.a;if(a<=.002)discard;c=tx.rgb/max(tx.a,.001);
    if(uMode>1.5){float sp=uMetal.x,ds=uMetal.y;float bd=uv.y*1.4+.22*sin(uv.x*6.+uTime*sp*1.7)+ds*.25*sin(uv.y*13.+uv.x*5.-uTime*sp*2.3);float f=fract(bd-uTime*sp*.12);vec3 ch=mix(vec3(.08,.08,.09),vec3(.98),smoothstep(.15,.5,f)*(1.-smoothstep(.62,.95,f)));ch+=vec3(.25,.05,-.05)*smoothstep(.45,.5,f)*(1.-smoothstep(.5,.56,f));c=ch*mix(vec3(1.),uColor,.45);}}
  else c=uColor;
  if(uDither>0.){bool inL=uLens.z>0.&&distance(gl_FragCoord.xy,uLens.xy)<uLens.z;if(!inL){vec2 cell=floor(gl_FragCoord.xy/uDither);float l=dot(c,vec3(.299,.587,.114));c=l>bay(cell)?mix(vec3(.94,.93,.9),c,.12):mix(vec3(.05),c,.1);}}
  if(uGray>0.)c=mix(c,vec3(dot(c,vec3(.299,.587,.114))),uGray);
  c=mix(c,uFadeColor,uFade);c+=glow;float al=a*uOpacity;o=vec4(c*al,al);
}`;
const VS_FS=`#version 300 es
layout(location=0) in vec2 aPos;void main(){gl_Position=vec4(aPos*2.,0.,1.);}`;
const FS_FS=`#version 300 es
precision highp float;out vec4 o;uniform vec2 uRes;uniform float uMode,uTime,uBgType,uNoise,uRefr,uDisp,uGrain,uVig,uAng,uPhase,uMeshDist;uniform vec3 uC1,uC2,uC3,uC4,uLens;uniform sampler2D uScene,uOver;
uniform float uFilter,uFOrig,uDxOn,uDxMode,uDxOp,uDxExp,uDxMask;uniform vec4 uF1,uF2,uDxUv;uniform vec3 uFC1,uFC2;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vn(p);p*=2.03;a*=.5;}return v;}
float bayer(vec2 p,float n){p=mod(floor(p),n);float v=0.,w=n*n/4.,k=1.;for(int i=0;i<3;i++){if(k>=n)break;vec2 b=mod(floor(p/k),2.);v+=w*(b.x>.5?(b.y>.5?1.:2.):(b.y>.5?3.:0.));w*=.25;k*=2.;}return (v+.5)/(n*n);}
vec3 scene(vec2 p){return texture(uScene,clamp(p,vec2(.5),uRes-.5)/uRes).rgb;}
float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
vec3 blend(vec3 a,vec3 b,float m){if(m<.5)return 1.-(1.-a)*(1.-b);if(m<1.5)return a*b;if(m<2.5)return mix(2.*a*b,1.-2.*(1.-a)*(1.-b),step(.5,a));if(m<3.5)return max(a,b);return abs(a-b);}
void main(){vec2 fc=gl_FragCoord.xy,uv=fc/uRes;float asp=uRes.x/uRes.y;
  if(uMode<.5){vec3 c;if(uBgType<.5)c=uC1;else if(uBgType<1.5){vec2 dr=vec2(cos(uAng),-sin(uAng));float tt=dot((uv-.5)*vec2(asp,1.),dr)/(abs(dr.x)*asp+abs(dr.y))+.5;c=mix(uC1,uC2,clamp(tt,0.,1.));}
    else if(uBgType<2.5){float d=length((uv-vec2(.5,.55))*vec2(asp,1.));c=mix(uC1,uC2,smoothstep(0.,.95,d));}
    else{vec2 p=(uv-.5)*vec2(asp,1.);float ph=uPhase;p+=uMeshDist*.35*vec2(sin(p.y*3.1+ph)+.5*sin(p.y*5.3-ph*2.),cos(p.x*2.7-ph)+.5*cos(p.x*4.9+ph*2.));
      vec2 q1=vec2(.55*cos(ph)-.25,.32*sin(ph)),q2=vec2(.45*cos(ph+2.1)+.3,.35*sin(ph*2.+1.)),q3=vec2(.5*cos(-ph+4.2),.3*sin(ph+3.)+.15),q4=vec2(.6*sin(ph*2.+.7),-.3*cos(ph+.5));
      float w1=1./(.02+dot(p-q1,p-q1)),w2=1./(.02+dot(p-q2,p-q2)),w3=1./(.02+dot(p-q3,p-q3)),w4=1./(.02+dot(p-q4,p-q4));w1*=w1;w2*=w2;w3*=w3;w4*=w4;c=(uC1*w1+uC2*w2+uC3*w3+uC4*w4)/(w1+w2+w3+w4);}
    c+=(h(fc)-.5)*uNoise*.06;o=vec4(c,1.);return;}
  vec2 p=fc;float F=uFilter;vec3 lightAdd=vec3(0.);float lightMul=1.;
  if(F>.5&&F<1.5){float a=uF1.y,w=mix(10.,140.,uF1.x)*uRes.y/720.;vec2 dr=vec2(cos(a),sin(a)),pr=vec2(-dr.y,dr.x);float s=dot(p-uRes*.5,dr)/w+uF1.w,f=fract(s);float off=(f-.5)*w*uF1.z*1.7;p-=dr*off;lightMul=1.-uF2.x*.7*smoothstep(.55,1.,f);lightAdd=vec3(uF2.x*.45*exp(-pow(f-.22,2.)/.004));}
  else if(F>4.5&&F<5.5){vec2 c0=uRes*.5,d=(p-c0)/length(uRes*.5);float r2=dot(d,d),k=uF1.x*.45;vec2 base=c0+d*(1.+k*r2)*length(uRes*.5);float ch=uF1.y*.04*r2;
    vec3 col=vec3(scene(c0+d*(1.+k*r2+ch)*length(uRes*.5)).r,scene(base).g,scene(c0+d*(1.+k*r2-ch)*length(uRes*.5)).b);o=vec4(col*(1.-uVig*dot(uv-.5,uv-.5)*1.7)+(h(fc+uTime*61.3)-.5)*uGrain*.11,1.);return;}
  else if(F>3.5&&F<4.5){float sd=uF2.x;vec2 n=vec2(fbm(uv*vec2(asp,1.)*9.+sd)-.5,fbm(uv*vec2(asp,1.)*9.+sd+7.)-.5);p+=n*uF1.y*uRes.y*.012;float sh=0.;for(int i=0;i<8;i++){if(float(i)>=uF1.x)break;float an=h(vec2(float(i),sd))*3.14159,px=h(vec2(sd,float(i)+3.));vec2 dr=vec2(cos(an),sin(an));float dd=dot(uv*vec2(asp,1.)-vec2(px*asp,h(vec2(float(i)+9.,sd))),dr);sh+=(step(0.,dd)-.5)*.13+exp(-abs(dd)*70.)*.22-exp(-abs(dd+.005)*120.)*.2;}
    vec2 e2=vec2(1.5/uRes.y,0.);float w0=fbm(uv*vec2(asp,1.)*22.+sd*3.),wx=fbm((uv+e2.xy)*vec2(asp,1.)*22.+sd*3.)-w0,wy=fbm((uv+e2.yx)*vec2(asp,1.)*22.+sd*3.)-w0;float wr=clamp((wx-wy)*uRes.y*.022,-.35,.35);lightMul=1.+sh+wr*uF1.y;lightAdd=vec3((h(fc*.7)-.5)*uF1.z*.08);}
  else if(F>5.5&&F<6.5){float row=floor(fc.y/2.),j=(vn(vec2(row*.05,uTime*3.))-.5)*uF1.x*uRes.x*.012;float band=step(.985,vn(vec2(fc.y*.01+uTime*.7,uTime)));p.x+=j+band*uF1.x*uRes.x*.04;}
  else if(F>6.5&&F<7.5){float st=floor(uTime*8.),by=floor(fc.y/(uRes.y*.045)),hb=h(vec2(by,st+uF2.x));if(hb>1.-uF1.x*.35)p.x+=(h(vec2(st,by))-.5)*uRes.x*.18*uF1.x;}
  vec3 base=scene(p),c=base;
  if(F>6.5&&F<7.5||F>5.5&&F<6.5){float s=uF1.x*uRes.x*.004;c=vec3(scene(p+vec2(s,0)).r,base.g,scene(p-vec2(s,0)).b);}
  if(uLens.z>0.){vec2 d=fc-uLens.xy;float r=length(d)/uLens.z;
    if(r<1.){float z=sqrt(1.-r*r),m=1.-uRefr*.5*z;float k=uDisp*.09*(1.-z)+uDisp*.02;
      vec3 lc=vec3(scene(uLens.xy+d*m*(1.+k)).r,scene(uLens.xy+d*m).g,scene(uLens.xy+d*m*(1.-k)).b);
      lc*=.96+.08*z;lc+=pow(r,9.)*.4;vec2 sp=d/uLens.z-vec2(-.33,.38);lc+=exp(-dot(sp,sp)*28.)*.55;c=mix(c,lc,smoothstep(1.,.985,r));}
    else{c*=1.-exp(-(r-1.)*7.)*.22;}}
  if(uDxOn>.5){vec2 du=mix(uDxUv.xy,uDxUv.zw,vec2(uv.x,1.-uv.y));vec3 ov=texture(uOver,du).rgb*uDxExp;float m=uDxOp;if(uDxMask>.5&&uDxMask<1.5)m*=smoothstep(.15,.75,length((uv-.5)*vec2(asp,1.)));else if(uDxMask>1.5)m*=uv.x;c=mix(c,blend(c,ov,uDxMode),m);}
  c=c*lightMul+lightAdd;
  if(F>1.5&&F<2.5){float cs=max(1.,uF1.x);vec2 cell=floor(fc/cs);vec3 s=scene((cell+.5)*cs);float th=bayer(cell,uF1.y)-.5+uF1.z;
    if(uFOrig>.5){float n=max(1.,uF1.w);c=floor(s*n+th+.5)/n;}else c=lum(s)+th>.5?uFC2:uFC1;}
  else if(F>2.5&&F<3.5){float cs=max(3.,uF1.x),a=uF1.y;vec2 dr=vec2(cos(a),sin(a)),pr=vec2(-dr.y,dr.x);vec2 q=vec2(dot(fc,dr),dot(fc,pr))/cs,ce=floor(q)+.5;vec2 wc=(ce.x*dr+ce.y*pr)*cs;vec3 s=scene(wc);float l=clamp((lum(s)-.5)*(1.+uF1.z*2.)+.5,0.,1.);
    float rad=.72*sqrt(1.-l),d=length(q-ce),cov=1.-smoothstep(rad-.06,rad+.06,d);c=uFOrig>.5?mix(vec3(1.),s,cov):mix(uFC1,uFC2,cov);}
  else if(F>5.5&&F<6.5){c=mix(c,vec3(lum(c)),.25)*vec3(1.05,.98,.92);c*=.86+.14*step(.5,fract(fc.y/3.));c+=(h(fc+uTime*91.)-.5)*.08;}
  else if(F>6.5&&F<7.5){c*=.9+.1*step(.5,fract(fc.y/2.));}
  c+=(h(fc+uTime*61.3)-.5)*uGrain*.11;vec2 qv=uv-.5;c*=1.-uVig*dot(qv,qv)*1.7;o=vec4(c,1.);}`;

class VEngine{
  constructor(){
    this.cv=document.createElement('canvas');const gl=this.gl=this.cv.getContext('webgl2',{alpha:false,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:true});
    if(!gl)throw new Error('Prohlížeč nepodporuje WebGL2, bez kterého se video nevykreslí.');
    this.pc=this.prog(VS_CARD,FS_CARD);this.pf=this.prog(VS_FS,FS_FS);
    this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    this.U={};for(const [p,k] of [[this.pc,'c'],[this.pf,'f']]){const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);this.U[k]={};for(let i=0;i<n;i++){const u=gl.getActiveUniform(p,i);this.U[k][u.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,u.name);}}
    this.tex=new Map();this.fbo=gl.createFramebuffer();this.ftex=gl.createTexture();this.W=0;this.H=0;this.frameNo=0;
    this.under=document.createElement('canvas');this.utex=gl.createTexture();
  }
  prog(vs,fs){const gl=this.gl,p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
  setSize(W,H){if(W===this.W&&H===this.H)return;const gl=this.gl;this.W=this.cv.width=W;this.H=this.cv.height=H;gl.bindTexture(gl.TEXTURE_2D,this.ftex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.ftex,0);this.under.width=W;this.under.height=H;}
  upload(t,src,mip){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);}
  texFor(item){let e=this.tex.get(item);const gl=this.gl;if(!e){e={t:gl.createTexture(),f:-1};this.tex.set(item,e);this.upload(e.t,item.el,item.kind!=='video');e.f=this.frameNo;}else if(item.kind==='video'&&e.f!==this.frameNo&&item.el.readyState>=2){this.upload(e.t,item.el,false);e.f=this.frameNo;}return e.t;}
  forget(item){const e=this.tex.get(item);if(e){this.gl.deleteTexture(e.t);this.tex.delete(item);}}
  render(S,out){
    const gl=this.gl,{W,H}=S;this.setSize(W,H);this.frameNo++;const c=S.c,U=this.U.c,F=this.U.f;
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,null);gl.disable(gl.BLEND);gl.useProgram(this.pf);gl.uniform1f(F.uMode,0);gl.uniform2f(F.uRes,W,H);gl.uniform3fv(F.uC1,hexF(c.bg1));gl.uniform3fv(F.uC2,hexF(c.bg2));const bg=bgSpec(c);gl.uniform3fv(F.uC1,bg.c1);gl.uniform3fv(F.uC2,bg.c2);gl.uniform1f(F.uAng,bg.ang);gl.uniform1f(F.uBgType,bg.type);if(bg.type===3){gl.uniform3fv(F.uC3,bg.c3);gl.uniform3fv(F.uC4,bg.c4);gl.uniform1f(F.uPhase,TAU*(S.phase||0)*Math.round(c.meshSpeed||0));gl.uniform1f(F.uMeshDist,c.meshDist??0.5);}gl.uniform1f(F.uNoise,c.grain);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(this.pc);
    const D=H*(S.persp||1.6),Pm=M4.mul(M4.P(2*Math.atan(H/2/D),W/H,Math.max(1,D*0.02),D*20),M4.mul(M4.S(1,-1,1),M4.T(0,0,-D)));
    const lens=S.lens?[W/2+S.lens.x,H/2-S.lens.y,S.lens.r]:[0,0,0],bgc=hexF(c.bg1),radius=c.radius*S.u;
    gl.uniform3fv(U.uLens,lens);gl.uniform1f(U.uTime,S.t);gl.uniform1i(U.uTex,0);gl.activeTexture(gl.TEXTURE0);
    const list=[],G=S.group||null,ST=S.style||null;
    if(c.bgType==='image'&&c.bgImage)list.push({item:c.bgImage,model:M4.S(W,H),w:W,h:H,uv:fitUV(c.bgImage,W,H,'crop').uv,layer:-1000,radius:0,opacity:1,z:0,fade:c.bgDim||0,fadeColor:'#000000'});
    if(S.under.length){const x=this.under.getContext('2d');x.clearRect(0,0,W,H);for(const f of S.under)f(x,S);this.upload(this.utex,this.under,false);list.push({tex:this.utex,model:M4.S(W,H),w:W,h:H,uv:[0,0,1,1],layer:-100,radius:0,opacity:1,z:0});}
    for(const o of S.cards){
      if(o.item&&!o.uv){const f=fitUV(o.item,o.w,o.h,o.fit||'crop');o.w=f.w;o.h=f.h;o.uv=f.uv;}
      if(o.uv&&o.flipX)o.uv=[o.uv[2],o.uv[1],o.uv[0],o.uv[3]];
      if(o.uv&&o.flipY)o.uv=[o.uv[0],o.uv[3],o.uv[2],o.uv[1]];
      const sc=o.s??1,w=o.w*sc,h=o.h*sc;
      let model=o.m?M4.mul(o.m,M4.S(w,h)):M4.chain(M4.T(o.x||0,o.y||0,o.z||0),M4.RZ(o.rz||0),M4.RY(o.ry||0),M4.RX(o.rx||0),M4.S(w,h));if(G&&!o.abs)model=M4.mul(G,model);
      const r=o.radius!=null?o.radius*S.u:ST&&ST.radius!=null?ST.radius/100*min2(w,h):radius;
      if(ST&&ST.shadow&&!o.color&&!o.noShadow&&(o.opacity??1)>0.02){const sh=ST.shadow,ms=min2(W,H)/100,sx=1+2*sh.spread*ms/w,sy=1+2*sh.spread*ms/h;list.push({color:hexF(sh.color),model:M4.chain(M4.T(sh.x*ms,sh.y*ms,0),model,M4.S(Math.max(.1,sx),Math.max(.1,sy))),w:w*sx,h:h*sy,radius:r,soft:sh.blur*ms*0.6,opacity:sh.op/100*(o.opacity??1),layer:o.layer||0,order:o.order!=null?o.order-0.001:undefined,z:model[14]-0.5});}
      if(o.shadow>0)list.push({color:[0,0,0],model:M4.chain(M4.T(0,h*0.05,0),model,M4.S(1.04,1.05)),w:w*1.04,h:h*1.05,radius:r+min2(w,h)*0.06,soft:min2(w,h)*0.07,opacity:o.shadow*(o.opacity??1),layer:o.layer||0,z:model[14]-0.5});
      list.push(Object.assign({},o,{model,w,h,radius:r,z:model[14]}));
    }
    if(c.device&&c.device!=='none'){const add=[];for(const o of list){if(!o.item||o.noShadow||o.noDevice||o.abs||o.layer||o.color)continue;const mn=min2(o.w,o.h),b=mn*0.035,phone=c.device==='phone',tb=phone?0:o.h*0.08,sx=(o.w+2*b)/o.w,sy=(o.h+2*b+tb)/o.h,col=hexF(c.deviceColor),z=o.z,ord=o.order;
        if(phone)o.radius=c.screenRadius/100*mn;
        add.push({color:col,model:M4.chain(o.model,M4.T(0,-tb/2/o.h,0),M4.S(sx,sy)),w:o.w*sx,h:o.h*sy,radius:(phone?c.screenRadius/100*mn:mn*0.02)+b,opacity:o.opacity,fade:o.fade,layer:o.layer,order:ord!=null?ord-0.002:undefined,z:z-0.3});
        if(phone)add.push({color:col,model:M4.chain(o.model,M4.T(0,-0.5+0.035,0),M4.S(0.28,0.04)),w:o.w*0.28,h:o.h*0.04,radius:o.h,opacity:o.opacity,fade:o.fade,layer:o.layer,order:ord!=null?ord+0.002:undefined,z:z+0.3});
        else{const dh=tb*0.36;[[0xff5f57],[0xfebc2e],[0x28c840]].forEach(([hx],i)=>add.push({color:[(hx>>16&255)/255,(hx>>8&255)/255,(hx&255)/255],model:M4.chain(o.model,M4.T((-o.w/2+b*1.2+dh*(0.6+i*1.6))/o.w,(-o.h/2-tb/2)/o.h,0),M4.S(dh/o.w,dh/o.h)),w:dh,h:dh,radius:dh,opacity:o.opacity,layer:o.layer,order:ord!=null?ord+0.002:undefined,z:z+0.3}));}}
      list.push(...add);}
    if(c.logo&&c.logo.el){const L=c.logo,lw=c.logoSize/100*W,lh=lw*L.h/L.w,m=Math.min(W,H)*0.05,pos=c.logoPos||'br',x=pos==='c'?0:pos[1]==='l'?-W/2+m+lw/2:W/2-m-lw/2,y=pos==='c'?0:pos[0]==='t'?-H/2+m+lh/2:H/2-m-lh/2;
      list.push({item:L,model:M4.chain(M4.T(x,y,0),M4.S(lw,lh)),w:lw,h:lh,uv:[0,0,1,1],radius:0,layer:1000,z:0,metal:c.logoStyle==='metal',metalColor:c.logoTint,opacity:1});}
    list.sort((a,b)=>(a.layer||0)-(b.layer||0)||(a.order??a.z)-(b.order??b.z));
    for(const o of list){
      if((o.opacity??1)<=0.002)continue;
      gl.uniformMatrix4fv(U.uMVP,false,M4.mul(Pm,o.model));gl.uniform2f(U.uSize,o.w,o.h);gl.uniform1f(U.uRadius,Math.max(0,o.radius||0));gl.uniform1f(U.uSoft,o.soft||0);gl.uniform1f(U.uOpacity,o.opacity??1);
      gl.uniform1f(U.uFade,o.fade||0);gl.uniform3fv(U.uFadeColor,o.fadeColor?hexF(o.fadeColor):bgc);gl.uniform1f(U.uDither,o.dither||0);gl.uniform1f(U.uWarp,o.warp||0);gl.uniform1f(U.uGray,o.gray||0);gl.uniform2f(U.uMask,o.mask?o.mask[0]:0,o.mask?o.mask[1]:0);gl.uniform1f(U.uMaskA,o.mask&&o.mask[2]||0);gl.uniform1f(U.uMaskG,o.mask&&o.mask[3]||0);
      if(o.metal){gl.uniform1f(U.uMode,2);gl.uniform3fv(U.uColor,hexF(o.metalColor||'#ffffff'));gl.uniform2f(U.uMetal,c.logoSpeed??1,0.6);gl.bindTexture(gl.TEXTURE_2D,this.texFor(o.item));gl.uniform4fv(U.uUvR,o.uv);}
      else if(o.color){gl.uniform1f(U.uMode,1);gl.uniform3fv(U.uColor,typeof o.color==='string'?hexF(o.color):o.color);}
      else{gl.uniform1f(U.uMode,0);gl.bindTexture(gl.TEXTURE_2D,o.tex||this.texFor(o.item));gl.uniform4fv(U.uUvR,o.uv);}
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.disable(gl.BLEND);gl.useProgram(this.pf);gl.bindTexture(gl.TEXTURE_2D,this.ftex);
    gl.uniform1f(F.uMode,1);gl.uniform1i(F.uScene,0);gl.uniform2f(F.uRes,W,H);gl.uniform3fv(F.uLens,lens);gl.uniform1f(F.uRefr,S.lens?S.lens.refr:0);gl.uniform1f(F.uDisp,S.lens?S.lens.disp:0);gl.uniform1f(F.uGrain,c.grain);gl.uniform1f(F.uVig,c.vignette);gl.uniform1f(F.uTime,S.t);
    const FL={none:0,fluted:1,dither:2,halftone:3,paper:4,lens:5,vhs:6,glitch:7}[c.filter||'none']||0,f4=(a,b,cc,d)=>gl.uniform4f(F.uF1,a,b,cc,d);gl.uniform1f(F.uFilter,FL);gl.uniform4f(F.uF2,0,0,0,0);
    const ps=Math.min(W,H)/1080;
    if(FL===1){f4(c.flSize,c.flAngle*D2R,c.flDistort,c.flShift);gl.uniform4f(F.uF2,c.flLight,0,0,0);}
    else if(FL===2){f4(Math.max(1,Math.round(c.diCell*ps)),+c.diType,c.diBias,c.diSteps);gl.uniform1f(F.uFOrig,c.diOrig?1:0);gl.uniform3fv(F.uFC1,hexF(c.fBack));gl.uniform3fv(F.uFC2,hexF(c.fFront));}
    else if(FL===3){f4(c.htCell*ps,c.htAngle*D2R,c.htContrast,0);gl.uniform1f(F.uFOrig,c.htOrig?1:0);gl.uniform3fv(F.uFC1,hexF(c.fBack));gl.uniform3fv(F.uFC2,hexF(c.fFront));}
    else if(FL===4){f4(c.paFolds,c.paCrumple,c.paGrain,0);gl.uniform4f(F.uF2,c.paSeed,0,0,0);}
    else if(FL===5){f4(c.leAmount,c.leChroma,0,0);}
    else if(FL===6||FL===7){f4(c.glAmount,0,0,0);gl.uniform4f(F.uF2,c.glSeed||0,0,0,0);}
    const dx=c.dxOn&&S.items.length?S.items[((Math.round(c.dxItem)-1)%S.items.length+S.items.length)%S.items.length]:null;gl.uniform1f(F.uDxOn,dx?1:0);
    if(dx){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.texFor(dx));gl.uniform1i(F.uOver,1);const fu=fitUV(dx,W,H,'crop').uv,dr=(c.dxDrift||0)*0.06*Math.sin(TAU*(S.phase||0)),sc=1-(c.dxDrift||0)*0.05;const cx=(fu[0]+fu[2])/2+dr*(fu[2]-fu[0]),cy=(fu[1]+fu[3])/2,hw=(fu[2]-fu[0])/2*sc,hh=(fu[3]-fu[1])/2*sc;gl.uniform4f(F.uDxUv,cx-hw,cy-hh,cx+hw,cy+hh);
      gl.uniform1f(F.uDxMode,{screen:0,multiply:1,overlay:2,lighten:3,difference:4}[c.dxMode]||0);gl.uniform1f(F.uDxOp,c.dxOpacity);gl.uniform1f(F.uDxExp,c.dxExposure);gl.uniform1f(F.uDxMask,{none:0,radial:1,linear:2}[c.dxMask]||0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.ftex);}
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(out.width!==W||out.height!==H){out.width=W;out.height=H;}
    const x=out.getContext('2d');x.drawImage(this.cv,0,0);for(const f of S.over){x.save();f(x,S);x.restore();}
  }
}
const min2=(a,b)=>a<b?a:b;
const GRADS={dusk:[135,'#2b1055','#7597de'],ember:[135,'#2a0a06','#f0603a'],mint:[150,'#0c3b3a','#86e3c5'],grape:[135,'#250a3a','#a65fe0'],peach:[160,'#f49c84','#ffe3c8'],slate:[180,'#2a3038','#11151a'],halo:['r','#3c3c56','#0b0b10']};
function bgSpec(c){if(c.bgType==='mesh')return{type:3,c1:hexF(c.mesh1),c2:hexF(c.mesh2),c3:hexF(c.mesh3),c4:hexF(c.mesh4),ang:0};if(c.bgType==='gradient'){let g=GRADS[c.gradient];if(c.gradient==='custom'||!g)g=[c.gradRadial?'r':c.gradAngle,c.grad1,c.grad2];return g[0]==='r'?{type:2,c1:hexF(g[1]),c2:hexF(g[2]),ang:0}:{type:1,c1:hexF(g[1]),c2:hexF(g[2]),ang:g[0]*D2R};}if(c.bgType==='radial')return{type:2,c1:hexF(c.bg1),c2:hexF(c.bg2),ang:0};if(c.bgType==='linear')return{type:1,c1:hexF(c.bg1),c2:hexF(c.bg2),ang:Math.PI/2};return{type:0,c1:hexF(c.bg1),c2:hexF(c.bg1),ang:0};}
function xf(m,x,y,z){return[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];}

// ================= Video: scene helpers =================
function makeScene(W,H,t,items,p,c){const S={W,H,u:Math.min(W,H)/1080,t,items,p,c,cards:[],over:[],under:[],lens:null,persp:1.6};S.card=o=>{S.cards.push(o);return o;};S.text=f=>S.over.push(f);S.bgDraw=f=>S.under.push(f);S.I=k=>items[((k%items.length)+items.length)%items.length];return S;}
function grid(n,W,H,margin,gap,aspect=4/3){let best=null;for(let cols=1;cols<=n;cols++){const rows=Math.ceil(n/cols),cw=(W-2*margin-gap*(cols-1))/cols,ch=(H-2*margin-gap*(rows-1))/rows,w=Math.min(cw,ch*aspect),h=w/aspect;if(!best||w*h>best.w*best.h)best={cols,rows,w,h,cw,ch};}
  const g=best,tw=g.cols*g.w+(g.cols-1)*gap,th=g.rows*g.h+(g.rows-1)*gap;g.pos=i=>{const r=Math.floor(i/g.cols),cIdx=i%g.cols,inRow=Math.min(g.cols,n-r*g.cols),rw=inRow*g.w+(inRow-1)*gap;return[-rw/2+g.w/2+cIdx*(g.w+gap),-th/2+g.h/2+r*(g.h+gap)];};return g;}
function seq(t,intro,seg,n){const tt=t-intro;if(tt<0)return{i:-1,f:tt};const i=Math.floor(tt/seg);return{i,f:tt-i*seg,end:i>=n};}
function fontOf(S){return VFONTS[S.c.font]||VFONTS.display;}
function drawLabel(x,S,item,alpha,opt={}){
  if(!S.c.showLabels||!item||alpha<=0.01)return;const {W,H,u}=S,m=60*u;x.globalAlpha=alpha;x.fillStyle=S.c.textColor;x.textBaseline='alphabetic';x.textAlign=opt.align||'left';
  const px=opt.x!=null?opt.x:(opt.align==='center'?W/2:m),py=opt.y!=null?opt.y:H-m;
  x.font=`600 ${Math.round(46*u)}px ${fontOf(S)}`;x.fillText(item.name||'',px,py-32*u);
  if(item.type){x.font=`500 ${Math.round(19*u)}px ${VFONTS.mono}`;x.globalAlpha=alpha*0.72;x.fillText(item.type.toUpperCase(),px,py);}
  x.globalAlpha=1;
}
function drawChrome(x,S,idx){
  const {W,u}=S,m=60*u;x.fillStyle=S.c.textColor;x.textBaseline='top';x.font=`500 ${Math.round(19*u)}px ${VFONTS.mono}`;
  if(S.c.brandText){x.globalAlpha=0.85;x.textAlign='left';x.fillText(S.c.brandText.toUpperCase(),m,m);}
  if(idx!=null&&S.c.showLabels){x.globalAlpha=0.6;x.textAlign='right';x.fillText(`${String(idx+1).padStart(2,'0')} / ${String(S.items.length).padStart(2,'0')}`,W-m,m);}
  x.globalAlpha=1;x.textAlign='left';
}
