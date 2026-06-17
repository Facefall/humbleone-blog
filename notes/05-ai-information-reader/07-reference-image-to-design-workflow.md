---
layout: page
title: Source Desk 参考图转设计稿工作流
date: 2026-06-17
tags:
  - AI-Reader
  - Source-Desk
  - Figma
  - Stitch
description: 将 Source Desk 参考图转为 Figma / Stitch 设计稿的流程、组件拆解和验收标准。
---

# Source Desk 参考图转设计稿工作流

## 1. 当前结论

代码不再继续盲调视觉质感。先把参考图转成一份可评审的 Figma / Stitch 设计稿，再按设计稿回到 Radix + Stitches 实现。

更合理的顺序是：

```text
参考图 -> Figma / Stitch 设计稿 -> 组件状态板 -> 代码实现
```

原因：

- 参考图里的质感主要来自材质、字体、层级、图钉/胶带/纸边这些视觉资产。
- 这些内容在 Figma 里比在代码里更容易调。
- 代码阶段应该实现已经确认的组件语言，而不是在 CSS 里反复试错审美。

## 2. 输入图片

当前使用两张图作为主输入：

| 图片 | 路径 | 角色 |
|---|---|---|
| Source Desk / Garden Atlas / Radio Dispatch 概念图 | `apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png` | Source Desk、外部索引卡、模式体系的强参考 |
| 左侧边栏改造方向 | `apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png` | Source Desk 组件质感、纸张状态、Pinned Notes、High Signal 预览卡主参考 |

优先级：

1. 组件质感优先看第二张图右侧的 Source Desk 和 High Signal 卡。
2. 结构和模式体系参考第一张图。
3. 不参考普通 SaaS sidebar。

## 3. Figma 工作流

### Step 1：建立三个 Frame

建议新建：

1. `00 Reference Board`
   - 放入两张参考图。
   - 标注：Source Desk、Pinned Notes、Quick Access、High Signal Preview、Footer Action。
2. `01 Source Desk Component Board`
   - 只画组件，不画完整应用。
   - 输出 SourceDeskShell、SourceSlip、PinnedNote、ClippingItem、HighSignalPreview、DeskFooterAction。
3. `02 Material Tokens`
   - 桌面纹理、纸张纹理、暖纸、胶带、印章墨色、铅笔线、阴影层级。

### Step 2：提取材质

不要直接把整块组件切成图片。

应该提取这些可复用小材质：

- dark desk surface：暗木桌 / 深棕黑颗粒。
- aged paper：米黄旧纸。
- warm paper：高信号纸条 / Add Source 纸条。
- tape fiber：胶带半透明纤维。
- stamp ink：低饱和红棕色印章。
- pencil line：虚线、手绘箭头、drop target。

建议在 Figma 中：

- 将参考图局部复制出来。
- 去色，调成黑白或低饱和纹理通道。
- 用 `multiply / overlay / soft light` 混合到色块上。
- 后续导出为 64x64、128x128 或 256x256 的无缝 WebP/SVG/PNG。

### Step 3：组件拆解

必须拆成组件，而不是只画一张静态稿。

| Figma 组件 | 关键 variants |
|---|---|
| `SourceDeskShell` | default / compact |
| `DeskHeader` | console / masthead |
| `SourceSlip` | default / hover / selected / new / stale / failed / dragging / drop-target |
| `PinnedNote` | ivory / amber / blue / rose |
| `ClippingItem` | default / active / stale |
| `StampBadge` | high-signal / official / github / saved |
| `FreshnessGlyph` | fresh-dot / pulse / faded / broken-line |
| `HighSignalPreview` | open / pinned / hover |
| `DeskFooterAction` | default / hover / pressed |

### Step 4：约束 Auto Layout

可以用 Auto Layout，但不要让它把设计变回普通列表。

规则：

- SourceSlip 可以 Auto Layout，但外层允许轻微 rotation 和 x-offset。
- PinnedNote 可以叠放，允许重叠 4-10px。
- Tape、pin、clip、stamp 可以 absolute position。
- Quick Access 保持紧凑，但每行必须像 clipping，而不是 menu row。
- HighSignalPreview 是独立浮出的纸卡，有旋转、图钉、阴影。

## 4. Stitch 工作流

### Step 1：上传参考图

推荐上传顺序：

1. `ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png`
   - title: `Reference - Source Desk tactile redesign`
2. `ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png`
   - title: `Reference - Source Desk interaction concepts`

### Step 2：生成组件板，不生成完整页面

这一步的目标不是完整产品页面，而是：

```text
Source Desk Component Board
```

必须包含：

- 左侧完整 Source Desk 组件。
- 右侧 High Signal Preview 浮出卡。
- 下方 material tokens。
- 下方 state matrix。

### Step 3：只用 targeted edit

如果输出太像 SaaS sidebar，不要重新生成大变体。

用 targeted edit：

- 让 paper slips 更像纸条。
- 让 pinned notes 更像被钉住的便签。
- 让 quick access 更像 clipping。
- 让 high signal preview 更像外部纸卡。
- 减少统一矩形和现代边框。

## 5. 设计稿验收

设计稿通过后，才回到代码。

验收标准：

| 维度 | 目标 |
|---|---|
| 参考图相似度 | 4/5 以上 |
| 纸张物件感 | SourceSlip / PinnedNote / Preview 都像真实物件 |
| 可读性 | 标签、计数、短文案都能快速扫读 |
| 状态语言 | selected/new/stale/failed/drop-target 能一眼区分 |
| 工程可实现性 | 可以拆成 Radix + Stitches 组件 |
| 非 SaaS 感 | 不像普通 sidebar / dashboard |

不通过的典型症状：

- 所有元素变成统一卡片。
- 全部圆角一致。
- 没有纸张厚度和阴影层级。
- 图钉、胶带、纸边只是装饰，和状态无关。
- High Signal 卡没有浮出层级。

## 6. 回到代码的实现边界

设计稿确认后，代码只做这些：

- 用 SVG/WebP/PNG texture asset 做 background。
- 用 `background-blend-mode` 融合 Stitches token。
- 用 `clip-path` 做纸边和胶带边缘。
- 用 `transform` 做轻微旋转、抽出、浮起。
- 用 `box-shadow` 做接触/悬浮/拖拽层级。
- 用 Radix 做 popover/tooltip/dialog/dropdown 等行为。

代码不再承担：

- 临场发明视觉语言。
- 反复试字体气质。
- 从零模拟复杂真实纹理。
- 用纯 CSS 硬搓所有材质。

## 7. 当前交付文件

- Stitch prompt: `.stitch/reference-transfer/source-desk-image-to-design.prompt.md`
- Figma layer spec: `.stitch/reference-transfer/figma-layer-spec.md`
- 本工作流说明：`notes/05-ai-information-reader/07-reference-image-to-design-workflow.md`
