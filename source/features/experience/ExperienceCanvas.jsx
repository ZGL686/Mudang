import { Fragment } from 'react';
import { assetUrl } from '../../lib/asset-url.js';
import { chapters, sounds } from './content.js';

function CanvasCursor() {
  return (
    <div className="cursor-w hide-mobile hide-tablet loading" data-component="Cursor" data-fixed="" aria-hidden="true">
      <svg className="cursor outer-circle" fill="none" viewBox="0 0 34 34" width="95" height="95">
        <ellipse className="out-circle circle" rx="16" ry="16" cx="17" cy="17" />
      </svg>
      <svg className="cursor inner-circle" fill="none" viewBox="0 0 34 34" width="95" height="95">
        <ellipse className="in-circle circle" rx="1.2" ry="1.2" cx="17" cy="17" strokeWidth="0" />
        <ellipse className="in-circle-down circle" rx="1.2" ry="1.2" cx="17" cy="17" strokeWidth="0" />
      </svg>
      <div className="hover-text"><p><span>阅读花史</span></p></div>
    </div>
  );
}

function CanvasLoader() {
  return (
    <div className="loader-experience" data-fixed="" data-component="LoaderExperience">
      <div className="center-wrapper">
        <div className="middle-w center"><p className="loading-text center">墨色正在晕开</p></div>
        <p className="enter-description center">滚动画卷，探寻牡丹的千年故事</p>
      </div>
    </div>
  );
}

function CanvasAssets() {
  return (
    <div className="xp-assets" aria-hidden="true" style={{ visibility: 'hidden', position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
      <video className="xp-videoTexture-base" muted loop crossOrigin="anonymous" playsInline style={{ visibility: 'hidden', position: 'absolute' }} />
      <video className="xp-videoTexture-over" muted loop crossOrigin="anonymous" playsInline style={{ visibility: 'hidden', position: 'absolute' }} />
      {sounds.map(({ name, loop }) => (
        <audio className={name} preload="none" controls loop={loop} key={name}>
          <source src={assetUrl(`assets/experience/xp/sounds/${name}.mp3`)} type="audio/mpeg" />
        </audio>
      ))}
    </div>
  );
}

function ChapterText() {
  return [0, 1, 2].map((section) => (
    <div className="xp-text" data-section={section} key={section}>
      {chapters.slice(section * 2, section * 2 + 2).map((chapter) => (
        <div className="peony-line" key={chapter.id}>
          <strong>{chapter.shortTitle}</strong>
          {chapter.lines.map(({ label, text }, index) => (
            <Fragment key={index}>
              <br />{label && <small className="peony-context">{label}</small>}{text}
            </Fragment>
          ))}
        </div>
      ))}
      <div className="line-break" />
    </div>
  ));
}

function SoundButton() {
  const wave = 'M0,0.5 c19.1,0,19.1,40.9,37.7,40.9 c19.1,0,19.1,-40.9,37.7,-40.9 c19.1,0,19.1,40.9,37.7,40.9';
  return (
    <button className="sound hidden is-off" type="button" aria-label="切换长卷声音">
      <div className="sound__container">
        <svg viewBox="0 0 921.5 41.9" aria-hidden="true">
          <path stroke="#000" fill="none" d={wave} />
          <path stroke="#000" fill="none" d={wave} />
          <path stroke="#000" fill="none" d="M113,40.9 c19.1,0,19.1-38.1,37.7-38.1 c19.1,0,19.1,33.1,37.7,33.1 c19.1,0,19.1-27.7,37.7-27.7 c19.1,0,19.1,22.7,37.7,22.7 c19.1,0,19.1-17.7,37.7-17.7 c19.1,0,19.1,12.7,37.7,12.7 c19.1,0,19.1-7.7,37.7-7.7 c19.1,0,19.1,5,37.7,5 c19.1,0,19.1-1.8,37.7-1.8 c19.1,0,17.7,0,36.3,0 c19.1,0,13.6,0,32.2,0 c19.1,0,23.6,0,42.7,0 c19.1,0,264.2,0,283.3,0" />
        </svg>
      </div>
    </button>
  );
}

export function ExperienceCanvas() {
  return (
    <>
      <CanvasCursor />
      <CanvasLoader />
      <canvas className="xp-canvas" aria-label="牡丹互动水墨长卷" />
      <CanvasAssets />
      <section className="xp-section" data-component="Experience" data-hover="2" aria-label="长卷花史">
        <button className="xp-btn xp-fullpaint-btn" type="button"><span>返回</span></button>
        <button className="xp-btn xp-poem-btn" type="button"><span>返回</span></button>
        <div className="xp-text-w">
          <div className="xp-text-sizer" aria-hidden="true"><ChapterText /></div>
          <div className="xp-text-w-inside"><ChapterText /></div>
        </div>
        <button className="xp-scrollToExplore hidden" type="button"><span>滚动赏花</span></button>
        <div className="xp-fulltext" />
        <SoundButton />
      </section>
    </>
  );
}
