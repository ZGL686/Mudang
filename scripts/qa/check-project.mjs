import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const pkg = JSON.parse(read('package.json'));
assert.ok(pkg.dependencies.react && pkg.dependencies['react-dom'] && pkg.devDependencies.vite);
assert.equal(pkg.type, 'module');
for (const command of ['dev', 'build', 'preview', 'check', 'lint']) assert.ok(pkg.scripts[command]);
// Both public URLs must open the retained scroll, including existing shot links.
for (const html of ['index.html', 'experience.html']) {
  const page = read(html);
  assert.ok(page.includes('id="app"') && page.includes('/source/main.jsx'), `Missing scroll entry: ${html}`);
  assert.ok(!/wp-content|story-player\.mjs|<iframe/.test(page), `Stale runtime: ${html}`);
}

const manifest = JSON.parse(read('source/data/story-layer-manifest.json'));
const images = [...new Set(Object.values(manifest.runtimeAssets))];
const assets = new Set([...images, 'assets/story/audio/ambient.mp3', 'assets/story/textures/paper.jpg']);
for (const resource of assets) {
  assert.ok(resource.startsWith('assets/story/'), `Unexpected asset root: ${resource}`);
  assert.ok(exists(`public/${resource}`), `Missing runtime asset: ${resource}`);
}

function files(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(file) : [file];
  });
}

for (const file of files('public')) {
  assert.ok(assets.has(file.slice('public/'.length)), `Unused release asset: ${file}`);
}
for (const file of files('source').filter((file) => /\.(?:js|jsx|mjs|css)$/.test(file))) {
  assert.ok(!/assets\/experience\/|vendor\/experience\/|wp-content|main-entry-link/.test(read(file)), `Stale dependency: ${file}`);
}
for (const file of ['materials/documents/牡丹真国色_全六场分镜_文字版(1).docx', 'materials/documents/主线内容(2)(1).docx', 'source/data/source-documents.json']) {
  assert.ok(exists(file), `Missing story source: ${file}`);
}
console.log(`PASS: both URLs open the scroll; ${images.length} layer images, ambient audio and paper texture exist; public/ contains no unused release assets; source documents retained.`);
