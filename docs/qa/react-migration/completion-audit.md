# 架构与目录整改完成审计

日期：2026-10-07。基线：`97448495e0064cacc8f5bd76fa4ae54c4a901d8f`。

| 用户要求 | 当前事实与证据 |
| --- | --- |
| 改为 React + Vite | package.json 和锁文件安装 React/ReactDOM/Vite；双 HTML 加载 source/main.jsx、source/story.jsx；两页均由 React 组件组织界面和交互。生产构建同时输出两个入口。 |
| 标准工程目录 | 根目录为配置与入口，source 为应用，public 为发布资源，scripts 为工具，materials 为制作来源，docs 为规范、QA、归档，wiki_memory 为工程记忆。职责与旧路径映射见 docs/STRUCTURE.md。 |
| 使用 source 管理源码 | JSX 页面、Hooks、业务数据、样式、Canvas 引擎与共用函数均在 source；保留的编译 WebGL 库位于 public/vendor，生成适配器位于 scripts/lib。活动 HTML 不嵌入旧静态页面或播放器。 |
| 消除 网页/网页 重复嵌套 | 旧网页目录已移除；项目检查直接断言其不存在；所有283个已跟踪迁移对象有新位置与摘要记录。 |
| 深度整理且可继续开发 | 制作与 QA 脚本路径全部迁移；生成素材、原图、提示词、原文、历史 QA 和归档区分；工具使用项目依赖和可配置解释器；README 提供根目录启动、构建和制作命令。 |
| 保留原始工程内容 | file-moves.json 对照 Git 基线记录迁移；200个二进制来源内容摘要不变。时间线除路径外的内容保持，18镜原文与119秒检查通过；历史QA与旧代码保留。原ZIP与未跟踪快照本地保留在忽略目录。 |
| 验证实际迁移结果 | npm ci、lint、check、check:art、build；18镜离线渲染；浏览器双入口、播放、章节、阅读、结束重播、窄屏与 /mudang/ 基址验证。详细范围见 browser-review.json。 |

## 验证边界

本次交付证明架构、目录、资源迁移及记录范围内的运行行为。保留引擎的纸色空白、原有18镜美术待办、真实手机、音频听感与授权核对仍有独立待办，不能由构建和文件检查推定完成。

## Git 交付

按 ADR-001 审阅完整差异并统一提交到现有 main，核对 origin 为用户指定 Mudang 仓库后推送；具体提交及远端结果以 Git 记录为准。
