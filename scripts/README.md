# 制作、数据与 QA 工具

从工程根目录运行以下命令。Node 工具使用 `npm ci` 安装的项目依赖；Python 工具使用 Python 3.10 或以上。

```sh
python -m pip install -r scripts/requirements.txt
```

Python npm 命令通过 `scripts/run-python.mjs` 选择解释器：先读取 `PYTHON`，再尝试 Windows 的 `py -3`、`python3`、`python`。可将解释器路径写入被 Git 忽略的根目录 `.env.local`：

```dotenv
PYTHON=C:/Python312/python.exe
```

以上路径只是配置示例。仓库中的工具不会读取特定用户的运行时缓存。

## 工程与内容检查

| 命令 | 检查范围 | 输出 |
| --- | --- | --- |
| `npm run lint` | React 源码、Hooks 和工程配置 | 控制台 |
| `npm run check` | 标准目录、双入口、运行资源、视频、原文时间线、React 内容渲染 | 控制台 |
| `npm run check:art` | 引擎与统一适配结果一致、22 项原引擎资源、18 段 React 原句、26 份遮罩符号一致 | `docs/qa/current/original-experience-checks.json` 与图层接触表 |

`check-timeline.mjs` 保留 18 镜总长 119 秒、原文片段、相机数值、图层透明度与尺寸、人物关节和横竖屏安全范围等检查。`check-experience-content.mjs` 实际静态渲染 React 长卷与阅读组件，检查六场内容、十八段原句以及图形引擎所需的六个文字节点。

这些是结构、数据、素材和静态组件检查，不会把 `browserVerified` 改为 `true`。浏览器交互与真实设备检查应另存明确的操作记录。

## 离线画面

```sh
npm run render:story
node scripts/qa/render-shot-clip.mjs 9
```

首条命令通过本地 `@napi-rs/canvas` 执行生产 Canvas 2D 渲染器，生成十八镜画面、人物动作表、横竖屏及镜 09 转场检查图，输出至 `docs/qa/current/story-frames/`。

第二条命令输出指定镜头的连续帧及 MP4，需要 PATH 中可执行的 `ffmpeg`。镜头编号为 `1`～`18`；连续帧放在 `docs/qa/current/clip-<编号>-frames/`，视频放在同级 QA 目录。

Skia 使用系统字体。需要固定接触表标签字体时，可通过 `STORY_FONT` 环境变量传入字体文件路径。离线渲染不模拟浏览器的控件、音频、鼠标或触控输入。

## 数据处理

```sh
npm run data:timeline
node --env-file-if-exists=.env.local scripts/run-python.mjs scripts/data/inspect_sources.py
```

- `build_timeline.py` 读取 `source/data/source-documents.json`，重建 `source/data/story-timeline.json`。原文摘录通过段落位置校验，18 镜时长合计固定为 119 秒。
- `inspect_sources.py` 重新读取 `materials/documents/` 中的两份原始 Word，更新提取的原文数据。若本地有 `materials/local/生成图.zip`，同时补充提取原始图片并更新 `materials/images/image-manifest.json`；否则校验已版本化的参考图与清单。接触表写入 `docs/qa/current/source-contact-sheets/`。
- 原始 ZIP 可通过 `--archive <路径>` 显式指定。工具保留已有解包图片，不覆盖原图。

重建时间线会按生成规则写回数据文件。修改分镜数据前，应先明确其来源；生成后运行 `npm run check`，并检查 Git 差异。

## 美术制作

| 工具 | 作用 |
| --- | --- |
| `npm run art:engine` | 从 `materials/artwork/experience/source-app.js` 重建 `public/vendor/experience/engine.js` |
| `scripts/art/rebuild-atlas-masks.py` | 按原引擎图集布局重新装入完整图块，生成纹理、遮罩和距离场 |
| `scripts/art/align-peony-atlas.py` | 按原始 UV 遮罩补齐图集边缘；属于特定制作步骤，需核对是否适用当前素材 |
| `scripts/art/build-peony-assets.ps1` | 从图集底稿及六张场景图生成主长卷纹理、桌面/手机视频，再重建遮罩 |
| `scripts/art/build-poem-text.ps1` | 在 Windows 上使用 System.Drawing 生成中文诗句贴图 |

引擎适配逻辑唯一位于 `scripts/lib/adapt-experience-engine.py`，引擎生成器和检查器共用此函数。修改适配规则后执行 `npm run art:engine` 和 `npm run check:art`，再完成对应浏览器验收。

PowerShell 制作脚本使用环境变量 `PYTHON` 选择解释器；直接运行 `.ps1` 不会自动读取 `.env.local`。视频工具需要 FFmpeg。美术制作会写入 `public/assets/experience/` 中的实际运行素材，修改前快照保留在 `materials/artwork/experience/`。

所有新 QA 输出统一写入 `docs/qa/current/`。历史 `docs/qa/legacy/` 及 `docs/archive/pre-react/` 中的旧脚本保留作来源，不作为当前执行入口。
