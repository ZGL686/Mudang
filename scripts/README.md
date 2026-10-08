# 数据与 QA 工具

从工程根目录运行命令。Node 工具使用 `npm ci` 安装的项目依赖；Python 数据工具使用 Python 3.10 或以上。重新提取原图、生成参考接触表需要 Pillow：

```sh
python -m pip install -r scripts/requirements.txt
```

Python npm 命令通过 `scripts/run-python.mjs` 选择解释器：先读取 `PYTHON`，再尝试 Windows 的 `py -3`、`python3`、`python`。可在被 Git 忽略的根目录 `.env.local` 中配置，例如：

```dotenv
PYTHON=C:/Python312/python.exe
```

## 检查

| 命令 | 检查范围 |
| --- | --- |
| `npm run lint` | 应用源码、Hooks 与工程配置 |
| `npm run check` | 单应用及兼容入口、运行资源、原文内容、18 镜与 119 秒时间线 |

时间线检查还覆盖镜头数值、图层尺寸与透明度、人物关节及横竖屏安全范围。结构、数据和资源检查不等于浏览器交互或真实设备验收；对应操作记录另存 `docs/qa/current/`。

## 离线画面

```sh
npm run render:story
node scripts/qa/render-shot-clip.mjs 9
```

首条命令通过项目的 `@napi-rs/canvas` 执行生产 Canvas 2D 渲染器，生成十八镜画面、动作接触表、横竖屏及镜 09 转场检查图，输出到 `docs/qa/current/story-frames/`。

第二条命令为编号 `1`～`18` 的指定镜头输出连续帧和 MP4，需要 PATH 中可执行的 `ffmpeg`。帧放在 `docs/qa/current/clip-<编号>-frames/`，视频放在同级 QA 目录。

Skia 使用系统字体；可通过 `STORY_FONT` 环境变量指定接触表标签字体。离线渲染不模拟浏览器控件、音频或输入操作。生成画面、连续帧与接触表由 Git 忽略，需要时重新生成。

## 数据处理

```sh
npm run data:timeline
node --env-file-if-exists=.env.local scripts/run-python.mjs scripts/data/inspect_sources.py
```

- `build_timeline.py` 使用 Python 标准库读取 `source/data/source-documents.json`，重建 `source/data/story-timeline.json`。原文摘录按段落位置校验，18 镜总时长为 119 秒。
- `inspect_sources.py` 读取 `materials/documents/` 中两份原始 Word，更新原文提取结果。若本地有 `materials/local/生成图.zip`，还会补充提取原图并更新 `materials/images/image-manifest.json`；否则校验已版本化的原图及清单。Pillow 用于图片读取及参考接触表，输出到 `docs/qa/current/source-contact-sheets/`。
- 原始 ZIP 可通过 `--archive <路径>` 指定。工具保留已有解包图片，不覆盖原图。当前仓库不包含原始 ZIP。

重建会写回数据文件；生成后运行 `npm run check` 并审阅差异。图层制作的来源放在 `materials/artwork/layer-drafts/` 和 `materials/prompts/story/`，成品通过 `source/data/story-layer-manifest.json` 接入播放器。

原 WebGL 图集制作、引擎适配及专用检查工具已移除。旧 QA 从 Git 提交 `2b6d5e8` 追溯；当前目录只维护新的检查报告及忽略的可重建输出。
