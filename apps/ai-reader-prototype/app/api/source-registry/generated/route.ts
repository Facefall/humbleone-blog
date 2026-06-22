import {
  updateSourceFeedHubConfigOverride,
  type SourceFeedHubConfigPatch,
} from '../../../../services/sourceRegistryOverrides'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(request: Request) {
  try {
    const payload = await request.json()
    const result = await updateSourceFeedHubConfigOverride(parseSourceFeedHubConfigPatch(payload))

    return jsonResponse({
      sourceId: result.sourceId,
      feedHub: result.feedHub,
    })
  } catch (error) {
    return jsonResponse({
      message: error instanceof Error ? error.message : String(error),
    }, getErrorStatus(error))
  }
}

function parseSourceFeedHubConfigPatch(value: unknown): SourceFeedHubConfigPatch {
  if (!value || typeof value !== 'object') {
    throw new Error('Source config payload must be an object.')
  }

  const record = value as Record<string, unknown>
  const enabled = readOptionalBoolean(record.enabled, 'enabled')
  const lookbackDays = readOptionalPositiveInteger(record.lookbackDays, 'lookbackDays')

  if (typeof enabled === 'undefined' && typeof lookbackDays === 'undefined') {
    throw new Error('enabled or lookbackDays is required.')
  }

  return {
    sourceId: readString(record.sourceId, 'sourceId'),
    ...(typeof enabled === 'boolean' ? { enabled } : {}),
    ...(lookbackDays ? { lookbackDays } : {}),
  }
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }

  return value.trim()
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

function readOptionalPositiveInteger(value: unknown, field: string) {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (!Number.isInteger(value) || typeof value !== 'number' || value <= 0) {
    throw new Error(`${field} must be a positive integer when provided.`)
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
    error.message.includes('not found') ||
    error.message.includes('not connected')
  ) {
    return 400
  }

  return 500
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
