# 制作资料

本目录保存用户提供的原始资料、参考资源和可以继续编辑的素材来源。浏览器实际加载的成品在 `public/assets/`，应用源码在 `source/`。

| 位置 | 内容 |
| --- | --- |
| `documents/` | 原始《牡丹真国色》全六场分镜与《主线内容》Word 文档 |
| `images/story-originals/` | 从原 ZIP 提取并保留的 40 张 a～d 分组参考图 |
| `images/image-manifest.json` | 图片编号、原 ZIP 路径、文件名及尺寸来源记录 |
| `artwork/experience/` | 主长卷图集底稿、六场场景图、修复前快照、原引擎脚本与页面来源 |
| `artwork/layer-drafts/` | 当前未在运行清单中使用的分层底稿和旧姿态稿 |
| `prompts/story/` | 图层生成提示词、人物动画制作记录 |
| `references/` | 用户参考视频与原站网址记录 |
| `local/` | 原始 ZIP、原始解包图片目录和旧站点本地快照；Git 忽略 |

`source/data/source-documents.json` 是两份 Word 的提取结果；`source/data/story-timeline.json` 保存 18 镜时间、原文锚点和镜头配置。原图的参考路径指向本目录，运行图层路径由 `source/data/story-layer-manifest.json` 单独管理。

继续制作时，将新底稿与提示词放入对应目录，确认接入播放器后将成品放入 `public/assets/story/layers/` 并更新运行清单。需要追溯的旧版本保留为底稿或快照；不要把原始文档、参考视频和原始图像当作生成缓存覆盖。

制作命令与依赖见 [scripts/README.md](../scripts/README.md)，完整目录职责见 [docs/STRUCTURE.md](../docs/STRUCTURE.md)。
