# AI Builder Daily Stitch Site Plan

## 1. Site Vision

`AI Builder Daily` is a personal-first AI information reader for Chinese-speaking AI builders.

The first prototype is a focused `Today` reading surface, not a full RSS reader:

```text
[Source Desk] [Today Timeline] [Newspaper Reader]
```

The product should help the user read 3-8 high-signal AI / Agent / Coding Agent items per day, grouped into:

- hard news
- cases
- interesting items

## 2. Current Decisions

- Repository host: `D:\Documents\humbleOne_Chen`
- Prototype app path: `apps/ai-reader-prototype`
- Prototype stack: `Next.js + React + TypeScript`
- First prototype scope: `Today` three-pane page only
- Data source for prototype: typed mock data until Decision Gate 4 is confirmed
- Visual baseline: existing images under `imgs/`

React / Next.js must stay inside `apps/ai-reader-prototype`; do not migrate the VitePress blog theme to React.

## 3. Stitch Project

Existing Stitch project:

- Project ID: `10033335275344269454`
- Project URL: `https://stitch.withgoogle.com/projects/10033335275344269454`

Relevant known screens:

- Current Source Desk target screen: `7a32e02fc8714781bba78cec07ec97db`
- Strong visual reference screen: `16578059806999052951`
- Design system asset: `bab8045236af45918d01160f1669fb91`

Stitch generation should prefer strict visual transfer from the known reference screen instead of free exploration. Local `imgs/` files document the intent, but MCP generation may need the Stitch screen IDs above as the real visual reference.

## 4. Sitemap

- [ ] `source-desk-reference-transfer-board` - Figma/Stitch reference-image-to-design component board
- [ ] `source-desk-today` - desktop Today three-pane layout
- [ ] `source-desk-today-mobile` - mobile Today mode shell
- [ ] `source-desk-component-board` - Source Desk primitives and states

Current priority: `source-desk-reference-transfer-board`, then return to `source-desk-today`.

## 5. Roadmap

1. Convert the reference images into a Figma/Stitch component board for Source Desk.
2. Score the board against the Source Desk rubric.
3. Use targeted Stitch/Figma edits if it becomes too SaaS-like.
4. Return to `source-desk-today` only after component quality is accepted.
5. Update `apps/ai-reader-prototype` components from the accepted design board.
6. Delegate implementation slices to workers:
   - UI shell and three variants
   - mock data and typed contracts
   - verification and run scripts

## 6. Visual References

Use these local references as the design baseline:

- `imgs/ig_0e746d651c7f2abe016a318af95acc8193b2c2093b3efe0c2e.png`
  - Main desktop/mobile structure reference.
- `imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png`
  - Source Desk tactile component reference.
- `imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png`
  - Mode system reference: Source Desk, Garden Atlas, Radio Dispatch.

## 7. Creative Freedom

Do not freely redesign the product direction.

Allowed:

- Improve visual fidelity of the Source Desk.
- Clarify hierarchy between Source Desk, Today Timeline, and Newspaper Reader.
- Add component states shown in existing docs: selected, new, stale, failed, hover.

Not allowed:

- Replace Source Desk with a generic SaaS sidebar.
- Turn Today into an infinite feed.
- Create a marketing hero page.
- Add account/auth/subscription features.
- Treat Stitch output as production code.

## 8. Scoring Rubric

Score each Stitch output from 1-5:

- Reference image similarity
- Non-commercial / handmade feel
- Physical object quality
- Today timeline readability
- Newspaper reader readability
- Engineering feasibility
- Daily-use comfort

The minimum viable score for implementation is:

- Source Desk physical object quality: 4+
- Today timeline readability: 4+
- Newspaper reader readability: 4+
- Engineering feasibility: 3+
