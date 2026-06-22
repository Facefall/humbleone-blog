import type { EffectiveSourceRegistry } from '../sourceRegistry'
import type { FeedHubSourceConfig } from './types'
import { buildFeedHubSourceCatalog } from './sourceCatalog'

export function getFeedHubSources(registry: EffectiveSourceRegistry): FeedHubSourceConfig[] {
  return buildFeedHubSourceCatalog(registry).sources
}

export function getFeedHubRsshubSources(registry: EffectiveSourceRegistry): FeedHubSourceConfig[] {
  return buildFeedHubSourceCatalog(registry).sources
    .filter((source) => source.fetchMethod === 'rsshub')
}
