import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { prepareFocus } from '../focus-model.js';
import { createFocusWorld, PHYSICS_STEP } from '../focus-world.js';

const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
// The same progress value gives the same path in both scroll directions.
export function doorPose(p,mobile,aspect){
 const t=smooth(.1,.95,p);return {x:(mobile?0:.6)*t,y:.45-.4*t,z:-.8*t,scale:1-.08*t,rotation:.12+.62*t,tilt:-.45*t,opacity:1};
}
export async function createFocusController({container,stage,getState,wake,onFirstGrab}){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 const canvas=renderer.domElement;container.append(canvas);canvas.tabIndex=0;
 canvas.setAttribute('aria-label','Focus interactif : saisir le pendentif et relâcher. Flèches gauche et droite pour le balancer.');
 canvas.style.touchAction='pan-y pinch-zoom';container.style.pointerEvents='auto';
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,150),root=new THREE.Group();scene.add(root);
 const room=new RoomEnvironment();const softbox=new THREE.Mesh(new THREE.PlaneGeometry(5,7),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));softbox.position.set(-2,1,5);softbox.lookAt(0,0,0);room.add(softbox);const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xeee8ff,0x190925,1.5));
 for(const [color,intensity,x,y,z] of [[0xffffff,3,-2,3,3],[0xb291ff,2,2,1,-1],[0x7046ff,1.8,-2,0,-1]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light);}
 const gltf=await new GLTFLoader().loadAsync('../sources/Focus_web_lossless.glb');
 const {parts,scale}=prepareFocus(gltf.scene),sim=createFocusWorld(parts,scale);
 for(const p of parts)root.add(p.group);
 // The old study had a floor; this header suspends Focus in open space.
 const floor=sim.world.bodies.find(b=>b.shapes.some(s=>s.constructor.name==='Plane'));if(floor)floor.position.y=-8;
 const pendant=parts[8].group,raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),plane=new THREE.Plane(),point=new THREE.Vector3();
 let hoverX=0,hoverY=0;let held=false,pending=null,active=-1,pathProgress=getState().progress,opacity=1,firstGrab=false,lastDiagnostics=0,aspect=1,lastCost=0;
 const projected=new THREE.Vector3();
 function interactive(){const s=getState();return !s.reduced&&!s.staticMode&&s.showModel&&opacity>.2;}
 function ray(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);root.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);}
 function hit(e){if(!interactive())return null;ray(e);return raycaster.intersectObject(pendant,true)[0]||null;}
 function begin(e,intersection){held=true;active=e.pointerId;pending=null;plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,0,1),intersection.point);const local=root.worldToLocal(intersection.point.clone());sim.grab(local.toArray());canvas.setPointerCapture(active);canvas.style.cursor='grabbing';canvas.dataset.held='true';if(!firstGrab){firstGrab=true;onFirstGrab();}wake();}
 function release(){pending=null;if(!held)return;held=false;sim.release();const id=active;active=-1;if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);canvas.style.cursor='grab';canvas.dataset.held='false';wake();}
 function down(e){if(e.button!==0||held||pending)return;const intersection=hit(e);if(!intersection)return;
  if(e.pointerType==='touch'||getState().ratio==='9x16'){pending={id:e.pointerId,x:e.clientX,y:e.clientY,intersection};canvas.dataset.gesture='pending';}
  else begin(e,intersection);
 }
 function move(e){if(!held&&e.pointerType==='mouse'&&!getState().reduced){const b=canvas.getBoundingClientRect();hoverX=(e.clientX-b.left)/b.width-.5;hoverY=(e.clientY-b.top)/b.height-.5;}
  if(pending&&pending.id===e.pointerId){const dx=e.clientX-pending.x,dy=e.clientY-pending.y;
   if(Math.abs(dy)>8&&Math.abs(dy)>=Math.abs(dx)*.85){pending=null;canvas.dataset.gesture='vertical-scroll';return;}
   if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.25){const intersection=pending.intersection;begin(e,intersection);canvas.dataset.gesture='horizontal-grab';}
  }
  if(!held){if(e.pointerType==='mouse')canvas.style.cursor=hit(e)?'grab':'default';return;}
  if(e.pointerId!==active)return;ray(e);
  if(raycaster.ray.intersectPlane(plane,point)){const local=root.worldToLocal(point.clone());sim.move(local.toArray());wake();}
 }
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
 addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 canvas.addEventListener('keydown',e=>{if(!interactive())return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();sim.push(e.key==='ArrowLeft'?-1:1);if(!firstGrab){firstGrab=true;onFirstGrab();}wake();}});
 function resize(){release();const w=stage.clientWidth,h=stage.clientHeight;aspect=w/h;camera.aspect=aspect;const span=Math.max(5.9,4.1/aspect);camera.position.set(0,0,span/(2*Math.tan(THREE.MathUtils.degToRad(37/2))));camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(w,h);wake();}
 function tick(dt,now){const s=getState();if(s.staticMode||!s.showModel){release();container.style.opacity='0';container.style.pointerEvents='none';renderer.clear();return false;}
  if(s.reduced)pathProgress=s.progress;else if(!held)pathProgress+=(s.progress-pathProgress)*(1-Math.exp(-dt*4.5));
  const pose=doorPose(pathProgress,s.ratio==='9x16',aspect);opacity=pose.opacity;
  root.position.set(pose.x,pose.y,pose.z);root.scale.setScalar(pose.scale);root.rotation.set(getState().reduced?0:hoverY*.025,pose.rotation+(getState().reduced?0:hoverX*.04),pose.tilt||0);
  container.style.opacity=String(opacity);container.style.pointerEvents=opacity>.2?'auto':'none';
  const start=performance.now();
  if(opacity>.001&&!document.hidden){if(!s.reduced)sim.world.step(PHYSICS_STEP,dt,9);for(let i=0;i<parts.length;i++){parts[i].group.position.copy(sim.bodies[i].position);parts[i].group.quaternion.copy(sim.bodies[i].quaternion);}renderer.render(scene,camera);}
  lastCost=performance.now()-start;
  if(now-lastDiagnostics>100){lastDiagnostics=now;root.updateMatrixWorld(true);pendant.getWorldPosition(projected).project(camera);const rect=canvas.getBoundingClientRect();canvas.dataset.focusState=JSON.stringify({held,gesture:canvas.dataset.gesture||'idle',progress:s.progress,pathProgress,opacity,scale:pose.scale,z:pose.z,links:7,jointError:sim.maxJointError(),speed:sim.bodies[8].velocity.length(),angularSpeed:sim.bodies[8].angularVelocity.length(),pendant:sim.bodies[8].position.toArray(),linkPositions:sim.bodies.slice(1,8).map(b=>b.position.toArray()),renderMs:lastCost,screen:{x:rect.left+(projected.x+1)*rect.width/2,y:rect.top+(1-projected.y)*rect.height/2}});}
  return opacity>.001||Math.abs(s.progress-pathProgress)>.0001;
 }
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();container.dispatchEvent(new Event('focusfailed'));});
 resize();if(!getState().reduced)sim.push(.2);
 return {tick,resize,release,get held(){return held;},get opacity(){return opacity;},get ready(){return true;}};
}
