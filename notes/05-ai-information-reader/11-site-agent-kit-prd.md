---
layout: page
title: PRD | Site Agent Kit | 全站上下文与跨应用 Agent SDK | v0.1
date: 2026-06-21
tags:
  - AI-Reader
  - PRD
  - Agent
  - SDK
  - Vercel-AI-SDK
  - Vite
description: 面向 AI Reader、Blog 和未来站内应用的 site-aware agent SDK 产品与架构基线。
---

# PRD | Site Agent Kit | 全站上下文与跨应用 Agent SDK | v0.1

## 1. 当前结论

本项目需要构建的是 `@humbleone/site-agent-kit`，不是 `reader-agent-kit`，也不是一个只服务本机的 local server 产品。

它的定位是：

```text
host-agnostic site-aware agent SDK
  = 全站上下文
  + 跨应用 action
  + 权限与确认策略
  + Agent UI 交互协议
  + Vercel AI runtime adapter
  + Vite site integration plugin
  + AI Reader / Blog app adapters
```

AI Reader 是第一入口和主使用场景，但不是 SDK 的边界。用户可以在 AI Reader 中要求 AI 执行跨应用动作，例如：

```text
把当前文章收藏到 blog
```

SDK 应将该意图解析为一个受权限控制的跨应用 action，而不是让 AI 直接操作 DOM 或任意写文件。

## 2. Problem Statement

AI Reader 正在从单一阅读原型发展为一个带有 Blog、Source Registry、Feed Hub、Reader App、Deep Research 和未来扩展应用的站点级信息系统。

用户希望站内 AI 不只是一个聊天框，也不只是 AI Reader 页面里的局部助手，而是能理解整个网站上下文，并在授权后跨应用完成任务：

- 在 AI Reader 中解释、总结、保存、收藏、发起 deep research。
- 从 Reader item 生成 Blog 草稿或阅读收藏条目。
- 理解 Blog 公开内容、notes、AI Reader 当前条目和 Source Registry 之间的关系。
- 在右键菜单、命令面板和对话入口中以助手形态提供动作。
- 在跨应用写入前展示明确确认，不污染公开博客内容或私有状态。

当前系统已有 VitePress Blog 和 Next.js AI Reader prototype 的集成雏形，但请求命名空间、跨应用上下文、SDK 边界、运行时 host、权限模型和可测试 action contract 尚未固定。

如果继续以 AI Reader 单应用助手设计，未来 Blog 写入、Source Registry 调整、Deep Research 持久任务和多 host 部署都会被反向绑定到 Reader。反过来，如果直接做全能网页 agent，又会带来不可控 DOM 操作、文件写入和公开内容污染风险。

## 3. Solution

构建 `@humbleone/site-agent-kit` 作为站点级 Agent SDK。SDK 本体只定义协议、配置、上下文、action、权限、事件流和 UI 交互 primitives；具体运行在什么 host 上，由 adapter 决定。

核心分层：

```text
SiteAgentRuntime
  -> AppRegistry
  -> ContextGraph
  -> ActionRegistry
  -> PolicyEngine
  -> EventProtocol
  -> HostRuntimeAdapter
```

V0.1 采用：

- `site-agent.config.ts` 作为站点级配置。
- `ai-reader.config.ts` 作为 AI Reader 应用级配置。
- AI Reader 作为第一个 host app 和主要交互入口。
- Blog 作为第一个跨应用写入目标。
- Vercel AI SDK 6 作为默认 agent runtime adapter。
- Vite plugin 作为 VitePress/Blog 的站点发现、manifest 注入和开发期路由集成。
- Next adapter 作为 AI Reader route handler 和 streaming endpoint 的主要落地方式。
- Local Node host 作为后续 reference host，不作为 SDK 本体定义。

V0.1 的第一个闭环 action：

```text
readerItem.saveToBlogDraft
```

用户在 AI Reader 中通过右键菜单、命令面板或对话提出收藏意图。SDK 读取当前 Reader item 和 Blog adapter 能力，生成 public-safe blog draft 预览，经用户确认后写入 Blog 草稿区，并把 Reader item 与 Blog draft 建立关联。

## 4. Confirmed Decisions

### 4.1 SDK 名称与边界

- SDK 名称采用 `@humbleone/site-agent-kit`。
- SDK 不是 `reader-agent-kit`。
- SDK 不是 local server 产品。
- SDK 是 host-agnostic 的站点级 agent SDK。
- AI Reader 是第一入口，不是唯一边界。

### 4.2 双层配置

采用双层配置：

```text
site-agent.config.ts
apps/ai-reader-prototype/ai-reader.config.ts
```

站点级配置负责：

- 注册站点有哪些 app。
- 声明每个 app 的可读上下文和可写能力。
- 声明跨应用 actions。
- 声明权限策略。
- 声明 host adapters。
- 声明哪些上下文可进入 client manifest。

应用级配置负责：

- 声明本应用上下文 providers。
- 声明本应用 actions。
- 声明本应用右键菜单、命令面板和 UI entry points。
- 声明本应用对站点级 action 的参与方式。

### 4.3 Vercel 与 Vite 的职责分工

Vercel 负责运行时智能：

- Vercel AI SDK 6：agent loop、typed tools、streaming、tool approval。
- AI Gateway：云端模型路由、fallback、预算和观测；不作为 V0.1 必需依赖。
- WorkflowAgent：Deep Research 和跨应用写入等长任务；进入 V2。
- Vercel Connect：未来第三方 OAuth 和短期 token；进入 V2。
- Vercel Sandbox：未来安全执行不可信解析、抓取或生成代码；不作为主 runtime。

Vite 负责站点集成：

- 读取或辅助发现 `site-agent.config.ts`。
- 生成 `virtual:site-agent/manifest`。
- 给 VitePress Blog 注入站点 manifest。
- 开发期代理或挂载 `/site-agent/*`、`/reader/*`。
- 帮助区分 Blog、AI Reader 和 Site Agent SDK 请求。

Vite plugin 不负责生产环境写文件，也不作为 agent server。

### 4.4 请求命名空间

V0.1 不引入独立 API Gateway 服务，但必须引入 host gateway contract。

请求边界：

```text
/humbleone-blog/*
  -> Blog / VitePress public content

/humbleone-blog/reader/*
  -> AI Reader UI

/humbleone-blog/reader/api/*
  -> AI Reader product API

/humbleone-blog/site-agent/*
  -> Site Agent SDK runtime API
```

不要长期代理根级 `/api` 到 Reader。Agent runtime 的请求与普通 Reader API 的缓存、鉴权、streaming 和权限策略不同，必须单独命名。

### 4.5 权限模型

采用三级权限：

```text
Level 1: read-only understanding
  -> 自动执行

Level 2: temporary UI / local light action
  -> 可自动执行

Level 3: persistent write / cross-app write / public content impact
  -> 必须用户确认
```

跨应用写 Blog、修改 Source Registry、写 notes/posts 草稿、发布内容、调整长期 source priority，全部属于 Level 3。

### 4.6 右键菜单与交互入口

Site Agent Kit 需要支持 AI Reader 内部右键菜单，但只接管应用内部上下文，不全站粗暴禁用浏览器原生右键。

V0.1 入口：

- Reader item 右键菜单。
- 选中文本浮层。
- Command palette。
- Agent dock / chat panel。
- Level 3 action approval sheet。

菜单项必须映射到 typed semantic actions，而不是 DOM 操作。

### 4.7 跨应用 Blog 写入

默认跨应用写入只创建 public-safe draft，不直接发布正式内容。

`readerItem.saveToBlogDraft` 行为：

- 读取当前 Reader item。
- 生成 Blog draft 预览。
- 显示目标路径、标题、frontmatter、正文摘要、来源链接和风险提示。
- 用户确认后写入。
- 写入后将 Reader item 与 Blog draft 建立关联。

禁止 V0.1 自动发布正式 `posts` 或公开归档内容。

### 4.8 Local / PWA / WASM 边界

SDK 不定义为 local server 产品。

但 SDK 应支持多个 host：

- `next`：当前 AI Reader prototype 的第一 host。
- `local-node`：个人本地增强和文件写入 reference host。
- `cloud-node`：未来 Vercel/Node 部署。
- `pwa`：离线缓存、OPFS/IndexedDB、本地索引和导出。
- `desktop`：未来 Tauri/Electron 的强本地能力。

PWA/WASM 不作为主 agent server。它们适合：

- 离线阅读缓存。
- 本地索引。
- OPFS/IndexedDB storage。
- 文件导出/import。

真正稳定的指定本地目录写入仍然优先由 `local-node` 或 `desktop` host 实现。

## 5. User Stories

1. As a reader, I want to right-click a Reader item and ask AI to explain it, so that I can understand high-signal articles without leaving the reading flow.
2. As a reader, I want to right-click selected text and ask follow-up questions, so that AI can reason from the exact passage I am reading.
3. As a reader, I want AI to summarize today's 3-8 selected items, so that I can quickly decide what deserves attention.
4. As a reader, I want AI to explain why a source or item matters, so that source curation remains transparent.
5. As a reader, I want AI to save a Reader item into my Blog draft library, so that valuable material can become long-term public-safe notes.
6. As a reader, I want AI to show a confirmation sheet before writing to Blog, so that public content is never changed invisibly.
7. As a reader, I want AI to show exactly which file or collection will be changed before confirmation, so that cross-app writes are auditable.
8. As a reader, I want AI to preserve links back to the original Reader item and source, so that saved Blog drafts remain traceable.
9. As a reader, I want AI to distinguish save, favorite, bookmark, and blog draft creation, so that short-term reading state and long-term content curation do not collapse into one action.
10. As a reader, I want AI to propose deep research from a Reader item, so that important topics can move from daily reading to evidence-based investigation.
11. As a reader, I want long-running research to continue outside the immediate chat turn, so that larger investigations do not block the UI.
12. As a reader, I want AI to use Blog notes and AI Reader source context together, so that follow-up answers reflect the whole site rather than only the current page.
13. As a reader, I want AI to understand Source Registry metadata, so that source-specific recommendations and warnings are grounded in existing source decisions.
14. As a reader, I want AI to avoid using untrusted source content as instructions, so that feed items cannot prompt-inject the agent.
15. As a site owner, I want the SDK to know which apps exist on the site, so that future applications can register context and actions without rewriting the agent.
16. As a site owner, I want Blog write capabilities to be declared by a Blog adapter, so that AI Reader does not own Blog storage rules.
17. As a site owner, I want AI Reader actions to be declared by an AI Reader adapter, so that Blog and other apps do not need to understand Reader internals.
18. As a site owner, I want site-level actions to be separate from app-level actions, so that cross-app operations can have stronger policy checks.
19. As a site owner, I want site-agent runtime requests to use a dedicated namespace, so that Blog requests, Reader requests, and Agent requests are operationally distinct.
20. As a site owner, I want public Blog content to stay public-safe, so that private automation state, secrets, or unverified AI output do not leak into GitHub Pages.
21. As a frontend developer, I want a Vite plugin that exposes the site agent manifest, so that VitePress can discover site agent capabilities without importing server-only code.
22. As a frontend developer, I want a Next adapter for agent route handlers, so that AI Reader can host streaming runs and approvals inside the existing prototype.
23. As a frontend developer, I want client UI primitives for right-click menus, command palette, stream rendering, and approval sheets, so that applications can embed agent UX consistently.
24. As a frontend developer, I want the client manifest to be sanitized, so that local paths, secrets, server action details, and private storage rules are not bundled into the browser.
25. As a backend developer, I want Vercel AI SDK 6 behind a runtime adapter, so that the SDK can use ToolLoopAgent now without exposing Vercel-specific APIs as the public contract.
26. As a backend developer, I want typed semantic actions, so that AI calls `readerItem.saveToBlogDraft` rather than arbitrary DOM or filesystem operations.
27. As a backend developer, I want each action to declare input schema, output schema, permission level, confirmation copy, and side effects, so that UI and runtime can reason about safety.
28. As a backend developer, I want a policy engine that can deny, auto-run, or require approval, so that risk is handled consistently across apps.
29. As a backend developer, I want event-stream protocol events for run start, context loading, tool call, approval request, approval resolution, state patch, and completion, so that UI can render agent progress predictably.
30. As a backend developer, I want local-node and cloud hosts to share the same core contracts, so that deployment mode does not change product semantics.
31. As a future maintainer, I want SDK core to be independent from Vite, Next, and Vercel, so that adapters can evolve without rewriting site-level actions.
32. As a future maintainer, I want PWA/WASM storage to be optional adapters, so that offline features can be added without redefining the server runtime.
33. As a future maintainer, I want generated Blog drafts to include source evidence and provenance, so that later publication review is straightforward.
34. As a future maintainer, I want the first cross-app action to be narrow and testable, so that the architecture is proven before adding broader write capabilities.
35. As a future maintainer, I want out-of-scope boundaries documented, so that the SDK does not drift into a generic browser automation tool.

## 6. Implementation Decisions

### 6.1 Modules To Build

- Core SDK: config schema, app registry, context graph, action registry, policy engine, event protocol.
- Client SDK: right-click menu, command palette, agent dock, stream renderer, approval sheet, hooks for current app/page/selection context.
- Server SDK: runtime abstraction, context loading, tool/action execution, approval handling, event streaming.
- Vercel AI adapter: Vercel AI SDK 6 integration behind the SDK runtime abstraction.
- Next adapter: route handlers for AI Reader agent runs, manifest, approvals, and streaming.
- Vite adapter: Vite/VitePress plugin for manifest injection and dev integration.
- Blog adapter: read Blog index and write public-safe Blog drafts through approved host capabilities.
- AI Reader adapter: expose current item, selected text, daily brief, source registry, reader state, and reader actions.

### 6.2 Public SDK Contract

The public SDK contract should be HumbleOne-owned, not Vercel-owned:

- Define site agent config.
- Define app config.
- Define context providers.
- Define semantic actions.
- Define permission policy.
- Define runtime events.
- Define client manifest shape.

Vercel AI SDK 6 is an implementation adapter. It should not leak into the core public contract.

### 6.3 Context Graph

The context graph should distinguish:

- Current UI context: route, app id, selected item, selected text, active pane.
- Reader context: daily brief, feed item, source family, source endpoint, article state.
- Blog context: notes/posts index, draft library, public-safe content roots.
- Site context: app registry, cross-app action registry, permission policy.
- Untrusted content: RSS item body, remote page text, raw excerpts, community posts.

Untrusted content can be summarized or quoted within limits, but must never be treated as system or developer instructions.

### 6.4 Action Registry

Actions are semantic and typed.

Action metadata should include:

- Action id.
- Owning app.
- Input schema.
- Output schema.
- Permission level.
- Whether confirmation is required.
- Confirmation preview renderer metadata.
- Side effect description.
- Audit/provenance fields.

Initial actions:

- `reader.explainItem`
- `reader.explainSelection`
- `reader.summarizeToday`
- `reader.startResearch`
- `reader.saveItem`
- `reader.favoriteItem`
- `blog.createDraft`
- `site.readerItem.saveToBlogDraft`

### 6.5 Cross-App Action Flow

`site.readerItem.saveToBlogDraft` should be implemented as a site-level composed action:

```text
Current Reader Context
  -> Reader item lookup
  -> Blog draft proposal
  -> Confirmation preview
  -> Blog adapter write
  -> Reader item backlink/state update
```

The action must not directly publish content.

### 6.6 Right-Click Menu

Right-click behavior applies only inside registered app surfaces.

Supported context targets:

- Reader item.
- Selected text.
- Source slip / source row.
- Newspaper reader pane.
- Blog draft preview.

The menu should have keyboard-accessible alternatives. `Shift+F10`, command palette, and selection toolbar are required fallbacks.

### 6.7 Host Gateway Contract

The host gateway contract should define:

- URL namespace.
- Which requests are static Blog requests.
- Which requests are Reader product API requests.
- Which requests are Site Agent runtime requests.
- Which endpoints stream events.
- Which endpoints can mutate persistent state.
- Which endpoints require local-only or authenticated host capabilities.

V0.1 should avoid a standalone API gateway service.

### 6.8 Storage Boundary

SDK core must not assume a single storage implementation.

Supported storage adapter concepts:

- Filesystem.
- SQLite.
- IndexedDB.
- OPFS.
- Remote database.
- GitHub-backed write path.

V0.1 implementation may prioritize filesystem/SQLite through Next or local-node host, but this must remain an adapter decision.

### 6.9 Vite Plugin Boundary

The Vite plugin should:

- Load or locate site agent config.
- Generate a sanitized virtual manifest.
- Provide dev server middleware/proxy for site-agent endpoints when configured.
- Avoid bundling server-only config into client code.
- Avoid writing production Blog files directly.

### 6.10 Vercel Capability Boundary

Vercel AI SDK 6 is the V0.1 default runtime adapter.

AI Gateway, WorkflowAgent, Vercel Connect, AI Elements, and Sandbox are planned capabilities, not core dependencies in V0.1.

## 7. Testing Decisions

### 7.1 Highest Test Seams

Test at the highest behavior seams:

```text
Site Agent Runtime
  -> app registry
  -> context graph
  -> action registry
  -> policy decision
  -> event stream
```

and:

```text
Cross-App Action
  -> reader item context
  -> blog draft proposal
  -> approval required
  -> confirmed write
  -> provenance/backlink update
```

Avoid tests that only assert internal helper behavior when external behavior can be tested through runtime/action APIs.

### 7.2 Core Tests

- Config loading validates site-level and app-level configs.
- Client manifest excludes server-only fields.
- App registry rejects duplicate app ids.
- Context graph tags untrusted source content.
- Action registry rejects missing schemas or permission metadata.
- Policy engine auto-allows Level 1, can auto-run Level 2, and requires approval for Level 3.
- Event protocol emits deterministic run, context, tool, approval, action, and completion events.

### 7.3 Adapter Tests

- Vercel AI adapter maps SDK actions into tool calls without exposing adapter-specific public APIs.
- Next adapter exposes manifest, run, event stream, and approval endpoints.
- Vite adapter provides virtual manifest and does not bundle server-only config.
- Blog adapter can create a draft proposal and write only after approval.
- AI Reader adapter can resolve current item and selected text context.

### 7.4 UI Tests

- Right-click menu appears only inside registered surfaces.
- Browser default context menu is not globally disabled outside app surfaces.
- Keyboard fallback opens equivalent actions.
- Level 3 action displays confirmation preview before execution.
- Approval denial does not write persistent state.
- Approval acceptance writes exactly the proposed draft and records provenance.

### 7.5 Integration Smoke Tests

Initial integration smoke should prove:

- AI Reader can fetch sanitized site manifest.
- AI Reader can start a read-only agent run.
- AI Reader can trigger a Level 3 save-to-blog action and receive approval request.
- Denied approval does not write.
- Accepted approval creates a Blog draft and links it back to the Reader item.

## 8. Out of Scope

V0.1 explicitly does not include:

- Generic browser DOM automation agent.
- Full replacement of `alibaba/page-agent`.
- Full micro-frontend architecture.
- Module Federation or single-spa adoption.
- Standalone API Gateway service.
- Vercel-only SDK design.
- Local-server-only product design.
- PWA-only agent runtime.
- WASM-only server replacement.
- Automatic publishing to public Blog posts.
- Automatic modification of public notes without confirmation.
- Multi-user SaaS permission model.
- Third-party OAuth integrations.
- GitHub PR creation for Blog writes.
- Durable deep research workflows.
- Untrusted code execution in sandbox.
- Full desktop wrapper.

## 9. Milestones

### 9.1 V0.1 Foundation

- Create `@humbleone/site-agent-kit`.
- Implement core config, app registry, action registry, policy, and event protocol.
- Implement dual config loading.
- Implement Next adapter for AI Reader.
- Implement Vercel AI SDK 6 runtime adapter.
- Implement right-click menu and approval sheet primitives.
- Implement `site.readerItem.saveToBlogDraft`.

### 9.2 V0.1 Integration

- Register AI Reader app.
- Register Blog app.
- Add Vite plugin for sanitized manifest and dev integration.
- Replace root `/api` proxy assumptions with namespaced gateway contract.
- Add smoke path for Reader item to Blog draft.

### 9.3 V1.5

- Add AI Gateway adapter.
- Add local-node reference host.
- Improve tool-call and approval UI.
- Add local storage adapter options.

### 9.4 V2

- Add WorkflowAgent for Deep Research and durable cross-app tasks.
- Add Vercel Connect for external integrations.
- Add Sandbox adapter for untrusted scraper/code execution.
- Add desktop/PWA storage adapters where useful.

## 10. Open Decisions

The following decisions are intentionally left open for the next implementation planning session:

1. Exact Blog draft directory and frontmatter schema.
2. Whether Blog draft writes should target Markdown files directly or a generated overlay directory first.
3. Whether local-node host is part of V0.1 or V1.5.
4. Whether AI Reader agent UI should start as right-click menu first or command palette first.
5. Whether the initial event stream uses SSE only or also supports resumable run state.
6. Whether `site-agent.config.ts` lives at repo root or app host root when extracted into a standalone product.
7. Whether `site.readerItem.saveToBlogDraft` should create one draft per item or append to a daily library note.

## 11. Further Notes

This PRD fixes the current decision baseline from the design discussion:

- The product direction is site-aware, not reader-only.
- Vercel is the strongest default AI runtime ecosystem, but remains an adapter.
- Vite is the strongest site integration layer for the Blog/VitePress side, but not a production agent server.
- Cross-app writes are valuable but risky; they must be semantic, typed, auditable, and confirmation-gated.
- The first implementation should prove one narrow cross-app loop before expanding agent powers.

Next development should start by turning this PRD into an implementation plan for the smallest tracer bullet:

```text
AI Reader item
  -> Site Agent action
  -> Blog draft proposal
  -> approval sheet
  -> confirmed draft write
  -> Reader backlink
```
