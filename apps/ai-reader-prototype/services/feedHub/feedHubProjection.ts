import type { DailySection, DailySectionKind, SourceDeskData, SourceHealth } from '../../lib/prototype-data'
import { dailyBrief } from '../../lib/prototype-data'
import {
  getSourceRegistryRecord,
  loadEffectiveSourceRegistry,
  type EffectiveSourceRegistry,
} from '../sourceRegistry'
import {
  readSourceResultsFromState,
  readStoredFeedSources,
} from './feedHubRepository'
import { getFeedHubRsshubSources } from './rsshubSources'
import type { FeedHubResponse, FeedHubSourceConfig, FeedHubSourceResult, NormalizedFeedSource } from './types'

const sectionMeta: Record<DailySectionKind, Pick<DailySection, 'title' | 'description'>> = {
  hard_news: {
    title: 'Hard News',
    description: '直接改变工具、平台或工程工作流的更新。',
  },
  cases: {
    title: 'Cases',
    description: '来自 builder、工具产品和社区的真实使用案例。',
  },
  interesting: {
    title: 'Interesting',
    description: '值得后续研究的观察、仓库和弱信号。',
  },
}

export async function readFeedHubProjection({
  fetchedAt = new Date().toISOString(),
}: {
  fetchedAt?: string
} = {}): Promise<FeedHubResponse> {
  const sourceRegistry = await loadEffectiveSourceRegistry()
  const feedHubRsshubSources = getFeedHubRsshubSources(sourceRegistry)
  const sourceEntries = getFeedHubSourceEntries(feedHubRsshubSources, sourceRegistry)
  const normalizedSources = readStoredFeedSources(sourceEntries)
  const sourceResults = readSourceResultsFromState(feedHubRsshubSources)

  return buildFeedHubResponse({
    fetchedAt,
    feedHubRsshubSources,
    normalizedSources,
    sourceRegistry,
    sourceResults,
  })
}

function buildFeedHubResponse({
  fetchedAt,
  feedHubRsshubSources,
  normalizedSources,
  sourceRegistry,
  sourceResults,
}: {
  fetchedAt: string
  feedHubRsshubSources: FeedHubSourceConfig[]
  normalizedSources: NormalizedFeedSource[]
  sourceRegistry: EffectiveSourceRegistry
  sourceResults: FeedHubSourceResult[]
}): FeedHubResponse {
  const sections = buildSections(normalizedSources)
  const items = sections.flatMap((section) => section.items)
  const sourceDesk = buildSourceDesk(
    normalizedSources,
    sourceResults,
    fetchedAt,
    sourceRegistry,
    feedHubRsshubSources,
  )

  if (!items.length) {
    return {
      mode: 'fallback',
      fetchedAt,
      brief: {
        ...dailyBrief,
        sourceDesk,
      },
      sourceResults,
    }
  }

  const selectedItemId = items[0].id

  return {
    mode: 'rsshub',
    fetchedAt,
    brief: {
      id: `rsshub-${formatLocalDate(new Date(fetchedAt))}`,
      date: formatLocalDate(new Date(fetchedAt)),
      title: 'Today',
      judgment: `RSSHub 已同步 ${items.length} 条 AI / coding-agent 高信号更新，优先阅读官方工程更新和工具 changelog。`,
      itemCount: items.length,
      selectedItemId,
      sourceDesk,
      sections,
      reader: {
        skin: 'postmodern_newspaper',
        masthead: 'AI BUILDER DAILY',
        editionLine: `RSSHub Edition / ${formatDisplayDate(new Date(fetchedAt))} / Personal Desk`,
        topicLine: 'Coding Agents, Builder Workflows, Runtime Control',
        selectedItemId,
      },
    },
    sourceResults,
  }
}

function getFeedHubSourceEntries(
  feedHubRsshubSources: FeedHubSourceConfig[],
  sourceRegistry: EffectiveSourceRegistry,
) {
  return feedHubRsshubSources.flatMap((config) => {
    const registry = getSourceRegistryRecord(sourceRegistry, config.sourceId)

    return registry ? [{ config, registry }] : []
  })
}

function buildSections(sources: NormalizedFeedSource[]): DailySection[] {
  return (Object.keys(sectionMeta) as DailySectionKind[]).map((sectionId) => {
    const items = sources
      .filter((source) => source.config.section === sectionId)
      .flatMap((source) => source.items)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return {
      id: sectionId,
      ...sectionMeta[sectionId],
      items,
    }
  })
}

function buildSourceDesk(
  sources: NormalizedFeedSource[],
  sourceResults: FeedHubSourceResult[],
  fetchedAt: string,
  sourceRegistry: EffectiveSourceRegistry,
  feedHubRsshubSources: FeedHubSourceConfig[],
): SourceDeskData {
  const itemsBySourceId = new Map(sources.map((source) => [source.config.sourceId, source.items]))
  const resultBySourceId = new Map(sourceResults.map((result) => [result.sourceId, result]))
  const feedHubSourceIds = new Set(feedHubRsshubSources.map((source) => source.sourceId))
  const sourceSlips = sourceRegistry.records
    .map((registry) => {
      const items = itemsBySourceId.get(registry.sourceId) ?? []
      const result = resultBySourceId.get(registry.sourceId)
      const health = getSourceHealth(result)

      return {
        id: sourceIdToSlipId(registry.sourceId),
        kind: 'source_slip' as const,
        label: registry.displayName,
        count: items.length || undefined,
        sourceFamily: registry.sourceFamily,
        evidenceLevel: registry.evidenceLevel,
        health,
        state: resolveSourceSlipState(health, items.length, feedHubSourceIds.has(registry.sourceId)),
        description: registry.whyFollow,
        contentType: registry.contentType,
        topicTags: registry.topicTags,
        adapter: registry.adapter,
      }
    })

  const itemCount = sources.reduce((total, source) => total + source.items.length, 0)
  const failedCount = sourceResults.filter((result) => result.status === 'failed').length

  return {
    ...dailyBrief.sourceDesk,
    issueLabel: 'RSSHub v0.1',
    deskDate: formatDisplayDate(new Date(fetchedAt)),
    navigation: [
      {
        id: 'nav-today',
        kind: 'navigation',
        label: 'Today',
        count: itemCount,
        health: itemCount ? 'fresh' : 'quiet',
        state: 'selected',
        description: '今日 RSSHub 高信号信息饮食。',
      },
      ...dailyBrief.sourceDesk.navigation.filter((item) => item.id !== 'nav-today'),
    ],
    sourceGroups: sourceRegistry.groups.map((group) => ({
      id: group.id,
      kind: 'source_group' as const,
      label: group.name,
      count: group.sourceIds.length,
      health: failedCount ? 'quiet' : 'fresh',
      state: group.sourceIds.some((sourceId) => resultBySourceId.get(sourceId)?.status === 'ok')
        ? 'new' as const
        : 'default' as const,
    })),
    sourceCollections: sourceRegistry.groups,
    sourceSlips,
  }
}

function resolveSourceSlipState(health: SourceHealth, itemCount: number, isFeedHubSource: boolean) {
  if (health === 'failed') {
    return 'failed' as const
  }

  if (itemCount) {
    return 'new' as const
  }

  return isFeedHubSource ? 'stale' as const : 'default' as const
}

function getSourceHealth(result: FeedHubSourceResult | undefined): SourceHealth {
  if (!result) {
    return 'quiet'
  }

  if (result.status === 'failed') {
    return 'failed'
  }

  if (result.status === 'empty') {
    return 'quiet'
  }

  return 'fresh'
}

function sourceIdToSlipId(sourceId: string) {
  return `slip-${sourceId.replace(/^source-/, '')}`
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(date: Date) {
  return formatLocalDate(date).replaceAll('-', '.')
}
