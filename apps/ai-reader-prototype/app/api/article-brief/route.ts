import {
  generateArticleBrief,
  type ArticleBriefInput,
} from '../../../services/ai/articleBrief'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const input = parseArticleBriefInput(payload)
    const result = await generateArticleBrief(input)

    return jsonResponse(result)
  } catch (error) {
    return jsonResponse({
      message: error instanceof Error ? error.message : String(error),
    }, getErrorStatus(error))
  }
}

function parseArticleBriefInput(value: unknown): ArticleBriefInput {
  if (!value || typeof value !== 'object') {
    throw new Error('Article brief payload must be an object.')
  }

  const record = value as Partial<ArticleBriefInput>

  if (!Array.isArray(record.body)) {
    throw new Error('body must be an array of strings.')
  }

  return {
    articleId: readString(record.articleId, 'articleId'),
    body: record.body.map((paragraph) => {
      if (typeof paragraph !== 'string') {
        throw new Error('body must be an array of strings.')
      }

      return paragraph
    }),
    sourceLanguage: parseLanguage(record.sourceLanguage, 'sourceLanguage'),
    targetLanguage: record.targetLanguage ? parseLanguage(record.targetLanguage, 'targetLanguage') : 'zh-CN',
    title: readString(record.title, 'title'),
    url: readString(record.url, 'url'),
  }
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }

  return value.trim()
}

function parseLanguage(value: unknown, field: string) {
  if (value === 'zh-CN' || value === 'en') {
    return value
  }

  throw new Error(`${field} must be zh-CN or en.`)
}

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500
  }

  if (
    error.message.includes('required') ||
    error.message.includes('payload') ||
    error.message.includes('must be')
  ) {
    return 400
  }

  if (error.message.includes('DEEPSEEK_API_KEY')) {
    return 503
  }

  return 502
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    status,
  })
}
