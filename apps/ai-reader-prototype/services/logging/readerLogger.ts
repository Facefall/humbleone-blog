import { appendFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import chalk, { type ChalkInstance } from 'chalk'
import { loadReaderEnv } from '../loadReaderEnv'

export type ReaderLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export type ReaderLogChannel =
  | 'feed-hub'
  | 'source-registry'
  | 'ai'
  | 'translation'
  | 'api'
  | 'client'

export type ReaderLogEntry = {
  channel: ReaderLogChannel
  correlationId?: string
  event: string
  level: ReaderLogLevel
  payload?: unknown
  ts: string
}

const levelRank: Record<ReaderLogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

const channelColors: Record<ReaderLogChannel, ChalkInstance> = {
  'feed-hub': chalk.cyan,
  'source-registry': chalk.magenta,
  ai: chalk.green,
  translation: chalk.blue,
  api: chalk.yellow,
  client: chalk.gray,
}

let resolvedLevel: ReaderLogLevel | null = null
let resolvedLogFile: string | null | undefined

function resolveLogLevel(): ReaderLogLevel {
  if (resolvedLevel) {
    return resolvedLevel
  }

  loadReaderEnv()

  const raw = (
    process.env.READER_LOG_LEVEL
    ?? process.env.FEED_HUB_LOG_LEVEL
  )?.trim().toLowerCase()

  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error' || raw === 'silent') {
    resolvedLevel = raw
    return raw
  }

  resolvedLevel = 'silent'
  return 'silent'
}

function resolveLogFilePath() {
  if (resolvedLogFile !== undefined) {
    return resolvedLogFile
  }

  loadReaderEnv()

  const configured = process.env.READER_LOG_FILE?.trim()

  if (!configured) {
    resolvedLogFile = null
    return null
  }

  resolvedLogFile = path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured)

  return resolvedLogFile
}

function isEnabled(level: ReaderLogLevel) {
  return levelRank[level] <= levelRank[resolveLogLevel()]
}

function writeLog(entry: ReaderLogEntry) {
  const logFilePath = resolveLogFilePath()

  if (!logFilePath) {
    return
  }

  try {
    mkdirSync(path.dirname(logFilePath), { recursive: true })
    appendFileSync(logFilePath, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    // Logging must never break request handling.
  }
}

function emit(
  level: ReaderLogLevel,
  channel: ReaderLogChannel,
  event: string,
  payload?: unknown,
  correlationId?: string,
) {
  if (!isEnabled(level)) {
    return
  }

  const entry: ReaderLogEntry = {
    ts: new Date().toISOString(),
    level,
    channel,
    event,
    correlationId,
    payload,
  }

  const color = channelColors[channel]
  const prefix = color.bold(`[${channel}:${level}]`)
  const line = `${prefix} ${chalk.gray(event)}`

  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }

  if (payload !== undefined) {
    const serialized = JSON.stringify(payload, null, 2)

    if (level === 'error') {
      console.error(chalk.dim(serialized))
    } else if (level === 'warn') {
      console.warn(chalk.dim(serialized))
    } else {
      console.log(chalk.dim(serialized))
    }
  }

  writeLog(entry)
}

export const readerLogger = {
  debug(channel: ReaderLogChannel, event: string, payload?: unknown, correlationId?: string) {
    emit('debug', channel, event, payload, correlationId)
  },
  info(channel: ReaderLogChannel, event: string, payload?: unknown, correlationId?: string) {
    emit('info', channel, event, payload, correlationId)
  },
  warn(channel: ReaderLogChannel, event: string, payload?: unknown, correlationId?: string) {
    emit('warn', channel, event, payload, correlationId)
  },
  error(channel: ReaderLogChannel, event: string, payload?: unknown, correlationId?: string) {
    emit('error', channel, event, payload, correlationId)
  },
  isDebugEnabled() {
    return isEnabled('debug')
  },
  writeClientEntries(entries: ReaderLogEntry[]) {
    const logFilePath = process.env.READER_CLIENT_LOG_FILE?.trim()
      || process.env.READER_LOG_FILE?.trim()

    if (!logFilePath) {
      entries.forEach((entry) => {
        emit(entry.level, entry.channel, entry.event, entry.payload, entry.correlationId)
      })
      return
    }

    const absolutePath = path.isAbsolute(logFilePath)
      ? logFilePath
      : path.join(process.cwd(), logFilePath)

    try {
      mkdirSync(path.dirname(absolutePath), { recursive: true })

      const lines = entries.map((entry) => JSON.stringify(entry)).join('\n')

      appendFileSync(absolutePath, `${lines}\n`, 'utf8')
    } catch {
      entries.forEach((entry) => {
        emit(entry.level, entry.channel, entry.event, entry.payload, entry.correlationId)
      })
    }
  },
}
