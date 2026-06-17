---
title: Source Desk Reference Image To Design
project_id: "10033335275344269454"
mode: image-to-design
primary_reference: "apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png"
supporting_reference: "apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png"
---

# Stitch Prompt: Source Desk Reference Image To Design

Use this prompt after uploading the two reference images to Stitch.

## Goal

Convert the reference images into a practical product design board for the `Source Desk` component system. This is not a marketing page and not a generic dashboard. The output should be a design-spec board that can later guide Radix UI + Stitches implementation.

## Output Format

Create one desktop design screen named:

```text
Source Desk Component Board - Reference Transfer
```

The screen must include four zones:

1. **Primary Source Desk Panel**
   - A complete Source Desk panel based on the right-side target shown in the reference image.
   - Include header, Source Desk tab, source slips, pinned notes, quick access clippings, and Add Source action.

2. **High Signal Preview Card**
   - A floating paper card to the right of the Source Desk.
   - It should look pinned or clipped to the workspace, with visible paper texture, shadow, and a slight rotation.
   - Include a `HIGH SIGNAL` title, count, short source list, tiny signal wave marks, and a "view all" footer.

3. **Component State Matrix**
   - Show SourceSlip states: default, hover/lift, selected/pulled-right, new/ink-dot, stale/faded, failed/broken-line, dragging/floating, drop-target/pencil-slot.
   - Show PinnedNote variants: ivory, amber, blue, rose.
   - Show ClippingItem variants: fresh, quiet, stale.
   - Show StampBadge and FreshnessGlyph samples.

4. **Material Token Board**
   - Dark desk texture.
   - Aged paper texture.
   - Warm signal paper texture.
   - Transparent tape texture.
   - Stamp ink.
   - Pencil line and dashed drop target.
   - Shadow levels: contact, lifted, floating.

## Visual Direction

The design should feel like:

- a private editor's desk
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

The design should not feel like:

- SaaS sidebar
- clean dashboard
- uniform cards
- modern rounded pills
- glassmorphism
- neon
- purple gradients
- marketing landing page

## Component Requirements

### SourceDeskShell

Dark brown-black desk background, subtle wood grain, low internal divider lines, compact but readable. Width target: 300-340px.

### DeskHeader

Small console-like identity:

```text
BUILDER_OS
AI Workstation v1.0
```

Use one or two tiny physical tool icons such as a pin and star. Do not use a large modern badge in the header.

### SourceSlip

Each source entry is a physical paper slip, not a menu item.

Required rows:

```text
All Sources     42
Annotated       12
High Signal      7
Archived        18
```

Make the rows stack like paper strips with slight offsets, edge imperfections, warm shadows, and counters that look handwritten or archival.

### PinnedNote

Use three pinned notes:

```text
Anthropic News     10m ago
Strong track record on safety + evals.

OpenAI Blog        1h ago
Watch Assistants API momentum.

Market Watch       3h ago
Blackwell signals suggest scale inflection in Q4.
```

Each note should use tape, pin, side tab, or clipped edge. Notes may overlap slightly.

### Quick Access

Use narrow clipping rows:

```text
AI Builder Daily
arXiv: CS.AI
Hacker News
LessWrong
```

Rows should be quiet, thin, and clipping-like. Use tiny star/mark actions on the right.

### Footer Action

Use a paper strip:

```text
+ Add Source
```

Make it look like a torn desk label or paper strip, not a primary button.

## Interaction States To Express Visually

- `default`: paper lies flat.
- `hover`: paper lifts slightly.
- `selected`: paper is pulled right with a copper edge.
- `new`: tiny ink dot or star stamp.
- `stale`: faded paper and low-contrast ink.
- `failed`: subtle broken line, not aggressive red.
- `dragging`: floating paper slip with deeper shadow.
- `drop-target`: dashed pencil slot or empty paper slot.

## Important Constraint

Do not recreate the Chinese annotation poster around the reference image. Extract the Source Desk component language from it and convert that into a usable design board.

## Evaluation Rubric

The output should score 4/5 or better on:

- reference image similarity
- paper-object quality
- handmade editorial feel
- component-state clarity
- readability
- engineering feasibility

If the first result looks like a normal app sidebar, apply targeted edits rather than generating a new concept.
