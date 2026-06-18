# AI Reader Prototype

Throwaway Next.js prototype for the AI Builder Daily reader.

Prototype question:

> Can the three-pane reading surface `[Source Desk] [Today Timeline] [Newspaper Reader]` support a comfortable daily AI / Agent / Coding Agent information diet?

Run from the repository root:

```powershell
pnpm reader:dev
```

Variant URLs:

- `/?variant=A`
- `/?variant=B`
- `/?variant=C`

Boundaries:

- No real RSS/API fetching.
- No persistence.
- Typed mock data only.
- React / Next.js stays inside `apps/ai-reader-prototype`.
- Do not modify the VitePress blog theme from this app.

## Typography

Fonts load through `next/font` in [`lib/fonts.ts`](lib/fonts.ts):

| Role | Stack | Theme |
|------|-------|-------|
| Serif body | Newsreader + Noto Serif SC | Source Desk reader |
| Archival mono | Courier Prime + Sarasa Mono SC | Source Desk labels |
| Note / annotation | Newsreader italic + Noto Serif SC | Pinned notes |
| Terminal mono | JetBrains Mono + Sarasa Mono SC | Standard reader |

Sarasa Mono SC is self-hosted from `public/fonts/`. After placing `SarasaMonoSC-TTF-1.0.39.7z` in that folder, run:

```powershell
pnpm --filter @humbleone/ai-reader-prototype fetch:fonts
```

