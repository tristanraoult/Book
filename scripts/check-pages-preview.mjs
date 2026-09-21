import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';

const root = resolve('_site');
const base = 'http://127.0.0.1:8790/portfolio-test/';
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}
const paths = files(root);
// Actual HTTP checks catch serving errors that checking file existence cannot.
for (let i = 0; i < paths.length; i += 8) {
  await Promise.all(paths.slice(i, i + 8).map(async file => {
    const url = new URL(relative(root, file).split(sep).map(encodeURIComponent).join('/'), base);
    const response = await fetch(url, { method: 'HEAD' });
    assert.equal(response.status, 200, url.href);
    assert.equal(Number(response.headers.get('content-length')), statSync(file).size, url.href);
  }));
}
const videos = paths.filter(file => file.endsWith('.mp4'));
for (const file of videos) {
  const url = new URL(relative(root, file).split(sep).map(encodeURIComponent).join('/'), base);
  const response = await fetch(url, { headers: { Range: 'bytes=1000-1999' } });
  assert.equal(response.status, 206, url.href);
  assert.equal(response.headers.get('content-type'), 'video/mp4');
  assert.equal(response.headers.get('content-range'), `bytes 1000-1999/${statSync(file).size}`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(file).subarray(1000, 2000));
}
const invalid = await fetch(new URL('01_Revelation_entree_16x9.mp4', base), { headers: { Range: 'bytes=999999999-' } });
assert.equal(invalid.status, 416);
const directory = await fetch(new URL('focus', base), { redirect: 'manual' });
assert.equal(directory.status, 301);
assert.equal(directory.headers.get('location'), '/portfolio-test/focus/');
console.log(JSON.stringify({ filesServed: paths.length, seekableVideos: videos.length, invalidRangeRejected: true, directorySlashRedirect: true }, null, 2));
