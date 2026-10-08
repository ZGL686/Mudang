# 分层故事制作资料

本目录保留支撑当前六场十八镜故事的原始资料、参考资源与可再编辑素材。浏览器运行素材在 `public/assets/story/`，应用源码在 `source/`。

| 位置 | 内容 |
| --- | --- |
| `documents/` | 用户原始《牡丹真国色》全六场分镜与《主线内容》Word 文档 |
| `images/story-originals/` | 原 ZIP 中提取的 40 张 a～d 分组原图 |
| `images/image-manifest.json` | 图片编号、原 ZIP 路径、文件名及尺寸来源记录 |
| `artwork/layer-drafts/` | 尚未接入当前运行清单的分层底稿与旧姿态稿 |
| `prompts/story/` | 图层生成提示词与人物动画制作记录 |
| `references/` | 用户参考视频与原站网址记录 |

`source/data/source-documents.json` 是两份 Word 的提取结果；`source/data/story-timeline.json` 保存 18 镜时间、原文锚点和镜头配置。原图引用指向本目录，实际运行图层由 `source/data/story-layer-manifest.json` 管理。

继续制作时，将底稿与提示词放入对应目录；成品放入 `public/assets/story/layers/` 并更新运行清单。保留原始文档、原图和用户参考视频作为来源。当前十八镜仍在制作中，`artReady` 均为 `false`。

原 WebGL 主站专用的 `artwork/experience/` 已移除。当前播放环境声 `public/assets/story/audio/ambient.mp3` 与纸纹 `public/assets/story/textures/paper.jpg` 从原项目沿用，未完成版权核验；保留参考文件不表示授权已确认。

工具与依赖见 [scripts/README.md](../scripts/README.md)，目录职责见 [docs/STRUCTURE.md](../docs/STRUCTURE.md)。
