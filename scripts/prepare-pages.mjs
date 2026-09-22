import { cpSync, mkdirSync, readdirSync, rmSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'outputs', 'V16_Studio');
const target = resolve(root, '_site');
const excluded = new Set([
  'archives/videos',
  'server.cjs',
  'LIRE_MOI_V16.txt',
]);

function fingerprint(directory, base = directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return fingerprint(path, base);
    return [[relative(base, path).split(sep).join('/'), createHash('sha256').update(readFileSync(path)).digest('hex')]];
  });
}
const sourceBefore = new Map(fingerprint(source));

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, {
  recursive: true,
  filter(path) {
    const local = relative(source, path).split(sep).join('/');
    if (!local) return true;
    if ([...excluded].some(item => local === item || local.startsWith(`${item}/`))) return false;
    return !/\.blend1?$/.test(local);
  },
});

// Reproduce the source server's legacy routes as static redirects, under any
// Pages project prefix. The working version is never edited by this build.
const sourceServer = readFileSync(resolve(source, 'server.cjs'), 'utf8');
const aliasLiteral = sourceServer.match(/const aliases=(\{[^;]+\});/);
if (!aliasLiteral) throw new Error('Source server routes were not found.');
const aliases = JSON.parse(aliasLiteral[1].replaceAll("'", '"'));
const generated = new Set();
for (const [route, destination] of Object.entries(aliases)) {
  const local = route.replace(/^\//, '');
  const output = local.endsWith('.html') ? local : `${local.replace(/\/$/, '')}/index.html`;
  if (generated.has(output)) continue;
  if (sourceBefore.has(output)) continue;
  const file = resolve(target, output);
  const [page, anchor] = destination.split('#');
  const relativePage = relative(dirname(file), resolve(target, page.replace(/^\//, ''))).split(sep).join('/') + '/';
  const href = relativePage + (anchor ? `#${anchor}` : '');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${href}"><title>Tristan Raoult — Portfolio</title><script>const target=new URL(${JSON.stringify(href)},location.href);target.search=location.search;if(!target.hash)target.hash=location.hash;location.replace(target);</script></head><body><a href="${href}">Ouvrir le projet</a></body></html>\n`);
  generated.add(output);
}

const sourceAfter = new Map(fingerprint(source));
if (sourceBefore.size !== sourceAfter.size || [...sourceBefore].some(([file, hash]) => sourceAfter.get(file) !== hash)) {
  throw new Error('Source changed during preparation. Rebuild from the current version.');
}
const copied = fingerprint(target).filter(([file]) => !generated.has(file));
const differences = copied.filter(([file, hash]) => sourceBefore.get(file) !== hash);
if (differences.length) throw new Error(`Copy differs from the working version: ${differences.map(([file]) => file).join(', ')}`);

function measure(directory) {
  let bytes = 0;
  let files = 0;
  let largest = { path: '', size: 0 };
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = measure(path);
      bytes += nested.bytes;
      files += nested.files;
      if (nested.largest.size > largest.size) largest = nested.largest;
    } else {
      const size = statSync(path).size;
      bytes += size;
      files += 1;
      if (size > largest.size) largest = { path, size };
    }
  }
  return { bytes, files, largest };
}

const result = measure(target);
if (result.largest.size >= 100 * 1024 * 1024) {
  throw new Error(`Fichier supérieur ou égal à 100 Mo : ${result.largest.path}`);
}
if (result.bytes >= 1024 * 1024 * 1024) {
  throw new Error(`Site supérieur ou égal à 1 Gio : ${result.bytes} octets`);
}
console.log(JSON.stringify({
  target,
  files: result.files,
  megabytes: Math.round(result.bytes / 1024 / 1024 * 100) / 100,
  largest: relative(target, result.largest.path),
  largestMegabytes: Math.round(result.largest.size / 1024 / 1024 * 100) / 100,
  byteIdenticalSourceFiles: copied.length,
  generatedLegacyRoutes: generated.size,
  sourceUnchanged: true,
}, null, 2));
