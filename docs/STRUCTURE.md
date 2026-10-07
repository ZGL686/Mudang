# 工程目录结构

工程根目录承载 npm/Vite 配置和两个 HTML 入口；实际应用源码统一放在 `source/`。

```text
项目根目录/
├── index.html                    # 主长卷 Vite 入口
├── experience.html               # 十八镜故事 Vite 入口
├── package.json / package-lock.json
├── vite.config.js / eslint.config.js
├── source/
│   ├── main.jsx                  # 主长卷 React 启动
│   ├── story.jsx                 # 分层故事 React 启动
│   ├── features/
│   │   ├── experience/           # 长卷界面、六场内容、阅读组件、引擎接入
│   │   └── story/
│   │       ├── StoryPage.jsx     # 故事界面
│   │       ├── useStoryPlayer.js # 播放、加载、输入与生命周期
│   │       └── engine/           # Canvas 绘制、镜头、人物姿态、转场
│   ├── data/                     # 时间线、运行图层清单、提取的原文
│   ├── lib/                      # 应用共用函数
│   └── styles/                   # 应用样式及已迁移的原引擎样式
├── public/
│   ├── assets/
│   │   ├── experience/           # 主长卷运行资源：fonts/、xp/
│   │   └── story/layers/         # 分层故事实际加载的图层 PNG
│   └── vendor/experience/        # 保留并适配的图形引擎 engine.js
├── scripts/
│   ├── art/                      # 图集、遮罩、视频、文字贴图制作
│   ├── data/                     # 源文档提取与时间线生成
│   ├── qa/                       # 工程、时间线、画面与素材检查
│   ├── lib/                      # 工具共用路径及确定性的引擎适配
│   ├── run-python.mjs            # Python 解释器选择
│   └── requirements.txt          # Python 制作工具依赖
├── materials/
│   ├── documents/               # 用户原始 Word 文档
│   ├── images/story-originals/   # a～d 四组原始参考图
│   ├── images/image-manifest.json
│   ├── artwork/experience/      # 主长卷图集底稿及原始快照
│   ├── artwork/layer-drafts/     # 当前未接入运行清单的图层稿
│   ├── prompts/story/           # 图层提示词与制作记录
│   ├── references/              # 参考视频与原网址
│   └── local/                   # 本地保留、Git 忽略的大文件及重复快照
├── docs/
│   ├── STRUCTURE.md
│   ├── qa/legacy/               # 迁移前的历史检查记录
│   ├── qa/current/              # 当前工具生成的检查结果
│   ├── qa/react-migration/      # 本轮迁移映射、浏览器检查与完成审计
│   └── archive/pre-react/       # 原 HTML、播放器、静态服务器与旧说明
├── wiki_memory/                 # 工程记忆；沿用现有协议
├── node_modules/                # npm 安装，Git 忽略
└── dist/                        # Vite 构建结果，Git 忽略
```

## 放置规则

- **应用逻辑放 `source/`。** 页面功能按 `features/` 组织，共用工具放 `source/lib/`，样式放 `source/styles/`。新增页面组件不放根目录或 `public/`。
- **运行素材放 `public/assets/`。** Vite 将这些文件原样复制到构建结果。分层故事通过 `source/data/story-layer-manifest.json` 引用实际使用的图层；参考图与未用底稿保留在 `materials/`。
- **原始资料和可再编辑素材放 `materials/`。** 原始 Word、图集快照和提示词属于制作来源，不进入浏览器发布目录。`materials/local/` 保存原 ZIP、原始解包目录、站点快照，Git 不上传这些本地文件。
- **可执行工具放 `scripts/`。** 工具从自身位置定位工程，不依赖启动时位于旧网页子目录，也不内置用户机器的解释器或 Node 缓存路径。
- **检查输出放 `docs/qa/current/`。** `legacy/` 是历史证据，旧路径文字反映检查时的结构。新增检查不覆盖历史记录；`archive/pre-react/` 保留旧实现以便追溯。
- **项目记忆继续遵守 `wiki_memory/AGENTS.md`。** 源码、配置、原始资料和实际检查结果是事实来源；记忆是摘要。

## 入口与资源关系

`index.html → source/main.jsx → ExperiencePage` 组织主长卷界面、六场阅读与导航；`useExperienceEngine` 在 DOM 就绪后加载 `public/vendor/experience/engine.js`。该引擎是保留的原图形实现，其适配只集中处理可见文字、资源基址与启动诊断。它的全局状态由完整文档生命周期管理。

`experience.html → source/story.jsx → StoryPage / useStoryPlayer` 组织十八镜播放器。播放器读取 `source/data/` 中的时间线和素材清单，调用 `source/features/story/engine/` 渲染 `public/assets/story/layers/` 图层。它与主长卷通过页面链接互通。

应用内公开资源 URL 由 `source/lib/asset-url.js` 拼接 Vite 的部署基址；Node 检查与渲染脚本通过 `scripts/lib/project-paths.mjs` 定位相同的 `public/` 文件。调整素材位置时，应同步清单、制作工具和检查器。

## 旧路径对应关系

| 旧位置 | 当前位置 |
| --- | --- |
| `网页/网页/index.html` | 根目录 Vite `index.html`；旧文件在 `docs/archive/pre-react/index.html` |
| `网页/网页/experience.html` | 根目录 Vite `experience.html`；旧文件在 `docs/archive/pre-react/experience.html` |
| `网页/网页/story-*.mjs` | `source/features/story/engine/`；旧播放器在归档目录 |
| `网页/网页/story-*.json`、`story-assets/source-documents.json` | `source/data/` |
| `网页/网页/story-assets/layers/` | 运行图在 `public/assets/story/layers/`，底稿在 `materials/artwork/layer-drafts/` |
| `网页/网页/story-assets/a-*.png` 等 | `materials/images/story-originals/` |
| `网页/网页/peony-art/` | `materials/artwork/experience/` |
| `网页/网页/wp-content/.../resources/assets/` | `public/assets/experience/` |
| `网页/网页/wp-content/.../app.js` | `public/vendor/experience/engine.js`，由原始快照统一适配生成 |
| `网页/网页/tools/` 及原根目录制作脚本 | `scripts/art/`、`scripts/data/`、`scripts/qa/` |
| 原 `.qa/` 检查资料 | `docs/qa/legacy/` |
| 根目录原始 Word、参考视频、原网址 | `materials/documents/`、`materials/references/` |

`docs/archive/pre-react/` 中的旧 HTML 和服务器只作为归档来源。当前开发、构建和预览统一使用根目录 npm 命令。
