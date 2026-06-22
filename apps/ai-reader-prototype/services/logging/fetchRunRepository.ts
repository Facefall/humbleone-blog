import { randomUUID } from 'node:crypto'
import { getReaderDatabase } from '../db/readerDatabase'

export type FetchRunTriggerType = 'manual' | 'scheduled' | 'bootstrap' | 'debug'
export type FetchRunStatus = 'running' | 'success' | 'partial' | 'failed' | 'empty'

export type FetchRunRecord = {
  durationMs: number
  endpoint: string
  errorMessage?: string
  fetchMethod: string
  finishedAt: string
  id: string
  insertedCount: number
  normalizedItemCount: number
  rawItemCount: number
  sourceId: string
  startedAt: string
  status: FetchRunStatus
  triggerType: FetchRunTriggerType
}

type CreateFetchRunInput = {
  endpoint: string
  fetchMethod: string
  sourceId: string
  startedAt: string
  triggerType: FetchRunTriggerType
}

type CompleteFetchRunInput = {
  durationMs: number
  errorMessage?: string
  finishedAt: string
  id: string
  insertedCount: number
  normalizedItemCount: number
  rawItemCount: number
  status: FetchRunStatus
}

export function createFetchRun(input: CreateFetchRunInput) {
  const id = randomUUID()
  const db = getReaderDatabase()

  db.prepare(`
    INSERT INTO fetch_runs (
      id,
      source_id,
      endpoint,
      fetch_method,
      trigger_type,
      status,
      started_at,
      finished_at,
      duration_ms,
      raw_item_count,
      normalized_item_count,
      inserted_count,
      error_message
    )
    VALUES (?, ?, ?, ?, ?, 'running', ?, NULL, NULL, 0, 0, 0, NULL)
  `).run(
    id,
    input.sourceId,
    input.endpoint,
    input.fetchMethod,
    input.triggerType,
    input.startedAt,
  )

  return id
}

export function completeFetchRun(input: CompleteFetchRunInput) {
  getReaderDatabase().prepare(`
    UPDATE fetch_runs
    SET
      status = ?,
      finished_at = ?,
      duration_ms = ?,
      raw_item_count = ?,
      normalized_item_count = ?,
      inserted_count = ?,
      error_message = ?
    WHERE id = ?
  `).run(
    input.status,
    input.finishedAt,
    input.durationMs,
    input.rawItemCount,
    input.normalizedItemCount,
    input.insertedCount,
    input.errorMessage ?? null,
    input.id,
  )
}

export function listRecentFetchRuns(sourceId?: string, limit = 20): FetchRunRecord[] {
  const db = getReaderDatabase()
  const normalizedLimit = Math.max(1, Math.min(limit, 100))

  const rows = (sourceId
    ? db.prepare(`
      SELECT *
      FROM fetch_runs
      WHERE source_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `).all(sourceId, normalizedLimit)
    : db.prepare(`
      SELECT *
      FROM fetch_runs
      ORDER BY started_at DESC
      LIMIT ?
    `).all(normalizedLimit)) as FetchRunRow[]

  return rows.map(parseFetchRunRow)
}

type FetchRunRow = {
  duration_ms: number | null
  endpoint: string | null
  error_message: string | null
  fetch_method: string
  finished_at: string | null
  id: string
  inserted_count: number
  normalized_item_count: number
  raw_item_count: number
  source_id: string
  started_at: string
  status: FetchRunStatus
  trigger_type: FetchRunTriggerType
}

function parseFetchRunRow(row: FetchRunRow): FetchRunRecord {
  return {
    id: row.id,
    sourceId: row.source_id,
    endpoint: row.endpoint ?? '',
    fetchMethod: row.fetch_method,
    triggerType: row.trigger_type,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? row.started_at,
    durationMs: row.duration_ms ?? 0,
    rawItemCount: row.raw_item_count,
    normalizedItemCount: row.normalized_item_count,
    insertedCount: row.inserted_count,
    errorMessage: row.error_message ?? undefined,
  }
}

export function mapFeedHubResultStatus(
  status: 'ok' | 'empty' | 'failed' | 'skipped',
): FetchRunStatus {
  if (status === 'ok') {
    return 'success'
  }

  if (status === 'empty') {
    return 'empty'
  }

  if (status === 'failed') {
    return 'failed'
  }

  return 'partial'
}
