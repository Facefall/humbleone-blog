import { createArticleSourceHash } from '../articles/articleSourceHash'
import {
  findArticleAiOutput,
  upsertArticleAiOutput,
  type StoredArticleAiOutput,
} from './articleAiOutputRepository'

export type ArticleBriefInput = {
  articleId: string
  body: string[]
  sourceLanguage: 'zh-CN' | 'en'
  targetLanguage?: 'zh-CN' | 'en'
  title: string
  url: string
}

export type ArticleBriefResult = {
  articleId: string
  body: string
  cached: boolean
  keyPoints: string[]
  language: 'zh-CN' | 'en'
  model: string
  provider: 'deepseek'
  generatedAt: string
}

type DeepSeekBriefPayload = {
  body: string
  keyPoints: string[]
}

const provider = 'deepseek' as const
const defaultModel = 'deepseek-v4-flash'
const defaultBaseUrl = 'https://api.deepseek.com'
const promptVersion = 'article-brief-v1'
const requestTimeoutMs = Number(process.env.DEEPSEEK_BRIEF_TIMEOUT_MS ?? process.env.DEEPSEEK_TRANSLATION_TIMEOUT_MS ?? 90000)
const maxArticleChars = Number(process.env.DEEPSEEK_BRIEF_MAX_CHARS ?? 45000)

export async function generateArticleBrief(input: ArticleBriefInput): Promise<ArticleBriefResult> {
  const normalizedInput = normalizeBriefInput(input)
  const model = process.env.DEEPSEEK_BRIEF_MODEL ?? process.env.DEEPSEEK_TRANSLATION_MODEL ?? defaultModel
  const inputHash = createArticleSourceHash(normalizedInput)
  const language = normalizedInput.targetLanguage ?? 'zh-CN'
  const cachedOutput = findArticleAiOutputSafely({
    inputHash,
    language,
    model,
    outputType: 'brief',
    promptVersion,
    provider,
    url: normalizedInput.url,
  })

  if (cachedOutput) {
    const payload = parseBriefOutput(cachedOutput.outputJson)

    if (payload) {
      return toBriefResult(cachedOutput, payload, true)
    }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured. Add it to apps/ai-reader-prototype/.env.local or the server environment.')
  }

  const brief = await requestDeepSeekBrief({
    apiKey,
    input: normalizedInput,
    model,
    targetLanguage: language,
  })
  const now = new Date().toISOString()
  const record: StoredArticleAiOutput = {
    articleId: normalizedInput.articleId,
    generatedAt: now,
    inputHash,
    language,
    model,
    outputJson: brief,
    outputType: 'brief',
    promptVersion,
    provider,
    status: 'ok',
    updatedAt: now,
    url: normalizedInput.url,
  }

  upsertArticleAiOutputSafely(record)

  return toBriefResult(record, brief, false)
}

function normalizeBriefInput(input: ArticleBriefInput): Required<ArticleBriefInput> {
  const title = input.title.trim()
  const body = truncateArticleBody(
    input.body.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim()).filter(Boolean),
    maxArticleChars,
  )

  if (!input.articleId.trim()) {
    throw new Error('articleId is required.')
  }

  if (!title) {
    throw new Error('title is required.')
  }

  if (!input.url.trim()) {
    throw new Error('url is required.')
  }

  if (!body.length) {
    throw new Error('article body is required.')
  }

  return {
    articleId: input.articleId.trim(),
    body,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage ?? 'zh-CN',
    title,
    url: input.url.trim(),
  }
}

function truncateArticleBody(body: string[], maxChars: number) {
  const nextBody: string[] = []
  let total = 0

  for (const paragraph of body) {
    if (total >= maxChars) {
      break
    }

    const remaining = maxChars - total
    const nextParagraph = paragraph.length > remaining ? paragraph.slice(0, remaining).trim() : paragraph

    if (nextParagraph) {
      nextBody.push(nextParagraph)
      total += nextParagraph.length
    }
  }

  return nextBody
}

async function requestDeepSeekBrief({
  apiKey,
  input,
  model,
  targetLanguage,
}: {
  apiKey: string
  input: Required<ArticleBriefInput>
  model: string
  targetLanguage: 'zh-CN' | 'en'
}): Promise<DeepSeekBriefPayload> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    const response = await fetch(`${process.env.DEEPSEEK_BASE_URL ?? defaultBaseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          {
            content: buildBriefSystemPrompt(targetLanguage),
            role: 'system',
          },
          {
            content: JSON.stringify({
              body: input.body,
              sourceLanguage: input.sourceLanguage,
              targetLanguage,
              title: input.title,
              url: input.url,
            }),
            role: 'user',
          },
        ],
        model,
        response_format: {
          type: 'json_object',
        },
        temperature: 0.2,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: controller.signal,
    })
    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message?: string }
    }

    if (!response.ok) {
      throw new Error(data.error?.message ?? `DeepSeek brief failed with HTTP ${response.status}.`)
    }

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('DeepSeek returned an empty brief.')
    }

    return parseBriefPayload(content)
  } finally {
    clearTimeout(timeout)
  }
}

function buildBriefSystemPrompt(targetLanguage: 'zh-CN' | 'en') {
  const target = targetLanguage === 'zh-CN' ? 'Simplified Chinese' : 'English'

  return [
    `You write concise technical reading briefs in ${target}.`,
    'Do not translate the full article. Do not add facts. Preserve product names, model names, commands, APIs, and code identifiers.',
    'Return only strict JSON with this shape: {"body":"3-5 sentence brief","keyPoints":["point 1","point 2","point 3"]}.',
    targetLanguage === 'zh-CN'
      ? 'The brief must be natural Simplified Chinese, suitable for a Chinese AI engineering reader.'
      : 'The brief must be direct, concrete, and suitable for an AI engineering reader.',
  ].join('\n')
}

function parseBriefPayload(content: string): DeepSeekBriefPayload {
  const parsed = JSON.parse(extractJsonObject(content)) as Partial<DeepSeekBriefPayload>
  const body = typeof parsed.body === 'string' ? parsed.body.replace(/\s+/g, ' ').trim() : ''
  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints
        .map((point) => typeof point === 'string' ? point.replace(/\s+/g, ' ').trim() : '')
        .filter(Boolean)
        .slice(0, 5)
    : []

  if (!body || !keyPoints.length) {
    throw new Error('DeepSeek brief JSON did not include body and keyPoints.')
  }

  return { body, keyPoints }
}

function extractJsonObject(content: string) {
  const trimmed = content.trim()

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed
  }

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1)
  }

  return trimmed
}

function findArticleAiOutputSafely(
  lookup: Parameters<typeof findArticleAiOutput>[0],
) {
  try {
    return findArticleAiOutput(lookup)
  } catch (error) {
    console.warn('[ai] failed to read article brief from database', error)

    return null
  }
}

function upsertArticleAiOutputSafely(record: StoredArticleAiOutput) {
  try {
    upsertArticleAiOutput(record)
  } catch (error) {
    console.warn('[ai] failed to persist article brief', error)
  }
}

function parseBriefOutput(value: unknown): DeepSeekBriefPayload | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Partial<DeepSeekBriefPayload>

  if (typeof record.body !== 'string' || !Array.isArray(record.keyPoints)) {
    return null
  }

  const keyPoints = record.keyPoints.filter((point): point is string => typeof point === 'string' && Boolean(point.trim()))

  return record.body.trim() && keyPoints.length
    ? { body: record.body.trim(), keyPoints }
    : null
}

function toBriefResult(
  record: StoredArticleAiOutput,
  payload: DeepSeekBriefPayload,
  cached: boolean,
): ArticleBriefResult {
  return {
    articleId: record.articleId,
    body: payload.body,
    cached,
    keyPoints: payload.keyPoints,
    language: record.language,
    model: record.model,
    provider: record.provider,
    generatedAt: record.generatedAt,
  }
}
