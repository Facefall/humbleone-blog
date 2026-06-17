# Figma Layer Spec: Source Desk Reference Transfer

## Target File Structure

```text
AI Builder Daily / Source Desk
  00 Reference Board
  01 Source Desk Component Board
  02 Material Tokens
  03 State Matrix
  04 Implementation Notes
```

## 00 Reference Board

Place these two images:

```text
apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a318e1fa56c8193a585bf7e00e6be73.png
apps/ai-reader-prototype/imgs/ig_0e746d651c7f2abe016a317c5c87c88193af61420aaeabe3fa.png
```

Add labels:

- Primary target: right-side Source Desk in the transformation image.
- Supporting target: Source Desk and High Signal / index-card language in the concepts image.
- Ignore: large poster annotations and surrounding explanation text.

## 01 Source Desk Component Board

Create a desktop frame around 900 x 900.

Layer hierarchy:

```text
SourceDeskShowcase
  DeskSurface
    SourceDeskShell
      DeskHeader
        ProductLabel
        ProductSubtitle
        HeaderTools
      SourceDeskTab
      SourceSlipStack
        SourceSlip / All Sources
        SourceSlip / Annotated
        SourceSlip / High Signal
        SourceSlip / Archived
      PinnedNotes
        PinnedNote / Anthropic News
        PinnedNote / OpenAI Blog
        PinnedNote / Market Watch
      QuickAccess
        ClippingItem / AI Builder Daily
        ClippingItem / arXiv CS.AI
        ClippingItem / Hacker News
        ClippingItem / LessWrong
      DeskFooterAction
    HighSignalPreview
```

## 02 Material Tokens

Create local styles or variable tokens:

### Color Tokens

```text
desk/bg             #160B07
desk/panel          #21110B
desk/line           #4A2D20
desk/ink            #F0D8C4
desk/muted          #9E7F70
paper/base          #F1E5CF
paper/warm          #EAD2AD
paper/aged          #D7C3A2
ink/base            #1D1712
ink/soft            #4B3A31
signal/copper       #FFB287
signal/orange       #FF7B3D
stamp/red           #A64728
blueprint/muted     #7A9BB8
archive/green       #8EA36D
```

### Texture Tokens

```text
texture/desk-walnut
texture/paper-aged
texture/paper-warm
texture/tape-fiber
texture/noise
texture/pencil-line
```

Use image fills where possible. If a texture is extracted from the reference image, desaturate it into a black/white texture channel first, then apply blend mode:

```text
desk texture: overlay / soft light
paper texture: multiply 8-16%
tape texture: multiply 10-20% + opacity 55-75%
noise: overlay 3-6%
```

## 03 Component Variants

### SourceSlip

Variants:

```text
state=default
state=hover
state=selected
state=new
state=stale
state=failed
state=dragging
state=drop-target
```

Required visual differences:

- `selected`: x +8px, copper edge visible.
- `new`: ink dot or star mark.
- `stale`: lower contrast, grayer paper.
- `failed`: broken dull red line.
- `dragging`: deeper shadow and flatter rotation.
- `drop-target`: dashed pencil slot.

### PinnedNote

Variants:

```text
color=ivory
color=amber
color=blue
color=rose
```

Required pieces:

- tape strip
- pin / side mark
- short source title
- time / source hint
- short editorial note

### ClippingItem

Variants:

```text
state=default
state=fresh
state=stale
state=selected
```

Clipping rows should be narrow and quiet. Do not use modern card styling.

### HighSignalPreview

Variants:

```text
state=open
state=pinned
state=hover
```

This card should look like it was pulled out from the High Signal source slip. It needs:

- slight rotation
- paper texture
- pin/clip top-left
- title and count
- source list with tiny signal waves
- footer action

## 04 Typography

Recommended font directions:

```text
Masthead / reader: Newsreader, Libre Baskerville, Fraunces, or Georgia fallback.
Source labels / counters: Courier Prime, IBM Plex Mono, JetBrains Mono, Courier fallback.
Pinned notes: Caveat, Patrick Hand, LXGW WenKai, KaiTi, or serif fallback.
```

Use real font exploration in Figma before locking the code stack.

## 05 Export Rules

Export texture assets separately, not as baked component images:

```text
desk-walnut.webp/svg
paper-aged.webp/svg
paper-warm.webp/svg
tape-fiber.webp/svg
noise.svg
pencil-line.svg
```

Components should remain editable and reconstructable in code.

## 06 Code Mapping

Once the design is accepted:

```text
Figma SourceDeskShell       -> SourceDeskShell
Figma SourceSlip            -> SourceSlip
Figma PinnedNote            -> PinnedNoteCard
Figma ClippingItem          -> ClippingCard
Figma HighSignalPreview     -> HighSignalPreviewCard
Figma StampBadge            -> StampBadge
Figma FreshnessGlyph        -> FreshnessGlyph
Figma DeskFooterAction      -> DeskFooterAction
```

Code implementation should use:

- Radix only for behavior and accessibility.
- Stitches for all visual states and tokens.
- image/SVG texture assets for material.
- `background-blend-mode`, `clip-path`, `transform`, and `box-shadow` for first- and second-level effects.
