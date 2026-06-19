'use client'

import { useState } from 'react'
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

    try {
      const nextBrief = await onRefreshFeed?.()
      const count = nextBrief?.itemCount ?? articleCount

      onNotice(labels.refreshed(count))
    } catch (error) {
      onNotice(error instanceof Error ? error.message : labels.refreshFailed)
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
