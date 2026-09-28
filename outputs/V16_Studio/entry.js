// Readiness, not a simulated percentage. A slow connection never traps navigation.
export async function enterHome({video,still,model,release}) {
 const loader=document.getElementById('entry-loader');
 const started=performance.now();
 const navigation=performance.getEntriesByType('navigation')[0];
 let returning=false;
 try {returning=sessionStorage.getItem('raoult-entered')==='yes'&&navigation?.type!=='reload'&&(navigation?.type==='back_forward'||(document.referrer&&new URL(document.referrer).origin===location.origin));}catch{}
 if(returning||location.hash){loader.remove();release();return;}
 document.documentElement.classList.add('entry-loading');
 const mediaReady=new Promise(resolve=>{if(video.readyState>=2||!video.src)return resolve();video.addEventListener('loadeddata',resolve,{once:true});video.addEventListener('error',resolve,{once:true});});
 const imageReady=still.decode?.().catch(()=>{})||Promise.resolve();
 let timer;
 await Promise.race([Promise.allSettled([mediaReady,imageReady,model]),new Promise(resolve=>{timer=setTimeout(resolve,1700);})]);
 clearTimeout(timer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 await new Promise(resolve=>setTimeout(resolve,Math.max(0,(reduced?0:1050)-(performance.now()-started))));
 await loader.animate([{opacity:1},{opacity:0}],{duration:reduced?100:280,easing:'ease-out',fill:'forwards'}).finished;
 loader.remove();document.documentElement.classList.remove('entry-loading');
 try{sessionStorage.setItem('raoult-entered','yes');}catch{}
 release();
}
