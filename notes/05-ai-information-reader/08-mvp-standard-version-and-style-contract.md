---
layout: page
title: AI 信息阅读器 MVP 标准版与风格契约
date: 2026-06-18
tags:
  - AI-Reader
  - MVP
  - Source-Desk
  - Product-Contract
description: 明确 AI 信息阅读器先实现标准功能闭环，再逐步收敛 Source Desk 个性化质感的执行边界。
---

# AI 信息阅读器 MVP 标准版与风格契约

## 1. 当前结论

实现路径应采用：

```text
标准功能闭环优先 -> 标准主题先落地 -> 主题切换预留 -> Source Desk 个性主题增强
```

这不是“先做普通 SaaS，再换皮”。正确边界是：

- 功能闭环先完整。
- 第一版默认使用标准主题，优先保证完整网站可用。
- 从第一版就预留主题切换能力，后续可切到最终 Source Desk 个性主题。
- 数据结构、组件语义和状态语言从第一版就按 Source Desk 设计。
- 纸纹、字体、胶带、图钉、旧纸边、阴影层级、微动效等视觉质感分阶段打磨。

第一版可以视觉粗糙，但不允许结构变成普通 sidebar。

## 2. 为什么不能直接先做高定视觉

参考图中的质感主要来自：

- 材质：桌面颗粒、旧纸、胶带、剪报、索引卡。
- 字体：报纸标题、档案标签、手写批注。
- 层级：纸张叠放、浮出卡、图钉、阴影。
- 状态：抽出、盖章、褪色、墨点、破损线。

这些内容如果在代码阶段边做边猜，会拖慢产品闭环，也容易陷入无休止 CSS 微调。

所以高定视觉应先通过 Figma / Stitch 收敛组件板，再回到代码实现。

## 3. 为什么不能先做普通标准版

如果第一版左侧做成普通导航：

```text
Today
Sources
Explore
Signals
Library
```

后面再加纸纹和阴影，Source Desk 只会变成皮肤。产品的差异化会丢失，因为真正的设计不是装饰，而是：

- 信息源是纸条。
- 备注是便签。
- 快捷入口是剪报。
- 状态是使用痕迹。
- 预览是索引卡。
- 保存、归档、批注是编辑动作。

因此，标准版只能标准化功能，不能标准化成普通 SaaS 组件语言。

## 4. MVP 标准功能版范围

第一版完整网站应先跑通这些能力。

| 模块 | MVP 要做 | 暂缓 |
|---|---|---|
| Today | 展示每日 3-8 条，按硬新闻 / 案例 / 有意思分组 | 今日头条算法、无限流 |
| Source Desk | 展示主入口、来源计数、Pinned Notes、Quick Access | 拖拽整理、复杂健康图谱 |
| Newspaper Reader | 默认展示第一条或选中条目的阅读版 | 多套复杂 newspaper skin 全量实现 |
| Sources | 展示 source family、抓取方式、为什么关注 | 完整源发现、外部用户导入 |
| Item Detail | 展示摘要、来源、证据级别、为什么重要 | 自动全文翻译、复杂引用管理 |
| Library | 保存 / 已读 / 归档的基础状态 | 高级收藏夹和标签系统 |
| Mock Data | 使用 typed mock data 覆盖主要状态 | 第一轮真实 RSS/API 接入 |

第一版的目标是证明：

> 用户每天打开它，能顺畅读完 3-8 条高信号 AI / Agent / Coding Agent 内容，并知道来源为什么可信。

## 5. 第一版必须保留的 Source Desk 契约

即使视觉未完全打磨，组件和数据也必须保留这些语义。

### 5.1 主入口

第一版主入口固定为：

```text
Today | Sources | Explore | Signals | Library
```

实现上可以是页面路由，也可以先是 mock tab，但组件命名不能叫 `SidebarItem`。应使用：

- `SourceSlip`
- `PinnedNote`
- `ClippingItem`
- `StampBadge`
- `FreshnessGlyph`
- `IndexPreviewPopover`
- `DeskFooterAction`

### 5.2 状态语言

第一版至少支持：

| 状态 | 必须有的数据字段 | 第一版视觉表达 |
|---|---|---|
| selected | 当前 route / filter | 纸条抽出或高亮边 |
| new | unread count / fresh flag | 墨点或轻微标记 |
| stale | last update / source health | 褪色、低对比 |
| high signal | importance / signal score | 铜橙小戳记 |
| saved | item status | 盖章或保存痕迹 |
| archived | item status | 下沉、旧纸色 |

可以暂缓：

- dragging
- drop-target
- failed 的完整动效
- pin/unpin 的真实拖拽行为

但这些状态名应预留在类型定义或组件 variant 中。

### 5.3 信息对象映射

| 产品对象 | UI 物件 | 代码对象 |
|---|---|---|
| source family | 纸条 / 文件夹条 | `SourceFamily` + `SourceSlip` |
| 高信号来源 | 被圈出的纸条 | `SourceSignal` + `StampBadge` |
| 个人备注 | 被钉住的便签 | `PinnedNote` |
| 快速访问 | 剪报条 | `ClippingItem` |
| 更新状态 | 墨点 / 破损线 / 褪色 | `FreshnessGlyph` |
| 来源预览 | 索引卡 | `IndexPreviewPopover` |
| 添加来源 | 桌面边缘纸条 | `DeskFooterAction` |

### 5.4 主题切换契约

当前确认采用双主题路线：

| 主题 | 阶段 | 目标 | 边界 |
|---|---|---|---|
| `standard` | MVP 默认主题 | 先完成完整网站、稳定布局和基础交互 | 可以偏克制新闻终端 / 信息工作台，但不能绕过 Source Desk 组件语义 |
| `source-desk` | 个性化目标主题 | 接近参考图中的编辑桌、纸张物件、剪报和报纸质感 | 后续通过 Figma / Stitch 组件板与材质资产收敛 |

主题切换不是简单换颜色。它必须基于同一套组件和数据契约：

- 页面结构不因主题切换而改变。
- `SourceSlip / PinnedNote / ClippingItem / NewspaperReader` 组件不被替换成另一套业务组件。
- 主题只改变 token、材质、字体、阴影、边缘、局部动效和装饰资产。
- 标准主题也必须使用 `SourceSlip` 等语义组件，不能退回 `SidebarItem` / `MenuItem`。
- 后续可以提供一个轻量主题切换入口，例如 `Standard / Source Desk`。

代码层建议预留：

```ts
type ReaderTheme = 'standard' | 'source-desk';
```

第一版可以只实现 `standard`，但组件和 token 命名必须能承接 `source-desk`。

## 6. 阶段路线

### Phase 1：标准功能骨架

目标：先有完整可跑的网站壳。

范围：

- `Today` 三栏页面。
- `Source Desk` 左侧结构。
- `Today Timeline` 中间列表。
- `Newspaper Reader` 右侧阅读区。
- 默认 `standard` 主题。
- 预留 `ReaderTheme` 主题字段或顶层 data attribute。
- typed mock data。
- 基础保存、已读、归档状态。
- Storybook 展示核心组件。

验收：

- 可以从 Source Desk 切换主要视图。
- 可以选中一条 timeline item，并在右侧阅读。
- 可以展示 source count、new count、stale 状态。
- 视觉不必像参考图，但截图不能像普通 SaaS sidebar。

### Phase 2：Figma / Stitch 组件板收敛

目标：把参考图转成可执行的组件设计板。

范围：

- SourceSlip 状态矩阵。
- PinnedNote 叠放和 pin/tape 语义。
- ClippingItem 剪报样式。
- HighSignalPreview 浮出卡。
- Material tokens：desk、paper、tape、stamp、pencil line。

验收：

- 参考图相似度达到 4/5。
- 每个组件能说明自己对应的真实桌面物件。
- 组件板可以指导 Stitches / CSS 实现。

### Phase 3：材质层接入

目标：把已确认的视觉语言接入代码。

范围：

- 字体系统。
- texture assets。
- `background-blend-mode`。
- paper surface token。
- `clip-path` 和不规则边缘。
- 多层 `box-shadow`。
- hover / selected / stale 微动效。
- `source-desk` 主题切换。

验收：

- Storybook 中每个状态能单独评审。
- Playwright 截图能对比桌面和移动 viewport。
- 组件质感接近参考图，但结构仍由数据和 props 控制。

### Phase 4：真实 Feed Hub tracer bullet

目标：接 1-2 个真实源，验证数据流。

范围：

- 1 个 changelog 源。
- 1 个 RSS/API 源。
- normalizer。
- daily compiler stub。
- Markdown export stub。

验收：

- 能生成一份真实或半真实 daily brief。
- 不把私有状态写入公开 notes。
- P0 source 抓取失败时能显示降级状态，而不是生成假内容。

## 7. 冻结与不冻结

### 7.1 现在应该冻结

- 三栏结构：`Source Desk + Today Timeline + Newspaper Reader`。
- 主入口：`Today / Sources / Explore / Signals / Library`。
- 数据对象：`SourceFamily / FeedItem / DailyBrief / ItemStatus / SourceHealth`。
- 第一版范围：mock data 优先，不接全量 RSS。
- Source Desk 组件语义：纸条、便签、剪报、印章、墨点、索引卡。
- 主题路线：`standard` 先实现，`source-desk` 后续通过主题切换进入。

### 7.2 现在不应该冻结

- 具体字体。
- 纸张纹理资产。
- 每个阴影数值。
- 胶带 / 图钉 / 邮戳的最终形状。
- 是否一次性实现所有 newspaper skins。
- Garden Atlas / Radio Dispatch 的复杂交互。
- `source-desk` 主题的最终材质资产和像素级参数。

### 7.3 必须再次确认后才能改变

- 是否放弃 Source Desk 方向。
- 是否从 Next / React 原型转回 Vue / Nuxt。
- 是否提前进入真实 RSS/API 抓取。
- 是否把 Reader App 混入 VitePress 博客运行时。
- 是否把 HeroUI 作为核心视觉基座。

## 8. 代码实现原则

实现标准版时应遵循：

1. 页面可以先标准，组件语义不能标准化成普通 UI。
2. 所有 Source Desk 状态由 props / typed data 控制。
3. Radix 只承接行为和可访问性，不承接默认视觉。
4. Stitches token 先放结构色、状态色和阴影层级。
5. texture assets 后接入，不能阻塞第一版功能闭环。
6. Storybook 必须覆盖组件状态矩阵。
7. 不用整张图片切成组件。
8. 主题切换通过顶层 theme token / data attribute 控制，不通过复制一套页面实现。

## 9. 验收标准

### 9.1 标准功能版通过标准

- 能完成从打开 Today 到读完一条 item 的完整流程。
- 每条 item 有来源、摘要、证据级别、为什么重要。
- Source Desk 至少显示主入口、来源状态、Pinned Notes、Quick Access。
- 基础状态 `selected / new / stale / high-signal / saved / archived` 可见。
- 移动端不依赖 hover。
- `standard` 主题可以作为默认主题稳定运行。
- 组件结构已预留 `source-desk` 主题切换，不需要重写页面。

### 9.2 风格契约通过标准

- Source Desk 截图一眼不像普通 SaaS sidebar。
- 入口不是均质 menu row，而是 SourceSlip。
- 状态不是普通 badge，而是痕迹或物件变化。
- Pinned Notes 和 ClippingItems 不只是普通 card/list。
- 设计资产可以替换，但组件契约不被推翻。

### 9.3 不通过症状

- 所有入口都变成同等高度的菜单项。
- 高信号只用一个现代圆角 badge 表示。
- selected 只是背景变色。
- source health 只是一串红黄绿点。
- 右侧 newspaper reader 变成普通详情卡片。
- 视觉打磨需要改动核心数据结构。

## 10. 下一步

下一步应执行：

```text
1. 定义 typed mock data、组件 props contract 和 ReaderTheme 契约
2. 先实现 standard 主题下的 Today 三栏功能闭环
3. 补 Storybook 组件状态矩阵
4. 并行推进 Figma / Stitch Source Desk 组件板
5. 后续把 source-desk 主题作为可切换主题接入
```

不要下一步就进入全量视觉微调，也不要下一步就开始真实抓取 RSS。

当前最需要的是：让标准功能版能跑起来，同时保证它从第一天起就是 Source Desk 信息物件模型，而不是普通导航模型。
