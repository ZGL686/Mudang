---
type: decision
status: active
kind: architecture
importance: high
updated: 2026-10-07
topic: react-vite-project-layout
source_logs:
  - "[[日志/2026-10-07-React与Vite架构及目录整改]]"
supersedes: null
---

# ADR-002：React + Vite 与标准目录

## 用户要求

用户明确要求将工程改成 React + Vite，深度整理目录，以 source 文件夹统一源码，消除 `网页/网页` 的重复嵌套。

## 决定

- 根目录管理 package.json、锁文件、Vite/ESLint 配置与两个 HTML 构建入口。
- `source/` 管理 React 组件、Hooks、图形模块、业务数据、样式与共用函数；功能按 `features/experience`、`features/story` 分开。
- `public/assets/` 仅保存当前运行素材；`public/vendor/experience` 保存原 WebGL 编译引擎。原始文档、参考图、底稿和提示词在 `materials/`。
- `scripts/` 分为 data、art、qa 和共用 lib；历史 QA 与旧版实现分别在 `docs/qa/legacy`、`docs/archive/pre-react`，新检查输出在 `docs/qa/current`。
- 继续保留原 WebGL 主入口与 Canvas 分层预览。两页界面均由 React 构成；Canvas 渲染算法保持普通模块。原 WebGL 引擎无完整销毁接口，采用每个文档加载一次、跨页原生导航和相关源码整页热重载。
- 使用根目录 npm 命令开发、构建和预览，不再运行旧 server.js。资源路径通过部署基址管理；制作工具使用项目依赖和可配置 Python 解释器。

## 边界

架构与目录迁移不代表 18 镜美术、原 WebGL 画面问题、素材授权或真实设备验收完成。Git 仍遵守 ADR-001；原始资料和历史记录保留。

## 事实来源

`package.json`、`vite.config.js`、`source/`、`scripts/`、`docs/STRUCTURE.md` 与本轮 QA。
