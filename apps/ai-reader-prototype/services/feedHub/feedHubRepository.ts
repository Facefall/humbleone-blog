import { createHash } from 'node:crypto'
import type { FeedItem } from '../../lib/prototype-data'
import { getReaderDatabase } from '../db/readerDatabase'
import type { SourceRegistryRecord } from '../sourceRegistry'
import { applyCachedArticleContentToFeedItems } from './articleContent'
import type { FeedHubSourceConfig, FeedHubSourceResult, NormalizedFeedSource } from './types'

export type SourceFetchState = {
  enabled: boolean
  itemCount: number
  lastCheckedAt?: string
  lastError?: string
  lastFeedHash?: string
  lastItemPublishedAt?: string
  lastSuccessAt?: string
  nextCheckAt?: string
  rsshubRoute: string
  sourceId: string
  status: 'idle' | 'ok' | 'empty' | 'failed' | 'skipped'
  updateFrequency: string
  updatedAt: string
}

type SourceFetchStateRow = {
  enabled: 0 | 1
  item_count: number
  last_checked_at: string | null
  last_error: string | null
  last_feed_hash: string | null
  last_item_published_at: string | null
  last_success_at: string | null
  next_check_at: string | null
  rsshub_route: string
  source_id: string
  status: SourceFetchState['status']
  update_frequency: string
  updated_at: string
}

type FeedItemRow = {
  item_json: string
}

type UpsertFeedSourceInput = {
  config: FeedHubSourceConfig
  fetchedAt: string
  result: FeedHubSourceResult
  source?: NormalizedFeedSource
}

export function getSourceFetchStates(sourceIds: string[]) {
  if (!sourceIds.length) {
    return new Map<string, SourceFetchState>()
  }

  const placeholders = sourceIds.map(() => '?').join(', ')
  const rows = getReaderDatabase()
    .prepare(`
      SELECT *
      FROM source_fetch_states
      WHERE source_id IN (${placeholders})
    `)
    .all(...sourceIds) as SourceFetchStateRow[]

  return new Map(rows.map((row) => [row.source_id, parseSourceFetchStateRow(row)]))
}

export function getDueFeedHubSources({
  force,
  now,
  sources,
}: {
  force: boolean
  now: Date
  sources: FeedHubSourceConfig[]
}) {
  const states = getSourceFetchStates(sources.map((source) => source.sourceId))
  const nowMs = now.getTime()

  return sources.filter((source) => {
    if (!source.enabled) {
      return false
    }

    if (force) {
      return true
    }

    if (source.updateFrequency.toLowerCase().includes('disabled')) {
      return false
    }

    const state = states.get(source.sourceId)

    if (!state?.nextCheckAt) {
      return true
    }

    return new Date(state.nextCheckAt).getTime() <= nowMs
  })
}

export function readStoredFeedSources(
  sources: Array<{ config: FeedHubSourceConfig; registry: SourceRegistryRecord }>,
): NormalizedFeedSource[] {
  return sources.map(({ config, registry }) => {
    const rows = getReaderDatabase()
      .prepare(`
        SELECT item_json
        FROM feed_items
        WHERE source_id = ?
        ORDER BY published_at DESC
        LIMIT ?
      `)
      .all(config.sourceId, config.maxItems) as FeedItemRow[]

    return {
      config,
      registry,
      items: applyCachedArticleContentToFeedItems(
        rows.map((row) => parseFeedItem(row.item_json)).filter((item): item is FeedItem => Boolean(item)),
      ),
    }
  }).filter((source) => source.items.length)
}

export function readSourceResultsFromState(sources: FeedHubSourceConfig[]): FeedHubSourceResult[] {
  const states = getSourceFetchStates(sources.map((source) => source.sourceId))

  return sources.map((source) => {
    const state = states.get(source.sourceId)

    if (!state) {
      return {
        sourceId: source.sourceId,
        rsshubRoute: source.rsshubRoute,
        itemCount: 0,
        status: 'empty',
      }
    }

    return {
      sourceId: source.sourceId,
      rsshubRoute: source.rsshubRoute,
      itemCount: state.itemCount,
      status: state.status === 'failed' ? 'failed' : state.itemCount ? 'ok' : 'empty',
      error: state.lastError,
    }
  })
}

export function upsertFeedHubSourceResult({
  config,
  fetchedAt,
  result,
  source,
}: UpsertFeedSourceInput) {
  const db = getReaderDatabase()
  const now = new Date(fetchedAt)
  const items = source?.items ?? []
  const feedHash = createFeedHash(items)
  const lastItemPublishedAt = items
    .map((item) => item.publishedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  const nextCheckAt = new Date(now.getTime() + getUpdateFrequencyMs(config.updateFrequency)).toISOString()
  const write = db.transaction(() => {
    db.prepare(`
      INSERT INTO source_fetch_states (
        source_id,
        rsshub_route,
        enabled,
        update_frequency,
        status,
        item_count,
        last_checked_at,
        last_success_at,
        next_check_at,
        last_error,
        last_feed_hash,
        last_item_published_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id) DO UPDATE SET
        rsshub_route = excluded.rsshub_route,
        enabled = excluded.enabled,
        update_frequency = excluded.update_frequency,
        status = excluded.status,
        item_count = excluded.item_count,
        last_checked_at = excluded.last_checked_at,
        last_success_at = COALESCE(excluded.last_success_at, source_fetch_states.last_success_at),
        next_check_at = excluded.next_check_at,
        last_error = excluded.last_error,
        last_feed_hash = COALESCE(excluded.last_feed_hash, source_fetch_states.last_feed_hash),
        last_item_published_at = COALESCE(excluded.last_item_published_at, source_fetch_states.last_item_published_at),
        updated_at = excluded.updated_at
    `).run(
      result.sourceId,
      result.rsshubRoute,
      config.enabled ? 1 : 0,
      config.updateFrequency,
      result.status,
      result.itemCount,
      fetchedAt,
      result.status === 'ok' || result.status === 'empty' ? fetchedAt : null,
      nextCheckAt,
      result.error ?? null,
      feedHash || null,
      lastItemPublishedAt ?? null,
      fetchedAt,
    )

    const upsertItem = db.prepare(`
      INSERT INTO feed_items (
        id,
        source_id,
        url,
        title,
        published_at,
        fetched_at,
        content_hash,
        item_json,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, url) DO UPDATE SET
        id = excluded.id,
        source_id = excluded.source_id,
        url = excluded.url,
        title = excluded.title,
        published_at = excluded.published_at,
        fetched_at = excluded.fetched_at,
        content_hash = excluded.content_hash,
        item_json = excluded.item_json,
        updated_at = excluded.updated_at
    `)

    items.forEach((item) => {
      upsertItem.run(
        item.id,
        item.sourceId,
        item.url,
        item.title,
        item.publishedAt,
        item.fetchedAt,
        createFeedItemHash(item),
        JSON.stringify(item),
        fetchedAt,
      )
    })
  })

  write()
}

function parseSourceFetchStateRow(row: SourceFetchStateRow): SourceFetchState {
  return {
    enabled: row.enabled === 1,
    itemCount: row.item_count,
    lastCheckedAt: row.last_checked_at ?? undefined,
    lastError: row.last_error ?? undefined,
    lastFeedHash: row.last_feed_hash ?? undefined,
    lastItemPublishedAt: row.last_item_published_at ?? undefined,
    lastSuccessAt: row.last_success_at ?? undefined,
    nextCheckAt: row.next_check_at ?? undefined,
    rsshubRoute: row.rsshub_route,
    sourceId: row.source_id,
    status: row.status,
    updateFrequency: row.update_frequency,
    updatedAt: row.updated_at,
  }
}

function parseFeedItem(value: string) {
  try {
    const parsed = JSON.parse(value) as FeedItem

    return parsed?.id && parsed?.sourceId && parsed?.url ? parsed : null
  } catch {
    return null
  }
}

function getUpdateFrequencyMs(value: string) {
  const normalized = value.toLowerCase()
  const hourMs = 1000 * 60 * 60

  if (normalized.includes('twice')) {
    return hourMs * 12
  }

  if (normalized.includes('hour')) {
    return hourMs
  }

  if (normalized.includes('weekly')) {
    return hourMs * 24 * 7
  }

  return hourMs * 24
}

function createFeedHash(items: FeedItem[]) {
  if (!items.length) {
    return ''
  }

  return createHash('sha256')
    .update(items.map((item) => createFeedItemHash(item)).join('\n'))
    .digest('hex')
}

function createFeedItemHash(item: FeedItem) {
  return createHash('sha256')
    .update(item.url)
    .update('\n')
    .update(item.title)
    .update('\n')
    .update(item.publishedAt)
    .update('\n')
    .update(item.summary)
    .update('\n')
    .update(item.reader.body.join('\n\n'))
    .digest('hex')
}
