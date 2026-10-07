import { chapters } from './content.js';
import { ExperienceLink } from './ExperienceLink.jsx';

export function ReadingSection({ readingOnly = false }) {
  return (
    <section
      className="advantages-section peony-story"
      id="read-story"
      data-component={readingOnly ? undefined : 'Advantages'}
      data-header="light"
      aria-labelledby="story-title"
    >
      <div className="peony-story-inner">
        <div className="advantages-header">
          <p className="peony-kicker">互动长卷 · 六场十八镜</p>
          <h2 className="a-title" id="story-title">牡丹真国色</h2>
          <p className="peony-intro">{readingOnly
            ? '六场故事，从盛唐花事走向今日洛阳。可打开分层故事预览，或选择重看长卷进入互动画卷。'
            : '向上滚动可重看画卷；移动鼠标，感受水墨图层的远近与显影。下方为六场故事的延伸阅读。'}</p>
          <ExperienceLink className="peony-story-cta" to="experience.html">
            <span>打开分层故事预览</span><span aria-hidden="true">→</span>
          </ExperienceLink>
        </div>
        <div className="advantages-content">
          <h2 className="a-title">六场花史</h2>
          <div className="peony-story-grid">
            {chapters.map((chapter) => (
              <article className="a-step-wrapper peony-story-card" id={chapter.id} key={chapter.id}>
                <span className="peony-num">{chapter.number}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.summary}</p>
              </article>
            ))}
          </div>
          <div className="a-cta-wrapper"><span className="a-cta-indication">史实与传说并置</span></div>
          <div className="a-cta-wrapper gift-card"><span className="a-cta-indication">从盛唐走向今日洛阳</span></div>
        </div>
        <div className="advantages-footer">
          <p className="peony-note">创作依据：《牡丹真国色》全六场分镜文字版与《主线内容》。涉及人物、年代及典故的历史表述，请在正式参赛前逐条核校出处。</p>
          {readingOnly ? (
            <ExperienceLink className="peony-restart" to="index.html?view=experience">重看长卷</ExperienceLink>
          ) : (
            <button className="xp-restart peony-restart" data-hover="2" type="button"><span>重看长卷</span></button>
          )}
        </div>
      </div>
    </section>
  );
}
