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
assert.ok(!exists('网页'), 'Old nested web directory must be removed');
for (const directory of ['source/features/experience', 'source/features/story/engine', 'source/data', 'source/styles', 'public/assets', 'scripts', 'materials', 'docs']) {
  assert.ok(exists(directory), `Missing directory: ${directory}`);
}
for (const [html, entry] of [['index.html', 'main.jsx'], ['experience.html', 'story.jsx']]) {
  const page = read(html);
  assert.ok(page.includes('id="app"') && page.includes(`/source/${entry}`), `Missing React entry: ${html}`);
  assert.ok(!/wp-content|story-player\.mjs|<iframe/.test(page), `Stale HTML runtime: ${html}`);
}

const manifest = JSON.parse(read('source/data/story-layer-manifest.json'));
const runtimeAssets = [...new Set(Object.values(manifest.runtimeAssets))];
for (const resource of runtimeAssets) {
  assert.ok(resource.startsWith('assets/story/'), `Unexpected runtime asset root: ${resource}`);
  assert.ok(exists(`public/${resource}`), `Missing runtime asset: ${resource}`);
}
const engine = read('public/vendor/experience/engine.js');
assert.ok(engine.includes('window.__MUDANG_BASE_URL__'), 'Engine must use the deployment base');
assert.ok(!engine.includes('wp-content/'), 'Engine contains old resource roots');
const original = read('materials/artwork/experience/source-app.js');
const graphicsPaths = [...new Set([...original.matchAll(/path:"(\/xp\/[^"?]+)"/g)].map((match) => match[1]))];
for (const resource of graphicsPaths) assert.ok(exists(`public/assets/experience${resource}`), `Missing graphics resource: ${resource}`);
for (const device of ['desktop', 'mobile']) for (const layer of ['base', 'over']) for (let scene = 1; scene <= 6; scene++) {
  assert.ok(exists(`public/assets/experience/xp/videos/${device}/${layer}/${scene}.mp4`));
}
for (const file of ['materials/documents/牡丹真国色_全六场分镜_文字版(1).docx', 'materials/documents/主线内容(2)(1).docx', 'source/data/source-documents.json']) assert.ok(exists(file));
assert.ok(!exists('public/story-assets') && !exists('public/wp-content'));
console.log(`PASS: React + Vite entries, standard folders, ${runtimeAssets.length} story images, ${graphicsPaths.length} graphics resources, 24 scene videos and source documents.`);
