const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.mp4':'video/mp4','.gif':'image/gif','.json':'application/json'};
http.createServer((req,res)=>{
 let relative;try{relative=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400).end();return;}
 const aliases={'/owlblack/':'/stage/','/owlblack':'/stage/','/projects/stage.html':'/stage/','/projects/owlblack.html':'/stage/','/projects/cours.html':'/cours/','/projects/freelance.html':'/freelance/','/projects/archives.html':'/archives/','/cours.html':'/cours/','/stage.html':'/stage/','/freelance.html':'/freelance/','/archives.html':'/archives/','/slipknot/':'/cours/#slipknot','/chippys/':'/cours/#chippys','/saucette/':'/cours/#saucette','/affiches-insta/':'/cours/#triptyque'};if(aliases[relative]){res.writeHead(302,{Location:aliases[relative]}).end();return;}
 if(relative==='/')relative='/prototype/index.html';
 else if(relative.endsWith('/'))relative+='index.html';
 const file=path.resolve(root,'.'+relative);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404).end('Fichier absent');return;}
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  const range=req.headers.range;
  if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416).end();return;}const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
  }else{res.writeHead(200,{...headers,'Content-Length':stat.size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);}
 });
}).listen(8778,'0.0.0.0',()=>console.log('Prototype local : http://127.0.0.1:8778/prototype/'));
