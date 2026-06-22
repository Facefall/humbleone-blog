type ClientLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type ClientLogEntry = {
  channel: 'client'
  event: string
  level: ClientLogLevel
  payload?: unknown
  ts: string
}

function isClientLogPersistenceEnabled() {
  return process.env.NODE_ENV === 'development'
    && process.env.NEXT_PUBLIC_READER_CLIENT_LOG === '1'
}

function createEntry(level: ClientLogLevel, event: string, payload?: unknown): ClientLogEntry {
  return {
    ts: new Date().toISOString(),
    level,
    channel: 'client',
    event,
    payload,
  }
}

function writeToDevConsole(entry: ClientLogEntry) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const prefix = `[client:${entry.level}] ${entry.event}`

  if (entry.level === 'error') {
    console.error(prefix, entry.payload ?? '')
    return
  }

  if (entry.level === 'warn') {
    console.warn(prefix, entry.payload ?? '')
    return
  }

  console.log(prefix, entry.payload ?? '')
}

async function postClientLogs(entries: ClientLogEntry[]) {
  const body = JSON.stringify({ entries })

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })

      if (navigator.sendBeacon('/api/dev/logs', blob)) {
        return
      }
    }

    await fetch('/api/dev/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    })
  } catch {
    // Client logging must never break UI flows.
  }
}

function emit(level: ClientLogLevel, event: string, payload?: unknown) {
  const entry = createEntry(level, event, payload)

  writeToDevConsole(entry)

  if (!isClientLogPersistenceEnabled()) {
    return
  }

  void postClientLogs([entry])
}

export const readerLog = {
  debug(event: string, payload?: unknown) {
    emit('debug', event, payload)
  },
  info(event: string, payload?: unknown) {
    emit('info', event, payload)
  },
  warn(event: string, payload?: unknown) {
    emit('warn', event, payload)
  },
  error(event: string, payload?: unknown) {
    emit('error', event, payload)
  },
}
