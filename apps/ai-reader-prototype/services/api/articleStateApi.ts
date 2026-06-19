import type { StandardArticle } from '../../types/reader'
import { request, type ApiRequestOptions } from './request'

export type ArticleStateRecord = {
  articleId: string
  favorited: boolean
  saved: boolean
  sourceId?: string
  title: string
  updatedAt: string
  url: string
}

export type ArticleStateResponse = {
  favoritedArticleIds: string[]
  savedArticleIds: string[]
  states: ArticleStateRecord[]
}

export type UpdateArticleStateInput = {
  article: Pick<StandardArticle, 'id' | 'sourceId' | 'title' | 'url'>
  favorited?: boolean
  saved?: boolean
}

export function getArticleState(articleIds: string[], options?: ApiRequestOptions) {
  return request<ArticleStateResponse>({
    method: 'GET',
    params: {
      articleIds: articleIds.join(','),
    },
    signal: options?.signal,
    url: '/api/article-state',
  })
}

export function updateArticleState(input: UpdateArticleStateInput, options?: ApiRequestOptions) {
  return request<ArticleStateResponse & { state: ArticleStateRecord }>({
    data: {
      articleId: input.article.id,
      favorited: input.favorited,
      saved: input.saved,
      sourceId: input.article.sourceId,
      title: input.article.title,
      url: input.article.url,
    },
    method: 'PATCH',
    signal: options?.signal,
    url: '/api/article-state',
  })
}
