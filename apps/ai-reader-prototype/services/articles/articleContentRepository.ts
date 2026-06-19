import { getReaderDatabase } from '../db/readerDatabase'

export type StoredArticleContent = {
  articleId: string
  body: string[]
  error?: string
  extractedAt: string
  source: 'rss' | 'web'
  sourceHash: string
  status: 'ok' | 'failed'
  textLength: number
  title: string
  updatedAt: string
  url: string
}

type ArticleContentRow = {
  article_id: string
  body_json: string
  error: string | null
  extracted_at: string
  source: StoredArticleContent['source']
  source_hash: string
  status: StoredArticleContent['status']
  text_length: number
  title: string
  updated_at: string
  url: string
}

export function findArticleContentByUrl(url: string) {
  const row = getReaderDatabase()
    .prepare('SELECT * FROM article_contents WHERE url = ? LIMIT 1')
    .get(url) as ArticleContentRow | undefined

  return row ? parseArticleContentRow(row) : null
}

export function upsertArticleContent(record: StoredArticleContent) {
  const db = getReaderDatabase()
  const writeArticleContent = db.transaction((nextRecord: StoredArticleContent) => {
    db
      .prepare(`
        INSERT INTO article_contents (
          article_id,
          url,
          title,
          body_json,
          source,
          status,
          error,
          text_length,
          source_hash,
          extracted_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
          article_id = excluded.article_id,
          title = excluded.title,
          body_json = excluded.body_json,
          source = excluded.source,
          status = excluded.status,
          error = excluded.error,
          text_length = excluded.text_length,
          source_hash = excluded.source_hash,
          extracted_at = excluded.extracted_at,
          updated_at = excluded.updated_at
      `)
      .run(
        nextRecord.articleId,
        nextRecord.url,
        nextRecord.title,
        JSON.stringify(nextRecord.body),
        nextRecord.source,
        nextRecord.status,
        nextRecord.error ?? null,
        nextRecord.textLength,
        nextRecord.sourceHash,
        nextRecord.extractedAt,
        nextRecord.updatedAt,
      )

    syncArticleSearchIndex(db, nextRecord)
  })

  writeArticleContent(record)
}

function parseArticleContentRow(row: ArticleContentRow): StoredArticleContent {
  return {
    articleId: row.article_id,
    body: parseStringArray(row.body_json),
    error: row.error ?? undefined,
    extractedAt: row.extracted_at,
    source: row.source,
    sourceHash: row.source_hash,
    status: row.status,
    textLength: row.text_length,
    title: row.title,
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

function syncArticleSearchIndex(db: ReturnType<typeof getReaderDatabase>, record: StoredArticleContent) {
  db.prepare('DELETE FROM article_search WHERE url = ?').run(record.url)

  if (record.status !== 'ok') {
    return
  }

  db
    .prepare(`
      INSERT INTO article_search (article_id, url, title, body)
      VALUES (?, ?, ?, ?)
    `)
    .run(
      record.articleId,
      record.url,
      record.title,
      record.body.join('\n\n'),
    )
}
