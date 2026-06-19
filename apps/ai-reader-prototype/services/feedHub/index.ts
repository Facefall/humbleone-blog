import { readFeedHubProjection } from './feedHubProjection'
import { syncFeedHubSources, type FeedHubSyncOptions } from './feedHubSync'
import type { FeedHubResponse } from './types'

export async function getFeedHubBrief(): Promise<FeedHubResponse> {
  return readFeedHubProjection()
}

export async function refreshFeedHubBrief(options: FeedHubSyncOptions = {}): Promise<FeedHubResponse> {
  await syncFeedHubSources(options)

  return readFeedHubProjection()
}
