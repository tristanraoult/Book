import { createFocusController } from './focus-controller.js';

const $=id=>document.getElementById(id),stage=$('stage'),journey=$('journey'),still=$('still');
const videos=[$('reveal'),$('enter')], mq=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
let ratio='',progress=0,staticMode=mq.matches,controller,frame=0,lastFrame=0;
let hasModel=false,videoError=false,firstInteraction=false;
$('staticMode').checked=staticMode;
function status(){ $('loadStatus').textContent=staticMode?'Affichage fixe : aucune vidéo ni animation.':videoError?'Vidéo indisponible : décor fixe affiché.':hasModel&&videos.every(v=>v.readyState>=2)?'Prêt · vidéos en pause, pilotées par le scroll.':'Chargement du décor et de Focus…'; }
function pickRatio(){return $('format').value==='mobile'||($('format').value==='auto'&&innerWidth<700)?'9x16':'16x9';}
function configure(){
 const next=pickRatio();document.body.classList.toggle('is-static',staticMode);
 stage.classList.toggle('mobile-preview',$('format').value==='mobile'&&innerWidth>=700);
 $('pointerHint').textContent=firstInteraction?'':(coarse.matches||next==='9x16'?'Faites défiler pour entrer dans le studio.':'Attrapez Focus · maintenez et relâchez.');
 if(next!==ratio||staticMode){ratio=next;for(let i=0;i<2;i++){const v=videos[i];v.pause();v.style.opacity=0;if(staticMode){v.removeAttribute('src');v.load();}else{v.src=`${i?'02_Entree_vers_atelier':'01_Revelation_entree'}_${ratio}.mp4`;v.load();}}}
 else if(!videos[0].getAttribute('src'))for(let i=0;i<2;i++){videos[i].src=`${i?'02_Entree_vers_atelier':'01_Revelation_entree'}_${ratio}.mp4`;videos[i].load();}
 still.src=`sources/${staticMode?'03_Atelier':'00_Fond_depart_vide'}_${ratio}.png`;
 resize();updateScroll();status();requestFrame();
}
function updateScroll(){const rect=journey.getBoundingClientRect();progress=clamp(-rect.top/Math.max(1,journey.offsetHeight-stage.clientHeight));requestFrame();}
function seek(v,t){if(v.readyState<2||!Number.isFinite(v.duration)||v.seeking)return;const desired=clamp(t,0,Math.max(0,v.duration-1/30));if(Math.abs(v.currentTime-desired)>1/60)v.currentTime=desired;}
function requestFrame(){if(!frame)frame=requestAnimationFrame(render);}
function render(now){
 frame=0;const dt=Math.min((now-lastFrame)/1000,.05)||.016;lastFrame=now;
 if(staticMode){controller?.tick(dt,now);return;}
 const p=progress,first=p<=.52,local=first?p/.52:(p-.52)/.48;
 const v=videos[first?0:1];seek(v,local*5);if(!first)seek(videos[0],5);
 videos[0].style.opacity=first&&!videoError&&videos[0].dataset.loaded==='yes'?1:0;
 videos[1].style.opacity=!first&&!videoError&&videos[1].dataset.loaded==='yes'?1:0;
 if(videoError)still.src=`sources/${first?'02_Entree':'03_Atelier'}_${ratio}.png`;
 const animateFocus=controller?.tick(dt,now);
 $('intro').style.opacity=1-smooth(.03,.20,p);$('intro').inert=p>.2;$('arrival').style.opacity=smooth(.34,.46,p)*(1-smooth(.56,.66,p));
 $('chapter').textContent=first?'01 / Révélation':'02 / Entrer dans le studio';$('progress').textContent=`${Math.round(p*100)} %`;$('progressBar').style.width=`${p*100}%`;
 $('diagnostics').textContent=`${ratio} · ${v.currentTime.toFixed(2)} / 5 s · ${v.paused?'pause':'lecture'} · Focus ${controller?.held?'dans la main':controller?.opacity>.01?'vers la porte':'dans l’ombre'}`;
 if(animateFocus&&!document.hidden)requestFrame();
}
function resize(){controller?.resize();}
async function initModel(){try{controller=await createFocusController({container:$('model'),stage,getState:()=>({progress,ratio,staticMode,showModel:$('showModel').checked}),wake:requestFrame,onFirstGrab:()=>{firstInteraction=true;$('pointerHint').textContent='';$('mobile-focus-hint').classList.add('used');}});hasModel=true;status();requestFrame();}catch(error){$('loadStatus').textContent='Le rendu 3D est indisponible sur ce navigateur.';console.error(error);}}
for(const v of videos){v.addEventListener('emptied',()=>{v.dataset.loaded='no';});v.addEventListener('loadeddata',()=>{v.dataset.loaded='yes';videoError=false;status();requestFrame();});v.addEventListener('seeked',requestFrame);v.addEventListener('error',()=>{if(v.getAttribute('src')){videoError=true;status();requestFrame();}});v.addEventListener('play',()=>v.pause());}
addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',configure);
$('format').addEventListener('change',configure);$('showModel').addEventListener('change',requestFrame);
$('staticMode').addEventListener('change',()=>{staticMode=$('staticMode').checked;configure();});mq.addEventListener('change',()=>{staticMode=mq.matches;$('staticMode').checked=staticMode;configure();});
for(const id of ['restart','again'])$(id).addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:'instant'});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestFrame();});
configure();initModel();
