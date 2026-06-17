# Source Desk Style Bible

> 面向 AI / Agent / Coding Agent 信息订阅阅读器的左侧入口设计语言、组件规格与交互质感说明。

版本：0.1  
日期：2026-06-17  
状态：设计规格草案  
关联文档：

- `01-product-design.md`
- `02-google-stitch-brief.md`
- `03-non-commercial-interaction-research.md`

---

# 1. 当前结论

现在要解决的不是“左侧栏再漂亮一点”，而是把左侧栏从普通 SaaS 导航，变成一个有编辑气质的“信息源工作台”。

第一版采用 `Source Desk` 作为默认入口隐喻：

- 左侧不是 sidebar，而是 `source desk`。
- 每个入口不是 menu item，而是可以被拿起、夹住、盖章、钉住的纸质物件。
- 每个状态不是普通 badge，而是阅读过程留下的痕迹。
- 交互不是商业软件的 hover 高亮，而是轻微纸张抬起、抽屉拉出、盖章、翻卡片、夹纸条。

这份文档的目标是让 Stitch、Figma 或前端实现时都有明确约束，不再依赖一句“更灵动”的抽象描述。

---

# 2. 设计方向

## 2.1 一句话

一个私人的 AI 信息编辑桌：每天把有价值的信号、来源、剪报、批注和待跟进线索整理成一份可阅读的报纸。

## 2.2 气质关键词

- 非商业
- 编辑室
- 纸张物件
- 手工整理
- 轻微凌乱
- 有痕迹
- 可信
- 可探索
- 低打扰

## 2.3 不是这些

- 不是 Notion 式灰白列表。
- 不是 SaaS dashboard。
- 不是 Slack/Discord 左侧频道栏。
- 不是游戏化积分系统。
- 不是过度拟物、牺牲阅读效率的装饰品。

---

# 3. 设计原则

## 3.1 信息先物件化，再组件化

每个导航入口都必须先回答：它在编辑桌上是什么物件？

示例：

| 信息类型 | 物件隐喻 | 视觉表现 |
|---|---|---|
| 全部来源 | 文件夹 | 宽纸条、折角、文件夹图标 |
| 高信号 | 被圈出的纸条 | 橙色墨点、闪电小戳记 |
| 已批注 | 批注卡 | 斜放便签、铅笔痕迹 |
| 已归档 | 档案袋 | 褪色纸张、低对比度 |
| 今日列表 | 当日报纸 | 小报头、日期、版次 |
| 探索模式 | 种子卡 | 枝蔓线、节点 |
| 信号模式 | 电台频率 | 波形、仪表、脉冲点 |

## 3.2 个性来自状态，不来自堆装饰

不要只加纸纹、贴纸、胶带。真正的个性应该来自状态：

- 新来源像刚放上桌的纸条。
- 高频更新像边角有墨点渗出。
- 被选中的来源像被抽出来压在最上面。
- 已读来源像被翻过一次，有轻微压痕。
- 失效来源像褪色的旧纸，仍可访问但不抢注意力。

## 3.3 主路径必须简单

左侧可以有气质，但不能让用户迷路。

第一版主路径固定为：

1. `Today`
2. `Sources`
3. `Explore`
4. `Signals`
5. `Library`

桌面端可以展开成 Source Desk；移动端用底部一级菜单进入不同模式。

## 3.4 交互像真实物件

优先使用这些动作隐喻：

- 抬起：hover
- 抽出：selected
- 盖章：mark / save / read
- 钉住：pin
- 夹住：save to clipping
- 翻面：show metadata
- 展开索引卡：preview
- 放入抽屉：archive

避免这些普通交互：

- 纯色 hover 块
- 圆角 pill everywhere
- 蓝色 SaaS active border
- 统一等高列表
- 全部元素严格网格对齐

## 3.5 非商业感来自节奏

这个产品不是让人无限刷，而是让人更好地读。

所以动效应该慢一点、轻一点、有结束感：

- hover：120-180ms
- 抽出选中：180-260ms
- 盖章反馈：220-320ms
- 弹出索引卡：160-220ms
- 页面切换：260-380ms

---

# 4. 视觉原语

## 4.1 材料

| 原语 | 用途 | 建议表现 | 禁止 |
|---|---|---|---|
| 深木桌面 | 左侧背景 | 深棕黑、低饱和、细微颗粒 | 纯黑大块 |
| 旧纸 | 一级入口 | 米白、轻微噪点、边缘不完全齐 | 干净白色卡片 |
| 索引卡 | 预览、分类 | 更厚的纸、阴影更明显 | 普通 tooltip |
| 便签 | pinned notes | 微黄、可轻微倾斜 | 统一卡片列表 |
| 剪报 | saved/clippings | 窄条、左侧裁切感 | 常规 bookmark list |
| 邮戳 | 状态标签 | 小写印章、压印感 | 现代 badge |
| 墨点 | 新鲜度 | 小点、渗墨、短脉冲 | 数字红点轰炸 |
| 铅笔线 | 关系与批注 | 虚线、手绘感 | 正规流程图线 |

## 4.2 色彩

```css
:root {
  --desk-bg: #160b07;
  --desk-bg-raised: #21110b;
  --desk-border: #4a2d20;
  --desk-ink: #f0d8c4;
  --desk-muted: #9e7f70;
  --paper: #f1ede3;
  --paper-aged: #ded4c2;
  --paper-shadow: rgba(0, 0, 0, 0.38);
  --ink: #1d1712;
  --ink-soft: #4b3a31;
  --accent-copper: #ffb287;
  --accent-signal: #ff7b3d;
  --accent-green: #8ea36d;
  --accent-blue: #7a9bb8;
  --stamp-purple: #8f6fbd;
}
```

使用原则：

- 大背景保持深棕黑，不要用纯黑。
- 纸张颜色不要纯白，要有温度。
- 高亮色只用于信号、钉子、邮戳、边角，不要大面积铺满。
- 数字计数可以用铜橙色，不要用 SaaS 蓝。

## 4.3 字体气质

推荐方向：

- 报纸正文：serif，偏传统和可读。
- 左侧标签：condensed mono 或窄体 sans，像档案标签。
- 批注文字：italic serif 或手写感较弱的字体，不要幼稚手写体。
- 数字：tabular mono，像档案编号。

如果交给 Stitch：

```text
Use a distinctive editorial typography system: bold newspaper serif for titles, narrow archival mono for labels and counters, italic serif for notes. Avoid Inter, Roboto, Arial, and generic system UI typography.
```

---

# 5. 组件规格

## 5.1 SourceDeskShell

左侧栏的根容器。

职责：

- 承载 Source Desk 的背景、整体光照、滚动区域和底部操作区。
- 为所有纸张物件提供统一的深色桌面环境。
- 在桌面端作为左栏，在移动端作为一级页面。

结构：

```text
SourceDeskShell
  DeskHeader
  SourceSlipGroup
  PinnedNoteStack
  ClippingList
  DeskFooterAction
```

规格：

| 属性 | 建议 |
|---|---|
| 桌面宽度 | 280-320px |
| 移动宽度 | 100vw |
| 背景 | 深棕黑 + subtle grain |
| 滚动 | 内部滚动，不影响右侧阅读区 |
| 底部按钮 | 固定在底部，像桌面边缘的长条按钮 |

## 5.2 DeskHeader

编辑桌标题区域。

用途：

- 显示产品身份。
- 显示当前日期或版次。
- 提供极少量全局动作，例如搜索、设置、折叠。

建议内容：

```text
阅见 AI
VOL. 1 / NO. 024
Jun 17, 2026
```

交互：

- hover 标题时，显示一行很淡的 subtitle：`personal signal desk`。
- 点击日期可以进入当日简报归档。
- 不要放太多图标，最多 2 个。

## 5.3 SourceSlip

核心导航组件。它不是 menu item，而是一张可以被抽出的纸条。

适用：

- All Sources
- Annotated
- High Signal
- Archived
- Today
- Sources
- Explore
- Signals
- Library

解剖：

```text
[左侧物件图标]  [标题]           [计数]
[可选：短状态线 / 微型信号点]
```

属性：

| 属性 | 类型 | 说明 |
|---|---|---|
| `label` | string | 入口名称 |
| `count` | number | 数量 |
| `kind` | enum | `folder` / `note` / `signal` / `archive` / `route` |
| `state` | enum | `default` / `hover` / `selected` / `new` / `stale` / `disabled` |
| `freshness` | number | 0-100，用于新鲜度墨点 |
| `signal` | number | 0-100，用于高信号强度 |

视觉：

- 默认是浅米色纸条，轻微倾斜 `-0.8deg` 到 `0.8deg`。
- 同组纸条不要完全等宽等高，可以有 2-4px 的微差。
- 选中时纸条向右抽出 6-10px，左边露出铜橙色纸边。
- 高信号纸条可以有小闪电戳记，但不要整条变亮。

交互：

| 状态 | 表现 |
|---|---|
| default | 平放，轻微阴影，低对比度 |
| hover | 抬起 2px，旋转趋近 0deg，阴影变清晰 |
| selected | 向右抽出，左边铜橙边缘，标题墨色更深 |
| new | 右上角出现小墨点，2 秒内只脉冲一次 |
| stale | 纸张变灰，文字偏淡，图标像铅笔淡描 |
| disabled | 保留形状，但降低透明度，不能出现强 hover |

CSS 意向：

```css
.source-slip {
  transform: rotate(var(--slip-rotate, -0.6deg)) translateX(0);
  box-shadow: 0 8px 18px var(--paper-shadow);
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.source-slip:hover {
  transform: rotate(-0.1deg) translateY(-2px) translateX(2px);
}

.source-slip[data-state="selected"] {
  transform: rotate(0.15deg) translateX(8px);
}
```

## 5.4 PinnedNote

被钉住的来源提醒或个人批注。

适用：

- 常看的来源。
- 人工添加的观察。
- 今日待跟进。
- 对某个信息源的长期判断。

解剖：

```text
[pin / tape]
source name          time
short handwritten-like note
```

视觉：

- 比 SourceSlip 更像便签。
- 宽度略窄，位置可以有 1-2 度倾斜。
- 顶部可以出现小胶带、图钉、纸夹。
- 便签之间可以有轻微重叠，但不能影响可读性。

交互：

| 动作 | 表现 |
|---|---|
| hover | 便签上沿抬起，露出阴影 |
| click | 打开对应来源或文章 |
| drag | 变成 floating note，可拖到 clipping 或 archive |
| pin/unpin | 图钉有一次轻微压下动画 |

文案风格：

- 短。
- 像私人编辑备注。
- 不要像系统通知。

示例：

```text
Anthropic Engineering
Claude Code 产品线值得跟踪，尤其是 CLI 与 coworker 的协作模型。
```

## 5.5 ClippingItem

剪报入口，用于快速访问固定栏目或收藏集合。

适用：

- AI Builder Daily
- arXiv: CS.AI
- Hacker News
- Claude Code
- Wayland Zhang
- CodeWhale

视觉：

- 更窄、更安静。
- 可以像从报纸边角裁下来的条目。
- 左侧用短色条表示栏目类别，不用大图标。

交互：

- hover 时左侧短色条拉长。
- selected 时像夹进金属夹，右侧出现一个小夹子。
- 可以支持拖拽排序，但第一版视觉上先表达“可夹取”即可。

## 5.6 StampBadge

替代普通 badge 的状态组件。

适用状态：

- `HIGH SIGNAL`
- `LLM`
- `ARCHITECTURE`
- `NEW`
- `RESEARCH`
- `READ`
- `SAVED`

视觉：

- 小写或全大写均可，但要像印章。
- 边框略微不均匀。
- 可以有 2-4 度轻微旋转。
- 不要使用现代圆角 pill。

规格：

| 类型 | 色彩 |
|---|---|
| high signal | copper / orange |
| research | muted blue |
| architecture | aged brown |
| llm | pale violet |
| saved | green gray |
| warning | dull red |

## 5.7 FreshnessGlyph

表达来源新鲜度、更新强度和异常信号的小型图形。

不要用普通红点通知。使用更有物感的信号：

| 数据 | 表现 |
|---|---|
| 刚更新 | 小墨点 |
| 高频更新 | 三个短竖线，像电报信号 |
| 长期未更新 | 褪色空心点 |
| 抓取失败 | 破损短线，不要红色报警 |
| 高价值信号 | 铜橙小星或闪电戳 |

位置：

- SourceSlip 右上角。
- PinnedNote 左上角。
- ClippingItem 右侧。

## 5.8 IndexPreviewPopover

hover 来源或分类时出现的索引卡预览。

用途：

- 显示该来源最近 3 条。
- 显示抓取方式。
- 显示更新频率。
- 显示为什么值得关注。

视觉：

- 像一张厚索引卡，不像现代 tooltip。
- 可以偏移到右侧，略微盖住中间时间线。
- 阴影明显，边角略旧。

内容结构：

```text
Claude Code
type: official blog / engineering
last update: 2h ago

recent:
- Desktop app release notes
- Engineering notes on agent reliability
- CLI workflow update

why follow:
成熟 coding agent 产品的工程迭代样本。
```

交互：

- hover 160ms 后出现，避免扫过时频繁闪烁。
- 卡片内部可以点击，但不要过度复杂。
- 鼠标离开后 120ms 延迟关闭。

## 5.9 DeskFooterAction

底部主要动作按钮。

默认动作：

```text
+ Add Source
```

可选动作：

- `New Research`
- `Tune Source`
- `Import RSS`

视觉：

- 像桌面边缘的一张长纸条或抽屉标签。
- 不要使用普通 primary button。
- 可以有一个局部印章，例如 `STAMP`、`NEW`。

交互：

- hover 时纸条被轻轻向上推。
- click 时出现盖章反馈。
- loading 时不是 spinner，而是短波形或墨点移动。

---

# 6. 状态语言

## 6.1 全局状态表

| 状态 | 视觉语言 | 动效 | 用途 |
|---|---|---|---|
| default | 平放纸张 | 无 | 常规入口 |
| hover | 抬起、影子变深 | 120-180ms | 鼠标探索 |
| selected | 抽出、纸边高亮 | 180-260ms | 当前路由 |
| unread | 小墨点、轻微新纸色 | 脉冲一次 | 有新内容 |
| high-signal | 铜橙戳记 | hover 时短闪 | 高价值 |
| stale | 褪色、边角灰 | 无 | 长期未更新 |
| failed | 破损线、低饱和红棕 | 无 | 抓取失败 |
| dragging | 浮起、旋转归零 | 跟随指针 | 拖拽整理 |
| drop-target | 虚线框、纸张下沉 | 160ms | 可放置位置 |

## 6.2 阅读痕迹

阅读器的个性应该来自“我使用过它”的痕迹：

- 已读过的来源：纸色略暗，标题不再纯黑。
- 常打开的来源：纸张边缘有轻微磨损。
- 刚保存的条目：出现一次盖章。
- 刚批注的内容：旁边出现铅笔短线。
- 长期忽略的来源：自动下沉到更暗的层级。

第一版可以只实现视觉静态状态，不必实现真实行为数据，但组件必须预留状态。

---

# 7. 桌面布局规则

## 7.1 三栏结构

桌面端保持：

```text
[Source Desk 280-320px] [Today Timeline 420-480px] [Newspaper Reader flexible]
```

规则：

- Source Desk 负责“入口与来源感”。
- Today Timeline 负责“今天有什么”。
- Newspaper Reader 负责“沉浸阅读”。

不要把 Source Desk 做成全功能控制台。它只负责入口、收藏、来源状态和模式切换。

## 7.2 Source Desk 内部层级

推荐顺序：

1. 顶部身份与日期。
2. 主要入口纸条。
3. Pinned Notes。
4. Clippings / Quick Access。
5. 底部 Add Source。

第一屏必须能看到：

- 当前产品身份。
- 至少 3 个主入口。
- 1-2 条 pinned notes。
- 底部主动作。

## 7.3 非均质布局

为了避免“太正规”，允许这些微差：

- 纸条轻微错位。
- 便签轻微倾斜。
- 区块间距不是完全均分。
- 某些纸条略长或略短。
- pinned notes 可以轻微重叠。

限制：

- 文字基线仍要可读。
- 点击区域仍要稳定。
- 不要让随机性每次刷新都变化太大。
- 不要让装饰遮挡标题和计数。

---

# 8. 移动端规则

移动端不要强行保留三栏。

使用一级底部菜单：

```text
Today | Sources | Explore | Signals | Library
```

每个入口打开一个独立全屏模式：

| 入口 | 页面 |
|---|---|
| Today | 当日时间线 |
| Sources | Source Desk |
| Explore | Garden Atlas |
| Signals | Radio Dispatch |
| Library | 个人资料库 |

移动端 Source Desk：

- 可以更像一叠卡片。
- 纸张旋转角度更小。
- 少用 hover，改用 tap 展开。
- 长按可以触发 pin / archive / annotate。

---

# 9. 动效规则

## 9.1 动效人格

关键词：

- 轻
- 慢半拍
- 有重量
- 有结束
- 像纸张，不像弹簧 UI

## 9.2 推荐动效

| 场景 | 动效 |
|---|---|
| 页面载入 | 纸条从桌面下方轻微滑入，分批出现 |
| hover 纸条 | 抬起 2px，阴影加深 |
| selected | 纸条向右抽出 |
| 保存 | 小邮戳压下并回弹一次 |
| pin | 图钉压入，便签略微下沉 |
| archive | 纸条向下滑入暗色抽屉 |
| drag | 纸条浮起，影子扩大，旋转归零 |
| drop | 纸条落下，有 1px 过冲 |

## 9.3 禁止动效

- 过强弹簧。
- 无限循环炫光。
- 大面积 shimmer。
- 过多 confetti。
- 所有元素同时飞入。

---

# 10. Stitch 使用 Prompt

下面这段用于继续要求 Stitch 优化左侧 Source Desk。

```text
Refine the left sidebar into a component-driven Source Desk design system, not a normal SaaS sidebar.

The app is an AI / agent / coding-agent information reader with a three-pane layout:
left Source Desk, middle Today Timeline, right newspaper-style article reader.

The right newspaper reader is already good. Do not redesign it. Focus on the left Source Desk interaction quality and tactile personality.

Design direction:
- The left rail should feel like a private editor's desk for managing sources, notes, clippings, and signal feeds.
- Every navigation item should look like a physical paper object: paper slip, pinned note, clipping, index card, stamp, folder tab, ink dot, or desk label.
- Avoid generic SaaS navigation, uniform cards, rounded pills, dashboard widgets, and clean corporate sidebars.
- Make it non-commercial, handcrafted, editorial, warm, tactile, and slightly irregular, while still readable and usable.

Required components:
1. SourceDeskShell: dark brown wooden desk background with subtle grain.
2. DeskHeader: product name, issue/date metadata, minimal actions.
3. SourceSlip: main route item, represented as a paper slip with icon, label, count, and freshness mark.
4. PinnedNote: small note cards with tape or pin, short editorial comments.
5. ClippingItem: narrow clipping rows for quick access feeds.
6. StampBadge: small stamped labels such as HIGH SIGNAL, LLM, RESEARCH.
7. FreshnessGlyph: ink dot, pulse line, faded dot, or small signal mark instead of standard notification badges.
8. DeskFooterAction: Add Source button as a long paper strip or drawer label.

Interaction states to visually express:
- default: paper lies flat
- hover: paper lifts slightly with deeper shadow
- selected: paper is pulled out to the right with copper paper edge
- unread/new: tiny ink dot or one-time pulse
- stale: faded paper and low-contrast ink
- failed: subtle broken line, not aggressive red alert
- dragging: floating paper slip with stronger shadow
- drop target: dashed pencil outline or empty paper slot

Micro-detail requirements:
- Use slight rotation variation between paper slips, but keep text readable.
- Add small edge imperfections, paper shadows, paper grain, tape, pins, and stamp marks.
- Use copper/orange accents sparingly for high signal or selected states.
- Use editorial typography: newspaper serif for large titles, narrow archival mono for labels and counters, italic serif for handwritten notes. Avoid Inter, Roboto, Arial, and generic system UI fonts.
- Keep the main route simple: Today, Sources, Explore, Signals, Library.
- On mobile, convert these into a bottom-level menu where each opens a full-screen mode.

Output expectation:
- Produce a detailed web app mockup showing desktop and mobile.
- Show at least one hover/selected/new/stale state in the Source Desk.
- Include a small component board for SourceSlip, PinnedNote, ClippingItem, StampBadge, and FreshnessGlyph.
- Preserve the existing postmodern retro newspaper article reader on the right.
```

---

# 11. 前端实现 Checklist

第一版实现时，不要一次做完整产品。先验证 Source Desk 的组件语言是否成立。

## 11.1 第一批组件

建议优先实现：

1. `SourceDeskShell`
2. `SourceSlip`
3. `PinnedNote`
4. `ClippingItem`
5. `StampBadge`
6. `FreshnessGlyph`
7. `DeskFooterAction`

暂缓：

- 拖拽排序。
- 真正的个性化算法。
- 完整 source health 可视化。
- Garden Atlas 和 Radio Dispatch 的复杂交互。

## 11.2 第一批状态

必须支持：

- `default`
- `hover`
- `selected`
- `new`
- `stale`

可以暂缓：

- `dragging`
- `drop-target`
- `failed`
- `loading`

## 11.3 验收标准

视觉验收：

- 截图一眼看上去不像普通 sidebar。
- 每个入口都像真实桌面物件，而不是列表项。
- 选中态、新内容、过期态能通过物件变化表达。
- 与右侧报纸阅读区气质一致，但不抢阅读区主角。

交互验收：

- hover 有纸张抬起感。
- selected 有抽出感。
- 点击区域稳定，不因视觉倾斜导致误点。
- 移动端没有 hover 依赖。

实现验收：

- 组件状态由 props 控制，不写死在样式里。
- 颜色、阴影、纸张纹理、动效时间使用 token。
- 不依赖随机数生成关键布局，避免刷新后 UI 跳变。
- 装饰元素不影响可访问性和文本读取。

---

# 12. 决策边界

已确认：

- 第一版采用三栏 Web 阅读器结构。
- 右侧阅读区走真实报纸构图。
- 左侧默认使用 Source Desk 方向。
- 不做今日头条算法，按列表顺序显示。
- 信息源聚合采用官方 RSS/API 优先，RSSHub 补缺，自定义抓取兜底。

待后续确认：

- Source Desk 是否作为唯一默认左栏，还是允许切换 Garden Atlas / Radio Dispatch。
- 是否在 MVP 中实现拖拽 pin / archive。
- 是否将 Source Desk 做成独立可复用 Vue 组件库。
- 是否先在博客仓库做原型，还是新建独立 app 仓库。

---

# 13. 下一步

建议顺序：

1. 用本文件的 Stitch Prompt 继续生成组件板和页面细节。
2. 从 Stitch 输出中选定 SourceSlip、PinnedNote、ClippingItem 的最终形态。
3. 在前端原型里只实现 Source Desk 左栏和假数据。
4. 再接入中间 Today Timeline 与右侧 Newspaper Reader。

不要下一步就做 RSS 抓取系统。当前最需要验证的是：这个阅读器的核心体验是否真的有记忆点，是否能让你每天愿意打开。
