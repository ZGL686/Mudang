# 牡丹真国色：原站交互改画版

本目录是可运行网页。画布、滚动推进、鼠标悬停与长按、图层视差和场景过渡仍使用 [David Whyte Experience](https://davidwhyte.com/experience/) 的原交互代码与模型。修改集中在 2D 图集、场景视频纹理、诗句贴图、可见按钮文字和页面叙事。

入口关系：`index.html` 保留原站交互；启动加载页和下方“六场花史”阅读区提供“打开分层故事预览”链接。`experience.html` 是独立的 Canvas 2D 制作预览，页面顶部可返回 `index.html#read-story`。两种实现仍需分别完成目标浏览器验收。

## 运行

在本目录打开 PowerShell，执行：

```powershell
node server.js
```

然后打开 `http://127.0.0.1:8787/`。需要通过本地 HTTP 服务访问，直接双击 `index.html` 可能无法加载 WebGL 资源。

## 六场内容

### 2026-09-30 图层修复

主入口仍为 `index.html`，使用原网站交互。`experience.html` 是另一份制作预览，不是本次保留原交互的入口。

- 将 26 个牡丹、仕女、宫苑和山水图块逐块装入原图集位置，避免图块偏移造成截断。
- 按新素材重建透明遮罩及 RGB 编码的距离场；旧树木、牛羊轮廓已不再用于裁切新画面。模型位置、滚动控制、水彩着色器、鼠标与长按逻辑保持原样。
- `index.html` 浮现内容采用《主线内容》的 18 段原句，生成时校验原文位置。
- `tools/rebuild-atlas-masks.py` 可重建图集与距离场，修改前资源保存在 `peony-art/before-mask-repair-*`。
- `tools/check-original-experience.py` 核查脚本差异、22 项引擎资源、原文及 26 个遮罩；结果位于 `.qa/original-experience-checks.json`，图层接触表位于 `.qa/original-engine-layers.jpg`。

2026-10-02 浏览器复查：本地网页可加载，模型、图集、距离场、诗句贴图及 12 个桌面场景视频等 18 项关键资源均返回 HTTP 200；“六场花史”静态卡片可见。Codex 内置浏览器中，主交互画布在入口加载后仍持续空白；多次滚动和鼠标拖动未显出场景。该环境没有可用的外部 Edge 浏览器，且未能进行触控模拟，因此 WebGL 场景、鼠标显影效果和触控交互仍未验证，`browserVerified` 保持 `false`。这不是修复通过，也不能据此判断目标浏览器中的根因；正式对照参考视频前仍需在支持 WebGL 的桌面/手机浏览器中复测。

1. 冠绝群芳：长卷、红牡丹、宫阙与仕女。
2. 神都花事：武则天引种的历史叙述，与拒开重生的民间传说并置。
3. 花出宫墙：宫廷、私园、民间踏青。
4. 吉祥入画：嫁衣、年画灯彩和器物牡丹纹。
5. 人花共盛：沉香亭、贵妃簪花与马嵬坡。
6. 花开不败：晚唐回望、今日洛阳花海与花瓣成冠。

六场详情在网页下方的“六场花史”。画面短句依照两份用户提供的 Word 文档整理。文档中的历史论断在正式参赛前仍需核对权威出处。

## 素材与修改位置

| 内容 | 位置 | 来源与处理 |
| --- | --- | --- |
| 图层图集 | `wp-content/themes/davidwhyte/resources/assets/xp/textures/atlas/texture.jpg` | 基于原图集的 UV 布局，用 AI 生成牡丹、水墨山川、唐风园林、仕女等图层，再做对位与人工整合 |
| 模型与显影遮罩 | 同目录 `texture_mask.jpg`、`sdf.png`、`models/scene.glb` | 模型沿用原站；遮罩和距离场按新素材重建，编码与图集槽位兼容原引擎 |
| 六场背景 | `resources/assets/xp/videos/{desktop,mobile}/{base,over}/1-6.mp4` | 六张 AI 场景图，经人工裁切、调色、缓动编码；每场有桌面与手机两版 |
| 中文诗句贴图 | `resources/assets/xp/poem/text.png` | 依据两份 Word 文档重新排版绘制，替换原英文贴图 |
| 页面文字 | `index.html`、`peony.css` | 六场短句、延伸阅读、史实与传说标签 |
| 可见鼠标提示 | `wp-content/themes/davidwhyte/app.js` | 仅替换六处可见提示；模型场景内部名称保持原样以维持点击匹配 |

`peony-art/` 保存生成图与可重建所需的原始快照。`build-peony-assets.ps1`、`align-peony-atlas.py`、`build-poem-text.ps1`、`apply-peony-text.py`、`apply-peony-js.py` 记录素材制作步骤。图集与场景图由 AI 辅助生成；排布、裁切、视频编码、文字改写及页面整合由本项目完成。

## 授权说明

原站的 `app.js`、`scene.glb`、遮罩、纸张纹理、字体、音频和部分样式仍在本地项目中。它们的版权不因修改而转移。**正式提交参赛作品前，请取得原权利人的明确授权，或用团队原创代码与素材重做对应部分。** 当前版本适合继续打磨和内部演示，不能把原站资源视为已授权参赛素材。
