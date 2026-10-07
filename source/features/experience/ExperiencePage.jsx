import { ExperienceCanvas } from './ExperienceCanvas.jsx';
import { ExperienceLink } from './ExperienceLink.jsx';
import { ReadingSection } from './ReadingSection.jsx';
import { useExperienceEngine } from './useExperienceEngine.js';

function PageLoader() {
  return (
    <div id="loader" aria-label="长卷加载中">
      <div className="loader-w">
        <div className="loader-img peony-loader-word">牡丹真国色</div>
        <div className="loader-bar" />
        <div className="loader-bar loader-bar-animated" />
      </div>
      <div className="peony-loader-links">
        <ExperienceLink className="peony-loader-preview" to="experience.html">打开分层故事预览 <span aria-hidden="true">→</span></ExperienceLink>
        <ExperienceLink className="peony-loader-reading" to="index.html?view=reading#read-story">阅读六场花史</ExperienceLink>
      </div>
    </div>
  );
}

function ExperienceNavigation() {
  return (
    <nav className="peony-navigation" aria-label="作品导航">
      <ExperienceLink to="index.html?view=reading#read-story">六场花史</ExperienceLink>
      <ExperienceLink to="experience.html">分层故事预览 <span aria-hidden="true">↗</span></ExperienceLink>
    </nav>
  );
}

export function ExperiencePage() {
  const readingOnly = new URLSearchParams(window.location.search).get('view') === 'reading'
    || window.location.hash === '#read-story';
  const error = useExperienceEngine(readingOnly);

  return (
    <div className={readingOnly ? 'experience-document experience-reading' : 'experience-document'}>
      {!readingOnly && <PageLoader />}
      <header id="header" className="peony-page-header"><ExperienceNavigation /></header>
      {!readingOnly && <div id="global-cursor" data-component="GlobalCursor" aria-hidden="true"><div className="text" /></div>}
      <main id="root" className="content lang-zh_CN">
        {readingOnly ? <ReadingSection readingOnly /> : (
          <section className="page unsubscribed-page" data-component="WatercolorExperience" data-header="dark" data-header-props="companion">
            <ExperienceCanvas />
            <ReadingSection />
          </section>
        )}
      </main>
      <footer id="footer" className="peony-page-footer">牡丹真国色 · 互动水墨长卷</footer>
      {error && (
        <aside className="experience-error" role="alert">
          <p>互动长卷暂时无法启动</p>
          <details><summary>查看原因</summary><p>{error}</p></details>
          <ExperienceLink to="index.html?view=reading#read-story">阅读六场花史</ExperienceLink>
          <ExperienceLink to="experience.html">打开分层故事预览</ExperienceLink>
        </aside>
      )}
    </div>
  );
}
