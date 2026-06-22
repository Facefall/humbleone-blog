'use client'

import { useState } from 'react'
import { readerLog } from '../lib/logging/readerLog'
import type { DailyBrief } from '../lib/prototype-data'

type UseFeedRefreshControlOptions = {
  articleCount: number
  labels: {
    refreshFailed: string
    refreshed: (count: number) => string
  }
  minDurationMs?: number
  onNotice: (label: string) => void
  onRefreshFeed?: () => Promise<DailyBrief | null>
}

export function useFeedRefreshControl({
  articleCount,
  labels,
  minDurationMs = 900,
  onNotice,
  onRefreshFeed,
}: UseFeedRefreshControlOptions) {
  const [feedRefreshing, setFeedRefreshing] = useState(false)

  async function refreshFeed() {
    if (feedRefreshing) {
      return
    }

    const startedAt = Date.now()

    setFeedRefreshing(true)
    readerLog.info('feed.refresh.start', { articleCount })

    try {
      const nextBrief = await onRefreshFeed?.()
      const count = nextBrief?.itemCount ?? articleCount

      readerLog.info('feed.refresh.success', { itemCount: count })
      onNotice(labels.refreshed(count))
    } catch (error) {
      const message = error instanceof Error ? error.message : labels.refreshFailed

      readerLog.error('feed.refresh.failed', { message })
      onNotice(message)
    } finally {
      const remainingMs = Math.max(0, minDurationMs - (Date.now() - startedAt))

      if (remainingMs > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingMs))
      }

      setFeedRefreshing(false)
    }
  }

  return {
    feedRefreshing,
    refreshFeed,
  }
}
