import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'outputs', 'V16_Studio');
const target = resolve(root, '_site');
const excluded = new Set([
  'archives/videos',
  'prototype/server.cjs',
  'LIRE_MOI_V16.txt',
]);

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
}, null, 2));
