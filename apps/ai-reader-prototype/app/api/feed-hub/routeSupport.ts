import { dailyBrief } from '../../../lib/prototype-data'
import type { FeedHubPageInfo, FeedHubResponse } from '../../../services/feedHub/types'

export type FeedHubProjectionQuery = {
  limit?: number
  offset: number
  sourceId?: string
}

export function readFeedHubProjectionQuery(request: Request): FeedHubProjectionQuery {
  const url = new URL(request.url)
  const offset = readOptionalInteger(url.searchParams.get('offset'))
  const cursor = readOptionalInteger(url.searchParams.get('cursor'))

  return {
    limit: readOptionalInteger(url.searchParams.get('limit')),
    offset: offset ?? cursor ?? 0,
    sourceId: readOptionalString(url.searchParams.get('sourceId')),
  }
}

export function createFeedHubFallbackResponse({
  endpoint,
  error,
  pageInfo = createEmptyPageInfo(50),
  sourceId,
}: {
  endpoint: string
  error: unknown
  pageInfo?: FeedHubPageInfo
  sourceId: string
}): FeedHubResponse {
  return {
    mode: 'fallback',
    fetchedAt: new Date().toISOString(),
    brief: dailyBrief,
    pageInfo,
    sourceResults: [
      {
        endpoint,
        fetchMethod: 'manual',
        sourceId,
        rsshubRoute: 'rsshub-package',
        itemCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      },
    ],
  }
}

export function createEmptyPageInfo(limit: number): FeedHubPageInfo {
  return {
    hasMore: false,
    limit,
    offset: 0,
    returnedCount: 0,
    totalCount: 0,
  }
}

export function jsonResponse(value: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}

function readOptionalString(value: string | null) {
  const trimmed = value?.trim()

  return trimmed || undefined
}

function readOptionalInteger(value: string | null) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) ? parsed : undefined
}
