// Render the actual React components so the six runtime text hooks and all
// source quotations remain checked after the HTML-to-React migration.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {dataPath} from '../lib/project-paths.mjs';

const timeline=JSON.parse(fs.readFileSync(dataPath('story-timeline.json'),'utf8'));
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
try {
  const {chapters}=await server.ssrLoadModule('/source/features/experience/content.js');
  const {ExperienceCanvas}=await server.ssrLoadModule('/source/features/experience/ExperienceCanvas.jsx');
  const {ReadingSection}=await server.ssrLoadModule('/source/features/experience/ReadingSection.jsx');
  assert.equal(chapters.length,6,'six source chapters');
  assert.equal(new Set(chapters.map(chapter=>chapter.id)).size,6,'unique chapter anchors');
  for(const [index,chapter] of chapters.entries()){
    assert.equal(chapter.lines.length,3,'three quotations per chapter');
    assert.deepEqual(chapter.lines.map(line=>line.text),timeline.shots.slice(index*3,index*3+3).map(shot=>shot.quote.text));
  }
  const canvas=renderToStaticMarkup(createElement(ExperienceCanvas));
  const reading=renderToStaticMarkup(createElement(ReadingSection));
  const escape=text=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[char]));
  const sections=[...canvas.matchAll(/class="xp-text" data-section="(\d)"/g)].map(match=>Number(match[1]));
  assert.deepEqual(sections,[0,1,2,0,1,2],'six engine text hooks, including measurement copies');
  for(const shot of timeline.shots)assert.equal(canvas.split(escape(shot.quote.text)).length-1,2,`shot ${shot.id} quotation appears in both text copies`);
  assert.equal((reading.match(/class="a-step-wrapper peony-story-card"/g)||[]).length,6,'six rendered reading cards');
  for(const chapter of chapters)assert.ok(reading.includes(`id="${chapter.id}"`),'rendered reading anchor '+chapter.id);
  console.log(JSON.stringify({chapterCount:chapters.length,quoteCount:timeline.shots.length,textHookCount:sections.length,readingCardCount:6,verification:'React component server render',browserVerified:false}));
} finally {
  await server.close();
}
