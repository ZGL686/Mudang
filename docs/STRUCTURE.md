# 工程目录结构

工程只有一个 React 分层叙事应用。两个 HTML 地址共用 `source/main.jsx`，以兼容原有预览链接。

```text
项目根目录/
├── index.html                    # 默认入口
├── experience.html               # 原预览地址的兼容入口
├── package.json / package-lock.json
├── vite.config.js / eslint.config.js
├── source/
│   ├── main.jsx                  # 唯一 React 启动模块
│   ├── features/story/
│   │   ├── StoryPage.jsx         # 封面、播放控制与读花史弹窗
│   │   ├── useStoryPlayer.js     # 时间、播放、加载、输入与生命周期
│   │   └── engine/               # Canvas 绘制、镜头、人物姿态与转场
│   ├── data/                     # 119 秒时间线、图层清单与提取的原文
│   ├── lib/                      # 资源 URL 等共用函数
│   └── styles/                   # 分层故事样式
├── public/assets/story/
│   ├── layers/                   # 运行图层 PNG
│   ├── audio/ambient.mp3         # 沿用原项目的环境声
│   └── textures/paper.jpg        # 沿用原项目的纸纹
├── scripts/
│   ├── data/                     # 原始资料提取与时间线生成
│   ├── qa/                       # 工程、内容、时间线与离线画面检查
│   ├── lib/                      # 工具共用路径
│   ├── run-python.mjs            # Python 解释器选择
│   └── requirements.txt          # Pillow：原图提取与接触表
├── materials/
│   ├── documents/                # 用户原始 Word 文档
│   ├── images/story-originals/    # a～d 四组原图
│   ├── images/image-manifest.json
│   ├── artwork/layer-drafts/      # 分层底稿与旧姿态稿
│   ├── prompts/story/             # 图层提示词与制作记录
│   └── references/                # 用户参考视频与网址记录
├── docs/
│   ├── STRUCTURE.md
│   └── qa/current/               # 当前检查报告及忽略的可重建画面
├── wiki_memory/                  # 工程记忆与追加式历史
├── node_modules/                 # npm 安装，Git 忽略
└── dist/                         # Vite 构建结果，Git 忽略
```

## 应用与资源

`index.html` 和 `experience.html` 都遵循 `HTML → source/main.jsx → StoryPage → useStoryPlayer / engine`。默认展示分层封面；「入卷」进入六场十八镜，完整时间线为 119 秒。「读花史」在当前应用中以弹窗显示原文。

播放器读取 `source/data/story-timeline.json` 和 `story-layer-manifest.json`。实际图层位于 `public/assets/story/layers/`，原文提取结果位于 `source/data/source-documents.json`。环境声和纸纹分别在 `audio/ambient.mp3`、`textures/paper.jpg`，两者沿用原项目且尚未完成版权核验。

公开资源 URL 通过 `source/lib/asset-url.js` 拼接 Vite 部署基址。Node 检查与渲染工具通过 `scripts/lib/project-paths.mjs` 定位工程文件。移动运行素材时同步修改引用和检查器。

原 WebGL 主站、独立阅读页、`source/story.jsx`、`public/vendor/`、`public/assets/experience/`、`materials/artwork/experience/`、`scripts/art/`、引擎适配/专用检查和旧实现归档已移除。旧 QA 产物已清理；清理前的文件从 Git 提交 `2b6d5e8` 追溯。

## 放置规则

- 应用逻辑放 `source/`；运行素材放 `public/assets/story/`。运行目录只发布播放器实际使用的素材。
- 原始 Word、原图、用户参考视频、可再编辑分层底稿和提示词放 `materials/`，保持来源可追溯。
- 数据与检查工具放 `scripts/`，通过工程位置或环境配置寻找依赖，不写机器专属解释器路径。
- 当前检查报告写入 `docs/qa/current/`。离线画面、连续帧和接触表属于可重建输出，由 Git 忽略。
- 工程记忆遵守 `wiki_memory/AGENTS.md`；历史日志保持。源码、配置、原始资料和实际检查结果是事实来源。

十八镜美术与角色动作继续保留现有制作状态；所有 `artReady` 仍为 `false`。当前目录清理不表示制作或真实设备验收完成。
