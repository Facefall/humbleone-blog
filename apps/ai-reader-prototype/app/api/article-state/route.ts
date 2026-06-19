import {
  findArticleReaderStates,
  updateArticleReaderState,
  type ArticleReaderStatePatch,
} from '../../../services/articles/articleReaderStateRepository'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const articleIds = parseArticleIds(new URL(request.url).searchParams)
    const states = findArticleReaderStates(articleIds)

    return jsonResponse(toArticleStateResponse(states))
  } catch (error) {
    return jsonResponse({
      message: error instanceof Error ? error.message : String(error),
    }, 400)
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json()
    const state = updateArticleReaderState(parseArticleReaderStatePatch(payload))

    return jsonResponse({
      state,
      ...toArticleStateResponse([state]),
    })
  } catch (error) {
    return jsonResponse({
      message: error instanceof Error ? error.message : String(error),
    }, getErrorStatus(error))
  }
}

function parseArticleIds(searchParams: URLSearchParams) {
  const values = [
    ...searchParams.getAll('articleId'),
    ...(searchParams.get('articleIds')?.split(',') ?? []),
  ]
    .map((value) => value.trim())
    .filter(Boolean)

  if (values.length > 500) {
    throw new Error('articleIds is too large.')
  }

  return values
}

function parseArticleReaderStatePatch(value: unknown): ArticleReaderStatePatch {
  if (!value || typeof value !== 'object') {
    throw new Error('Article state payload must be an object.')
  }

  const record = value as Record<string, unknown>
  const saved = readOptionalBoolean(record.saved, 'saved')
  const favorited = readOptionalBoolean(record.favorited, 'favorited')

  if (typeof saved === 'undefined' && typeof favorited === 'undefined') {
    throw new Error('saved or favorited is required.')
  }

  return {
    articleId: readString(record.articleId, 'articleId'),
    ...(typeof favorited === 'boolean' ? { favorited } : {}),
    ...(typeof saved === 'boolean' ? { saved } : {}),
    sourceId: readOptionalString(record.sourceId),
    title: readString(record.title, 'title'),
    url: readString(record.url, 'url'),
  }
}

function toArticleStateResponse(states: ReturnType<typeof findArticleReaderStates>) {
  return {
    favoritedArticleIds: states.filter((state) => state.favorited).map((state) => state.articleId),
    savedArticleIds: states.filter((state) => state.saved).map((state) => state.articleId),
    states,
  }
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }

  return value.trim()
}

function readOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readOptionalBoolean(value: unknown, field: string) {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${field} must be boolean when provided.`)
  }

  return value
}

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500
  }

  if (
    error.message.includes('required') ||
    error.message.includes('payload') ||
    error.message.includes('must be') ||
    error.message.includes('too large')
  ) {
    return 400
  }

  return 500
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
