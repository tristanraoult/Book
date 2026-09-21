const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '_site');
const prefix = '/portfolio-test';
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary', '.pdf': 'application/pdf',
};

http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname === prefix) {
    response.writeHead(302, { Location: `${prefix}/` });
    response.end();
    return;
  }
  if (!url.pathname.startsWith(`${prefix}/`)) {
    response.writeHead(404).end();
    return;
  }
  let local = decodeURIComponent(url.pathname.slice(prefix.length + 1));
  let file = path.resolve(root, local);
  if (!file.startsWith(root)) {
    response.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(8790, '127.0.0.1', () => console.log('http://127.0.0.1:8790/portfolio-test/'));
