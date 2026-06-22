import { readerLogger } from '../logging/readerLogger'

export function feedHubDebug(message: string, payload?: unknown, correlationId?: string) {
  readerLogger.debug('feed-hub', message, payload, correlationId)
}

export function feedHubInfo(message: string, payload?: unknown, correlationId?: string) {
  readerLogger.info('feed-hub', message, payload, correlationId)
}

export function feedHubWarn(message: string, payload?: unknown, correlationId?: string) {
  readerLogger.warn('feed-hub', message, payload, correlationId)
}

export function feedHubError(message: string, payload?: unknown, correlationId?: string) {
  readerLogger.error('feed-hub', message, payload, correlationId)
}

export function isFeedHubDebugEnabled() {
  return readerLogger.isDebugEnabled()
}
