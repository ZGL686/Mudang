import { useEffect, useRef } from 'react';
import { assetUrl } from '../../lib/asset-url.js';
import { clamp, quoteProgress, sample, SPRING_LOW_CUT } from './engine/story-core.mjs';
import { useStoryPlayer } from './useStoryPlayer.js';
import '../../styles/story.css';

function formatTime(value) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
}

function Masthead({ shot, total, onRestart }) {
  return (
    <header className="masthead">
      <a className="wordmark" href="#" id="restart" aria-label="重看长卷" onClick={(event) => {
        event.preventDefault();
        onRestart();
      }}>
        牡丹真国色<span>一花 · 一朝 · 千年</span>
      </a>
      <div className="chapter-mark">
        <span id="chapter">{shot.chapterTitle}</span>
        <span id="shot-number">{String(shot.id).padStart(2, '0')} / {total}</span>
      </div>
    </header>
  );
}

function Opening({ started, status, error, onEnter }) {
  return (
    <section id="opening" className="opening" hidden={started}>
      <p className="overline">水墨重彩 · 牡丹花史</p>
      <h1>牡丹<br /><span>真国色</span></h1>
      <p className="opening-line">以指尖入画，看一朵花穿过千年。</p>
      <button id="enter" disabled={status !== 'ready'} onClick={onEnter}>
        {status === 'ready' ? '入 卷' : status === 'error' ? '画卷暂未载入' : '墨色正在晕开…'}
      </button>
      <p className="hint">滚轮行卷 · 移动鼠标显色 · 长按细看</p>
      <p id="load-error" role="alert">{error ? `画卷暂未载入：${error}。` : ''}</p>
    </section>
  );
}

function Narration({ shot, local, reduced, started }) {
  const characters = Array.from(shot.quote.text);
  const count = reduced ? characters.length : quoteProgress(local, characters.length, shot.duration);
  return (
    <section id="narration" aria-label="浮现文字" hidden={!started}>
      <span id="context-label">{shot.context}</span>
      <p id="quote">
        {characters.map((character, index) => {
          const opacity = clamp(count - index);
          return <span key={`${shot.id}-${index}`} style={{ opacity, filter: `blur(${(1 - opacity) * 4}px)` }}>{character}</span>;
        })}
      </p>
      <span id="shot-label">{shot.label}</span>
    </section>
  );
}

function PlaybackControls({ player, shot, playButtonRef, readButtonRef }) {
  return (
    <nav className="controls" aria-label="长卷播放控制" hidden={!player.started}>
      <button ref={playButtonRef} id="play" aria-label={player.playing ? '暂停' : '播放'} onClick={player.togglePlaying}>
        {player.playing ? 'Ⅱ' : '▷'}
      </button>
      <span id="elapsed">{formatTime(player.time)}</span>
      <input
        id="seek" aria-label="长卷时间" type="range" min="0" max={player.timeline.duration}
        value={player.time} step="0.01"
        aria-valuetext={`${shot.chapterTitle}，${shot.label}，${formatTime(player.time)}`}
        onChange={(event) => player.changeTime(event.target.value)}
      />
      <span className="total-time">{formatTime(player.timeline.duration)}</span>
      <button ref={readButtonRef} id="read" onClick={player.openReading}>读花史</button>
      <button
        id="sound" aria-pressed={player.sound} aria-label={player.sound ? '关闭环境声' : '开启环境声'}
        onClick={player.toggleSound}
      >声 · {player.sound ? '开' : '关'}</button>
    </nav>
  );
}

function ChapterNavigation({ chapters, chapter, started, onSelect }) {
  return (
    <nav id="chapter-nav" className="chapter-nav" aria-label="六场导航" hidden={!started}>
      {chapters.map((title, index) => (
        <button
          key={title} aria-label={`第${index + 1}场：${title}`} title={title}
          aria-current={index === chapter ? 'true' : 'false'} onClick={() => onSelect(index)}
        />
      ))}
    </nav>
  );
}

function ReadingDialog({ open, narrative, onClose, readButtonRef }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyOpen = useRef(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open) {
      if (!dialog.open) dialog.showModal();
      closeButtonRef.current?.focus();
    } else {
      if (dialog.open) dialog.close();
      if (previouslyOpen.current) readButtonRef.current?.focus();
    }
    previouslyOpen.current = open;
  }, [open, readButtonRef]);
  useEffect(() => () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

  return (
    <dialog id="reading" ref={dialogRef} onClose={onClose} aria-labelledby="reading-title">
      <button ref={closeButtonRef} id="close-reading" aria-label="关闭花史" onClick={onClose}>返回画卷 ×</button>
      <div className="reading-inner">
        <p className="overline">主线内容 · 原文</p>
        <h2 id="reading-title">牡丹真国色</h2>
        <div id="full-text">
          {narrative.filter((text) => text.trim()).map((text, index) => (
            /^[一二三四]．$/.test(text)
              ? <h3 key={index}>{text}</h3>
              : <p key={index}>{text}</p>
          ))}
        </div>
      </div>
    </dialog>
  );
}

export function StoryPage() {
  const player = useStoryPlayer();
  const { shot, local } = sample(player.timeline, player.time);
  const playButtonRef = useRef(null);
  const readButtonRef = useRef(null);
  const view = shot.motion === 'spring-walk' && local / shot.duration >= SPRING_LOW_CUT ? 'low' : 'wide';
  useEffect(() => {
    if (player.started) playButtonRef.current?.focus({ preventScroll: true });
  }, [player.started]);

  return (
    <>
      <main
        ref={player.experienceRef} id="experience" aria-label="牡丹真国色互动水墨长卷"
        data-shot={shot.id} data-time={player.time.toFixed(3)} data-playing={player.playing} data-view={view}
        style={{ '--story-paper-texture': `url("${assetUrl('assets/story/textures/paper.jpg')}")` }}
      >
        <canvas ref={player.canvasRef} id="stage" aria-label="分层水墨动画" {...player.pointerEvents} />
        <div className="paper-grain" aria-hidden="true" />
        <Masthead shot={shot} total={player.timeline.shots.length} onRestart={player.restart} />
        <Opening started={player.started} status={player.status} error={player.error} onEnter={player.enter} />
        <Narration shot={shot} local={local} reduced={player.reduced} started={player.started} />
        <div
          id="cursor" aria-hidden="true" className={player.cursor.pressed ? 'pressed' : ''}
          style={{ left: player.cursor.x, top: player.cursor.y }}
        ><span /></div>
        <PlaybackControls player={player} shot={shot} playButtonRef={playButtonRef} readButtonRef={readButtonRef} />
        <ChapterNavigation chapters={player.timeline.chapters} chapter={shot.chapter} started={player.started} onSelect={player.selectChapter} />
        <div id="end-note" hidden={!player.started || player.time < player.timeline.duration}>
          <h2>花开不败</h2><p>千年国色，仍在盛放。</p><button id="replay" onClick={player.restart}>再入画卷</button>
        </div>
        {player.error && player.started && <p className="runtime-error" role="alert">画卷暂未载入：{player.error}。</p>}
      </main>
      <ReadingDialog open={player.readingOpen} narrative={player.timeline.narrative} onClose={player.closeReading} readButtonRef={readButtonRef} />
    </>
  );
}

export default StoryPage;
