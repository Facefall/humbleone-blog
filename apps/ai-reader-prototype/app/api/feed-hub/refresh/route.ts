import { after } from 'next/server'
import { getFeedHubBrief, refreshFeedHubBrief } from '../../../../services/feedHub'
import { isFeedHubDebugEnabled, feedHubWarn } from '../../../../services/feedHub/feedHubLogger'
import {
  createEmptyPageInfo,
  createFeedHubFallbackResponse,
  jsonResponse,
  readFeedHubProjectionQuery,
} from '../routeSupport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const syncOptions = { force: true, hydrateArticles: false } as const
    const projectionOptions = readFeedHubProjectionQuery(request)

    if (isFeedHubDebugEnabled()) {
      await refreshFeedHubBrief(syncOptions, projectionOptions)
    } else {
      after(async () => {
        try {
          await refreshFeedHubBrief(syncOptions, projectionOptions)
        } catch (error) {
          feedHubWarn('background refresh failed', {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      })
    }

    const response = await getFeedHubBrief(projectionOptions)

    return jsonResponse(response)
  } catch (error) {
    return jsonResponse(createFeedHubFallbackResponse({
      endpoint: 'feed-hub-refresh',
      error,
      pageInfo: createEmptyPageInfo(50),
      sourceId: 'feed-hub',
    }))
  }
}
