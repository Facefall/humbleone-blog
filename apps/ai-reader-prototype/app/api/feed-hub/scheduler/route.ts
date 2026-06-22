import { refreshFeedHubBrief } from '../../../../services/feedHub'
import {
  createEmptyPageInfo,
  createFeedHubFallbackResponse,
  jsonResponse,
} from '../routeSupport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  return handleSchedulerRequest(request)
}

export async function POST(request: Request) {
  return handleSchedulerRequest(request)
}

async function handleSchedulerRequest(request: Request) {
  if (!isSchedulerAuthorized(request)) {
    return jsonResponse({ error: 'Unauthorized scheduler request.' }, { status: 401 })
  }

  try {
    const response = await refreshFeedHubBrief({ force: false, hydrateArticles: true })

    return jsonResponse(response)
  } catch (error) {
    return jsonResponse(createFeedHubFallbackResponse({
      endpoint: 'feed-hub-scheduler',
      error,
      pageInfo: createEmptyPageInfo(0),
      sourceId: 'feed-hub-scheduler',
    }))
  }
}

function isSchedulerAuthorized(request: Request) {
  const schedulerToken = process.env.FEED_HUB_SCHEDULER_TOKEN?.trim()
    || process.env.CRON_SECRET?.trim()

  if (!schedulerToken) {
    return process.env.NODE_ENV !== 'production'
  }

  return readBearerToken(request) === schedulerToken
    || request.headers.get('x-scheduler-token') === schedulerToken
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim()
}
