'use client'

import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { getFeedHubBrief, refreshFeedHubBrief } from '../../services/api/feedHubApi'
import type { FeedHubResponse } from '../../services/feedHub/types'
import { normalizeApiError, type ApiError } from '../../services/api/request'

const feedHubBriefKey = '/api/feed-hub'
const pollingIntervalMs = 3000
const pollingWindowMs = 45000

export function useFeedHubBrief() {
  const [pollingExpiresAt, setPollingExpiresAt] = useState(0)
  const polling = pollingExpiresAt > Date.now()
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<FeedHubResponse, ApiError>(
    feedHubBriefKey,
    () => getFeedHubBrief(),
    {
      dedupingInterval: 1000,
      keepPreviousData: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: polling ? pollingIntervalMs : 0,
      refreshWhenHidden: false,
    },
  )

  useEffect(() => {
    if (!polling) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setPollingExpiresAt(0)
    }, Math.max(0, pollingExpiresAt - Date.now()))

    return () => window.clearTimeout(timeout)
  }, [polling, pollingExpiresAt])

  const refetch = useCallback(async () => {
    const nextData = await mutate()

    return nextData ?? null
  }, [mutate])
  const refresh = useCallback(async () => {
    const controller = new AbortController()
    const data = await refreshFeedHubBrief({ signal: controller.signal })

    void mutate(data, {
      revalidate: false,
    })
    setPollingExpiresAt(Date.now() + pollingWindowMs)

    return data
  }, [mutate])

  return {
    data: data ?? null,
    error: error ? normalizeApiError(error) : null,
    isError: Boolean(error),
    isIdle: false,
    isLoading,
    isPolling: polling,
    isSuccess: Boolean(data) && !error,
    isValidating,
    refetch,
    refresh,
    status: error ? 'error' as const : data ? 'success' as const : isLoading ? 'loading' as const : 'idle' as const,
  }
}
