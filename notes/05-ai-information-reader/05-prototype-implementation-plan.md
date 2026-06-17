---
layout: page
title: AI 信息阅读器原型实现计划
date: 2026-06-17
tags:
  - AI-Reader
  - Prototype
  - Implementation-Plan
description: AI 信息阅读器从设计文档到可运行原型的分阶段实现计划。
---

# AI 信息阅读器原型实现计划

## 1. 当前目标

把 `AI 信息阅读器` 从产品/视觉文档推进到一个可运行、可评审、可迭代的原型。

这个原型不是最终产品，也不是普通博客页面。它要回答一个核心问题：

> 三栏阅读体验 `[Source Desk] [Today Timeline] [Newspaper Reader]` 是否真的适合日常阅读 AI / Agent / Coding Agent 信息？

当前阶段不急着做 RSS 抓取系统。先验证阅读器体验、组件语言、数据边界和工程骨架。

## 2. 已有 source of truth

实现前必须遵循这些文档：

1. `AGENTS.md`
   - 本仓库是 `Facefall/humbleone-blog`。
   - AI reader 是未来独立 Web 产品的设计/文档面。
   - 博客 v1 不加 React。
   - VitePress 自定义 UI 保持 Vue。
   - Markdown 是公开内容 source of truth。
2. `notes/05-ai-information-reader/01-product-design.md`
   - 产品定位、信息架构、数据模型、阶段计划。
   - 明确 Reader App 不应被塞进普通博客页面。
3. `notes/05-ai-information-reader/02-google-stitch-brief.md`
   - Stitch 生成 Today / Sources / Research / Item Detail 的基础 prompt。
4. `notes/05-ai-information-reader/03-non-commercial-interaction-research.md`
   - Source Desk 取代普通 sidebar 的设计依据。
5. `notes/05-ai-information-reader/04-source-desk-style-bible.md`
   - Source Desk 组件语言、状态、色彩、动效、验收标准。
6. `notes/05-ai-information-reader/08-mvp-standard-version-and-style-contract.md`
   - 明确先做标准功能闭环，但从第一版就保留 Source Desk 组件语义和状态契约。
7. `imgs/`
   - 已有 AI reader 概念图和结构图。
   - 这些图片是第一轮视觉基准，不需要重新生成泛概念图。

## 2.1 现有视觉参考图

当前 `imgs/` 下有三张关键参考图：

| 文件 | 用途 | 原型实现中的角色 |
|---|---|---|
| `imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png` | 左侧入口交互概念：`Source Desk` / `Garden Atlas` / `Radio Dispatch` | 定义未来模式体系；第一轮只实现 Source Desk，但保留 Explore / Signals 作为左栏入口 |
| `imgs/ig_0e746d651c7f2abe016a318af95acc8193b2c2093b3efe0c2e.png` | `AI Builder Daily` Web 展示结构：桌面三栏、移动一级菜单、模式入口关系 | 第一轮 Today 三栏布局的主参考 |
| `imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png` | 左侧边栏改造方向：从正规组件感转向编辑台灵动感 | Source Desk 组件细节的主参考 |

建议参考优先级：

1. 布局优先参考 `ig_0e746d...318af95...png`。
2. Source Desk 细节优先参考 `ig_0e746d...318e1f...png`。
3. 模式体系参考 `ig_0e746d...317c5c...png`。

原则：

- 不再为“第一张三栏概念图”重新调用 imagegen。
- 后续如果改变具体 UI component、layout 或 design color，仍要生成新的 imagegen 图来解释变化效果。
- Stitch prompt 应引用这些图中的结构和物件语言，而不是重新自由探索。

## 3. 项目原则

本计划继承以下执行原则：

1. 编码前必须先有计划。
2. 计划必须写入 Markdown 文件。
3. 大任务必须拆分，并把实现任务交给 subagent / worker。
4. 按阶段推进，不一次性吞掉完整产品。
5. 凡是影响产品范围、架构、技术选型、实现顺序、风险边界或验收标准的决策，都先给用户选项。
6. 每次设计更新，例如 UI component、layout、design color，都必须用 imagegen 生成图像来解释预期效果。
7. 工程实现要按正式工程项目处理：npm 脚本、依赖边界、前后端边界、数据模型、验证命令都要明确。

## 4. 不做什么

当前原型阶段不做：

- 不做完整 RSS 抓取系统。
- 不做账号系统。
- 不做真实多用户订阅。
- 不做生产级搜索。
- 不做无限流 feed。
- 不把 `.codex/automations/` 或私有状态复制进公开 notes。
- 不把 Stitch 输出当作最终实现代码。
- 不绕过用户确认直接决定技术栈。

## 5. 推荐阶段

### Phase 0：决策与骨架

目标：

- 确认原型承载方式。
- 初始化 Stitch loop 所需文档。
- 定义 worker 切分。
- 明确第一轮验收口径。

产物：

- 本计划文件。
- `.stitch/SITE.md`：站点/产品愿景、sitemap、roadmap。
- `.stitch/DESIGN.md`：由现有设计文档整理出的 Stitch 设计系统。
- `.stitch/next-prompt.md`：第一轮 baton，建议从 `source-desk-today` 开始。
- 可选 `CONTEXT.md`：只在术语被确认后创建，作为 glossary，不写实现细节。

### Phase 1：视觉原型

目标：

- 用 Stitch / imagegen 先解释并评审视觉方向。
- 生成 Source Desk + Today Timeline + Newspaper Reader 的第一轮效果。
- 不直接进入生产代码。

产物：

- `.stitch/designs/source-desk-today.*`
- 至少一张 imagegen 概念图，用来解释本轮布局/组件/色彩更新。
- 设计评分表：
  - Source Desk 是否不像 SaaS sidebar。
  - 是否能看出纸质物件状态。
  - 中间 timeline 是否适合每日 3-8 条。
  - 右侧 newspaper reader 是否可读。
  - 工程实现是否可控。

### Phase 2：可运行 UI prototype

目标：

- 建一个可本地运行的 UI 原型。
- 使用假数据，不接真实抓取。
- 采用 `?variant=` 切换 3 个结构不同的 UI 方案。

建议原型问题：

> 三栏信息阅读器到底应该如何组织注意力：Source Desk 优先、Timeline 优先，还是 Newspaper Reader 优先？

产物：

- 一个运行命令。
- 3 个结构不同的 variant。
- 浮动 prototype switcher。
- 假数据：
  - source families
  - feed items
  - daily brief
  - selected item
  - evidence level
  - source health

### Phase 3：最小工程骨架

目标：

- 在 UI 原型胜出后，把结论吸收到真正工程骨架。
- 明确 frontend / backend / data contracts。

产物：

- 前端 shell。
- typed mock data。
- source registry schema。
- feed item schema。
- 本地 API 或 file-backed adapter 的边界设计。
- npm scripts：
  - install
  - dev
  - build
  - typecheck
  - lint 或 format

### Phase 4：Feed Hub tracer bullet

目标：

- 只接 1-2 个可靠源，打通从 source registry 到 daily brief 的最小链路。
- 先验证数据流，不扩源。

建议首批：

- CodeWhale changelog
- 一个官方 RSS/API 源

产物：

- source registry 文件。
- collector stub / adapter interface。
- normalized feed item。
- daily compiler stub。
- Markdown export stub。

## 6. Worker 切分

后续进入实现时，任务应拆给 worker，而不是一个 agent 全包。

### Worker A：UI Prototype

职责：

- 建立可运行的前端原型。
- 实现 `?variant=` 切换。
- 实现假数据驱动的三栏界面。

写入范围：

- 原型 app 目录。
- 原型专用组件。
- 原型 mock data。

不得修改：

- 公开文章正文。
- 私有自动化状态。
- 无关 VitePress 主题。

### Worker B：Design / Stitch Assets

职责：

- 初始化 `.stitch/`。
- 根据 `04-source-desk-style-bible.md` 生成 Stitch baton。
- 维护设计评分表。
- 下载或登记 Stitch 输出资产。

写入范围：

- `.stitch/`
- `notes/05-ai-information-reader/` 中的设计记录。

不得修改：

- 原型 app 业务代码。
- RSS 数据层代码。

### Worker C：Data Contract / Backend Skeleton

职责：

- 定义 source registry、feed item、daily brief 的类型和示例数据。
- 设计 collector / normalizer / compiler 边界。
- 不做大规模真实抓取。

写入范围：

- 数据 schema / mock data / backend skeleton 目录。

不得修改：

- UI 视觉组件。
- Stitch 资产。

## 7. 决策门

### Decision Gate 1：原型承载方式

状态：已确认。

结论：

> 在当前 repo 新建 `apps/ai-reader-prototype`，保持 Reader App 原型与 VitePress 博客分离。

注意：这里确认的是承载位置，不等于确认前端技术栈。

原始选项：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | 在当前 VitePress 博客内做 throwaway prototype route | 改动少，启动快 | 容易把 reader app 误混成博客页面；VitePress 不适合复杂 app | 不推荐 |
| B | 在当前 repo 新建 `apps/ai-reader-prototype` | 可保留独立 app 边界；与当前设计文档联动成本低 | 当前 repo 会暂时变成轻量 monorepo | 已选择 |
| C | 先只做 `.stitch` 和静态 HTML，不写运行时代码 | 最快看视觉 | 无法验证真实交互、状态和工程边界 | 可作为 Phase 1，但不能替代 Phase 2 |
| D | 直接新建独立仓库 | 最干净 | 当前上下文和文档联动成本高 | 适合后续，不适合第一步 |

### Decision Gate 1.5：原型技术栈

状态：已确认。

结论：

> `apps/ai-reader-prototype` 采用 `Next.js + React + TypeScript`。

边界：

- React / Next.js 只进入 `apps/ai-reader-prototype`。
- 不改 VitePress 博客主题为 React。
- 不把 Reader App 原型混进 `notes/` 页面运行时。
- 当前选择服务于“未来产品栈预演”，不是要求博客 v1 技术栈迁移。

决策原因：

- AI reader 的长期目标更接近独立 Web 产品，而不是博客内嵌页面。
- Next.js 更适合提前验证前后端边界、route handlers、future server-side data flow。
- React 生态对正式产品化更成熟，尤其适合后续评估 shadcn/ui、TanStack、AI SDK、数据表格、复杂交互和后台能力。
- 这个选择会带来比 Vite/Vue 更高的第一轮工程成本，但能更早暴露真实产品栈问题。

原始选项：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | Vite + Vue 3 + TypeScript | 贴近当前 VitePress/Vue 依赖；原型轻；不污染博客 v1 的 React 边界；适合做 throwaway UI prototype | 未来如果产品化选择 React/Next，会有一次重写 | 原型阶段推荐 |
| B | Nuxt + Vue 3 + TypeScript | Vue 生态内的全栈方向；比纯 Vite 更接近真实 app；后续可承接 server routes | 第一轮 UI 原型成本高于 Vite；仍不如 Next 生态丰富 | Phase 3 候选 |
| C | Next.js + React + TypeScript | 全栈和 UI 生态成熟；shadcn/ui、AI SDK、TanStack 等组合强；更像正式产品栈 | 与当前 AGENTS 的“博客 v1 不加 React”容易混淆；会在当前 repo 引入 React app，需要明确边界 | 已选择 |
| D | SvelteKit + TypeScript | 轻、快、适合高定制交互 | 当前 repo 和团队上下文少；Stitch/组件生态联动弱 | 不推荐首轮 |

### Decision Gate 2：第一轮原型范围

状态：已确认。

结论：

> 第一轮只做 `Today` 三栏原型：`Source Desk + Today Timeline + Newspaper Reader`。

范围边界：

- 做三栏阅读体验和 `?variant=` 切换。
- 使用 typed mock data。
- 不做真实 RSS/API 抓取。
- 不做完整 `Sources` 页面。
- 不做完整 `Research` 页面。
- 不做完整 `Item Detail` 页面。
- 可以在三栏内用少量假数据露出 source health、evidence level、selected item、daily sections。

原始选项：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | 只做 Today 三栏 | 最快验证核心体验 | Sources / Research 先看不到 | 已选择 |
| B | Today + Sources | 能验证 Source Registry 展示 | 工期更长 | 次选 |
| C | Today + Research | 能验证第二核心页面 | 复杂度上升快 | 暂缓 |
| D | Today + Sources + Research + Item Detail | 最接近设计稿 | 太大，不适合第一轮 prototype | 不推荐 |

### Decision Gate 3：视觉生成顺序

状态：已确认。

现有事实：

> `imgs/` 已经有三张概念/结构图，因此第一步不需要重新生成泛概念图。

结论：

> 使用 `imgs/` 现有图作为视觉基准，先初始化 `.stitch/`，再用 Stitch 做 Today 三栏结构稿。

边界：

- 不重新生成泛概念图。
- 不让 Stitch 自由探索出新的产品方向。
- Stitch 只服务于 `Today` 三栏结构稿与 Source Desk 细节收敛。
- 后续如果改变具体 UI component、layout 或 design color，再用 imagegen 生成变化说明图。

原始选项：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | 使用 `imgs/` 现有图作为视觉基准，先初始化 `.stitch/`，再用 Stitch 做 Today 三栏结构稿 | 避免重复生成；最大化利用已有视觉判断；适合进入 loop | 需要把图片意图翻译成严格 prompt，避免 Stitch 走偏 | 已选择 |
| B | 先把 `imgs/` 图整理成更正式的 imagegen 变化说明图，再进入 Stitch | 视觉说明更统一 | 会重复已有工作，拖慢进入原型 | 不推荐 |
| C | 不走 Stitch，直接按图片编码 Next 原型 | 最快进入代码 | 违反先设计 loop 的目标；容易把视觉判断写死进代码 | 不推荐 |

### Decision Gate 4：后端边界

状态：已确认。

结论：

> 第一轮原型只用 typed mock data。

边界：

- 不建 Next route handlers。
- 不建 `/api/today`。
- 不接 RSS/API。
- 不读取本地 JSON 作为运行时数据源。
- mock data 写成 TypeScript 类型和常量，服务 UI 原型与状态验证。
- 后续 UI 验证通过后，再评估 file-backed API 或真实 collector。

原始选项：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | 原型只用 typed mock data | 快，适合 UI 判断 | 暂不能验证抓取 | 已选择 |
| B | 本地 file-backed API | 能提前验证数据边界 | 会拖慢 UI 原型 | Phase 3 |
| C | 直接真实抓 RSS/API | 看起来完整 | 过早复杂化，偏离当前体验验证 | 暂不推荐 |

### Decision Gate 5：npm 工程组织

状态：已确认。

结论：

> 添加 `pnpm-workspace.yaml`，把 root 和 `apps/*` 作为 workspace 管理。

边界：

- root 继续保留 VitePress 博客脚本。
- 新增 reader 脚本只转发到 `apps/ai-reader-prototype`。
- 不把 Next 依赖加到 root `dependencies`。
- 依赖和 lockfile 由同一个 pnpm workspace 统一管理。

这个决策决定 `apps/ai-reader-prototype` 如何接入当前 repo。

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | 添加 `pnpm-workspace.yaml`，把 root 和 `apps/*` 作为 workspace 管理 | 符合多 app repo；根目录可提供 `reader:dev` / `reader:build`；依赖和 lockfile 集中 | 会把当前博客 repo 正式变成轻量 monorepo，需要小心 root scripts | 已选择 |
| B | `apps/ai-reader-prototype` 内独立 `package.json` + 独立 lockfile | 对博客 root 影响最小 | 脚本、依赖、lockfile 分散；后续协作和 CI 不整洁 | 次选 |
| C | 不安装依赖，只写静态代码草案 | 最少文件变更 | 不可运行，违背可运行 prototype 目标 | 不推荐 |

### Decision Gate 6：组件样式系统工作流

状态：已确认。

结论：

> 采用 `Stitch 设计系统 + Storybook 组件工作台 + Next 页面集成` 的路线。

边界：

- Stitch 负责视觉方向收敛和 design system 生成。
- Storybook 负责组件状态矩阵、交互状态、样式回归和组件文档。
- Next 页面负责真实布局、真实密度、路由和产品体验验证。
- 不把 Stitch 输出直接当最终代码。
- 不在页面实现中隐式决定组件库基座。

推荐流程：

1. 用 `stitch-utilities:taste-design` 强化 `.stitch/DESIGN.md` 的反普通化规则。
2. 用 `stitch-design:manage-design-system` 将设计系统应用到 Stitch 项目。
3. 用 `stitch-design:generate-design` 做定向编辑和少量变体。
4. 用 Storybook 建立 `SourceDesk` 组件族状态矩阵。
5. 视觉和状态稳定后，再把组件集成进 `apps/ai-reader-prototype` 页面。

### Decision Gate 7：UI 组件基座

状态：已确认。

当前候选：

- Radix UI Primitives
- HeroUI

决策问题：

> 我们要用哪个 UI 库作为自定义组件样式的底层基座？

约束：

- 不从零实现可访问性和复杂交互。
- 不直接使用成品库默认视觉。
- Source Desk 仍必须保持纸质物件、编辑台、剪报、索引卡、印章、墨点的视觉语言。
- 页面代码不得直接到处 import 第三方 UI 组件；必须通过项目自己的组件层封装。

候选路线：

| 选项 | 做法 | 优点 | 风险 | 推荐 |
|---|---|---|---|---|
| A | Radix-first：用 Radix Primitives 做无样式可访问基座，所有视觉由我们自己的 CSS / tokens / Storybook 控制 | 最大样式自由度；最适合 Source Desk 这种强定制物件语言；不容易被库默认视觉带偏 | 需要自己写更多视觉层和状态样式 | 推荐 |
| B | HeroUI-first：用 HeroUI 的成品组件和主题系统快速搭建，再深度改主题 | 启动快；React 19 / Next 支持明确；表单、弹窗、列表等现成 | 默认设计系统较强，容易把产品拉回现代 SaaS / dashboard 视觉 | 次选 |
| C | 混合：Source Desk 用 Radix，普通后台/表单/弹窗考虑 HeroUI | 能兼顾强定制和速度 | 同类 primitive 重复、主题系统冲突、bundle 和 API 复杂度上升 | 后续可评估，不建议第一轮就混用 |

确认结论：

> 第一轮采用 Radix-first。HeroUI 保留为后续候选，不进入第一轮核心组件基座。

实现边界：

- Source Desk、Today Timeline、Newspaper Reader 的自定义视觉组件优先用 Radix primitives 承接交互和可访问性。
- 成品视觉由我们自己的 CSS variables、组件 class、Storybook stories 和 `.stitch/DESIGN.md` 控制。
- HeroUI 暂不安装，避免默认主题和组件 API 过早影响 Source Desk 的物件语言。
- 页面层不直接 import Radix；Radix 只出现在项目自己的组件封装内部。

### Decision Gate 8：主题路线

状态：已确认。

结论：

> 第一版先实现 `standard` 标准主题，后续增加主题切换能力，切到最终 `source-desk` 个性化设计版本。

边界：

- `standard` 是 MVP 默认主题，用于先完成完整网站和核心阅读流程。
- `source-desk` 是后续个性化目标主题，用于接近参考图中的编辑桌、纸张物件、剪报和报纸质感。
- 主题切换不是重新做一套页面，而是在同一套组件、数据和交互契约上切换 token、字体、材质、阴影、边缘和微动效。
- 第一版可以只开放 `standard`，但代码结构必须预留 `ReaderTheme = 'standard' | 'source-desk'`。
- 标准主题也必须通过 `SourceSlip / PinnedNote / ClippingItem / NewspaperReader` 等项目自定义组件表达，不能退回普通 `SidebarItem` / `MenuItem`。

候选路线：

| 选项 | 做法 | 优点 | 风险 | 结论 |
|---|---|---|---|---|
| A | 先做标准主题，后续通过主题切换接入 Source Desk 个性主题 | 最快形成完整产品闭环；后续能逐步打磨个性化质感 | 如果组件语义没有提前保留，会退化成普通换肤 | 已选择 |
| B | 一开始就只做 Source Desk 个性主题 | 最接近最终视觉 | 会拖慢功能闭环，容易陷入 CSS 质感微调 | 暂不采用 |
| C | 标准版和个性版各写一套页面 | 表面上隔离清楚 | 维护成本高，状态和数据容易分叉 | 不采用 |

实现口径：

- 顶层应用可使用 `data-theme="standard"` / `data-theme="source-desk"` 或等价 theme provider。
- Storybook 至少能在组件层切换两个主题。
- 页面逻辑不依赖主题判断分叉。
- `source-desk` 主题未完成前，标准主题作为唯一可用运行主题。

## 8. 第一轮验收

第一轮不以“功能多”为成功标准，而以体验判断为成功标准。

必须能回答：

1. Source Desk 是否比普通 sidebar 更适合这个产品？
2. 三栏宽度是否合理？
3. 每日 3-8 条是否能自然分布到 `硬新闻 / 案例 / 有意思`？
4. 右侧 Newspaper Reader 是否应该默认显示第一条内容？
5. 是否需要保留 3 个 newspaper skins，还是先只实现一个？
6. 这个原型是否值得进入真实工程骨架？

## 9. 下一步

下一步是创建 `apps/ai-reader-prototype` 的 Next.js 原型骨架，并把 UI / mock data 切给 worker。

Decision Gate 1 与 1.5 已确认：

- 原型承载位置：`apps/ai-reader-prototype`
- 原型技术栈：`Next.js + React + TypeScript`
- 第一轮原型范围：只做 `Today` 三栏
- 视觉生成顺序：复用 `imgs/` 作为视觉基准，初始化 `.stitch/` 后进入 Stitch loop
- 后端边界：只用 typed mock data
- npm 工程组织：pnpm workspace
- 主题路线：先实现 `standard`，后续通过主题切换接入 `source-desk`

已确认的第一轮实现边界：

- 只做 Today 三栏。
- Next.js + React + TypeScript 只在 `apps/ai-reader-prototype`。
- 数据只用 typed mock data。
- 原型必须支持 `?variant=` 切换。
- 原型必须预留 `ReaderTheme`，但第一轮可以只开放 `standard` 主题。
- 后续设计变更继续用 imagegen 或现有 `imgs/` 解释视觉效果。
