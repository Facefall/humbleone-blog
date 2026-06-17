---
layout: page
title: AI 信息订阅阅读网站 Google Stitch Brief
date: 2026-06-16
tags:
  - AI
  - Agent
  - UI
  - Google-Stitch
description: 可用于 Google Stitch 的 AI 信息订阅阅读网站 UI 生成 brief。
---

# AI 信息订阅阅读网站 Google Stitch Brief

## 使用目标

这份 brief 用于 Google Stitch 生成第一轮 Web UI 原型。目标不是生成最终代码，而是快速探索高保真页面结构、信息密度、移动端响应式和 Deep Research 工作台的视觉方向。

## Stitch Prompt

```text
Design a web-first AI information reader for Chinese-speaking AI builders.

Product positioning:
It is inspired specifically by Folo's web app timeline page, especially https://app.folo.is/timeline/articles/all/pending, but it is not a general-purpose RSS reader. It is a curated, high-signal AI / Agent / Coding Agent information diet product. The first version is personal-first, with only 5 to 8 carefully selected source families. It should feel useful for daily reading before becoming open source.

Core user:
A technical builder who heavily uses Codex, Claude Code, Cursor, CodeWhale and other coding agents, studies LLM engineering, and wants a calm daily reading system for high-quality AI sources.

Primary web app pages:
1. Today
2. Sources
3. Deep Research
4. Item Detail

Global navigation:
Today, Feeds, Sources, Topics, Research, Search.

Design direction:
Create a refined editorial research desk, not a marketing landing page.
The first screen must be the actual product interface.
Use a dense but readable layout, like Folo's calm timeline reader mixed with a modern digital newspaper and a research workspace.
Avoid oversized hero sections, decorative gradients, bokeh blobs, purple-heavy palettes, startup marketing visuals, and empty card walls.
Use Chinese UI text.
Use a restrained dark-first palette inspired by Folo's timeline screenshot. Keep the left rail and central timeline dark and quiet. Make the right-side content panel feel like a postmodern deliberately retro newspaper reading area.
Prioritize scanning, comparison, evidence, and repeated daily use.

Folo timeline reference:
- Use a lightweight left source/category rail.
- Use a narrow central reading timeline with source name, time, title, short summary, and optional thumbnail.
- Use a right-side newspaper reader / research panel for selected article, AI summary, source proof, and research actions.
- Keep the UI quiet, dark, spacious, and focused on text.
- Do not use heavy cards; prefer rows, separators, spacing, and typographic hierarchy.
- Do not show a login modal in the design.

Difference from Folo:
- Add newspaper-like editorial ordering.
- Add 今日一句判断 at the top.
- Group the timeline into 硬新闻 / 案例 / 有意思.
- Make Deep Research a first-class page, not just a side prompt.
- Make the right pane visually memorable: a restrained postmodern retro newspaper reading surface, not a generic empty AI panel.

Page 1: Today
Desktop layout:
- Top navigation
- Left rail with categories, sources, saved reports, similar to Folo's source rail
- Main timeline column with date, one-sentence daily judgment, and sections shown in list order:
  - 硬新闻
  - 案例
  - 有意思
- Each item shows title, source, time, evidence level, short Chinese summary, why it matters, and original link.
- Right rail as a newspaper reading pane:
  - default state shows the first item from the current timeline list, not an empty AI prompt panel
  - selected article preview after the user chooses a timeline item
  - edition note
  - AI summary
  - source proof
  - start deep research
  - follow-up questions

Right pane visual style:
- The right pane should support three switchable newspaper skins:
  1. Broadsheet: classic serious newspaper, black-and-white, serif headline, narrow columns, thin column rules, formal and authoritative.
  2. Feature: magazine-feature newspaper, larger headline, more whitespace, one hero image or pull quote, elegant longform reading.
  3. Retro Dispatch: a full newspaper-page composition embedded inside the right pane, postmodern deliberately retro, edition labels, date stamp, source stamps, pull quote blocks, editorial notes, subtle print feel.
- Include a small style switcher at the top of the right pane: Broadsheet / Feature / Retro.
- Do not use yellow old paper, parchment, ornate borders, heavy texture, or decorative clutter.
- The right pane can be slightly warmer or paper-like, but must still fit the dark Folo-like shell.
- On first load, the right pane should show the first timeline item with editorial note, source proof, AI summary, and a deep research entry. Do not create a separate 今日头条 / lead story selection in the first version.

Generate the Today page in one main composition, and show three right-pane variants side by side or as clearly labeled states if possible.

Extra detail for Retro Dispatch:
Make the right pane look like an actual generated newspaper page sitting inside the dark app.
The text content should be laid out inside the newspaper page, not just placed in normal UI cards.
Include:
- masthead: AI BUILDER DAILY
- edition number
- date line
- topic line: AI / Agent / Engineering
- main article headline
- two-column body text
- AI Summary box
- Why It Matters box
- Source Proof box
- Research Dispatch footer
- Follow-up Questions footer
- subtle evidence stamp
Keep all text selectable-looking and interface-like; do not make it a flat decorative poster.

Mobile layout:
- Compact top bar
- Date and one-sentence judgment
- Segmented tabs for 硬新闻 / 案例 / 有意思
- Stacked reading cards

Page 2: Sources
Show source families and endpoints.
Each source family card should show:
- name
- theme
- default column
- why subscribed
- endpoint count
- reliability
- last update
- number of times included in daily
The page should make it obvious that the product subscribes to fewer sources on purpose.

Page 3: Deep Research
This is the most important page after Today.
Create a three-column desktop workspace:
- Left: research queue, new question input, saved reports, topic filters
- Middle: research brief with question, scope, key findings, timeline/diff, open questions, suggested next actions
- Right: evidence board grouped by Official, GitHub, Builder, Community, Video, Scraped

Deep Research must communicate that conclusions are evidence-bound. The report should show source citations, confidence, uncertainty, and follow-up actions.

Mobile layout:
- Research question at top
- Tabs: 结论 / 证据 / 来源 / 待跟进
- Stacked research report blocks

Page 4: Item Detail
Show:
- original title
- Chinese title
- source and author
- source URL
- evidence level
- AI summary
- key facts
- why it matters to AI / Agent builders
- related source family
- related historical items

Interaction states:
- Source reliability badges
- Evidence level badges: official, github, builder, community, video, scraped
- Empty state for no new daily items
- Loading state for Deep Research
- Warning state when a source endpoint fails

Output:
Generate high-fidelity responsive web UI screens.
The product should feel like a serious daily information desk for builders, not a news portal and not a social feed.
```

## 需要重点观察的输出质量

- `Today` 是否像真实可用的日报，而不是泛资讯首页。
- `Research` 是否真的像调研工作台，而不是普通聊天框。
- `Sources` 是否体现“少量精选源”的策略。
- 移动端是否保留栏目层次，而不是把所有内容压成无差别列表。
- 视觉上是否适合长期阅读，而不是一次性 demo。

## Stitch 结果回填规则

Stitch 生成结果只作为设计输入。最终进入实现前，需要把结果整理成：

- 页面结构
- 组件清单
- 状态设计
- 颜色和排版 tokens
- 移动端断点规则
- 与 source registry / feed item schema 的字段映射
