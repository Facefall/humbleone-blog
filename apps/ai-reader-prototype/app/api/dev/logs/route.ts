import type { ClientLogEntry } from '../../../../lib/logging/readerLog'
import { readerLogger, type ReaderLogEntry } from '../../../../services/logging/readerLogger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ClientLogRequestBody = {
  entries?: ClientLogEntry[]
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 })
  }

  let body: ClientLogRequestBody

  try {
    body = await request.json() as ClientLogRequestBody
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400)
  }

  const entries = Array.isArray(body.entries) ? body.entries : []

  if (!entries.length) {
    return jsonResponse({ ok: true, accepted: 0 })
  }

  readerLogger.writeClientEntries(entries.map(toReaderLogEntry))

  return jsonResponse({ ok: true, accepted: entries.length })
}

function toReaderLogEntry(entry: ClientLogEntry): ReaderLogEntry {
  return {
    ts: entry.ts || new Date().toISOString(),
    level: entry.level,
    channel: 'client',
    event: entry.event,
    payload: entry.payload,
  }
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
