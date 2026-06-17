# AGENTS.md

This file is the fast-start context for agents working in this repository.

## Project Identity

- This is the standalone personal blog repository `Facefall/humbleone-blog`.
- The site is built with VitePress and the Zaun blog template.
- Do not merge this site into `stock-community-summary`.
- This repository is currently also being used as the planning/documentation surface for a future standalone AI information reader app.

## Runtime Rules

- Use Node `24.14.0`.
- Use `pnpm@9.15.5`.
- Before normal local work, run `nvm use`.
- If `nvm use` hangs in this environment, use the pinned Node path:

```powershell
$env:PATH='C:\Users\31089\.local\opt\node-v24.14.0-win-x64;' + $env:PATH
& 'C:\Users\31089\.local\opt\node-v24.14.0-win-x64\corepack.cmd' pnpm build
```

## Tech Boundaries

- Do not add React for v1 of this blog repo.
- VitePress custom UI should stay in Vue components.
- Markdown is the source of truth for public content.
- Keep public content suitable for a public GitHub Pages site.
- Do not commit secrets, OAuth client secrets, access tokens, private notes, or private automation state.
- Do not rollback user changes unless explicitly requested.

## Content Model

- `posts/**/*.md` contains long-form articles.
- `notes/**/*.md` contains structured learning notes and project planning notes.
- `notes/03-CodeWhale-更新追踪/` contains public CodeWhale changelog tracking notes.
- `notes/05-ai-information-reader/` contains the current AI information reader product/design work.
- `.codex/automations/` is private automation state and must not be copied into public notes.

## Comments

- Comments use Giscus and GitHub Discussions in `Facefall/humbleone-blog`.
- The configured category is `General`.
- Comments are enabled only for article and note pages.

## Active Product Context: AI Information Reader

The user is designing a separate web product inspired by Folo:

> A high-quality Chinese AI / agent / coding-agent subscription, aggregation, and reading website.

The first personal use case is a daily information diet:

- 3-8 daily items.
- 3-5 items from coding-agent / AI engineering sources.
- Additional high-signal social or X-style items about how people are using agents, Codex, Claude Code, and related tools.

Important sources already discussed:

- Wayland Zhang: `waylandz.com`, GitHub, Bilibili, Douyin.
- Anthropic Engineering and Claude Code product lines.
- Hacker News / Y Combinator.
- Pydantic, Reasonix, CodeWhale.
- `shumer.dev/something-big-is-happening`.
- `github.com/LitoMore`.

Data-source strategy:

- Official RSS/API first.
- RSSHub as supplement.
- Custom scraping as fallback.
- Maintain a unified source registry / feed hub.
- Fetch by adapter type.

## Personal RSS Reader Product Design Capability

When asked to design or refine the RSS/subscription product, treat it as a standalone web app that can share content with the blog, not as a normal blog page.

Product definition:

> A personal-first AI information diet system: subscribe to high-quality sources, normalize them into a feed hub, select 3-8 high-signal daily items, and read them in a newspaper-like interface.

The product should support three layers:

1. `Source Registry`: what sources exist, why they matter, how to fetch them.
2. `Feed Hub`: normalized feed items from RSS/API/RSSHub/custom adapters.
3. `Reader App`: daily timeline, source desk, saved library, and newspaper-style reading.

Source registry design should capture:

- `source_id`
- `display_name`
- `source_family`
- `topic_tags`
- `priority`
- `language`
- `official_url`
- `fetch_method`: `official_rss` / `official_api` / `rsshub` / `custom_scrape` / `manual`
- `adapter`
- `update_frequency`
- `evidence_level`
- `why_follow`
- `risk_notes`

Feed item design should capture:

- `id`
- `source_id`
- `title`
- `url`
- `author`
- `published_at`
- `fetched_at`
- `summary`
- `raw_excerpt`
- `tags`
- `importance_score`
- `novelty_score`
- `evidence_links`
- `language`
- `status`: `new` / `read` / `saved` / `annotated` / `archived`

Adapter hierarchy:

1. Use official RSS/API when available.
2. Use RSSHub when official feeds are missing or too limited.
3. Use custom scraping only when source value is high enough to justify maintenance.
4. Use manual capture for rare high-value sources that are hard to automate.

Design requirements:

- The app is personal-first. Optimize for the user's daily reading comfort before public/open-source completeness.
- The first version does not need exhaustive source coverage.
- The first version does not need algorithmic headline ranking. List order can be deterministic.
- The daily brief should usually contain 3-8 items.
- Coding-agent / AI engineering should usually contribute 3-5 items.
- Social/X-style items should be included only when they add concrete examples of people using agents, Codex, Claude Code, or similar tools.

Avoid:

- Turning the product into a generic RSS reader with hundreds of undifferentiated feeds.
- Building discovery or recommendation complexity before the personal feed works.
- Treating RSSHub as the source of truth. It is only an adapter.
- Mixing private automation state into public content.
- Designing around infinite scroll as the primary experience.

Useful product-design questions:

- What source is this, and why is it worth the user's attention?
- What is the most reliable way to fetch it?
- How will the item appear in the daily 3-8 item diet?
- Does this belong in hard news, cases, or interesting items?
- What evidence should be shown so the user can trust the summary?
- What should be saved into the blog/notes layer, and what should remain private state?

## Current Design Direction

The product direction is a three-pane web reader:

```text
[Source Desk] [Today Timeline] [Newspaper Reader]
```

Current visual target:

- The right reading pane should feel like a real postmodern retro newspaper page.
- The left pane should not be a normal SaaS sidebar.
- The left pane is being evolved into `Source Desk`: a tactile editor's desk made of paper slips, pinned notes, clippings, stamps, ink dots, and index cards.

Core design documents:

- `notes/05-ai-information-reader/01-product-design.md`
- `notes/05-ai-information-reader/02-google-stitch-brief.md`
- `notes/05-ai-information-reader/03-non-commercial-interaction-research.md`
- `notes/05-ai-information-reader/04-source-desk-style-bible.md`

Before changing direction, read `04-source-desk-style-bible.md`.

## Source Desk Component Language

The current component primitives are:

- `SourceDeskShell`
- `DeskHeader`
- `SourceSlip`
- `PinnedNote`
- `ClippingItem`
- `StampBadge`
- `FreshnessGlyph`
- `IndexPreviewPopover`
- `DeskFooterAction`

The important design principle:

> Information should become physical objects first, then UI components.

Required state language:

- `default`: paper lies flat.
- `hover`: paper lifts slightly.
- `selected`: paper is pulled out from the stack.
- `new`: tiny ink dot or one-time pulse.
- `stale`: faded paper and quiet ink.
- `failed`: subtle broken line, not an aggressive red alert.
- `dragging`: floating paper slip.
- `drop-target`: dashed pencil outline or empty paper slot.

Avoid:

- Generic SaaS sidebars.
- Uniform menu rows.
- Modern rounded pills everywhere.
- Corporate dashboard widgets.
- Large colorful blocks.
- Perfectly aligned card stacks.
- Inter / Roboto / Arial / default system UI typography as the main visual language.

## Stitch Workflow

Stitch is available through the `mcp__stitch` tools.

Current Stitch project:

- Project ID: `10033335275344269454`
- Project URL: `https://stitch.withgoogle.com/projects/10033335275344269454`

Relevant Stitch screens:

- Current Source Desk target screen: `7a32e02fc8714781bba78cec07ec97db`
- Title: `Source Desk - 触感工作台 (像素级还原)`
- Strong visual reference screen: `16578059806999052951`
- Title: `ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png`

Created Stitch design system asset:

- `bab8045236af45918d01160f1669fb91`

Important lesson from the latest Stitch runs:

- Generic `generate_variants` tends to regularize the design into a product sidebar.
- To get closer to the user's preferred reference image, use strict visual transfer prompts against the reference image.
- Do not let Stitch freely explore unless the user explicitly wants divergence.

Recommended convergence loop:

1. Ask a small number of decisive questions with `grill-me`.
2. Define a scoring rubric before generating more variants.
3. Score current Stitch outputs against the rubric.
4. Pick one target screen.
5. Use `edit_screens` for directed edits, not endless `generate_variants`.

Useful scoring dimensions:

- Reference-image similarity.
- Non-commercial / handmade feel.
- Physical object quality.
- Readability.
- Engineering feasibility.
- Daily-use comfort.

## Design Collaboration Rules

- For frontend or visual tasks, preserve the existing product direction unless the user explicitly changes it.
- Do not propose a clean SaaS redesign for Source Desk.
- Do not treat Stitch output as final implementation.
- Stitch is for visual exploration and convergence; implementation still needs component specs and Vue-compatible frontend work.
- If the user says the design is too normal, the likely root cause is missing object states and tactile micro-details, not layout.
- If asked to continue the current design loop, start from `04-source-desk-style-bible.md` and the Stitch reference screen above.

## Verification

Run these before claiming implementation success:

```powershell
nvm use
pnpm install --frozen-lockfile
pnpm build
pnpm serve
```

For documentation-only changes, at minimum run:

```powershell
pnpm install --frozen-lockfile
pnpm build
```

Do not start `pnpm serve` in an automated turn unless the user asks for a local preview, because it is a long-running process.
