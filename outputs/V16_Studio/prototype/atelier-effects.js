// Lightweight SVG details sit in the same scene coordinates as the photographed objects.
export function addObjectEffects(a,id,el){
 const fx=el('g',{class:'object-effect','aria-hidden':'true'});
 if(id==='fizzi'){
  fx.append(el('ellipse',{cx:993,cy:611,rx:3.5,ry:1.2,fill:'#222623',class:'tab-opening'}));
  fx.append(el('path',{d:'M988 611Q989 608.8 994 609Q998 609.5 997 611.5Q994 613 989 612Z',fill:'#a5a992',stroke:'#ead6ae','stroke-width':'.5',class:'can-tab'}));
  for(const [i,dx] of [-20,12,-8,22,-15,6,17,-3].entries())fx.append(el('circle',{cx:991+(i%2)*3,cy:609,r:i%2?3:4,fill:'none',stroke:'#f5dcaa','stroke-width':'1.1',class:'fizzi-bubble',style:`--drift:${dx}px;--delay:${140+i*75}ms`}));
 }
 if(id==='photography'){
  fx.append(el('ellipse',{cx:393,cy:525,rx:37,ry:33,fill:'url(#lensSpark)',class:'lens-flash'}));
  fx.append(el('path',{d:'M393 505V545M373 525H413',stroke:'#fff4d6','stroke-width':'1.3',class:'lens-flash'}));
 }
 if(id==='focus')fx.append(el('path',{d:'M1180 826Q1204 828 1217 819M1260 790L1268 793',fill:'none',stroke:'#ffe0a3','stroke-width':'.8',class:'metal-glint'}));
 a.append(fx);
}
