import {addObjectEffects} from './atelier-effects.js';
const $=id=>document.getElementById(id),section=$('atelier'),svg=$('room-svg'),win=$('room-window'),dialog=$('room-dialog');
const NS='http://www.w3.org/2000/svg',reduce=matchMedia('(prefers-reduced-motion: reduce)'),touch=matchMedia('(any-pointer: coarse)');
const highResolution=innerWidth<701||innerWidth*devicePixelRatio>2048;
const layerSuffix=highResolution?'':'-2048';
function frameObject(l){if(innerWidth<701){const target=$('mobile-studio').querySelector('.scene-object[data-id="'+l.id+'"]');target?.parentElement.scrollIntoView({block:'center',behavior:reduce.matches?'instant':'smooth'});}}
const project={
 fizzi:{title:'Fizzi',category:'Identité · Packaging',slug:'fizzi',image:'originaux/fizzi-can.png',text:'Une boisson pétillante, une mascotte et trois canettes. Des formes souples et une palette rétro, déclinées du packaging aux supports de communication.'},
 focus:{title:'Focus',category:'Identité · Podcast',slug:'focus',image:'atelier/focus-table.png',text:'L’identité d’un podcast co-créé avec Loli Martinez pour mettre en lumière les parcours créatifs. Un lettrage organique et une paire d’yeux composent sa signature. Le podcast est en développement.'},
 photography:{title:'Photography',category:'Photographie · Direction artistique',slug:'photography',image:'originaux/photography-fair.webp',text:'Des instants, des lumières et des atmosphères. Fête foraine, poses longues et observation : découvrez les séries photographiques personnelles.'},
 gloomy:{title:'Gloomy Graphic',category:'Identité personnelle',slug:'gloomy-graphic',image:'originaux/gloomy-original.webp',text:'Un univers personnel sombre et expressif, porté par un lettrage organique et une paire d’yeux. La carte reprend la vraie identité du projet.'},
 affiches:{title:'Affiches',category:'Composition · Typographie',slug:'affiches',image:'originaux/flowers-original.webp',text:'Flowers, choisie pour ses accents moutarde et son bleu patiné, est présentée dans son intégralité. Retrouvez toutes les affiches et leurs mises en situation.'}
};
let layers=[],loaded=false,loading,active=null,revealed=false,timers=[],lastOpener=null;
const el=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;return n;};
function activate(id){if(id===active)return;if(active)document.querySelectorAll(`.scene-object[data-id="${active}"]`).forEach(n=>n.classList.remove('is-active'));active=id;document.querySelectorAll('.room-index a').forEach(n=>n.classList.toggle('is-active',n.dataset.open===id));svg.dataset.active=id||'';if(id){document.querySelectorAll(`.scene-object[data-id="${id}"]`).forEach(n=>n.classList.add('is-active'));document.querySelectorAll('.room-index a').forEach(n=>n.classList.toggle('is-active',n.dataset.open===id));const l=layers.find(l=>l.id===id);if(l){$('room-hint').textContent=innerWidth<701&&section.dataset.revealing!=='true'?'Touchez les objets pour ouvrir les projets.':`${l.title} · ${l.category}`;}}else $('room-hint').textContent=win.scrollWidth>win.clientWidth+1?'Faites glisser la pièce. Touchez un objet.':touch.matches?'Touchez un objet pour le découvrir.':'Approchez un objet pour le découvrir.';}
function stopReveal(keepActive=false){timers.forEach(clearTimeout);timers=[];if(section.dataset.revealing==='true')win.scrollTo({left:win.scrollLeft,behavior:'instant'});if(!keepActive)activate(null);section.dataset.revealing='false';}
async function load(){if(loaded)return;if(loading)return loading;loading=(async()=>{
 const response=await fetch('atelier/scene.json');if(!response.ok)throw Error('Scene data unavailable');layers=await response.json();
 const defs=el('defs');defs.innerHTML='<radialGradient id="lensSpark"><stop stop-color="#fff9e0" stop-opacity=".85"/><stop offset=".3" stop-color="#ffe5ac" stop-opacity=".4"/><stop offset="1" stop-color="#ffe5ac" stop-opacity="0"/></radialGradient><radialGradient id="crtGlow"><stop stop-color="#c9dfbb" stop-opacity=".72"/><stop offset=".55" stop-color="#68725d" stop-opacity=".4"/><stop offset="1" stop-color="#181d18" stop-opacity=".93"/></radialGradient><pattern id="scanlines" width="4" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H4" stroke="#111" stroke-opacity=".25"/></pattern><clipPath id="crtClip"><path d="M1550 326L1811 335Q1834 432 1808 544L1544 530Q1523 431 1550 326Z"/></clipPath>';
 svg.append(defs);const base=el('image',{href:`atelier/decor-clean-${highResolution?'4096':'2048'}.webp`,width:2048,height:1152});svg.append(base);
 for(const l of layers){
  const a=el('a',{href:project[l.id]?`https://tristanraoult.com/projects/${project[l.id].slug}.html`:'#',role:'button',tabindex:'0','aria-label':l.id==='tv'?'Ouvrir Motion Design et Montage':l.id==='archives'?'Ouvrir la bibliothèque et les archives':`Découvrir ${l.title}`,'data-id':l.id,class:'scene-object',style:`--cx:${l.cx}px;--cy:${l.cy}px`});
  a.append(el('title',{},l.title));
  if(l.id!=='tv')a.append(el('image',{href:`atelier/${l.id}${layerSuffix}.webp`,width:2048,height:1152,class:'object-pixels'}));
  else {const light=el('g',{class:'tv-light','clip-path':'url(#crtClip)'});light.append(el('rect',{x:1525,y:319,width:315,height:235,fill:'url(#crtGlow)'}),el('rect',{x:1525,y:319,width:315,height:235,fill:'url(#scanlines)'}),el('text',{x:1675,y:412,'text-anchor':'middle',fill:'#e5dfb9','font-size':19,'font-family':'monospace'},'MOTION'),el('text',{x:1675,y:444,'text-anchor':'middle',fill:'#e5dfb9','font-size':19,'font-family':'monospace'},'MONTAGE'),el('text',{x:1675,y:480,'text-anchor':'middle',fill:'#b7b5a0','font-size':12,'font-family':'monospace'},'02 CHAÎNES'));a.append(light);}
  addObjectEffects(a,l.id,el);
  const hitPaths={fizzi:'M966 612Q992 601 1020 612L1022 750Q992 766 964 750L964 623Z',gloomy:'M119 808L267 826L210 882L61 864Z',photography:'M331 484L430 481L435 544L370 552Q360 579 338 576Q317 566 324 534Z',affiches:'M1096 12L1216 0V216L1096 228Z',archives:'M441 176L460 165L513 171L523 272L508 291L442 289Z'};
  a.append(hitPaths[l.id]?el('path',{d:hitPaths[l.id],class:'object-hit'}):el('rect',{x:l.x,y:l.y,width:l.w,height:l.h,rx:5,class:'object-hit'}));
  const label=el('g',{class:'object-label',transform:`translate(${Math.min(1760,Math.max(12,l.cx-108))} ${Math.min(1086,l.y+l.h+16)})`});label.append(el('rect',{width:230,height:44,rx:3}),el('text',{x:13,y:29},l.title));a.append(label);
  a.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&innerWidth>1024&&!touch.matches){stopReveal(true);activate(l.id);}});a.addEventListener('pointerleave',()=>{if(!timers.length&&!dialog.open)activate(null);});a.addEventListener('focus',()=>{stopReveal(true);activate(l.id);});a.addEventListener('blur',()=>{if(!dialog.open)activate(null);});a.addEventListener('click',e=>{e.preventDefault();stopReveal(true);open(l.id,a);});a.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();stopReveal(true);open(l.id,a);}});svg.append(a);
 }
 const urls=[base.getAttribute('href'),...layers.filter(l=>l.id!=='tv').map(l=>`atelier/${l.id}${layerSuffix}.webp`)];await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>reject(Error(`Image unavailable: ${src}`));im.src=src;})));
 buildMobileStudio();svg.style.visibility='visible';$('room-fallback').style.visibility='hidden';loaded=true;section.dataset.loaded='true';activate(null);
 })().catch(error=>{console.error(error);$('room-hint').textContent='Explorez les projets avec les liens sous la scène.';});return loading;}
async function reveal(manual=false){
 await load();if(!loaded)return;
 if(reduce.matches){section.dataset.revealed='reduced';$('room-announcement').textContent='Sept objets sont accessibles dans la scène et dans les liens qui la suivent.';return;}
 if(revealed&&!manual)return;revealed=true;stopReveal();section.dataset.revealing='true';
 const order=innerWidth<701?['fizzi','focus','photography','gloomy','affiches','tv','archives']:['photography','fizzi','focus','affiches','tv','archives','gloomy'];
 const panLead=innerWidth<701?650:0;
 order.forEach((id,i)=>{
  timers.push(setTimeout(()=>{activate(null);frameObject(layers.find(l=>l.id===id));},i*(innerWidth<701?2500:1900)));
  timers.push(setTimeout(()=>activate(id),i*(innerWidth<701?2500:1900)+panLead));
 });
 timers.push(setTimeout(()=>{stopReveal();section.dataset.revealed='true';$('room-announcement').textContent='La découverte est terminée. Touchez un objet pour ouvrir son projet.';},innerWidth<701?18000:14000));
}
function open(id,opener){if(id==='tv'){location.href='audiovisuel/';return;}if(id==='archives'){activate(id);if(reduce.matches){location.href='archives/';return;}section.classList.add('entering-archives');setTimeout(()=>location.href='archives/',380);return;}if(id==='affiches'){location.href='affiches/';return;}if(id==='photography'){location.href='photography/';return;}if(id==='gloomy'){location.href='gloomy/';return;}if(id==='focus'){location.href='focus/';return;}if(id==='fizzi'){location.href='fizzi/';return;}lastOpener=opener;activate(id);const content=$('detail-content');content.replaceChildren();
 if(project[id]){const p=project[id];content.innerHTML=`<div class="detail-grid"><img class="detail-image ${id}" src="${p.image}" alt="${p.title}"><div class="detail-copy"><p class="room-kicker">${p.category}</p><h3 id="detail-title">${p.title}</h3><p>${p.text}</p><a class="detail-link" href="https://tristanraoult.com/projects/${p.slug}.html" target="_blank" rel="noopener">Voir le projet complet ↗</a></div></div>`;}
 else {const tv=id==='tv',choices=tv?[['Motion Design','motion-design','Animation · Récit'],['Montage','montage','Rythme · Film']]:[['Cours','cours','Recherches & études'],['Stage / Owlblack','stage','Travaux en agence'],['Freelance','freelance','Missions & identités']];content.innerHTML=`<p class="room-kicker">${tv?'LA TÉLÉVISION':'LES ARCHIVES'}</p><h3 id="detail-title">${tv?'Qu’est-ce qu’on regarde ?':'Quelques pages de plus.'}</h3>${choices.map(([title,slug,sub])=>`<a class="choice-link" href="https://tristanraoult.com/projects/${slug}.html" target="_blank" rel="noopener"><span>${title} ↗</span><small>${sub}</small></a>`).join('')}`;}
 dialog.showModal();$('close-detail').focus();section.dataset.open=id;
}
dialog.addEventListener('close',()=>{section.dataset.open='';activate(null);lastOpener?.focus();});$('close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();stopReveal(true);open(a.dataset.open,a);}));
$('reveal-objects').addEventListener('click',()=>reveal(true));$('zoom-room').addEventListener('click',()=>{stopReveal();if(innerWidth<701){const overview=win.classList.toggle('is-overview');$('zoom-room').setAttribute('aria-pressed',overview);$('zoom-room').textContent=overview?'Explorer la pièce +':'Vue d’ensemble −';win.scrollLeft=overview?0:($('room-canvas').clientWidth-win.clientWidth)/2;}else{const zoom=win.classList.toggle('is-zoomed');$('zoom-room').setAttribute('aria-pressed',zoom);$('zoom-room').textContent=zoom?'Vue d’ensemble −':'Se rapprocher +';if(!zoom)win.scrollLeft=0;}});
win.addEventListener('pointerdown',()=>{if(timers.length)stopReveal();},{passive:true});
win.addEventListener('wheel',()=>{if(timers.length)stopReveal();},{passive:true});
new IntersectionObserver(entries=>{if(entries[0].isIntersecting)load();},{rootMargin:'600px'}).observe(section);
new IntersectionObserver(entries=>{const inView=entries[0].isIntersecting;document.body.classList.toggle('at-atelier',inView);if(inView&&innerWidth>=701&&(touch.matches||innerWidth<1025))reveal();else if(!inView)stopReveal();},{threshold:.25}).observe(win);
reduce.addEventListener('change',()=>{if(reduce.matches)stopReveal();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopReveal();});


addEventListener('pageshow',()=>section.classList.remove('entering-archives'));

// V16: original scene and object layers, framed into a vertical mobile visit.
function buildMobileStudio(){
 const mobile=$('mobile-studio');
 const frame=el('svg',{viewBox:'0 0 941 1672',class:'portrait-room','aria-label':'Studio en portrait : sept objets ouvrent les projets'});
 const defs=svg.querySelector('defs').cloneNode(true);frame.append(defs);
 defs.querySelectorAll('[id]').forEach(n=>{const old=n.id;n.id='portrait-'+old;});
 frame.append(el('image',{href:'atelier/studio-portrait.webp',width:941,height:1672}));
 const placements={fizzi:[320,970,1.28],focus:[535,1110,1.2],photography:[290,805,1],gloomy:[25,919,.88],affiches:[570,175,1.18],archives:[52,352,.82],tv:[528,548,.7]};
 for(const l of layers){
  const [x,y,scale]=placements[l.id],src=svg.querySelector('.scene-object[data-id="'+l.id+'"]');
  const outer=el('a',{href:l.id==='tv'?'audiovisuel/':''+l.id+'/',class:'portrait-link',role:'link','aria-label':'Ouvrir '+l.title});
  const g=el('g',{'data-id':l.id,class:'scene-object',transform:'translate('+x+' '+y+') scale('+scale+') translate('+(-l.x)+' '+(-l.y)+')',style:src.getAttribute('style')});
  for(const n of src.childNodes){if(n.classList?.contains('object-label')||n.classList?.contains('object-hit'))continue;g.append(n.cloneNode(true));}
  g.querySelectorAll('*').forEach(n=>{for(const a of [...n.attributes])if(a.value.includes('url(#'))n.setAttribute(a.name,a.value.replaceAll('url(#','url(#portrait-'));});
  if(l.id!=='tv'){const pixels=g.querySelector('.object-pixels');pixels.setAttribute('href','atelier/'+l.id+'-portrait-object.webp');pixels.setAttribute('x',Math.max(0,l.x-10));pixels.setAttribute('y',Math.max(0,l.y-10));pixels.setAttribute('width',l.w+20);pixels.setAttribute('height',Math.min(1152-Math.max(0,l.y-10),l.h+20));}
  // Original pixels and effects move together; no artwork regeneration or deformation.
  outer.append(g);outer.append(el('rect',{x:x-24,y:y-24,width:Math.max(155,l.w*scale+48),height:Math.max(155,l.h*scale+48),fill:'transparent',class:'portrait-hit'}));
  const badge=el('g',{class:'portrait-marker','aria-hidden':'true',transform:'translate('+(x+l.w*scale+9)+' '+(y+l.h*scale-5)+')'});badge.append(el('circle',{r:20,fill:'#251b12','fill-opacity':'.9',stroke:'#eed0a0','stroke-width':2}),el('text',{'text-anchor':'middle',y:7,fill:'#fff1dc','font-size':20},String(['fizzi','focus','photography','gloomy','affiches','tv','archives'].indexOf(l.id)+1)));outer.append(badge);
  outer.addEventListener('pointerenter',()=>{if(!timers.length)activate(l.id);});outer.addEventListener('focus',()=>activate(l.id));outer.addEventListener('click',e=>{e.preventDefault();stopReveal(true);open(l.id,outer);});frame.append(outer);
 }
 mobile.append(frame);if(innerWidth<701)document.getElementById('room-hint').textContent='Touchez un objet pour ouvrir son projet.';
 const note=document.createElement('p');note.className='portrait-caption';note.textContent='Touchez un objet pour ouvrir son projet. Les sept objets sont aussi disponibles juste en dessous.';mobile.append(note);
 document.querySelectorAll('.room-index a').forEach(link=>{
  const l=layers.find(n=>n.id===link.dataset.open);if(!l)return;
  const margin=18;const art=el('svg',{viewBox:[l.x-margin,l.y-margin,l.w+margin*2,l.h+margin*2].join(' '),'aria-hidden':'true',class:'directory-object'});
  art.append(el('image',{href:l.id==='tv'?'atelier/decor-clean-2048.webp':'atelier/'+l.id+'.webp',width:2048,height:1152}));
  link.prepend(art);link.setAttribute('aria-label',l.title+' - '+l.category);const sub=document.createElement('small');sub.textContent=l.category;link.append(sub);
 });

}
addEventListener('touchstart',()=>{if(timers.length)stopReveal();},{passive:true});
addEventListener('wheel',()=>{if(timers.length)stopReveal();},{passive:true});
