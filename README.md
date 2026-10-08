# 牡丹真国色 · 分层叙事长卷

项目使用 **React + Vite + Canvas 2D**，只保留分层叙事封面与点击「入卷」后的六场十八镜播放，总长 **119 秒（约 2 分钟）**。播放界面保留播放/暂停、时间进度、章节跳转、环境声和「读花史」原文弹窗。

## 启动

推荐 Node.js 24；项目也支持 Node.js 22.12 及以上的 22.x。在工程根目录执行：

```sh
npm ci
npm run dev
```

访问 [本地开发页面](http://127.0.0.1:5173/)。`/`、`/index.html` 与兼容地址 `/experience.html` 都加载 `source/main.jsx` 中的同一个 `StoryPage` 应用。通过 Vite 服务运行页面。

## 命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 开发服务器，端口 `5173` |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 在端口 `4173` 预览构建结果 |
| `npm run lint` | 检查源码与工程配置 |
| `npm run check` | 检查单应用入口、运行资源、119 秒时间线及原文内容 |
| `npm run render:story` | 生成十八镜离线画面和动作接触表 |
| `npm run data:timeline` | 从已提取的原文数据重建时间线，需要 Python |

Python 数据工具需要 Python 3.10 或以上；重新提取原始图片及生成参考接触表时还需要 Pillow：

```sh
python -m pip install -r scripts/requirements.txt
```

可在 Git 忽略的 `.env.local` 中设置 `PYTHON` 解释器路径。数据处理、离线渲染和可选 FFmpeg 镜头视频命令见 [工具说明](scripts/README.md)。

## 目录

| 内容 | 位置 |
| --- | --- |
| React 播放界面、生命周期与 Canvas 渲染器 | `source/features/story/` |
| 时间线、图层清单、提取的原文 | `source/data/` |
| 运行图层、环境声与纸纹 | `public/assets/story/` |
| 用户原文、原图、分层底稿、提示词与参考视频 | [materials/](materials/README.md) |
| 数据处理与 QA 工具 | [scripts/](scripts/README.md) |
| 目录说明与当前检查报告 | [docs/](docs/STRUCTURE.md) |
| 工程记忆和提交协议 | [wiki_memory/](wiki_memory/AGENTS.md) |

原 WebGL 主站、独立阅读页面及其专用引擎、素材、制作工具和旧实现归档已移除。`experience.html` 仅为兼容原预览地址保留的 HTML 入口。原文、原图和当前故事制作资料继续保留。

## 制作与验证边界

十八镜仍是制作中的分层叙事预览，时间线的 `artReady` 均为 `false`。结构检查和离线画面检查不代表美术、角色动作、真实设备交互或参赛验收完成。

当前检查报告保存在 `docs/qa/current/`；离线画面、连续帧和接触表是可重新生成的本地输出，不提交 Git。清理前的旧 QA 与实现可从 Git 提交 `2b6d5e8` 追溯，工程记忆日志继续保留。

当前环境声 `public/assets/story/audio/ambient.mp3` 和纸纹 `public/assets/story/textures/paper.jpg` 沿用原项目素材，未完成版权核验。正式发布前仍需核对保留素材的授权及历史叙述出处。

当前未配置生产部署；`npm run build` 生成本地构建产物。
