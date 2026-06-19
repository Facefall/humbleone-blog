import { getReaderDatabase } from '../db/readerDatabase'

export type ArticleReaderState = {
  articleId: string
  favorited: boolean
  saved: boolean
  sourceId?: string
  title: string
  updatedAt: string
  url: string
}

export type ArticleReaderStatePatch = {
  articleId: string
  favorited?: boolean
  saved?: boolean
  sourceId?: string
  title: string
  url: string
}

type ArticleReaderStateRow = {
  article_id: string
  favorited: 0 | 1
  saved: 0 | 1
  source_id: string | null
  title: string
  updated_at: string
  url: string
}

export function findArticleReaderStates(articleIds: string[]) {
  const uniqueArticleIds = Array.from(new Set(articleIds.map((articleId) => articleId.trim()).filter(Boolean)))

  if (!uniqueArticleIds.length) {
    return []
  }

  const placeholders = uniqueArticleIds.map(() => '?').join(', ')
  const rows = getReaderDatabase()
    .prepare(`
      SELECT article_id, source_id, url, title, saved, favorited, updated_at
      FROM reader_article_states
      WHERE article_id IN (${placeholders})
    `)
    .all(...uniqueArticleIds) as ArticleReaderStateRow[]

  return rows.map(parseArticleReaderStateRow)
}

export function updateArticleReaderState(patch: ArticleReaderStatePatch) {
  const articleId = patch.articleId.trim()
  const url = patch.url.trim()
  const title = patch.title.trim()
  const sourceId = patch.sourceId?.trim() || null

  if (!articleId) {
    throw new Error('articleId is required.')
  }

  if (!url) {
    throw new Error('url is required.')
  }

  if (!title) {
    throw new Error('title is required.')
  }

  if (typeof patch.saved === 'undefined' && typeof patch.favorited === 'undefined') {
    throw new Error('saved or favorited is required.')
  }

  const db = getReaderDatabase()
  const current = db
    .prepare(`
      SELECT article_id, source_id, url, title, saved, favorited, updated_at
      FROM reader_article_states
      WHERE article_id = ?
    `)
    .get(articleId) as ArticleReaderStateRow | undefined
  const saved = typeof patch.saved === 'boolean' ? patch.saved : current?.saved === 1
  const favorited = typeof patch.favorited === 'boolean' ? patch.favorited : current?.favorited === 1
  const updatedAt = new Date().toISOString()

  if (!saved && !favorited) {
    db.prepare('DELETE FROM reader_article_states WHERE article_id = ?').run(articleId)

    return {
      articleId,
      favorited: false,
      saved: false,
      sourceId: sourceId ?? undefined,
      title,
      updatedAt,
      url,
    } satisfies ArticleReaderState
  }

  db.prepare(`
    INSERT INTO reader_article_states (
      article_id,
      source_id,
      url,
      title,
      saved,
      favorited,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(article_id) DO UPDATE SET
      source_id = excluded.source_id,
      url = excluded.url,
      title = excluded.title,
      saved = excluded.saved,
      favorited = excluded.favorited,
      updated_at = excluded.updated_at
  `).run(
    articleId,
    sourceId,
    url,
    title,
    saved ? 1 : 0,
    favorited ? 1 : 0,
    updatedAt,
  )

  return {
    articleId,
    favorited,
    saved,
    sourceId: sourceId ?? undefined,
    title,
    updatedAt,
    url,
  } satisfies ArticleReaderState
}

function parseArticleReaderStateRow(row: ArticleReaderStateRow): ArticleReaderState {
  return {
    articleId: row.article_id,
    favorited: row.favorited === 1,
    saved: row.saved === 1,
    sourceId: row.source_id ?? undefined,
    title: row.title,
    updatedAt: row.updated_at,
    url: row.url,
  }
}
