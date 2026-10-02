import * as THREE from 'three';
import {RoomEnvironment} from './assets/RoomEnvironment.js';

export function initMotionLab(options){
 const host=document.querySelector('#lab-canvas'),section=document.querySelector('#motion-lab');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;host.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#171915');scene.fog=new THREE.Fog('#171915',13,30);
 const camera=new THREE.PerspectiveCamera(40,1,.1,50);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.05).texture;scene.environmentIntensity=1.3;room.dispose();pmrem.dispose();
 const group=new THREE.Group();group.position.set(1.2,.2,0);scene.add(group);
 // A continuous twisted ribbon, built as geometry rather than a flat background.
 const positions=[],normals=[],uvs=[],indices=[],uCount=220,vCount=22;
 for(let i=0;i<=uCount;i++){const u=i/uCount*Math.PI*2;for(let j=0;j<=vCount;j++){const v=(j/vCount-.5)*.88;const twist=u*1.5;const radius=1.85+v*Math.cos(twist);positions.push(radius*Math.cos(u),radius*Math.sin(u),v*Math.sin(twist));uvs.push(i/uCount,j/vCount);}}
 for(let i=0;i<uCount;i++)for(let j=0;j<vCount;j++){const a=i*(vCount+1)+j,b=a+vCount+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const gold=new THREE.MeshPhysicalMaterial({color:'#cfaf77',metalness:1,roughness:.18,clearcoat:.8,side:THREE.DoubleSide});
 const ribbon=new THREE.Mesh(geometry,gold);ribbon.rotation.set(.45,.6,-.3);group.add(ribbon);
 const orbits=[];
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.45+i*.35,.009,6,160),new THREE.MeshStandardMaterial({color:'#a49471',metalness:.8,roughness:.3}));ring.rotation.set(.3+i*.85,i*.62,.4);group.add(ring);orbits.push(ring);}
 const satellites=[];for(let i=0;i<7;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(i===0?.38:.08+(i%3)*.055,32,24),i%2?new THREE.MeshStandardMaterial({color:'#e2d8c1',roughness:.3,metalness:.2}):gold);group.add(mesh);satellites.push(mesh);}
 const floor=new THREE.Mesh(new THREE.CircleGeometry(9,80),new THREE.MeshStandardMaterial({color:'#22241e',roughness:.58,metalness:.2}));floor.rotation.x=-Math.PI/2;floor.position.y=-3;scene.add(floor);
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(181,139,73,.28)');gradient.addColorStop(1,'rgba(181,139,73,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const glow=new THREE.Mesh(new THREE.PlaneGeometry(10,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(glowCanvas),transparent:true,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.set(1.2,-2.98,0);scene.add(glow);
 scene.add(new THREE.HemisphereLight('#f7e6bd','#151917',1));const key=new THREE.DirectionalLight('#fff1d1',3);key.position.set(2,4,5);scene.add(key);const rim=new THREE.DirectionalLight('#c59a52',4);rim.position.set(-3,2,-4);scene.add(rim);
 let visible=false,paused=options.paused,reduced=options.reduced,time=0,last=performance.now(),smooth=0,w=0,h=0;
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'});observer.observe(section);
 window.addEventListener('studio-motion',e=>{paused=e.detail.paused;reduced=e.detail.reduced;});
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.06);last=now;if(!visible||document.hidden)return;
  if(!paused&&!reduced)time+=dt;
  const rect=section.getBoundingClientRect(),progress=reduced?0:THREE.MathUtils.clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight),0,1);smooth+=(progress-smooth)*(1-Math.exp(-dt*8));
  if(w!==host.clientWidth||h!==host.clientHeight){w=host.clientWidth;h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const mobile=innerWidth<600;camera.position.set(Math.sin(smooth*Math.PI*1.1)*3,.6+smooth*1.8,(mobile?15:10.5)-Math.sin(smooth*Math.PI)*3.3);camera.lookAt(mobile?.9:-.9,mobile?1.1:.25,0);
  ribbon.rotation.set(.45+smooth*.8,.6+smooth*Math.PI*1.8+time*.1,-.3+smooth*.4);
  group.scale.setScalar(1+Math.sin(smooth*Math.PI)*.18);
  orbits.forEach((ring,i)=>{ring.rotation.y=i*.62+smooth*2+time*.025;});
  satellites.forEach((mesh,i)=>{const angle=i/satellites.length*Math.PI*2+time*.1+smooth*3;const radius=2.7+Math.sin(smooth*Math.PI)*(i%2?.7:0);mesh.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius*.65,Math.sin(angle+i)*1.25);});
  renderer.render(scene,camera);host.dataset.progress=smooth.toFixed(3);host.dataset.camera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');host.dataset.rendered='true';document.querySelector('#lab-phase').textContent=smooth<.34?'01 / COMPOSITION':smooth<.7?'02 / TRANSFORMATION':'03 / PERSPECTIVE';
 }
 requestAnimationFrame(frame);
 renderer.domElement.addEventListener('webglcontextlost',()=>{visible=false;document.body.classList.add('no-lab');});
}
