---
name: AI Builder Daily Source Desk
project_id: "10033335275344269454"
colors:
  desk_bg: "#160B07"
  desk_panel: "#21110B"
  desk_line: "#4A2D20"
  desk_ink: "#F0D8C4"
  paper: "#F1E5CF"
  paper_warm: "#EAD2AD"
  paper_aged: "#D7C3A2"
  ink: "#1D1712"
  copper: "#FFB287"
  signal: "#FF7B3D"
  blueprint: "#7A9BB8"
  archive_green: "#8EA36D"
---

# Design System: AI Builder Daily Source Desk

**Project ID:** `10033335275344269454`  
**Status:** Source Desk convergence baseline  
**Primary reference screen:** `16578059806999052951`  
**Current target screen:** `7a32e02fc8714781bba78cec07ec97db`

## 1. Visual Theme & Atmosphere

`AI Builder Daily` is a personal editorial desk for reading AI / Agent / Coding Agent signals. The interface should feel like a quiet late-night editor's workstation: dark warm desk surface, aged paper, pinned source notes, narrow clippings, ink marks, stamps, and a newspaper reader pane.

The left pane is not a sidebar. It is a `Source Desk`: a tactile surface where information sources become physical objects before they become UI components. The middle pane is a compact daily filing stack. The right pane is a readable postmodern newspaper page.

Atmosphere scale:

- Density: 7/10, compact enough for daily reading.
- Variance: 7/10, slightly irregular but never chaotic.
- Motion: 4/10, quiet physical feedback rather than flashy animation.
- Commercial polish: intentionally low; handmade editorial quality is preferred.

The memorable signature is physical information handling: paper slips are pulled out, notes are pinned, quick links are clipped, new items leave ink dots, stale sources fade, failed sources show broken pencil lines.

## 2. Color Palette & Roles

### Primary Foundation

- **Deep Desk Brown Black** (`#160B07`) — main Source Desk background; never use pure black.
- **Raised Desk Brown** (`#21110B`) — lifted dark panels, inner desk wells, popover shadows.
- **Worn Desk Border** (`#4A2D20`) — dividers, worn edges, low-contrast rails.
- **Warm Desk Ink** (`#F0D8C4`) — primary text on the dark desk surface.
- **Muted Desk Ink** (`#9E7F70`) — secondary metadata, timestamps, section actions.

### Paper Materials

- **Aged Paper** (`#F1E5CF`) — primary paper slips and index cards.
- **Warm Paper Tag** (`#EAD2AD`) — tabs, Add Source strip, important labels.
- **Worn Paper** (`#D7C3A2`) — stale paper, archived sources, secondary cards.
- **Paper Edge Brown** (`rgba(65,40,24,0.26)`) — borders, creases, edge stains.
- **Transparent Tape** (`rgba(255,238,181,0.72)`) — tape and pinned-note anchors.

### Text & Signal

- **Print Ink** (`#1D1712`) — primary text on paper.
- **Soft Print Ink** (`#4B3A31`) — paper metadata and secondary copy.
- **Copper Signal** (`#FFB287`) — selected edge, high-signal trace, active route.
- **Orange Ink Signal** (`#FF7B3D`) — freshness dot, one-time pulse, new source mark.
- **Muted Blueprint Blue** (`#7A9BB8`) — evidence/research marks.
- **Archive Green Gray** (`#8EA36D`) — saved, stable, archival states.
- **Dull Stamp Red** (`#A64728`) — failed/broken stamps, warnings, stamp ink.

Use signal colors only as small physical marks. Do not fill large surfaces with orange, blue, or purple.

## 3. Typography Rules

### Hierarchy

- **Masthead / Reader Headlines:** newspaper serif, strong but not decorative.
- **Source Desk Labels:** narrow archival mono, uppercase, low letter-spacing.
- **Counters / Time / Evidence:** tabular mono, compact, clear.
- **Pinned Notes:** serif note text with editorial tone; avoid childish handwriting fonts.
- **Chinese summaries:** readable body sizing and enough line-height; personality should come from object treatment, not hard-to-read text.

### Banned Typography

- No Inter / Roboto / Arial as the main visual voice.
- No generic app sidebar typography.
- No oversized SaaS dashboard numbers.
- No negative letter-spacing.
- No decorative calligraphy that harms scanning.

## 4. Component Stylings

### SourceDeskShell

Dark brown desk surface with grain built from layered backgrounds. It frames objects rather than behaving like a normal card. Use subtle inner light, desk dust, and low-contrast dividers.

### DeskHeader

Small console-like identity block. It may include one or two physical tools: pin, star, tiny divider. Avoid a large modern badge in the header. The header should look like the top edge of a working surface, not a marketing brand bar.

### SourceSlip

A paper slip with icon, label, count, and freshness mark.

State language:

- `default`: paper lies flat, low contact shadow.
- `hover`: paper lifts 2-3px, shadow sharpens, rotation moves closer to zero.
- `selected`: slip pulls right 6-10px; copper edge becomes visible.
- `new`: tiny ink dot or small star, one-time pulse feel.
- `stale`: paper desaturates, ink fades, contrast lowers.
- `failed`: a broken dull red/brown line; never aggressive alert red.
- `dragging`: paper floats, rotation normalizes, shadow becomes deeper.
- `drop-target`: empty dashed pencil slot, not a blue drop zone.

### PinnedNote

Small note card with tape, pin, or side tab. Notes may overlap slightly and rotate by less than two degrees. They should feel written by an editor, not emitted by a notification system.

### ClippingItem

Narrow clipping row for quick access feeds. Keep it quiet and dense. Hover can make the left mark stretch slightly. Avoid full-height menu-row backgrounds.

### StampBadge

Stamp labels are physical ink marks: slightly rotated, imperfect, low fill. Use for `HIGH SIGNAL`, `OFFICIAL`, `GITHUB`, `COMMUNITY`, `READ`, `SAVED`. Avoid modern rounded pills.

### FreshnessGlyph

Use ink dots, faded dots, short pulse lines, and broken lines. It must never look like a generic notification badge.

### Today Timeline

Compact editorial filing stack grouped by hard news, cases, and interesting. Rows should be easy to scan and should not become heavy dashboard cards.

### Newspaper Reader

Right pane should feel like a real newspaper surface inside a product. It needs masthead, edition line, headline, body columns, AI summary, source proof, and follow-up questions. Do not make it parchment fantasy or a fake old map.

## 5. Layout Principles

Desktop structure:

```text
[Source Desk 280-340px] [Today Timeline 420-480px] [Newspaper Reader flexible]
```

Source Desk order:

1. Identity and issue/date.
2. Main entries or Source Desk tab.
3. Source groups: All Sources, High Signal, Annotated, Archived.
4. Pinned Notes.
5. Quick Access.
6. Add Source / New Clipping strip.

Responsive:

- Mobile should not preserve three columns.
- Use a bottom-level menu: `Today | Sources | Explore | Signals | Library`.
- Mobile Source Desk becomes a stack of larger paper objects, not hover-dependent UI.

## 6. Motion & Interaction

Motion should be physical and restrained:

- Hover lift: 120-180ms.
- Selected pull-out: 180-260ms.
- Popover index card: 160-220ms.
- Pin/stamp feedback: 220-320ms.

Animate only `transform` and `opacity` for primary interactions. Avoid animating width/height/top/left. No shimmer, confetti, neon glow, or constant animated decoration.

## 7. Anti-Patterns

Never generate or implement:

- Generic SaaS sidebar.
- Uniform menu rows.
- Clean corporate dashboard widgets.
- Purple/blue neon gradients.
- Rounded pills as default badges.
- Marketing hero page.
- Login/signup/auth surfaces.
- Infinite scrolling feed as the primary experience.
- Large colored blocks for state.
- Perfectly aligned sterile card stacks.
- Image-only components with baked-in text.
- Fictional metrics or fake system health sections.

## 8. Design System Notes for Stitch Generation

Use strict visual transfer from the reference image and existing target screen. Do not freely explore a new direction.

Generate or edit screens as an actual product surface, not a concept poster:

1. **Left Source Desk**
   - Dark warm desk surface.
   - Paper slips, pinned notes, clippings, stamps, ink dots, index cards.
   - Physical object states visible: selected, new, stale, failed, hover/lift.
   - Key entries: Today, Sources, Explore, Signals, Library; All Sources, High Signal, Annotated, Archived; Pinned Notes; Quick Access; Add Source.

2. **Middle Today Timeline**
   - Compact list of 3-8 items.
   - Groups: hard news, cases, interesting.
   - Each item needs source, time, evidence level, Chinese title, short Chinese summary, and why it matters.
   - Keep it readable and dense.

3. **Right Newspaper Reader**
   - `AI BUILDER DAILY` masthead.
   - Edition/date/topic line.
   - Selected article headline and body.
   - AI summary, source proof, follow-up questions.

Prompt language to use:

- "private editor's desk"
- "tactile paper-object interface"
- "torn paper tabs"
- "pinned source notes"
- "narrow archival clippings"
- "ink freshness marks"
- "dull stamped labels"
- "warm dark wooden desk surface"
- "postmodern retro newspaper reader"

Prompt language to avoid:

- "modern dashboard"
- "clean SaaS"
- "sleek sidebar"
- "glassmorphism"
- "neon"
- "purple gradient"
- "hero section"
- "marketing landing page"
