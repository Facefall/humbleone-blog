# AI Reader Prototype

Throwaway Next.js prototype for the AI Builder Daily reader.

Prototype question:

> Can the three-pane reading surface `[Source Desk] [Today Timeline] [Newspaper Reader]` support a comfortable daily AI / Agent / Coding Agent information diet?

Run from the repository root:

```powershell
pnpm dev
```

The integrated dev server mounts this app at `http://localhost:5173/humbleone-blog/reader/`.
To run only the reader, use `pnpm reader:dev`. The standalone reader now listens on `http://localhost:7788`.

For a long-running process, `pm2` is fine:

```powershell
pnpm reader:build
pnpm reader:pm2
```

This assumes `pm2` is already installed globally.

If you need to start the production server without `pm2`, use:

```powershell
pnpm reader:start
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

## Logging

The reader uses structured logging with separate server and client channels.

### Server logs (Feed Hub, AI, translation)

Server logs print to the **`next dev` terminal**, not the browser DevTools console.

```env
READER_LOG_LEVEL=debug
READER_LOG_FILE=logs/reader.log
```

`FEED_HUB_LOG_LEVEL` is still supported as a legacy alias for `READER_LOG_LEVEL`.

To inspect RSSHub sync output:

1. Set `READER_LOG_LEVEL=debug` in `apps/ai-reader-prototype/.env`
2. Restart `pnpm reader:dev` or the integrated `pnpm dev`
3. Click **Feed refresh** in the reader UI (or `POST /api/feed-hub/refresh`)
4. Read `[feed-hub:debug]` lines in the terminal, or open `logs/reader.log`

Each source fetch also writes a row to the SQLite `fetch_runs` table for later inspection.

### Client logs (dev only)

Client events use explicit `readerLog` calls. They do **not** mirror the full browser console.

```env
NEXT_PUBLIC_READER_CLIENT_LOG=1
READER_CLIENT_LOG_FILE=logs/reader-client.log
```

When enabled, feed refresh events are posted to `POST /api/dev/logs` and appended to the client log file.
