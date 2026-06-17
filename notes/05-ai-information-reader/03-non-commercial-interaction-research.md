---
title: 非商业灵动交互设计调研
date: 2026-06-17
tags:
  - AI-Reader
  - Interaction-Design
  - Indie-Web
  - Digital-Garden
description: 面向 AI 信息订阅阅读器的非商业、灵动、有意思的交互设计参考。
---

# 非商业灵动交互设计调研

## 1. 结论

当前 Stitch 版本右侧报纸阅读区已经有记忆点，问题主要在左侧 sidebar：它像一个工程工具或 SaaS 控制台，和右侧“报纸阅读”的编辑气质不统一。

更合适的方向不是继续把 sidebar 做漂亮，而是重新定义它的隐喻：

- 不叫 sidebar，叫 `Source Desk`。
- 不像 OS 菜单，像编辑桌、资料架、索引卡、剪报夹。
- 不把用户推向任务执行，而是帮助用户进入阅读状态。
- 不使用商业 SaaS 常见的全大写菜单、厚重选中块、硬分组和仪表盘感。
- 保留效率：左侧负责来源、栏目、研究夹、收藏；中间负责每日列表；右侧负责沉浸阅读。

优先落地方案：

| 方案 | 用途 | 是否适合作为 v1 默认 |
|---|---|---|
| Source Desk | 编辑台、资料架、索引卡、剪报夹 | 是 |
| Garden Atlas | 数字花园、主题分叉、探索型阅读 | 后续探索模式 |
| Radio Dispatch | 实时信号台、源频率、热点扫描 | 后续 live / X signals 模式 |

## 2. 参考网站

这些网站不一定全部是“非营利组织”，但共同点是：它们的界面目标不是转化、销售和增长漏斗，而是表达、探索、学习、收藏和阅读。

| 网站 | 类型 | 值得研究的点 | 对本项目的启发 |
|---|---|---|---|
| [Nicky Case](https://ncase.me/) | 可探索解释 / 交互学习 | 用游戏化、可操作的小实验解释复杂概念 | 左栏可以有轻量 playful interaction，但不能变成游戏；适合“随机发现一条有趣信息” |
| [Explorable Explanations](https://explorabl.es/) | 交互解释集合 | 把阅读从线性文章变成可探索对象 | 信息源可以按“问题 / 概念 / 线索”组织，而不只是按来源组织 |
| [Bartosz Ciechanowski](https://ciechanow.ski/archives/) | 高质量交互文章 | 文章内部嵌入模拟器，互动服务于理解 | 右侧报纸页可以保留少量可互动注释，但不要把每篇文章都做成交互 demo |
| [The Pudding](https://pudding.cool/) | 视觉散文 / 数据新闻 | 每篇文章都有独立叙事机制和强编辑感 | 每日简报不只是 RSS 列表，而应有编辑判断、栏目顺序和重点标记 |
| [Maggie Appleton](https://maggieappleton.com/garden-history) | 数字花园 / 个人知识库 | 内容是持续生长的，不是只按时间归档 | “资料架”可以显示主题成长、常看方向和长期研究线索 |
| [Andy Matuschak Notes](https://notes.andymatuschak.org/About_these_notes) | 链接笔记 / 工作笔记 | 通过链接、悬浮预览、非线性路径鼓励深读 | 对文章、来源、概念提供 hover preview，而不是每次都跳页 |
| [Gwern.net](https://www.gwern.net/) | 长文阅读 / 注释系统 | popover、sidenote、层级展开帮助阅读长内容 | 右侧报纸页可以用旁注、来源证明、术语说明降低阅读阻力 |
| [Low-tech Magazine Solar](https://solar.lowtechmagazine.com/) | 低技术网站 / 太阳能网站 | dither 图像、低能耗、状态公开，视觉上反商业 | 可借鉴“克制、粗粝、诚实”的气质，避免过度玻璃拟态 |
| [Solar Protocol](https://solarprotocol.net/) | 艺术研究 / 太阳能网络 | 网站根据太阳能服务器状态和地理位置变化 | 左栏可以显示 source health / freshness，把系统状态变成界面的一部分 |
| [The HTML Review](https://thehtml.review/) | Web-native 文学刊物 | 每期都像一个手工网页实验，而不是 CMS 模板 | 每日报纸可以有“期刊感”，但整体导航仍要稳定 |
| [HTML Energy](https://html.energy/) | Handmade web 社群 | 重视手写、朴素、反平台化的网页精神 | 左栏可以有手工感、纸张感、索引卡感，但不能牺牲可读性 |
| [ooh.directory](https://ooh.directory/) | 独立博客目录 | 用人工分类和目录组织个人网站 | 信息源注册表可以公开成一个可浏览的目录，而不只是后台 JSON |

## 3. 共性模式

### 3.1 信息不是菜单，而是物件

商业后台通常把信息做成菜单项。非商业、有意思的网站更常把信息做成物件：

- 卡片
- 文件夹
- 便签
- 节点
- 剪报
- 书签
- 地图点
- 频率信号

对本项目的启发：左栏不应该是 `Sources / Research / Timeline / Library` 的硬菜单，而应该像一张编辑桌：

- `All Sources` 是资料盒。
- `High Signal` 是贴了星标的剪报夹。
- `Annotated` 是有批注的卡片。
- `Archived` 是归档盒。
- `Pinned Notes` 是固定在桌面上的来源便签。

### 3.2 导航可以有隐喻，但主路径必须简单

灵动不等于复杂。优秀的非商业交互通常有明确隐喻，但核心路径仍然简单：

- 想读今天内容：一眼进入今日列表。
- 想追某个来源：进入 source desk。
- 想探索主题：进入 garden atlas。
- 想看实时信号：进入 radio dispatch。

对本项目的启发：v1 不要同时做太多高级交互。默认只做 Source Desk，Garden Atlas 和 Radio Dispatch 可以先作为概念和未来模式。

### 3.3 反商业不是粗糙，而是降低转化压力

反商业感不是故意做丑，而是少一点增长产品的压迫：

- 少用强 CTA。
- 少用营销式高亮。
- 少用 dashboard KPI。
- 少用全大写命令。
- 少用“产品功能入口”的文案。
- 多用阅读、编辑、归档、观察、剪报这类语义。

对本项目的启发：把 `+ NEW RESEARCH` 改成更有编辑感的动作，例如：

- `开一个研究夹`
- `新建剪报`
- `添加来源`
- `记录一条线索`

### 3.4 交互应该服务阅读，不制造上瘾

这个产品的核心不是让用户刷，而是优化 information diet。因此交互设计要避免无限流兴奋感：

- 可以有“今天 7 条值得看”。
- 可以有“随机给我一条有意思的”。
- 可以有“这个来源最近变热了”。
- 不应该有无底洞式 feed。
- 不应该把 X/Twitter 信号做成注意力老虎机。

## 4. 三个适合本项目的左栏方案

### 4.1 Source Desk

定位：默认方案。

视觉隐喻：

- 编辑桌
- 资料架
- 索引卡
- 剪报夹
- 贴纸和图钉

结构：

```text
AI Builder Daily
Personal Edition
Jun 17, 2026

SOURCE DESK
All Sources        42
High Signal         7
Annotated          12
Archived           18

PINNED NOTES
Anthropic News
OpenAI Blog
CodeWhale
Wayland Zhang

QUICK ACCESS
AI Builder Daily
arXiv CS.AI
Hacker News
X Signals

[ Add Source ]
```

交互：

- hover source 时弹出一张小索引卡，显示来源说明、最近更新、为什么值得关注。
- 拖拽来源到 pinned notes。
- count 不用 SaaS badge，用手写数字或小纸条。
- 当前选中项不用整块高亮，用左侧细线、图钉、折角或盖章。

优点：

- 和右侧报纸页高度统一。
- 灵动但不影响效率。
- 最适合第一版落地。

风险：

- 纸张质感过多会显得复古模板化。
- 图标和贴纸如果太多，会降低信息密度。

### 4.2 Garden Atlas

定位：探索模式。

视觉隐喻：

- 数字花园
- 主题树
- 种子节点
- 线索分叉

结构：

```text
Garden Atlas

Frontier Models
  Benchmarks
  Reasoning
  Safety

Infrastructure
  Compute
  Chips
  Scaling Laws

Applications
  Dev Tools
  Coding Agents
  AI Workflows

Recently Visited Seeds
```

交互：

- hover topic 节点出现 preview card。
- 新增来源不是添加到列表，而是 `Plant Seed`。
- 阅读过的线索变成更亮的路径。
- 长期高质量主题可以逐渐变粗，形成知识地图。

优点：

- 很适合“个人 information diet”。
- 有独立产品气质，不像普通 RSS reader。
- 适合未来做公开 source map。

风险：

- 第一版容易做复杂。
- 如果数据不够多，花园会显得空。

### 4.3 Radio Dispatch

定位：实时信号模式。

视觉隐喻：

- 电台
- 频率
- 雷达
- dispatch queue
- live source monitor

结构：

```text
Radio Dispatch
LIVE

Signal Overview
High Signal       7
Active Sources   23
New Today        18

Source Frequencies
Anthropic News
OpenAI Blog
The Verge AI
Hacker News
X / AI

Dispatch Queue
```

交互：

- 每个来源有微型 pulse meter，表示新鲜度或更新强度。
- 用户可以 `Tune Source`，而不是普通订阅。
- 对 X / HN / YC 这种高噪声源尤其合适。

优点：

- 适合热点追踪和 X 信号。
- 很有辨识度。

风险：

- 容易把产品带向实时资讯焦虑。
- 不适合作为默认阅读模式。

## 5. 对当前 Stitch 图的修改建议

保留：

- 右侧报纸阅读区。
- 中间时间线的密度和三栏目结构。
- 暗色外壳。
- `硬新闻 / 案例 / 有意思` 的栏目。

修改：

- `BUILDER_OS` 改为 `AI Builder Daily` 或 `Source Desk`。
- `AI Workstation v1.0` 改为 `Personal Edition`、`Editorial Desk` 或当天日期。
- `SOURCES / RESEARCH / TIMELINE / LIBRARY` 不要全大写硬菜单。
- 当前选中不要整块厚高亮，改为细线、纸签、图钉或盖章。
- `WORKSPACE` 改成 `Clippings`、`Desk`、`Archive` 这类编辑语义。
- `+ NEW RESEARCH` 改成 `Add Source`、`Open Research Folder` 或 `New Clipping`。
- 左栏顶部不要像应用品牌区，而要像报纸的 masthead / desk label。

## 6. 可直接给 Stitch 的追加 prompt

```text
Refine only the left sidebar. Keep the current middle timeline and right newspaper reading pane almost unchanged.

The current left sidebar feels too rigid, like an enterprise OS menu or SaaS command center. Redesign it as an editorial "Source Desk" for a personal AI newspaper reader.

Design direction:
- Non-commercial, handmade, editorial, tactile, lively.
- It should feel like an editor's desk with source folders, index cards, pinned notes, clippings, and quiet counters.
- Keep the dark warm shell, but soften the structure.
- Avoid heavy all-caps command labels, thick selected blocks, harsh dashboard separators, and generic enterprise navigation.
- Use paper tabs, thin accent rules, small source cards, subtle stamps, handwritten-style count labels, and warm ink colors.
- The selected section should feel pinned or marked, not like a SaaS active menu row.
- Keep the layout efficient and readable. This is still a daily reading product, not an art portfolio.

Suggested left rail content:
- Top masthead: AI Builder Daily / Personal Edition / today's date
- Source Desk: All Sources, High Signal, Annotated, Archived
- Pinned Notes: Anthropic News, OpenAI Blog, CodeWhale, Wayland Zhang
- Quick Access: AI Builder Daily, arXiv CS.AI, Hacker News, X Signals
- Bottom action: Add Source or New Clipping, styled like a paper tab or ledger button

Interaction hints:
- Hovering a source reveals a small index-card preview.
- Sources can be dragged into Pinned Notes.
- Counts look like small paper labels, not notification badges.
- The rail should feel alive through subtle hover motion, paper-card lift, and thin glowing ink lines, not through loud animations.
```

## 7. 推荐采用顺序

1. v1 默认采用 Source Desk。
2. 等信息源数量超过 30 个后，再做 Garden Atlas。
3. 等 X / HN / YC 等高频源接入稳定后，再做 Radio Dispatch。
4. 不要先做复杂交互。先把左栏气质从 SaaS 菜单改成编辑台。

