---
layout: page
title: Source Desk 技术实现路线
date: 2026-06-17
tags:
  - AI-Reader
  - Source-Desk
  - Frontend
  - Storybook
description: Source Desk 纸质物件化组件的 CSS、SVG、图片资产与 Storybook 实现路线。
---

# Source Desk 技术实现路线

## 1. 结论

当前路线采用：

> CSS-first + SVG micro-assets + 少量 bitmap texture atlas。

具体含义：

- 组件结构和可访问性交互用 `Radix UI Primitives` 承接。
- 样式系统用 `Stitches` 的 `styled` / `css` / theme token 承接。
- 纸张、胶带、阴影、抽出、悬浮、褪色、失败、drop target 等状态优先用 CSS 实现。
- 图钉、夹子、邮戳破损边、手绘虚线、波形等小形状可以用 SVG micro-assets。
- 真实纸纹、胶带纤维、桌面颗粒这类高频噪声纹理，后续再做小尺寸 bitmap texture atlas。
- 不采用“整张组件截图切图”的路线。

原因：Source Desk 的关键不是静态装饰，而是状态语言。纸张被 hover、selected、new、stale、failed、dragging、drop-target 时必须可以由 props 和 token 控制。如果做成整图，视觉接近但交互和维护会很差。

## 2. 技术分工

| 层 | 责任 | 第一轮做法 |
|---|---|---|
| Radix | 行为、可访问性、焦点管理、popover/tooltip/dialog/dropdown 等 primitives | 只在项目自定义组件内部使用，不把 Radix 默认视觉暴露到页面 |
| Stitches | theme token、组件 variants、状态矩阵、Storybook 展示 | `SourceDeskShell` / `SourceSlip` / `PinnedNote` / `ClippingItem` / `StampBadge` / `FreshnessGlyph` |
| CSS 材质 | 纸纹、桌面颗粒、胶带透明感、阴影层级、clip-path 不规则边缘 | 优先用 multiple backgrounds、pseudo-elements、box-shadow、drop-shadow、clip-path |
| SVG micro-assets | 图钉、夹子、手绘虚线、破损边、邮戳扰动、波形 | 第二阶段补充，不在首轮阻塞组件收敛 |
| bitmap texture atlas | 高质量纸纹、胶带纤维、油墨颗粒 | 只做小图平铺或 mask，不做整组件切图 |
| Storybook | 组件状态矩阵、材质样本、视觉回归入口 | 每 10 轮收敛后停下评审 |
| Playwright | 截图验证和桌面/移动 viewport 检查 | 对 Storybook iframe 截图，避免只靠代码想象 |

## 3. 方案比较

| 方案 | 适合什么 | 优点 | 风险 | 结论 |
|---|---|---|---|---|
| 整组件图片 | 完全静态海报、概念稿展示 | 最容易贴近示意图 | 不可响应、不好国际化、状态难维护、可访问性差 | 不作为组件路线 |
| 纯 CSS | 纸张、阴影、边缘、hover/selected/drop target 状态 | 可维护、可主题化、性能可控、适合 Storybook 矩阵 | 极细的真实材质会略假 | 第一阶段主路线 |
| CSS + SVG | 图钉、夹子、邮戳、手绘线条、波形 | 可缩放、可着色、适合状态驱动 | SVG 太复杂会提高维护成本 | 第二阶段主路线 |
| CSS + bitmap texture | 真实纸纹、胶带、桌面噪声 | 质感提升明显 | 资产管理和暗色混合要控制 | 第三阶段补充 |
| 全 SVG 组件 | 高度插画化的图形控件 | 形状可控 | 文本流、响应式、交互复杂度高 | 只用于局部 micro-assets |
| Canvas / Houdini | 大量动态颗粒、复杂生成纹理 | 自由度高 | 对当前组件过重，调试和可访问性差 | 暂不采用 |

## 4. CSS 质感手段

当前组件应优先使用这些 CSS 手段：

1. `multiple backgrounds`
   - 叠加纸纹点、纤维线、明暗渐变和底色。
   - 用于 `SourceSlip`、`PinnedNote`、`DeskFooterAction`、索引卡。
2. `::before` / `::after`
   - 做纸边、铜色抽出边、胶带、针脚、底部铅笔线。
3. `box-shadow`
   - 表达纸张接触桌面、hover 抬起、dragging 浮起的不同高度。
4. `filter: drop-shadow()`
   - 用于不规则 `clip-path` 后的外形阴影，避免只有矩形阴影。
5. `clip-path`
   - 做轻微不规则纸边、胶带撕口、底部纸条。
6. `mask-image`
   - 后续用于纸边磨损和胶带透明边，不作为首轮必需项。
7. SVG `feTurbulence`
   - 后续用于可复用的油墨/纸纹 filter，但先不引入复杂 SVG filter 链。
8. 动效只动 `transform` 和 `opacity`
   - hover、selected、dragging 都尽量不动 layout 属性。

参考资料：

- MDN: [Using multiple backgrounds](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Backgrounds_and_borders/Using_multiple_backgrounds)
- MDN: [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- MDN: [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow)
- MDN: [drop-shadow()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/filter-function/drop-shadow)
- MDN: [clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path)
- MDN: [mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image)
- MDN: [::before](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::before)
- MDN: [feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
- web.dev: [How to create high-performance CSS animations](https://web.dev/articles/animations-guide)
- MDN: [Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)

## 5. 实施阶段

### Phase A：材质 token

目标：把纸张、桌面、胶带、阴影、状态颜色抽成 Stitches theme token。

必须有：

- `paper / paperWarm / paperAged / paperDark`
- `deskBg / deskPanel / deskRaised / deskLine`
- `copper / signal / stampRed / blueprint / archiveGreen`
- `paperContact / paperLift / paperFloat / dropSlot`

### Phase B：组件状态矩阵

目标：Storybook 中每个 primitive 都能看到关键状态。

必须覆盖：

- `SourceSlip`: default / hover / selected / new / stale / failed / dragging / dropTarget
- `PinnedNote`: ivory / amber / rose / blue
- `ClippingItem`: fresh / quiet / stale / failed
- `StampBadge`: red / blue / green / copper
- `FreshnessGlyph`: fresh / stale / failed / new pulse

### Phase C：材质样本板

目标：单独建立 `MaterialSamples` story，避免每次都在大页面里判断质感。

样本包括：

- 平放纸张
- 抬起纸张
- 浮起纸张
- drop target 虚线槽
- 胶带
- 暗桌面颗粒
- 印章

### Phase D：SVG micro-assets

目标：在 CSS 质感稳定后补局部小资产。

优先顺序：

1. pin / clip
2. torn tape edge
3. stamp distress
4. pencil dashed line
5. dispatch waveform

### Phase E：texture atlas

目标：如果纯 CSS 仍缺真实纸感，再补小尺寸纹理资产。

约束：

- 纹理只作为 background/mask。
- 每张纹理应可平铺或非常小。
- 不把文字和组件结构烘焙进图片。
- 提供 1x / 2x 或响应式资源策略。

## 6. 验收标准

视觉：

- 一眼不像普通 SaaS sidebar。
- 每个入口都像桌面物件，而不是列表项。
- 状态差异来自纸张位置、阴影、墨点、边缘、褪色，而不是现代 badge。
- 与右侧 newspaper reader 气质一致，但不抢主阅读区。

工程：

- 视觉状态由 props / variants 控制。
- 材质参数进入 token 或局部 primitive，不散落在页面 CSS。
- Storybook 能单独评审组件状态。
- Playwright 能对 Storybook iframe 截图。
- 不依赖整图切片实现主组件。

## 7. 当前执行口径

第 6-10 轮收敛按这个顺序推进：

1. 第 6 轮：补材质 token 和 shared paper surface。
2. 第 7 轮：让 header action 更接近参考图中的 pin / tool，而不是普通 badge。
3. 第 8 轮：补 `MaterialSamples` story。
4. 第 9 轮：补 interaction states story，展示 dragging / drop target。
5. 第 10 轮：Playwright 截图，停下评审。

第 10 轮之后不继续自动扩展，先由用户判断：下一阶段是继续追求“更像图”，还是开始把组件质量推进到更可用的产品级交互。
