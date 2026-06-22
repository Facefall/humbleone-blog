import { getFeedHubBrief } from '../../../services/feedHub'
import {
  createFeedHubFallbackResponse,
  createEmptyPageInfo,
  jsonResponse,
  readFeedHubProjectionQuery,
} from './routeSupport'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const response = await getFeedHubBrief(readFeedHubProjectionQuery(request))

    return jsonResponse(response)
  } catch (error) {
    return jsonResponse(createFeedHubFallbackResponse({
      endpoint: 'feed-hub',
      error,
      pageInfo: createEmptyPageInfo(50),
      sourceId: 'feed-hub',
    }))
  }
}
