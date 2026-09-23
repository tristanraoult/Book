// Original logo and outer contours stay intact. Only eye interiors are painted;
// identical circular black pupils are explicitly requested in the latest brief.
const reduce=matchMedia('(prefers-reduced-motion:reduce)');
const apertures=[{x:916,y:431,r:143.5},{x:1256,y:431,r:143.5}];
const eyes=[];let frame=0;
// Rest pose measured from assets/sticker.png: pupils sit right/down from the
// eye centre, edge touching the black ring. Same direction as the sticker,
// pushed out to the same clamp `paint()` uses so it just reaches the ring.
function rest(e){const hero=!!e.logo.closest('.hero, .finale'),radius=hero?82:78;
 const limit=(hero?60:143.5-radius-2)-1,ux=.7172,uy=.6967;
 return{x:limit*ux,y:limit*uy};}
function mask(ctx,eye){ctx.beginPath();ctx.arc(eye.x,eye.y,eye.r,0,Math.PI*2);ctx.clip();}
function paint(e){
 const ctx=e.canvas.getContext('2d');ctx.clearRect(0,0,2300,1520);
 ctx.drawImage(e.base,0,0);
 apertures.forEach(eye=>{
  // No sticker rim: black surround, white interior and unchanged moving pupil.
  // The existing logo supplies the outer silhouette; paint only inside it.
  const hero=!!e.logo.closest('.hero, .finale'),radius=hero?82:78;
  if(hero){ctx.beginPath();ctx.arc(eye.x,eye.y,181,0,Math.PI*2);ctx.fillStyle='#090909';ctx.fill();}
  const interior=hero?{...eye,r:130}:eye;
  const limit=hero?60:eye.r-radius-2,ratio=Math.min(1,limit/Math.max(1,Math.hypot(e.x,e.y)));
  ctx.save();mask(ctx,interior);ctx.fillStyle='#fafafa';ctx.fillRect(eye.x-eye.r,eye.y-eye.r,eye.r*2,eye.r*2);
  ctx.beginPath();ctx.arc(eye.x+e.x*ratio,eye.y+e.y*ratio,radius,0,Math.PI*2);ctx.fillStyle='#090909';ctx.fill();ctx.restore();
 });
}
function tick(){frame=0;let moving=false;
 for(const e of eyes){if(!e.visible)continue;
  e.x+=(e.tx-e.x)*.16;e.y+=(e.ty-e.y)*.16;
  if(Math.abs(e.tx-e.x)+Math.abs(e.ty-e.y)<.025){e.x=e.tx;e.y=e.ty;}else moving=true;
  paint(e);e.logo.dataset.eyeX=e.x.toFixed(3);e.logo.dataset.eyeY=e.y.toFixed(3);
 }
 if(moving&&!document.hidden&&!reduce.matches)frame=requestAnimationFrame(tick);
}
function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick);}
function neutral(immediate=false){for(const e of eyes){const p=rest(e);e.tx=p.x;e.ty=p.y;if(immediate){e.x=p.x;e.y=p.y;paint(e);e.logo.dataset.eyeX=e.x;e.logo.dataset.eyeY=e.y;}}if(!immediate)wake();}
const observer=new IntersectionObserver(entries=>{for(const entry of entries){const e=eyes.find(e=>e.logo===entry.target);if(!e)continue;e.visible=entry.isIntersecting;if(!e.visible){const p=rest(e);e.x=e.tx=p.x;e.y=e.ty=p.y;paint(e);}}});
document.querySelectorAll('.live-logo').forEach(async logo=>{
 const image=logo.querySelector('img'),canvas=logo.querySelector('canvas');
 try{await image.decode();}catch{return;}
 let base=image;
 if(logo.closest('.hero, .finale')){
  base=document.createElement('canvas');base.width=2300;base.height=1520;
  const ink=base.getContext('2d');ink.drawImage(image,0,0);ink.globalCompositeOperation='source-in';ink.fillStyle='#090909';ink.fillRect(0,0,2300,1520);
 }
 const e={logo,image,base,canvas,x:0,y:0,tx:0,ty:0,visible:false};const p=rest(e);e.x=e.tx=p.x;e.y=e.ty=p.y;eyes.push(e);paint(e);logo.classList.add('eye-ready');observer.observe(logo);
});
function follow(event){if(reduce.matches)return;
 for(const e of eyes){if(!e.visible)continue;
  const r=e.logo.getBoundingClientRect(),scale=Math.min(r.width/2300,r.height/1520);
  const ox=r.left+(r.width-2300*scale)/2,oy=r.top+(r.height-1520*scale)/2;
  const dx=(event.clientX-ox-1086*scale)/Math.max(1,300*scale),dy=(event.clientY-oy-431*scale)/Math.max(1,300*scale),length=Math.max(1,Math.hypot(dx,dy));
  const travel=e.logo.closest('.hero, .finale')?60:48;
  e.tx=travel*dx/length;e.ty=travel*dy/length;
 }wake();
}
addEventListener('pointermove',follow,{passive:true});addEventListener('pointerdown',follow,{passive:true});
addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')neutral();},{passive:true});
addEventListener('pointercancel',()=>neutral(),{passive:true});document.documentElement.addEventListener('pointerleave',()=>neutral());
reduce.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;neutral(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;neutral(true);}});
document.querySelector('#sticker-button').addEventListener('click',event=>{const button=event.currentTarget;button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));});
