import {
  loadEffectiveSourceRegistry,
  type EffectiveSourceRegistry,
  type SourceRegistryRecord,
} from '../sourceRegistry'
import type { FeedHubSourceCatalogEntry, FeedHubSourceConfig } from './types'

export type FeedHubSourceCatalog = {
  enabledSourceEntries: FeedHubSourceCatalogEntry[]
  enabledSources: FeedHubSourceConfig[]
  registry: EffectiveSourceRegistry
  sourceEntries: FeedHubSourceCatalogEntry[]
  sourceEntryById: Map<string, FeedHubSourceCatalogEntry>
  sources: FeedHubSourceConfig[]
}

export async function loadFeedHubSourceCatalog(): Promise<FeedHubSourceCatalog> {
  return buildFeedHubSourceCatalog(await loadEffectiveSourceRegistry())
}

export const getFeedHubSourceCatalog = loadFeedHubSourceCatalog

export function buildFeedHubSourceCatalog(registry: EffectiveSourceRegistry): FeedHubSourceCatalog {
  const sourceEntries = getFeedHubSourceEntries(registry)
  const sourceEntryById = new Map(sourceEntries.map((entry) => [entry.config.sourceId, entry]))
  const sources = sourceEntries.map((entry) => entry.config)
  const enabledSourceEntries = sourceEntries.filter((entry) => entry.config.enabled)

  return {
    enabledSourceEntries,
    enabledSources: enabledSourceEntries.map((entry) => entry.config),
    registry,
    sourceEntries,
    sourceEntryById,
    sources,
  }
}

export function getFeedHubSourceEntries(registry: EffectiveSourceRegistry): FeedHubSourceCatalogEntry[] {
  return registry.records.flatMap((record) => {
    const config = toFeedHubSourceConfig(record)

    return config ? [{ config, registry: record }] : []
  })
}

export function getFeedHubSources(registry: EffectiveSourceRegistry): FeedHubSourceConfig[] {
  return getFeedHubSourceEntries(registry).map((entry) => entry.config)
}

function toFeedHubSourceConfig(record: SourceRegistryRecord): FeedHubSourceConfig | null {
  if (!record.feedHub) {
    return null
  }

  const endpoint = resolveFeedHubEndpoint(record)

  if (!endpoint) {
    return null
  }

  return {
    adapter: record.adapter,
    endpoint,
    fetchMethod: record.fetchMethod,
    lookbackDays: record.feedHub.lookbackDays,
    sourceId: record.sourceId,
    rsshubRoute: record.rsshubRoute ?? endpoint,
    section: record.feedHub.section,
    enabled: record.feedHub.enabled,
    updateFrequency: record.updateFrequency,
  }
}

function resolveFeedHubEndpoint(record: SourceRegistryRecord) {
  if (record.fetchMethod === 'rsshub') {
    return record.rsshubRoute
  }

  if (record.fetchMethod === 'official_rss') {
    return record.feedUrl
  }

  if (record.fetchMethod === 'official_api') {
    return record.apiEndpoint
  }

  return undefined
}
