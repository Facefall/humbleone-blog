import { request, type ApiRequestOptions } from './request'

export type SourceFeedHubConfigPatch = {
  sourceId: string
  enabled?: boolean
  lookbackDays?: number
}

export type SourceFeedHubConfigResponse = {
  sourceId: string
  feedHub: {
    enabled: boolean
    lookbackDays: number
    section: string
  }
}

export function updateSourceFeedHubConfig(
  patch: SourceFeedHubConfigPatch,
  options?: ApiRequestOptions,
) {
  return request<SourceFeedHubConfigResponse>({
    method: 'PATCH',
    url: '/api/source-registry/generated',
    data: patch,
    signal: options?.signal,
  })
}
