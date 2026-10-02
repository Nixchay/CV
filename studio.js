import * as THREE from 'three';
import {RoomEnvironment} from './assets/RoomEnvironment.js';

export async function initStudio(options){
 const host=document.querySelector('#studio-canvas');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#ece3d4');scene.fog=new THREE.Fog('#ece3d4',23,46);scene.environmentIntensity=.65;
 const pmrem=new THREE.PMREMGenerator(renderer);const environment=new RoomEnvironment();scene.environment=pmrem.fromScene(environment,.06).texture;environment.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(42,1,.1,80);
 const studio=new THREE.Group();scene.add(studio);

 function grainTexture(type){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=type==='wood'?'#978066':'#e5d8bf';ctx.fillRect(0,0,512,512);let seed=91;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<6000;i++){const a=rand()*.065;ctx.fillStyle=rand()>.5?'rgba(75,59,39,'+a+')':'rgba(255,255,255,'+a+')';const x=rand()*512,y=rand()*512;ctx.fillRect(x,y,type==='wood'?1:rand()*5,type==='wood'?20+rand()*120:rand()*3);}
  if(type!=='wood'){for(let i=0;i<16;i++){ctx.beginPath();ctx.moveTo(-50,rand()*512);ctx.bezierCurveTo(120,rand()*512,300,rand()*512,560,rand()*512);ctx.strokeStyle='rgba(128,105,69,.045)';ctx.lineWidth=rand()*4;ctx.stroke();}}
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(type==='wood'?3:2,2);return texture;}
 const plaster=new THREE.MeshStandardMaterial({color:'#d2c3ac',roughness:.92});
 const stone=new THREE.MeshStandardMaterial({map:grainTexture('stone'),roughness:.48,color:'#dac8a8'});
 const wood=new THREE.MeshStandardMaterial({map:grainTexture('wood'),roughness:.75,color:'#d0bfa5'});
 const charcoal=new THREE.MeshStandardMaterial({color:'#292a26',roughness:.6});
 const gold=new THREE.MeshPhysicalMaterial({color:'#bda06a',metalness:1,roughness:.2,clearcoat:.45,clearcoatRoughness:.12});
 const linen=new THREE.MeshStandardMaterial({color:'#d6c5a7',roughness:1});
 function box(w,h,d,x,y,z,material=plaster,parent=studio){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function cylinder(r,h,x,y,z,material=stone,r2=r,parent=studio){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r2,h,48),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function roundedBox(w,h,d,material){const r=Math.min(w,h)*.12,shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:12});g.translate(0,0,-d/2);const m=new THREE.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;studio.add(m);return m;}
 box(12,.16,9,0,-.1,0,stone);
 box(12,5.5,.2,0,2.65,-4.2);
 // The fourth wall stays open so the scrolling camera can enter the studio.
 // Open architectural windows bring light into the studio.
 box(.25,5.5,1,-6,2.65,-3.7);box(.25,5.5,1,-6,2.65,3.7);box(.25,.4,7,-6,5.15,0);box(.25,.5,7,-6,.2,0);
 for(const z of [-2.2,0,2.2]){box(.22,4.7,.11,-6,2.65,z,wood);box(.32,.1,7,-6,1.55,0,wood);}
 const daylight=new THREE.MeshBasicMaterial({color:'#ffefd2'});const windowPanel=box(.1,4.6,6.8,-6.15,2.7,0,daylight);windowPanel.castShadow=false;
 box(11.9,.07,.05,0,.12,-4.05,wood);box(.05,.07,8.5,5.85,.12,0,wood);
 // Architectural details create depth at close camera distances.
 const jointMat=new THREE.MeshStandardMaterial({color:'#b8a78b',roughness:.8});
 for(let x=-6;x<=6;x+=3)box(.008,.005,9,x,.003,0,jointMat);
 for(let z=-4.5;z<=4.5;z+=3)box(12,.005,.008,0,.003,z,jointMat);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(1.72,.023,10,96,Math.PI),gold);arch.position.set(1.25,2.48,-4.065);studio.add(arch);
 box(.045,2.45,.06,-.47,1.24,-4.06,gold);box(.045,2.45,.06,2.97,1.24,-4.06,gold);
 // Travertine pedestal and a continuous gold sculptural loop.
 box(1.9,1.15,1.75,-2.8,.575,.7,stone);
 const sculpture=new THREE.Group();sculpture.position.set(-2.8,2.42,.7);studio.add(sculpture);
 const knot=new THREE.Mesh(new THREE.TorusKnotGeometry(.82,.14,220,28,2,3),gold);knot.rotation.set(.65,.2,.3);knot.castShadow=true;sculpture.add(knot);
 const orbitRings=[];for(let i=0;i<2;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.22+i*.17,.012,8,128),gold);ring.rotation.set(Math.PI*.35+i*.6,i*.7,.35);sculpture.add(ring);orbitRings.push(ring);}
 cylinder(.45,.06,-2.8,1.2,.7,gold);
 // Curved desk, column legs, monitor, keyboard and speakers.
 const desktop=roundedBox(4.8,1.9,.15,stone);desktop.rotation.x=-Math.PI/2;desktop.position.set(1.35,1.65,-2.2);
 cylinder(.5,1.55,-.15,.775,-2.2,stone);cylinder(.5,1.55,2.85,.775,-2.2,stone);
 const monitor=roundedBox(2.1,1.26,.09,charcoal);monitor.position.set(1.25,2.45,-2.55);
 const artCanvas=document.createElement('canvas');artCanvas.width=768;artCanvas.height=432;const art=artCanvas.getContext('2d');const artTexture=new THREE.CanvasTexture(artCanvas);artTexture.colorSpace=THREE.SRGBColorSpace;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.94,1.09),new THREE.MeshBasicMaterial({map:artTexture}));screen.position.set(1.25,2.46,-2.44);studio.add(screen);
 box(.1,.36,.12,1.25,1.87,-2.55,charcoal);box(.6,.05,.35,1.25,1.705,-2.5,charcoal);
 const keyboard=roundedBox(1.15,.36,.03,charcoal);keyboard.rotation.x=-Math.PI/2;keyboard.position.set(1.25,1.76,-1.85);
 for(let x=0;x<12;x++)for(let z=0;z<3;z++)box(.065,.01,.062,.79+x*.078,1.784,-1.93+z*.075,linen);
 for(const x of [-.35,3.05]){box(.31,.5,.31,x,1.99,-2.52,charcoal);const speaker=new THREE.Mesh(new THREE.CircleGeometry(.09,32),new THREE.MeshStandardMaterial({color:'#44433d',metalness:.3,roughness:.6}));speaker.position.set(x,2,-2.356);studio.add(speaker);}
 // Desk chair with softly rounded upholstery and a brass base.
 const seat=roundedBox(.85,.8,.13,linen);seat.rotation.x=-Math.PI/2;seat.position.set(1.45,.9,-.6);
 const back=roundedBox(.83,.85,.13,linen);back.position.set(1.45,1.45,-.14);back.rotation.x=-.12;
 cylinder(.04,.7,1.45,.5,-.6,gold);
 for(let i=0;i<5;i++){const angle=i/5*Math.PI*2;const arm=box(.06,.06,.68,1.45+Math.sin(angle)*.24,.15,-.6+Math.cos(angle)*.24,gold);arm.rotation.y=angle;const wheel=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),charcoal);wheel.position.set(1.45+Math.sin(angle)*.56,.1,-.6+Math.cos(angle)*.56);studio.add(wheel);}
 // Framed actual project posters and shelves.
 const textureLoader=new THREE.TextureLoader();
 function poster(index,x,y,w,h){box(w+.13,h+.13,.08,x,y,-4.02,charcoal);box(w+.04,h+.04,.09,x,y,-3.97,linen);const material=new THREE.MeshBasicMaterial({color:'#c0ac8d'});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.position.set(x,y,-3.91);studio.add(mesh);const p=options.projects[index];if(p)textureLoader.load(p.poster,t=>{t.colorSpace=THREE.SRGBColorSpace;material.map=t;material.color.set('#ffffff');material.needsUpdate=true;});return mesh;}
 poster(0,4.05,3.45,1.85,1.1);poster(1,4.05,1.95,1.85,1.1);
 for(const y of [2.4,3.5,4.6])box(2.05,.09,.45,-3.3,y,-3.85,wood);
 const bookColors=['#827258','#b39a71','#c7b99f','#574f42','#d7c6aa'];
 for(let i=0;i<7;i++){box(.1+((i%3)*.035),.37+i%3*.08,.27,-4+i*.21,2.63,-3.8,new THREE.MeshStandardMaterial({color:bookColors[i%5],roughness:.8}));}
 for(let i=0;i<3;i++)box(.55,.06,.34,-3.6,3.59+i*.063,-3.82,new THREE.MeshStandardMaterial({color:bookColors[i],roughness:.9}));
 cylinder(.15,.34,-2.8,3.71,-3.84,new THREE.MeshStandardMaterial({color:'#98866c',roughness:.6}),.1);
 const vaseMat=new THREE.MeshStandardMaterial({color:'#c7b697',roughness:.6});cylinder(.2,.45,-3.6,4.86,-3.83,vaseMat,.12);
 // Sculpture-side rug, tiny table and warm lamp.
 const rug=new THREE.Mesh(new THREE.CircleGeometry(1.7,64),new THREE.MeshStandardMaterial({color:'#cabda6',roughness:1}));rug.rotation.x=-Math.PI/2;rug.position.set(-2.8,.003,.7);rug.scale.x=1.2;studio.add(rug);
 cylinder(.45,.07,3.9,1.05,-.65,wood);cylinder(.05,1,3.9,.5,-.65,gold);cylinder(.3,.04,3.9,.03,-.65,gold);
 const lamp=new THREE.Mesh(new THREE.SphereGeometry(.22,32,24),new THREE.MeshStandardMaterial({color:'#ffefd7',emissive:'#efc887',emissiveIntensity:.5,roughness:.8}));lamp.position.set(3.9,1.45,-.65);studio.add(lamp);cylinder(.03,.22,3.9,1.19,-.65,gold);
 const lampLight=new THREE.PointLight('#ffddb0',3,4);lampLight.position.set(3.9,1.55,-.65);scene.add(lampLight);
 // A tall indoor tree, shaped leaf by leaf.
 cylinder(.35,.62,4.9,.31,-3.3,vaseMat,.23);const branchMat=new THREE.MeshStandardMaterial({color:'#78684f',roughness:1});cylinder(.035,2.1,4.9,1.5,-3.3,branchMat,.055);
 const leafMat=new THREE.MeshStandardMaterial({color:'#6d7450',roughness:.85,side:THREE.DoubleSide});
 for(let i=0;i<35;i++){const a=i*2.4,rad=.24+(i%5)*.095,y=1.25+i/35*1.65;const leaf=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),leafMat);leaf.scale.set(1.8,.22,.75);leaf.position.set(4.9+Math.cos(a)*rad,y,-3.3+Math.sin(a)*rad);leaf.rotation.set(i*.7,a,.3);leaf.castShadow=true;studio.add(leaf);}
 // Window light is directional; the window frames cast the actual shadows.
 scene.add(new THREE.HemisphereLight('#fff8ea','#786247',.7));
 const sun=new THREE.DirectionalLight('#fff0d5',2.8);sun.position.set(-7,8,4);sun.target.position.set(1,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(window.innerWidth<600?1024:2048,window.innerWidth<600?1024:2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.1,far:30});sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.radius=3;scene.add(sun,sun.target);
 const fill=new THREE.DirectionalLight('#fff9ef',.65);fill.position.set(4,5,5);scene.add(fill);
 // Contact shadows anchor the room furnishings without a heavy post-processing pipeline.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sh=shadowCanvas.getContext('2d');const gradient=sh.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,'rgba(41,30,15,.32)');gradient.addColorStop(1,'rgba(41,30,15,0)');sh.fillStyle=gradient;sh.fillRect(0,0,128,128);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
 for(const [x,z,s] of [[-2.8,.7,2],[1.4,-2,3],[1.45,-.6,1.2],[4.9,-3.3,1]]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.015,z);studio.add(mesh);}

 const nodes=[
  {p:new THREE.Vector3(7.5,4.1,9.8),t:new THREE.Vector3(-2.1,1.95,0)},
  {p:new THREE.Vector3(2.1,2.85,5.7),t:new THREE.Vector3(-3.35,2.2,.6)},
  {p:new THREE.Vector3(-.6,4.8,4.6),t:new THREE.Vector3(-3.15,1.9,.3)},
  {p:new THREE.Vector3(-.65,2.8,4.4),t:new THREE.Vector3(-1.4,2.35,-2.4)},
  {p:new THREE.Vector3(1.25,3.35,1.8),t:new THREE.Vector3(.8,2.8,-3.9)},
  {p:new THREE.Vector3(5.5,3.2,6.2),t:new THREE.Vector3(-.6,1.9,-1.2)},
  {p:new THREE.Vector3(7.5,4.7,10.4),t:new THREE.Vector3(-1.3,2,-.7)}
 ];
 const cameraPath=new THREE.CatmullRomCurve3(nodes.map(n=>n.p),false,'catmullrom',.25);
 const lookPath=new THREE.CatmullRomCurve3(nodes.map(n=>n.t),false,'catmullrom',.25);
 let progress=options.initialProgress||0,smooth=progress,paused=options.paused,reduced=options.reduced,active=true,time=0,last=performance.now(),size={w:0,h:0};const target=new THREE.Vector3();
 const hotspot=document.querySelector('#studio-hotspot');
 window.addEventListener('studio-scroll',e=>{progress=e.detail.progress;active=window.scrollY<document.querySelector('.journey').offsetHeight;});
 window.addEventListener('studio-motion',e=>{paused=e.detail.paused;reduced=e.detail.reduced;});
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(w!==size.w||h!==size.h){size={w,h};renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}}
 function const screenImage = new Image();
screenImage.src = './assets/pc-screen.jpg';

function paintArt(t) {
  if (!screenImage.complete || !screenImage.naturalWidth) return;

  art.drawImage(screenImage, 0, 0, 768, 432);
  artTexture.needsUpdate = true;
}
 function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.06);last=now;if(document.hidden||!active)return;
  if(!paused&&!reduced)time+=dt;smooth=reduced?0:smooth+(progress-smooth)*(1-Math.exp(-dt*6));
  const mobile=window.innerWidth<=600;host.style.left='0';resize();
  cameraPath.getPoint(Math.min(smooth,1),camera.position);lookPath.getPoint(Math.min(smooth,1),target);
  if(mobile){camera.position.y+=1.35;camera.position.z+=3.8;target.y+=1.35;camera.fov=48;}else{camera.fov=41;}
  camera.updateProjectionMatrix();camera.lookAt(target);knot.rotation.y=.2+time*.07+smooth*Math.PI*2;knot.rotation.z=.3+Math.sin(time*.35+smooth*5)*.12;
  orbitRings.forEach((ring,i)=>{ring.rotation.y=i*.7+smooth*Math.PI+time*.035;ring.scale.setScalar(1+Math.sin(smooth*Math.PI)*.12);});
  paintArt(time);renderer.render(scene,camera);
  const v=screen.position.clone().project(camera);const rect=host.getBoundingClientRect();hotspot.style.left=(rect.left+(v.x*.5+.5)*rect.width)+'px';hotspot.style.top=((-v.y*.5+.5)*rect.height)+'px';
  const visible=smooth>.5&&smooth<.7&&!reduced&&v.z<1&&v.x>-.15&&v.x<1&&v.y>-1&&v.y<1;hotspot.style.opacity=visible?'1':'0';hotspot.style.pointerEvents=visible?'auto':'none';hotspot.tabIndex=visible?0:-1;hotspot.setAttribute('aria-hidden',String(!visible));
  host.dataset.progress=smooth.toFixed(3);host.dataset.camera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');host.dataset.rendered='true';
 }
 resize();requestAnimationFrame(animate);
 renderer.domElement.addEventListener('webglcontextlost',()=>{document.body.classList.add('no-webgl');active=false;});
}
