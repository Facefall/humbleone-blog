import {
  getSourceRegistryRecord,
  loadEffectiveSourceRegistry,
  type EffectiveSourceRegistry,
} from '../sourceRegistry'
import { hydrateFeedItemsWithArticleContent } from './articleContent'
import {
  getDueFeedHubSources,
  upsertFeedHubSourceResult,
} from './feedHubRepository'
import { normalizeRSSHubItems } from './normalize'
import { requestRSSHubRoute } from './rsshubClient'
import { getFeedHubRsshubSources } from './rsshubSources'
import type { FeedHubSourceConfig, FeedHubSourceResult, NormalizedFeedSource } from './types'

export type FeedHubSyncOptions = {
  force?: boolean
  hydrateArticles?: boolean
}

type FeedHubSourceSyncOutput = {
  config: FeedHubSourceConfig
  result: FeedHubSourceResult
  source?: NormalizedFeedSource
}

export async function syncFeedHubSources({
  force = false,
  hydrateArticles = false,
}: FeedHubSyncOptions = {}) {
  const fetchedAt = new Date().toISOString()
  const sourceRegistry = await loadEffectiveSourceRegistry()
  const feedHubRsshubSources = getFeedHubRsshubSources(sourceRegistry)
  const dueSources = getDueFeedHubSources({
    force,
    now: new Date(fetchedAt),
    sources: feedHubRsshubSources,
  })
  const sourceOutputs = await Promise.all(
    dueSources.map((source) => fetchRSSHubSource(source, sourceRegistry)),
  )
  const refreshSources = sourceOutputs.flatMap((output) => output.source ?? [])
  const persistedRefreshSources = hydrateArticles
    ? await hydrateNormalizedFeedSources(refreshSources)
    : refreshSources
  const refreshSourceById = new Map(
    persistedRefreshSources.map((source) => [source.config.sourceId, source]),
  )

  sourceOutputs.forEach((output) => {
    upsertFeedHubSourceResult({
      config: output.config,
      fetchedAt,
      result: output.result,
      source: refreshSourceById.get(output.config.sourceId),
    })
  })

  return {
    dueSourceCount: dueSources.length,
    fetchedAt,
    sourceResults: sourceOutputs.map((output) => output.result),
  }
}

async function fetchRSSHubSource(
  config: FeedHubSourceConfig,
  sourceRegistry: EffectiveSourceRegistry,
): Promise<FeedHubSourceSyncOutput> {
  const registry = getSourceRegistryRecord(sourceRegistry, config.sourceId)

  if (!registry) {
    return {
      config,
      result: {
        sourceId: config.sourceId,
        rsshubRoute: config.rsshubRoute,
        itemCount: 0,
        status: 'failed',
        error: 'Source registry record is missing.',
      },
    }
  }

  try {
    const data = await requestRSSHubRoute(config.rsshubRoute)
    const items = normalizeRSSHubItems({
      config,
      data,
      fetchedAt: new Date().toISOString(),
      registry,
    })

    return {
      config,
      result: {
        sourceId: config.sourceId,
        rsshubRoute: config.rsshubRoute,
        itemCount: items.length,
        status: items.length ? 'ok' : 'empty',
      },
      source: {
        config,
        registry,
        items,
      },
    }
  } catch (error) {
    return {
      config,
      result: {
        sourceId: config.sourceId,
        rsshubRoute: config.rsshubRoute,
        itemCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

async function hydrateNormalizedFeedSources(sources: NormalizedFeedSource[]) {
  const items = sources.flatMap((source) => source.items)
  const hydratedItems = await hydrateFeedItemsWithArticleContent(items)
  const hydratedItemById = new Map(hydratedItems.map((item) => [item.id, item]))

  return sources.map((source) => ({
    ...source,
    items: source.items.map((item) => hydratedItemById.get(item.id) ?? item),
  }))
}
