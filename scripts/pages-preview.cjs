const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.env.PAGES_PREVIEW_ROOT || path.join(__dirname, '..', '_site'));
const prefix = process.env.PAGES_PREVIEW_PREFIX ?? '/portfolio-test';
const port = Number(process.env.PAGES_PREVIEW_PORT || 8790);
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary', '.pdf': 'application/pdf',
};

http.createServer((request, response) => {
  let url, local;
  try {
    url = new URL(request.url, 'http://127.0.0.1');
    local = decodeURIComponent(url.pathname.slice(prefix.length + 1));
  } catch {
    response.writeHead(400).end();
    return;
  }
  if (url.pathname === prefix) {
    response.writeHead(302, { Location: `${prefix}/` });
    response.end();
    return;
  }
  if (!url.pathname.startsWith(`${prefix}/`)) {
    response.writeHead(404).end();
    return;
  }
  let file = path.resolve(root, local);
  if (file !== root && !file.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  const size = fs.statSync(file).size;
  const headers = {
    'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
  };
  let start = 0, end = size - 1, code = 200;
  if (request.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if (!match || (!match[1] && !match[2])) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start > end || start >= size) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    code = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  response.writeHead(code, { ...headers, 'Content-Length': Math.max(0, end - start + 1) });
  if (request.method === 'HEAD' || !size) response.end();
  else {
    const stream = fs.createReadStream(file, { start, end });
    response.on('close', () => stream.destroy());
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${prefix}/`));
