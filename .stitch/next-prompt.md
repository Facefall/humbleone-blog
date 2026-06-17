---
page: source-desk-reference-transfer-board
---

Create a desktop design-spec board named:

```text
Source Desk Component Board - Reference Transfer
```

This is a reference-image-to-design task. Do not generate a full product page yet.

Use these local image references:

- `apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png`
- `apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png`

If local images are not directly readable inside Stitch, upload the two images first and use the prompt at:

```text
.stitch/reference-transfer/source-desk-image-to-design.prompt.md
```

Also follow the Figma layer/component spec at:

```text
.stitch/reference-transfer/figma-layer-spec.md
```

**DESIGN SYSTEM REQUIRED**

Use `.stitch/DESIGN.md`, especially:

- Section 4: Component Stylings
- Section 7: Anti-Patterns
- Section 8: Design System Notes for Stitch Generation

## Board Structure

The output must include four zones:

1. **Primary Source Desk Panel**
   - Header: `BUILDER_OS`, `AI Workstation v1.0`, tiny pin/star tools.
   - Source Desk tab.
   - Source slips: All Sources, Annotated, High Signal, Archived.
   - Pinned notes: Anthropic News, OpenAI Blog, Market Watch.
   - Quick Access: AI Builder Daily, arXiv CS.AI, Hacker News, LessWrong.
   - Footer action: `+ Add Source`.

2. **High Signal Preview Card**
   - A floating paper card pulled out from the High Signal slip.
   - Slight rotation, paper texture, pin/clip top-left, shadow.
   - Title `HIGH SIGNAL`, count, short source list, tiny signal wave marks, footer action.

3. **Component State Matrix**
   - SourceSlip: default, hover/lift, selected, new, stale, failed, dragging, drop-target.
   - PinnedNote: ivory, amber, blue, rose.
   - ClippingItem: fresh, quiet, stale.
   - StampBadge and FreshnessGlyph samples.

4. **Material Token Board**
   - dark desk texture
   - aged paper texture
   - warm signal paper texture
   - transparent tape texture
   - stamp ink
   - pencil line / dashed slot
   - contact/lifted/floating shadows

## Strict Visual Direction

The board must feel like:

- private editor's desk
- tactile paper-object interface
- dark warm wooden desk surface
- aged paper slips
- pinned source notes
- narrow archival clippings
- transparent torn tape
- small metal pins and clips
- dull stamped labels
- ink freshness marks
- pencil dashed annotations

The board must not feel like:

- SaaS sidebar
- clean dashboard
- uniform cards
- modern rounded pills
- glassmorphism
- neon
- purple gradients
- marketing page

## Output Goal

Produce a design board good enough to guide Radix UI + Stitches implementation.

Do not recreate the surrounding Chinese annotation poster. Extract and formalize the Source Desk component language from the reference images.
