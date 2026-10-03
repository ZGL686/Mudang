---
type: moc
status: active
kind: process
importance: high
updated: 2026-10-03
topic: work-log-index
source_logs: []
supersedes: null
---

# 工作日志 MOC

> 单一工作日志索引，按更新时间倒序。任务类型通过 `kind` 元数据区分。

| 时间 | 类型 | 目标 | 状态 | 主题 | 日志 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-03 | test | 检查第 14 镜中贵妃回眸关键姿态是否连续，并将其纳入可重复查看的离线动作表。 | archived | shot-14-consort-turn-browser-review | [[日志/2026-10-03-第14镜贵妃回眸验收.md|2026-10-03｜第 14 镜贵妃回眸验收]] |
| 2026-10-03 | feature | 接续第13镜场景层，为四位角色增加独立动作，并调整竖屏人物与旁白布局。 | archived | shot-13-independent-character-poses | [[日志/2026-10-03-第13镜独立人物动作与竖屏构图.md|2026-10-03｜第13镜独立人物动作与竖屏构图]] |
| 2026-10-03 | feature | 补齐第 13 镜“沉香亭 · 清平新调”缺少的园林背景和人物画面。 | archived | shot-13-pavilion-scene-layers | [[日志/2026-10-03-第13镜沉香亭场景图层.md|2026-10-03｜第 13 镜沉香亭场景图层]] |
| 2026-10-03 | feature | 补齐镜11贴年画人物及动作，并完成镜11、镜13的Codex浏览器连续播放检查和最终离线画面刷新。 | archived | shot-11-newyear-paster-and-playback | [[日志/2026-10-03-第11镜贴年画动作与双镜播放检查.md|2026-10-03｜第11镜贴年画动作与双镜播放检查]] |
| 2026-10-03 | feature | 接续镜09的游人行走与花瓣划转，并落实用户本轮明确的GitHub推送目标。 | archived | shot-09-walkers-petal-wipe-and-github-target | [[日志/2026-10-03-第09镜游人步态与花瓣划转.md|2026-10-03｜第09镜游人步态与花瓣划转]] |
| 2026-10-03 | feature | 接续镜09城郊踏青分镜，补齐母子、触花/拦花手臂和独立花枝，检查横竖屏播放并同步工程记忆。 | archived | shot-09-spring-mother-child-action | [[日志/2026-10-03-第09镜母子拦花动作.md|2026-10-03｜第09镜母子拦花动作]] |
| 2026-10-03 | feature | 接续镜09分镜要求，补上跟随游人之后的孩童仰拍。 | archived | shot-09-child-low-angle-view | [[日志/2026-10-03-第09镜孩童仰拍视角.md|2026-10-03｜第09镜孩童仰拍视角]] |
| 2026-10-03 | bug | 修复章节导航暂停跳转后画面保持白屏的问题，并查看故事预览在手机比例视口中的布局。 | archived | paused-chapter-seek-and-narrow-layout | [[日志/2026-10-03-章节跳转修复与窄屏检查.md|2026-10-03｜修复章节暂停跳转并检查窄屏预览]] |
| 2026-10-03 | maintenance | - | archived | git-initialization-and-authentication | [[日志/2026-10-03-启用本地Git与GitHub认证.md|2026-10-03｜启用本地Git与GitHub认证]] |
| 2026-10-03 | test | 确认分层预览是否持续停在加载态，并检查已接入图层的第 12 镜器物移焦。 | archived | preview-load-and-shot-12-browser-review | [[日志/2026-10-03-分层预览加载与第12镜验收.md|2026-10-03｜分层预览加载与第 12 镜验收]] |
| 2026-10-03 | feature | 保留原 WebGL 主入口，同时让制作预览可从主页面打开，并可返回主页面。 | archived | main-preview-route-integration | [[日志/2026-10-03-主入口与分层预览互通.md|2026-10-03｜主入口与分层预览互通]] |
| 2026-10-02 | feature | 补足曲水宴游镜头中的君主与执扇宫女，并消除重复官员的绘制。 | archived | shot-07-character-layers | [[日志/2026-10-02-补齐第07镜角色图层.md|2026-10-02｜补齐第 07 镜角色图层]] |
| 2026-10-02 | maintenance | 按用户提供的记忆架构建立项目记忆，并保存后续按对话提交、推送的工作要求。 | archived | project-memory-bootstrap | [[日志/2026-10-02-初始化工程记忆.md|2026-10-02｜初始化项目工程记忆]] |

## 使用方式

- 由 `python 工具/memory_lint.py index` 生成或刷新。
- 查询时先阅读当前状态，再按关键词定位日志。
- 历史日志是审计记录，不应直接覆盖当前状态。

## 入口

- [[README|工程 Agent 记忆系统]]
- [[AGENTS|记忆维护协议]]
- [[日志/README|工作日志说明]]
- [[当前状态/项目概览|当前项目概览]]
- [[当前状态/系统架构|当前系统架构]]
