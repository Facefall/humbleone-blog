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
import { feedHubDebug } from './feedHubLogger'
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

  feedHubDebug('starting feed hub sync', {
    force,
    hydrateArticles,
    enabledSourceCount: feedHubRsshubSources.filter((source) => source.enabled).length,
    dueSourceCount: dueSources.length,
    dueSourceIds: dueSources.map((source) => source.sourceId),
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
    feedHubDebug(`fetching RSSHub route for ${config.sourceId}`, {
      sourceId: config.sourceId,
      rsshubRoute: config.rsshubRoute,
      section: config.section,
      maxItems: config.maxItems,
    })

    const data = await requestRSSHubRoute(config.rsshubRoute)

    feedHubDebug(`RSSHub response for ${config.sourceId}`, {
      sourceId: config.sourceId,
      rsshubRoute: config.rsshubRoute,
      feedTitle: data.title,
      feedLink: data.link,
      itemCount: data.item?.length ?? 0,
      items: data.item,
    })

    const items = normalizeRSSHubItems({
      config,
      data,
      fetchedAt: new Date().toISOString(),
      registry,
    })

    feedHubDebug(`normalized Feed Hub items for ${config.sourceId}`, {
      sourceId: config.sourceId,
      itemCount: items.length,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        publishedAt: item.publishedAt,
        sourceName: item.sourceName,
      })),
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
    feedHubDebug(`RSSHub fetch failed for ${config.sourceId}`, {
      sourceId: config.sourceId,
      rsshubRoute: config.rsshubRoute,
      error: error instanceof Error ? error.message : String(error),
    })

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
