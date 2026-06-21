import chalk from 'chalk'
import { loadReaderEnv } from '../loadReaderEnv'

type FeedHubLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const levelRank: Record<FeedHubLogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

function resolveLogLevel(): FeedHubLogLevel {
  loadReaderEnv()

  const raw = process.env.FEED_HUB_LOG_LEVEL?.trim().toLowerCase()

  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error' || raw === 'silent') {
    return raw
  }

  return 'silent'
}

function isEnabled(level: FeedHubLogLevel) {
  return levelRank[level] <= levelRank[resolveLogLevel()]
}

export function feedHubDebug(message: string, payload?: unknown) {
  if (!isEnabled('debug')) {
    return
  }

  console.log(chalk.cyan.bold('[feed-hub:debug]'), chalk.gray(message))

  if (payload !== undefined) {
    console.log(chalk.dim(JSON.stringify(payload, null, 2)))
  }
}

export function isFeedHubDebugEnabled() {
  return isEnabled('debug')
}
