import type { ArticleTranslationLanguage } from './articleTranslation'
import { getReaderDatabase } from '../db/readerDatabase'

export type StoredArticleTranslation = {
  articleId: string
  body: string[]
  errorMessage?: string
  model: string
  promptVersion: string
  provider: 'deepseek'
  sourceHash: string
  status: 'ok' | 'failed'
  targetLanguage: ArticleTranslationLanguage
  title: string
  translatedAt: string
  updatedAt: string
  url: string
}

type TranslationLookup = {
  model: string
  promptVersion: string
  provider: StoredArticleTranslation['provider']
  sourceHash: string
  targetLanguage: ArticleTranslationLanguage
  url: string
}

type ArticleTranslationRow = {
  article_id: string
  error_message: string | null
  model: string
  prompt_version: string
  provider: StoredArticleTranslation['provider']
  source_hash: string
  status: StoredArticleTranslation['status']
  target_language: ArticleTranslationLanguage
  translated_at: string
  translated_body_json: string
  translated_title: string
  updated_at: string
  url: string
}

export function findArticleTranslation(lookup: TranslationLookup) {
  const row = getReaderDatabase()
    .prepare(`
      SELECT *
      FROM article_translations
      WHERE url = ?
        AND target_language = ?
        AND provider = ?
        AND model = ?
        AND prompt_version = ?
        AND source_hash = ?
        AND status = 'ok'
      LIMIT 1
    `)
    .get(
      lookup.url,
      lookup.targetLanguage,
      lookup.provider,
      lookup.model,
      lookup.promptVersion,
      lookup.sourceHash,
    ) as ArticleTranslationRow | undefined

  return row ? parseArticleTranslationRow(row) : null
}

export function upsertArticleTranslation(record: StoredArticleTranslation) {
  getReaderDatabase()
    .prepare(`
      INSERT INTO article_translations (
        article_id,
        url,
        target_language,
        provider,
        model,
        prompt_version,
        source_hash,
        translated_title,
        translated_body_json,
        status,
        error_message,
        translated_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(url, target_language, provider, model, prompt_version, source_hash)
      DO UPDATE SET
        article_id = excluded.article_id,
        translated_title = excluded.translated_title,
        translated_body_json = excluded.translated_body_json,
        status = excluded.status,
        error_message = excluded.error_message,
        translated_at = excluded.translated_at,
        updated_at = excluded.updated_at
    `)
    .run(
      record.articleId,
      record.url,
      record.targetLanguage,
      record.provider,
      record.model,
      record.promptVersion,
      record.sourceHash,
      record.title,
      JSON.stringify(record.body),
      record.status,
      record.errorMessage ?? null,
      record.translatedAt,
      record.updatedAt,
    )
}

function parseArticleTranslationRow(row: ArticleTranslationRow): StoredArticleTranslation {
  return {
    articleId: row.article_id,
    body: parseStringArray(row.translated_body_json),
    errorMessage: row.error_message ?? undefined,
    model: row.model,
    promptVersion: row.prompt_version,
    provider: row.provider,
    sourceHash: row.source_hash,
    status: row.status,
    targetLanguage: row.target_language,
    title: row.translated_title,
    translatedAt: row.translated_at,
    updatedAt: row.updated_at,
    url: row.url,
  }
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value)

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}
