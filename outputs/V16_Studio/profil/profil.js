(()=>{
 const main=document.querySelector('main'),svg=document.querySelector('.life-thread'),path=svg.querySelector('path'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let length=0,queued=false;
 const section=id=>{const n=document.getElementById(id);return {y:n.offsetTop,h:n.offsetHeight}};
 function draw(){queued=false;if(!length)return;const progress=reduced.matches?1:Math.min(1,Math.max(.06,(scrollY+innerHeight*.8)/main.scrollHeight));path.style.strokeDashoffset=length*(1-progress);}
 // Shared tangents at every knot produce continuous rounded cubic curves.
 // Handle lengths are bounded by both adjacent chords to avoid overshoots/cusps.
 function spline(points){const tangent=points.map((p,i)=>{const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];const dx=next[0]-prev[0],dy=next[1]-prev[1],norm=Math.hypot(dx,dy)||1;const before=i?Math.hypot(p[0]-prev[0],p[1]-prev[1]):Math.hypot(next[0]-p[0],next[1]-p[1]);const after=i<points.length-1?Math.hypot(next[0]-p[0],next[1]-p[1]):before;const size=Math.min(before,after)*.34;return [dx/norm*size,dy/norm*size];});let d=`M ${points[0].join(' ')}`;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],u=tangent[i-1],v=tangent[i];d+=` C ${a[0]+u[0]} ${a[1]+u[1]} ${b[0]-v[0]} ${b[1]-v[1]} ${b[0]} ${b[1]}`;}return d;}
 function layout(){const w=main.clientWidth,h=main.scrollHeight,mobile=w<=700;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);const hero=section('debut'),about=section('regard'),cv=section('cv'),journey=section('parcours'),photos=section('images'),practice=section('pratique'),contact=section('contact');const pts=[];const add=(sec,list)=>list.forEach(([x,y])=>pts.push([w*x,sec.y+sec.h*y]));
 if(mobile){
  add(hero,[[.88,.045],[.71,.04],[.76,.25],[.88,.42],[.42,.55],[.23,.68],[.48,.83],[.91,.86]]);
  add(about,[[.93,.06],[.79,.14],[.12,.12],[.07,.26],[.43,.37],[.9,.43],[.96,.68],[.94,.96]]);
  add(cv,[[.77,.005],[.67,.045],[.91,.12],[.95,.3],[.96,.67],[.91,.93]]);
  add(journey,[[.67,.025],[.57,.065],[.9,.12],[.96,.4],[.95,.75],[.91,.97]]);
  add(photos,[[.66,.015],[.23,.04],[.47,.17],[.94,.29],[.91,.5],[.46,.55],[.08,.5],[.07,.69],[.57,.88],[.92,.94]]);
  add(practice,[[.95,.12],[.95,.48],[.93,.81],[.7,.97],[.52,.91],[.7,.88],[.93,.99]]);
  add(contact,[[.95,.17],[.94,.48],[.9,.82],[.82,.95]]);
 }else{
  add(hero,[[.57,.045],[.74,.01],[.93,.14],[.93,.34],[.65,.44],[.59,.59],[.77,.73],[.91,.9]]);
  add(about,[[.7,.03],[.28,.01],[.065,.2],[.07,.61],[.31,.81],[.44,.68],[.34,.5],[.19,.65],[.42,.94]]);
  add(cv,[[.12,.045],[.075,.23],[.2,.45],[.71,.56],[.95,.72],[.94,.96]]);
  add(journey,[[.7,.01],[.46,.12],[.44,.46],[.46,.81],[.3,.96],[.16,.89],[.29,.83],[.56,.97]]);
  add(photos,[[.87,.06],[.95,.32],[.87,.74],[.57,.85],[.24,.74],[.08,.85]]);
  add(practice,[[.16,.015],[.37,.1],[.46,.36],[.45,.71],[.29,.91],[.15,.83],[.27,.74],[.47,.97]]);
  add(contact,[[.72,.08],[.91,.04],[.95,.29],[.92,.63],[.86,.92]]);
 }
 path.setAttribute('d',spline(pts));length=path.getTotalLength();path.style.strokeDasharray=length;draw();}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(draw)}},{passive:true});new ResizeObserver(layout).observe(main);reduced.addEventListener('change',draw);layout();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('seen');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.photo').forEach(photo=>{if(!reduced.matches&&photo.getBoundingClientRect().top>innerHeight){photo.classList.add('waiting');observer.observe(photo)}});
})();
