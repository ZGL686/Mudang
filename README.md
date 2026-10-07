# 牡丹真国色 · 互动水墨长卷

本项目使用 **React + Vite**，以六场十八镜讲述牡丹文化。页面组件、交互逻辑、故事数据和样式集中在 `source/`；运行素材、制作材料、工具及历史记录分别管理。

## 启动项目

使用 Node.js 24 和 npm，在项目根目录执行：

```sh
npm ci
npm run dev
```

本地开发地址为 <http://127.0.0.1:5173/>。通过 Vite 服务访问页面；不要双击 HTML 文件运行。

| 页面 | 地址 | 实现 |
| --- | --- | --- |
| 互动水墨长卷 | `/` 或 `/index.html` | React 页面与六场阅读组件，保留原 WebGL 图形引擎 |
| 六场花史阅读 | `/index.html?view=reading#read-story` | React 阅读视图 |
| 十八镜分层故事 | `/experience.html` | React 播放器与 Canvas 2D 分层渲染器 |

两份根目录 HTML 是 Vite 入口，分别加载 `source/main.jsx`、`source/story.jsx`。界面由 React 组件构成，页面间链接可相互跳转。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发服务器，端口 `5173` |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 在端口 `4173` 预览已构建的 `dist/` |
| `npm run lint` | 检查应用源代码与工程配置 |
| `npm run check` | 检查目录、入口、资源、119 秒时间线和 React 六场内容 |
| `npm run check:art` | 校验保留引擎的适配结果、资源与 26 份图集遮罩，需要 Python |
| `npm run render:story` | 用项目依赖生成十八镜离线画面与动作接触表 |
| `npm run data:timeline` | 从已提取的原文数据重建时间线，需要 Python |
| `npm run art:engine` | 从保留的引擎原始快照重建适配后的脚本，需要 Python |

Python 工具使用 Python 3.10 或以上。素材检查与制作另需：

```sh
python -m pip install -r scripts/requirements.txt
```

可以在本地 `.env.local` 中指定解释器，例如 `PYTHON=C:/Python312/python.exe`。这些 Python npm 命令会读取此文件；未指定时依次查找 Windows 的 `py -3`、`python3`、`python`。`.env.local` 已被 Git 忽略。视频制作额外需要 PATH 中的 FFmpeg，详细命令见 [工具说明](scripts/README.md)。

## 去哪里修改

| 内容 | 目录 |
| --- | --- |
| React 组件、Hooks、样式、数据 | [`source/`](source/) |
| 浏览器直接使用的图像、字体、音频、视频 | [`public/assets/`](public/assets/) |
| 保留的第三方图形引擎 | [`public/vendor/experience/`](public/vendor/experience/) |
| 用户原文、参考图、素材底稿、提示词 | [`materials/`](materials/README.md) |
| 数据处理、素材制作、QA 脚本 | [`scripts/`](scripts/README.md) |
| 目录规范、QA 与旧版归档 | [`docs/`](docs/STRUCTURE.md) |
| 项目记忆与按对话提交协议 | [`wiki_memory/`](wiki_memory/AGENTS.md) |

完整目录职责、修改边界和旧路径映射见 [目录结构说明](docs/STRUCTURE.md)。原始 Word 文档和参考图已保留，原始 ZIP、重复解包目录和本地站点快照位于被忽略的 `materials/local/`。

## 图形引擎与验收范围

主入口保留了原站的 WebGL 场景、着色器、模型与交互引擎。React 管理页面界面，引擎在组件挂载后每个文档加载一次；页面切换使用完整文档导航，相关代码更新使用整页重载。引擎迁移适配由 `scripts/lib/adapt-experience-engine.py` 统一生成，修改前的原始脚本保存在 `materials/artwork/experience/source-app.js`。

历史 QA 记录位于 `docs/qa/legacy/`，迁移后的工具记录写入 `docs/qa/current/`，本轮浏览器检查范围见 `docs/qa/react-migration/browser-review.json`。时间线、资源存在、React 内容渲染及离线画面检查各有明确范围；这些记录不等同于所有设备上的交互验收。原主入口在内置浏览器中仍显示纸色空白，导航、六场阅读与独立分层预览可用；原 WebGL 图形问题需专项诊断。十八镜素材与角色动作也保留原有制作待办，不能据架构迁移认定作品已完成参赛验收。

原站代码、模型、字体、音频和部分纹理仍随项目保留，来源及授权处理沿用 [原版说明](docs/archive/pre-react/README.md)。正式参赛前需核对相应授权与历史叙述出处。

当前未配置生产部署。`npm run build` 生成本地构建产物；开发与预览地址均为本机地址。
