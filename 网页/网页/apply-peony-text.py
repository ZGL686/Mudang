"""Replace the source page's copy while retaining its Experience DOM hooks."""
from pathlib import Path
import re
import json
from html import escape

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'peony-art/source-index.html'
TARGET = ROOT / 'index.html'
html = SOURCE.read_text(encoding='utf-8')

html = re.sub(r'<title>.*?</title>', '<title>牡丹真国色｜互动水墨长卷</title>', html, count=1, flags=re.S)
html = re.sub(r'<meta name="description" content="[^"]*"\s*/>', '<meta name="description" content="沿着水墨长卷，走进牡丹与盛唐、传说、民俗和今日洛阳的六场故事。" />', html, count=1)
html = re.sub(r'<script type="application/ld\+json" class="yoast-schema-graph">.*?</script>', '', html, count=1, flags=re.S)
html = re.sub(r'<meta property="og:[^>]+>', '', html)
html = html.replace('lang="en-US"', 'lang="zh-CN"').replace('lang-en_US', 'lang-zh_CN')
html = re.sub(r'<svg class="loader-img".*?</svg>', '<div class="loader-img peony-loader-word">牡丹真国色</div>', html, count=1, flags=re.S)

timeline = json.loads((ROOT/'story-timeline.json').read_text(encoding='utf-8'))
scenes = []
for i, title in enumerate(timeline['chapters']):
    shots = timeline['shots'][i*3:i*3+3]
    quotes = []
    for shot in shots:
        q = shot['quote']
        original = timeline['narrative'][q['paragraph']]
        assert original[q['start']:q['end']] == q['text'], 'Quote must match the supplied Word document'
        text = escape(q['text'])
        if shot['context']:
            text = f'<small class="peony-context">{escape(shot["context"])}</small>' + text
        quotes.append(text)
    scenes.append((f'{"一二三四五六"[i]}｜{title}', quotes[0], '<br />'.join(quotes[1:])))

def xp_block(group):
    lines = []
    for title, lead, detail in group:
        lines.append(f'<div class="peony-line"><strong>{title}</strong><br />{lead}<br />{detail}</div>')
    return '\n'.join(lines)

def xp_wrapper(cls):
    inner = ''.join(
        f'<div class="xp-text" data-section="{i}">{xp_block(scenes[i*2:i*2+2])}<div class="line-break"></div></div>'
        for i in range(3)
    )
    if cls == 'xp-text-w':
        return f'<div class="xp-text-w"><div class="xp-text-sizer">{inner}</div><div class="xp-text-w-inside">{inner}</div></div>'
    return ''

start = html.index('    <div class="xp-text-w">')
end = html.index('    <button class="xp-scrollToExplore hidden">', start)
html = html[:start] + '    ' + xp_wrapper('xp-text-w') + '\n' + html[end:]

notes = [
    ('01', '冠绝群芳，王者气象', '长卷展开，红牡丹从淡墨山峦间显现。花瓣层叠如冕，汉服仕女立于花海，宫阙隐于远山。牡丹以晚春压轴之姿，成为盛唐审美中雍容气象的象征。'),
    ('02', '武则天与牡丹：史实与传说', '史实记载：牡丹在武周时期进入洛阳皇家苑囿，推动洛阳牡丹声名渐盛。民间传说：寒冬百花奉旨绽放，牡丹拒开而遭焚，焦骨上重生为“洛阳红”。拒开与火焚属于后世文学演绎，不宜当作史实。'),
    ('03', '从宫廷御花到朝野共赏', '中宗、睿宗时期，宫廷宴游、士族私园和城郊踏青串起牡丹的传播路径。赏花由礼制中的御苑活动，渐渐成为春日休闲；此时仍以静赏为主，盛唐式的斗花热潮尚未形成。'),
    ('04', '吉祥符号，进入民俗', '凤穿牡丹寄托婚姻和美、家业兴旺；年画与灯彩祈愿岁岁圆满；铜镜、瓷盏和陈设上的花纹，则让富足安泰的祝愿进入日常器物。'),
    ('05', '杨贵妃与牡丹：人花盛衰', '沉香亭的牡丹与《清平调》将名花和美人相映，写尽盛世风华。马嵬坡事变之后，繁花又成为人世无常的映照；花的文化意象随着王朝盛衰而变化。'),
    ('06', '花开不败，魂铸王冠', '晚唐残垣前，红牡丹依旧开放；镜头回到今日洛阳的花海，花瓣升空汇聚成冠。王者气象不止于一时的繁华，也在代代相传的文化记忆中。'),
]
cards = '\n'.join(f'<article class="a-step-wrapper peony-story-card" id="scene-{num}"><span class="peony-num">{num}</span><h3>{title}</h3><p>{body}</p></article>' for num,title,body in notes)
story = f'''<section class="advantages-section peony-story" id="read-story" data-component="Advantages" data-header="light">
  <div class="peony-story-inner">
    <div class="advantages-header"><p class="peony-kicker">互动长卷 · 六场十八镜</p><h2 class="a-title">牡丹真国色</h2><p class="peony-intro">向上滚动可重看画卷；移动鼠标，感受水墨图层的远近与显影。下方为六场故事的延伸阅读。</p></div>
    <div class="advantages-content"><h2 class="a-title">六场花史</h2><div class="peony-story-grid">{cards}</div>
      <div class="a-cta-wrapper"><span class="a-cta-indication">史实与传说并置</span></div>
      <div class="a-cta-wrapper gift-card"><span class="a-cta-indication">从盛唐走向今日洛阳</span></div>
    </div>
    <div class="advantages-footer"><p class="peony-note">创作依据：《牡丹真国色》全六场分镜文字版与《主线内容》。涉及人物、年代及典故的历史表述，请在正式参赛前逐条核校出处。</p>
      <button class="xp-restart peony-restart" data-hover="2"><span>重看长卷</span></button></div>
  </div>
</section>
</section>'''
pattern = r'<section class="advantages-section".*?</section>\s*</section>'
html, n = re.subn(pattern, story, html, count=1, flags=re.S)
assert n == 1, 'Could not replace the marketing section'

html = html.replace('Access David\'s library to discover his poems, essays, courses and short films', '滚动画卷，探寻牡丹的千年故事')
html = html.replace('See the poems', '阅读花史')
html = html.replace('Scroll to explore', '滚动赏花')
html = html.replace('<span>Back</span>', '<span>返回</span>')
html = html.replace('>Loading<', '>墨色正在晕开<')
html = html.replace('app.js?ver=1786613130', 'app.js?ver=peony-5')

# The source site's navigation, checkout, contact, and footer are unrelated to this work.
# Keep the markup until all Experience hooks have initialized, but hide it with a local stylesheet.
inject = '<link rel="stylesheet" href="peony.css" />\n'
html = html.replace('</head>', inject + '</head>', 1)
TARGET.write_text(html, encoding='utf-8')
