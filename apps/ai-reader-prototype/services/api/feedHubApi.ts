import { request, type ApiRequestOptions } from './request'
import type { FeedHubResponse } from '../feedHub/types'

export function getFeedHubBrief(options?: ApiRequestOptions) {
  return request<FeedHubResponse>({
    method: 'GET',
    url: '/api/feed-hub',
    signal: options?.signal,
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
}

export function refreshFeedHubBrief(options?: ApiRequestOptions) {
  return request<FeedHubResponse>({
    method: 'POST',
    signal: options?.signal,
    url: '/api/feed-hub/refresh',
  })
}
