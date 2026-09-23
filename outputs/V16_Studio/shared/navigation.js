class PortfolioHeader extends HTMLElement{
 connectedCallback(){
  const siteRoot=new URL('../',document.currentScript?.src||location.href);
  const site=path=>new URL(path.replace(/^\//,''),siteRoot).href;
  // The logo and nav links are inserted as direct children of <body> (not inside
  // this element, and not in a Shadow root): in this engine, mix-blend-mode on a
  // descendant does not blend against real page content once it sits inside ANY
  // positioned ancestor (fixed/sticky) or a Shadow tree — only a true direct
  // child of <body> blends correctly. Confirmed with a black/white split test.
  const logo=document.createElement('a');
  logo.className='header-logo';
  logo.href=site('');
  logo.setAttribute('aria-label','Raoult — Accueil');
  logo.innerHTML=`<span class="header-logo-mark" aria-hidden="true"></span>`;
  const nav=document.createElement('div');
  nav.className='desktop-nav';
  nav.setAttribute('role','navigation');
  nav.setAttribute('aria-label','Navigation principale');
  nav.innerHTML=`<a href="${site('#atelier')}">Studio</a><a href="${site('#directory-title')}">Projets</a><a href="${site('profil/')}">À propos</a><a href="${site('profil/#cv')}">CV</a><a href="${site('profil/#contact')}">Contact</a>`;
  document.body.insertBefore(logo,this);
  document.body.insertBefore(nav,this);
  this.innerHTML=`<div class="bar"><button class="toggle" aria-expanded="false" aria-haspopup="dialog" aria-controls="portfolio-menu">Menu <i aria-hidden="true">＋</i></button></div><dialog id="portfolio-menu" aria-label="Navigation du portfolio"><div class="menu-top"><a class="name" href="${site('')}" aria-label="Raoult — Accueil"><img src="${site('shared/raoult-original.svg')}" alt="Raoult" width="6493" height="1924"></a><button class="close" aria-label="Fermer le menu">Fermer ×</button></div><div class="menu-body"><svg class="thread" viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true"><path d="M380 0C180 30 190 130 295 125C410 120 210 210 245 280C290 370 120 380 110 270C95 175 375 385 280 465S10 440 65 575S350 610 265 700" fill="none" stroke="#f4eddf" stroke-width="3"/></svg><div class="menu-links"><a href="${site('#atelier')}"><small>01</small>Studio</a><a href="${site('#directory-title')}"><small>02</small>Projets</a><a href="${site('profil/')}"><small>03</small>À propos</a><a href="${site('profil/#cv')}"><small>04</small>CV</a><a href="${site('profil/#contact')}"><small>05</small>Contact</a></div><div class="menu-aside"><strong>Une rencontre ?</strong>Direction artistique · Design graphique<br>Bordeaux / M1 · Recherche d’alternance<a href="mailto:tristan.raoult62@gmail.com">tristan.raoult62@gmail.com ↗</a></div></div><div class="foot"><span>IDENTITÉ · IMAGE · MOUVEMENT</span><span>PORTFOLIO / TRISTAN RAOULT</span></div></dialog>`;
  const button=this.querySelector('.toggle'),dialog=this.querySelector('dialog');let overflow='';
  const close=()=>{if(dialog.open)dialog.close();};
  button.onclick=()=>{overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';button.setAttribute('aria-expanded','true');this.querySelector('.close').focus();};
  this.querySelector('.close').onclick=close;
  dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;button.setAttribute('aria-expanded','false');button.focus({preventScroll:true});});
  this.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  logo.addEventListener('click',close);
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...dialog.querySelectorAll('a,button')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  this.addEventListener('disconnect',()=>{logo.remove();nav.remove();});
 }
 disconnectedCallback(){
  document.querySelectorAll('body > .header-logo, body > .desktop-nav').forEach(el=>el.remove());
 }
}
customElements.define('portfolio-header',PortfolioHeader);

// Custom cursor: two small circles, same reactive contrast system as the header
// (mix-blend-mode:difference on a direct child of <body>). Desktop pointer only.
(function(){
 if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const style=document.createElement('style');
 style.textContent='*{cursor:none!important}a,button,[role=button],summary,input,textarea,select,label{cursor:none!important}'+
  'body>.cursor-dot,body>.cursor-ring{position:fixed;top:0;left:0;border-radius:50%;pointer-events:none;z-index:2000;mix-blend-mode:difference;background:#fff;transform:translate(-50%,-50%);will-change:transform;opacity:0}'+
  'body>.cursor-dot{width:8px;height:8px}'+
  'body>.cursor-ring{width:16px;height:16px}'+
  '.cursor-visible body>.cursor-dot,.cursor-visible body>.cursor-ring{opacity:1}';
 document.head.appendChild(style);
 const dot=document.createElement('div');dot.className='cursor-dot';document.body.appendChild(dot);
 const ring=document.createElement('div');ring.className='cursor-ring';document.body.appendChild(ring);
 let tx=innerWidth/2,ty=innerHeight/2,dx=tx,dy=ty,rx=tx,ry=ty,shown=false;
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(!shown){shown=true;document.documentElement.classList.add('cursor-visible');dx=tx;dy=ty;rx=tx;ry=ty;}},{passive:true});
 addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;},{passive:true});
 document.addEventListener('mouseleave',()=>{shown=false;document.documentElement.classList.remove('cursor-visible');});
 (function loop(){
  dx+=(tx-dx)*.55;dy+=(ty-dy)*.55;
  rx+=(tx-rx)*.18;ry+=(ty-ry)*.18;
  dot.style.transform=`translate(${dx}px,${dy}px) translate(-50%,-50%)`;
  ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(loop);
 })();
})();
