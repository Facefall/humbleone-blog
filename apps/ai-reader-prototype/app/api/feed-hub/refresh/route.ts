import { after } from 'next/server'
import { dailyBrief } from '../../../../lib/prototype-data'
import { getFeedHubBrief, refreshFeedHubBrief } from '../../../../services/feedHub'
import { isFeedHubDebugEnabled } from '../../../../services/feedHub/feedHubLogger'
import type { FeedHubResponse } from '../../../../services/feedHub/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const syncOptions = { force: true, hydrateArticles: false } as const

    if (isFeedHubDebugEnabled()) {
      await refreshFeedHubBrief(syncOptions)
    } else {
      after(async () => {
        try {
          await refreshFeedHubBrief(syncOptions)
        } catch (error) {
          console.warn('[feed-hub] background refresh failed', error)
        }
      })
    }

    const response = await getFeedHubBrief()

    return jsonResponse(response)
  } catch (error) {
    return jsonResponse({
      mode: 'fallback',
      fetchedAt: new Date().toISOString(),
      brief: dailyBrief,
      sourceResults: [
        {
          sourceId: 'feed-hub',
          rsshubRoute: 'rsshub-package',
          itemCount: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
      ],
    })
  }
}

function jsonResponse(value: FeedHubResponse) {
  return new Response(JSON.stringify(value), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
