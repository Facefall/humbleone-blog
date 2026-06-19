---
layout: page
title: PRD | AI Reader | Source Registry Config 与 SQLite Feed Store | v0.1
date: 2026-06-19
tags:
  - AI-Reader
  - PRD
  - Source-Registry
  - SQLite
  - RSSHub
description: AI Reader v0.1 的信息源配置、版本化覆盖配置、SQLite 镜像、启动同步和 Web 受限更新 PRD。
---

# PRD | AI Reader | Source Registry Config 与 SQLite Feed Store | v0.1

## Problem Statement

AI Reader 需要从少量高质量信息源稳定生成可阅读内容。当前页面仍偏原型数据和 RSSHub tracer bullet，缺少一个明确的数据源控制面：

- 信息源定义需要长期、可审查、可版本管理。
- 页面需要从 SQLite 读取历史内容和用户状态，而不是直接依赖 RSSHub 实时返回。
- Server 启动时需要把当前 source registry 同步到 DB，保证 source list、endpoint 和历史 item 有一致运行态。
- Web 后续需要提供新增来源入口，但不能直接修改人工维护的源配置，避免破坏源配置、写入 secrets 或造成 Git 工作区不可控漂移。

用户希望第一版采用项目配置文件维护 RSS 源，server 读取配置并配合 SQLite 读取历史信息；server 启动时同步配置；配置文件改动可被实时监听；Web 可以通过 API 做受限更新，但不能直接修改源配置。

## Solution

v0.1 采用：

```text
Immutable Base Source Registry Config
  + Generated Versioned Config Overlays
  -> Server Registry Loader
  -> SQLite Source Mirror
  -> RSSHub / Adapter Refresh
  -> Feed Store
  -> Reader API
```

核心设计：

1. 人工维护的 source registry base config 是源定义的基准，不允许 Web API 修改。
2. Web API 只能生成新的版本化覆盖配置文件，例如 `source-registry.generated.20260619T120301.json`。
3. Server 每次启动读取 base config 和所有 generated config version，按确定顺序合并，得到 effective source registry。
4. Server file watcher 监听 base config 和 generated config 目录，变更后重新校验、合并、同步 DB。
5. SQLite 保存 source mirror、抓取状态、历史 feed item、用户阅读状态、书签和 saved views。
6. RSSHub refresh 永远从 DB 中当前生效 endpoint 读取 route/config，不接受前端直接传 route。
7. 配置删除或覆盖 source 时，DB 只软删除或暂停 source，不删除历史 item。

## User Stories

1. As a reader, I want the page to load from stored feed history, so that reading is not blocked by RSSHub latency or route failures.
2. As a reader, I want saved, favorited, read, archived, bookmarks, and saved views to persist, so that my reading state survives refreshes and restarts.
3. As a reader, I want source lists to remain available even when there are no recent items, so that sources are treated as long-lived subscriptions rather than temporary RSS responses.
4. As a reader, I want to filter sources by recent activity, status, content type, and saved/favorited content, so that a growing source list remains usable.
5. As a reader, I want manual refresh to return latest DB-backed results, so that refresh feedback is consistent with the page data model.
6. As a reader, I want a failed RSSHub route to keep showing the last successful content, so that the app remains readable during source failures.
7. As a product owner, I want manually curated source config to be version-controllable, so that important source decisions can be reviewed through Git diff.
8. As a product owner, I want Web source changes to be constrained, so that the UI cannot accidentally corrupt the base registry config.
9. As a product owner, I want Web source additions to generate separate config version files, so that generated changes can be reviewed, reverted, compacted, or promoted later.
10. As a product owner, I want base config and generated overlays to be merged deterministically, so that restart behavior is predictable.
11. As a product owner, I want server startup to validate config before syncing to DB, so that invalid source config cannot poison runtime state.
12. As a product owner, I want config watcher changes to be debounced and validated, so that partial writes or editor temp files do not trigger bad syncs.
13. As a product owner, I want config-derived source deletion to soft-delete or pause DB sources, so that historical feed items remain searchable and readable.
14. As a product owner, I want source config to exclude secrets, so that cookies, tokens, and private credentials never enter public project files.
15. As a backend developer, I want a single effective registry loader, so that startup sync, file watcher sync, and Web API updates use the same validation and merge rules.
16. As a backend developer, I want RSSHub endpoints stored in SQLite after config sync, so that refresh jobs can be driven from DB state.
17. As a backend developer, I want raw feed items saved before normalization, so that parser bugs can be debugged and fixed without losing evidence.
18. As a backend developer, I want normalized feed item upsert to preserve user states, so that content refresh never overwrites reader choices.
19. As a backend developer, I want fetch run records for every refresh, so that source health and failure reasons can be shown later.
20. As a backend developer, I want same-endpoint refresh locking, so that repeated refresh clicks do not issue duplicate RSSHub requests.
21. As a frontend developer, I want source management APIs to return validated source registry views, so that UI never has to understand raw config merge internals.
22. As a frontend developer, I want add-source UI to be able to submit URL and tag metadata, so that later Folo-like discovery can be attached without changing the UI concept.
23. As a future maintainer, I want generated source config files to be easy to inspect, so that I can understand whether a change came from manual editing or Web UI.
24. As a future maintainer, I want generated config overlays to be compactable, so that many small Web changes do not accumulate forever.
25. As a future maintainer, I want public deployment constraints documented, so that file-writing source config APIs are not accidentally deployed to unsupported serverless environments.

## Implementation Decisions

- Source Registry remains the canonical definition for what sources exist and why they are followed.
- Base Source Registry Config is immutable from Web APIs. It may be manually edited and version-controlled.
- Web APIs generate new versioned overlay config files instead of modifying the base config.
- Effective Source Registry is produced by loading base config plus generated overlays in deterministic order.
- Generated overlays may add sources, update allowed display metadata, assign tags/groups, pause sources, or request deletion/deprecation, but cannot store secrets.
- The merge layer must validate the full effective config before syncing SQLite.
- Server startup always runs registry load, validation, merge, and SQLite sync before serving DB-backed source/feed views.
- File watcher observes both base config and generated overlay directory. It debounces changes, validates the effective registry, and only syncs DB on valid config.
- Invalid config changes do not mutate DB. The server keeps the last valid effective registry and exposes validation errors for diagnostics.
- SQLite is the runtime mirror and history store. It contains source families, endpoints, fetch runs, raw feed items, normalized feed items, item states, bookmarks, and saved views.
- RSSHub refresh uses endpoint records from SQLite, not request-provided route strings.
- Config removal or generated deprecation does not delete historical feed items. DB sources become paused/deprecated/soft-deleted.
- User state lives outside feed item content tables and must survive refresh/upsert.
- Web config update APIs must use allowlisted fields and schema validation. v0.1 does not expose broad source registry editing.
- Secrets stay in environment variables or private server config. Source registry config can reference secret keys by name only if needed later.
- Generated overlay files should include metadata such as id, created_at, created_by, reason, operation type, and affected source ids.

Recommended config layering:

```text
config/source-registry/base.json
config/source-registry/generated/
  source-registry.generated.20260619T120301.json
  source-registry.generated.20260619T124455.json
```

Merge order:

```text
base.json
  -> generated files sorted by filename timestamp ascending
  -> validate full effective registry
  -> sync sqlite mirror
```

## Testing Decisions

- Test behavior at the registry service seam, not individual parser implementation details.
- Config loader tests should verify deterministic merge order, overlay precedence, invalid overlay rejection, and base config immutability.
- Startup sync tests should verify that source families and endpoints are created, updated, paused, and soft-deleted correctly.
- Watcher tests should verify debounce behavior and that invalid changes do not mutate DB.
- Web API tests should verify allowlisted updates, generated overlay file creation, schema validation failure, and no direct writes to base config.
- Refresh tests should verify that endpoint refresh reads DB endpoint config, stores raw items, upserts normalized items, and preserves item states.
- Reader API tests should verify that page data reads from SQLite and continues returning last known data after refresh failure.

Highest testing seam:

```text
Source Registry API / Registry Sync Service
  -> generated config overlay
  -> effective registry
  -> SQLite mirror
```

Secondary testing seam:

```text
Refresh Endpoint
  -> DB endpoint lookup
  -> adapter request
  -> raw item save
  -> normalized item upsert
  -> reader query response
```

## Out of Scope

- Folo Discover style automatic URL recognition and import.
- User-facing full source registry CRUD UI.
- Multi-user source subscriptions.
- Account system and permission model.
- Public SaaS deployment.
- Secrets/token/cookie editing through Web UI.
- RSSHub route authoring UI.
- Full item version history.
- Complex job queue and worker dashboard.
- True full-text search or external search engine.
- Postgres/Turso/libSQL migration.
- Generated overlay compaction and promotion workflow, except for documenting the need.

## Further Notes

This PRD sharpens the existing `SQLite-first + DB-driven page + Source Registry as source-of-truth` decision by adding a stricter config mutability rule:

> Web can create versioned generated config overlays, but cannot modify the base source registry config.

This keeps the personal reader safe for local iteration while preserving a path toward future source discovery. The first implementation should focus on the data control loop, not on a rich source management UI.

