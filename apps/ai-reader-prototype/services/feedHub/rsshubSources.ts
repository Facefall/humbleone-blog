import type { FeedHubSourceConfig } from './types'
import type { EffectiveSourceRegistry } from '../sourceRegistry'

export function getFeedHubRsshubSources(registry: EffectiveSourceRegistry): FeedHubSourceConfig[] {
  return registry.records.flatMap((record) => {
    if (record.fetchMethod !== 'rsshub' || !record.rsshubRoute || !record.feedHub) {
      return []
    }

    return [{
      sourceId: record.sourceId,
      rsshubRoute: record.rsshubRoute,
      section: record.feedHub.section,
      maxItems: record.feedHub.maxItems,
      enabled: record.feedHub.enabled,
      updateFrequency: record.updateFrequency,
    }]
  })
}
