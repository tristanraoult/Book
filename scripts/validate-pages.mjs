import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '_site');
const textExtensions = new Set(['.html', '.css', '.js']);
const missing = [];
const absolute = [];
let checked = 0;

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

for (const file of files(root)) {
  const extension = extname(file);
  if (!textExtensions.has(extension)) continue;
  const text = readFileSync(file, 'utf8');
  const patterns = extension === '.html'
    ? [/(?:src|href|poster)=["']([^"']+)["']/g]
    : extension === '.css'
      ? [/url\(\s*["']?([^"')]+)["']?\s*\)/g]
      : [/(?:fetch|loadAsync)\(["']([^"']+)["']/g, /(?:from|import)\s*["']([^"']+)["']/g];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const raw = match[1].trim();
      if (!raw || /^(?:https?:|mailto:|tel:|data:|blob:|#|javascript:)/i.test(raw) || raw.includes('${')) continue;
      if (raw.startsWith('/')) absolute.push({ file, raw });
      const clean = raw.split('#')[0].split('?')[0];
      if (!clean) continue;
      if (extension === '.js' && !clean.startsWith('.') && !clean.startsWith('/')) continue;
      let target = raw.startsWith('/') ? resolve(root, `.${clean}`) : resolve(dirname(file), clean);
      if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html');
      checked += 1;
      if (!existsSync(target)) missing.push({ file, raw, target });
    }
  }
}

function requireFile(base, raw) {
  checked += 1;
  const target = resolve(base, raw);
  if (!existsSync(target)) missing.push({ file: base, raw, target });
}

for (const item of JSON.parse(readFileSync(resolve(root, 'affiches', 'posters.json'), 'utf8'))) {
  requireFile(resolve(root, 'affiches', 'assets'), item.original);
  requireFile(resolve(root, 'affiches', 'assets'), item.web);
}
for (const item of JSON.parse(readFileSync(resolve(root, 'photography', 'photos.json'), 'utf8'))) {
  requireFile(resolve(root, 'photography', 'assets'), item.file);
}
for (const item of JSON.parse(readFileSync(resolve(root, 'archives', 'curly.json'), 'utf8'))) {
  requireFile(resolve(root, 'archives'), item.file);
}
for (const item of Object.values(JSON.parse(readFileSync(resolve(root, 'archives', 'videos.json'), 'utf8')))) {
  requireFile(resolve(root, 'archives'), item.file);
}

if (absolute.length || missing.length) {
  console.error(JSON.stringify({ absolute, missing }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ checked, absolutePaths: 0, missing: 0 }, null, 2));
