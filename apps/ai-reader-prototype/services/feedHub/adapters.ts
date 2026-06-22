import { requestOfficialApiSource } from './officialApiClient'
import { requestOfficialFeed } from './officialFeedClient'
import { requestRSSHubRoute } from './rsshubClient'
import type { FeedHubSourceConfig, RsshubData } from './types'

export type FeedSourceAdapter = {
  id: string
  canHandle: (config: FeedHubSourceConfig) => boolean
  fetch: (config: FeedHubSourceConfig) => Promise<RsshubData>
}

export const defaultFeedSourceAdapters: FeedSourceAdapter[] = [
  {
    id: 'rsshub-package',
    canHandle: (config) => config.fetchMethod === 'rsshub',
    fetch: (config) => requestRSSHubRoute(config.rsshubRoute),
  },
  {
    id: 'official-rss',
    canHandle: (config) => config.fetchMethod === 'official_rss',
    fetch: (config) => requestOfficialFeed(config.endpoint),
  },
  {
    id: 'official-api',
    canHandle: (config) => config.fetchMethod === 'official_api',
    fetch: requestOfficialApiSource,
  },
  {
    id: 'custom-scrape-unsupported',
    canHandle: (config) => config.fetchMethod === 'custom_scrape',
    fetch: async (config) => {
      throw new Error(`Feed Hub custom scrape adapter is not implemented: ${config.adapter}`)
    },
  },
  {
    id: 'manual-unsupported',
    canHandle: (config) => config.fetchMethod === 'manual',
    fetch: async (config) => {
      throw new Error(`Feed Hub manual adapter cannot be fetched automatically: ${config.adapter}`)
    },
  },
]

export async function requestFeedSourceWithAdapters(
  config: FeedHubSourceConfig,
  adapters: FeedSourceAdapter[] = defaultFeedSourceAdapters,
) {
  return getFeedSourceAdapter(config, adapters).fetch(config)
}

export function getFeedSourceAdapter(
  config: FeedHubSourceConfig,
  adapters: FeedSourceAdapter[] = defaultFeedSourceAdapters,
) {
  const matches = adapters.filter((adapter) => adapter.canHandle(config))

  if (!matches.length) {
    throw new Error(`Unsupported Feed Hub fetch method: ${config.fetchMethod}`)
  }

  if (matches.length > 1) {
    throw new Error(`Multiple Feed Hub adapters matched ${config.sourceId}: ${matches.map((adapter) => adapter.id).join(', ')}`)
  }

  return matches[0]
}
