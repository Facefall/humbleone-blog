import { getReaderDatabase } from '../db/readerDatabase'

export type ArticleAiOutputType = 'brief'

export type StoredArticleAiOutput = {
  articleId: string
  errorMessage?: string
  generatedAt: string
  inputHash: string
  language: 'zh-CN' | 'en'
  model: string
  outputJson: unknown
  outputType: ArticleAiOutputType
  promptVersion: string
  provider: 'deepseek'
  status: 'ok' | 'failed'
  updatedAt: string
  url: string
}

type ArticleAiOutputLookup = {
  inputHash: string
  language: StoredArticleAiOutput['language']
  model: string
  outputType: ArticleAiOutputType
  promptVersion: string
  provider: StoredArticleAiOutput['provider']
  url: string
}

type ArticleAiOutputRow = {
  article_id: string
  error_message: string | null
  generated_at: string
  input_hash: string
  language: StoredArticleAiOutput['language']
  model: string
  output_json: string
  output_type: ArticleAiOutputType
  prompt_version: string
  provider: StoredArticleAiOutput['provider']
  status: StoredArticleAiOutput['status']
  updated_at: string
  url: string
}

export function findArticleAiOutput(lookup: ArticleAiOutputLookup) {
  const row = getReaderDatabase()
    .prepare(`
      SELECT *
      FROM article_ai_outputs
      WHERE url = ?
        AND output_type = ?
        AND language = ?
        AND provider = ?
        AND model = ?
        AND prompt_version = ?
        AND input_hash = ?
        AND status = 'ok'
      LIMIT 1
    `)
    .get(
      lookup.url,
      lookup.outputType,
      lookup.language,
      lookup.provider,
      lookup.model,
      lookup.promptVersion,
      lookup.inputHash,
    ) as ArticleAiOutputRow | undefined

  return row ? parseArticleAiOutputRow(row) : null
}

export function upsertArticleAiOutput(record: StoredArticleAiOutput) {
  getReaderDatabase()
    .prepare(`
      INSERT INTO article_ai_outputs (
        article_id,
        url,
        output_type,
        language,
        provider,
        model,
        prompt_version,
        input_hash,
        output_json,
        status,
        error_message,
        generated_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(url, output_type, language, provider, model, prompt_version, input_hash)
      DO UPDATE SET
        article_id = excluded.article_id,
        output_json = excluded.output_json,
        status = excluded.status,
        error_message = excluded.error_message,
        generated_at = excluded.generated_at,
        updated_at = excluded.updated_at
    `)
    .run(
      record.articleId,
      record.url,
      record.outputType,
      record.language,
      record.provider,
      record.model,
      record.promptVersion,
      record.inputHash,
      JSON.stringify(record.outputJson),
      record.status,
      record.errorMessage ?? null,
      record.generatedAt,
      record.updatedAt,
    )
}

function parseArticleAiOutputRow(row: ArticleAiOutputRow): StoredArticleAiOutput {
  return {
    articleId: row.article_id,
    errorMessage: row.error_message ?? undefined,
    generatedAt: row.generated_at,
    inputHash: row.input_hash,
    language: row.language,
    model: row.model,
    outputJson: parseJson(row.output_json),
    outputType: row.output_type,
    promptVersion: row.prompt_version,
    provider: row.provider,
    status: row.status,
    updatedAt: row.updated_at,
    url: row.url,
  }
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
