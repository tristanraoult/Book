import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export async function createCans(container){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,60);camera.position.set(0,2.25,10);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();const env=pmrem.fromScene(room,.01);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff,0xdde5e0,.55));const key=new THREE.DirectionalLight(0xfff8ee,2.8);key.position.set(-3,5,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffe9c7,1.1);rim.position.set(4,2.5,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xd9e6ff,.5);fill.position.set(2,1,6);scene.add(fill);
 const points=[[-1.51,.515],[-1.48,.55],[-1.42,.58],[-1.30,.59],[1.26,.59],[1.38,.58],[1.47,.54],[1.50,.535]].map(([y,r])=>new THREE.Vector2(r,y));const bodyGeometry=new THREE.LatheGeometry(points,72);
 const pos=bodyGeometry.attributes.position,uv=bodyGeometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setY(i,THREE.MathUtils.clamp((pos.getY(i)+1.43)/2.86,0,1));
 const metal=new THREE.MeshStandardMaterial({color:0xc9d4d0,metalness:.92,roughness:.2,envMapIntensity:1.2}),darkMetal=new THREE.MeshStandardMaterial({color:0x8b9997,metalness:.85,roughness:.32,envMapIntensity:1.1}),purple=new THREE.MeshStandardMaterial({color:0x59467b,metalness:.48,roughness:.24,envMapIntensity:1});
 // Albedo deprojected from the six original renders; original files remain untouched.
 const maps=await Promise.all([2,3,1].map(n=>new THREE.TextureLoader().loadAsync(`assets/albedo-${n}.webp`)));const cans=[];
 const ringGeo=new THREE.TorusGeometry(.543,.028,8,64),lidGeo=new THREE.CylinderGeometry(.521,.521,.023,64),baseGeo=new THREE.CylinderGeometry(.51,.50,.037,48);
 for(let i=0;i<3;i++){
  const g=new THREE.Group();const tex=maps[i];tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;tex.offset.x=.5;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const mat=new THREE.MeshPhysicalMaterial({map:tex,metalness:.4,roughness:.24,envMapIntensity:1.2,clearcoat:1,clearcoatRoughness:.07});g.add(new THREE.Mesh(bodyGeometry,mat));
  for(const y of [1.51,-1.51]){const rim=new THREE.Mesh(ringGeo,metal);rim.rotation.x=Math.PI/2;rim.position.y=y;g.add(rim);}
  const lid=new THREE.Mesh(lidGeo,metal);lid.position.y=1.507;g.add(lid);const base=new THREE.Mesh(baseGeo,darkMetal);base.position.y=-1.505;g.add(base);
  const inset=new THREE.Mesh(new THREE.TorusGeometry(.46,.012,6,56),darkMetal);inset.rotation.x=Math.PI/2;inset.position.y=1.524;g.add(inset);
  const tabShape=new THREE.Shape();tabShape.absellipse(0,0,.12,.23,0,Math.PI*2,false,0);const hole=new THREE.Path();hole.absellipse(0,.08,.06,.08,0,Math.PI*2,true,0);tabShape.holes.push(hole);const tab=new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape,{depth:.018,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.01,bevelThickness:.01,curveSegments:16}),purple);tab.rotation.x=-Math.PI/2;tab.position.set(0,1.54,0);g.add(tab);
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),metal);rivet.position.set(0,1.565,.07);g.add(rivet);
  g.position.x=(i-1)*1.6;scene.add(g);cans.push(g);
 }
 function resize(){const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;const framing=Math.max(1,(width<=600?1.2:1.42)/camera.aspect);camera.position.set(0,1.85*framing,8.2*framing);camera.lookAt(0,0,0);camera.updateProjectionMatrix();}
 function render(angle=0,progress=0){for(let i=0;i<cans.length;i++){const g=cans[i];g.rotation.y=angle+(i-1)*.1;g.rotation.z=(i-1)*(-.055+.025*Math.sin(progress*Math.PI));g.position.x=(i-1)*(1.6+.12*Math.sin(progress*Math.PI));g.position.y=i===1?.05:-.07;}renderer.render(scene,camera);container.dataset.angle=angle.toFixed(4);container.dataset.triangles=renderer.info.render.triangles;container.dataset.drawCalls=renderer.info.render.calls;}
 resize();container.append(renderer.domElement);container.dataset.ready='true';render();return {resize,render,dispose(){renderer.dispose();env.dispose();maps.forEach(t=>t.dispose());}};
}
