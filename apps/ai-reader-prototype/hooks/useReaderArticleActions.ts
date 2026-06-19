'use client'

import { useMemo } from 'react'
import { copyTextToClipboard } from '../services/browserClipboard'
import type { StandardActionNotice, StandardArticle } from '../types/reader'
import { useTimedState } from './useTimedState'

type ArticleLibraryActions = {
  toggleFavoriteArticle: (article: StandardArticle) => boolean
  toggleSaveArticle: (article: StandardArticle) => boolean
}

type ReaderArticleActionLabels = {
  analysisCopied: string
  favorited: string
  linkCopied: string
  removed: string
  saved: string
  unfavorited: string
}

type UseReaderArticleActionsOptions = {
  articles: StandardArticle[]
  labels: ReaderArticleActionLabels
  libraryActions: ArticleLibraryActions
}

export function useReaderArticleActions({
  articles,
  labels,
  libraryActions,
}: UseReaderArticleActionsOptions) {
  const actionNoticeState = useTimedState<StandardActionNotice>(null)
  const copiedAnalysisState = useTimedState<string | null>(null)
  const articleById = useMemo(
    () => new Map(articles.map((article) => [article.id, article])),
    [articles],
  )

  function toggleSaveArticle(articleId: string) {
    const article = articleById.get(articleId)

    if (!article) {
      return
    }

    const willSave = libraryActions.toggleSaveArticle(article)

    showActionNotice(articleId, willSave ? labels.saved : labels.removed, willSave ? 'positive' : 'neutral')
  }

  function toggleFavoriteArticle(articleId: string) {
    const article = articleById.get(articleId)

    if (!article) {
      return
    }

    const willFavorite = libraryActions.toggleFavoriteArticle(article)

    showActionNotice(articleId, willFavorite ? labels.favorited : labels.unfavorited, willFavorite ? 'positive' : 'neutral')
  }

  function shareArticle(articleId: string) {
    const article = articleById.get(articleId)

    if (!article) {
      return
    }

    void copyTextToClipboard(article.url)
    showActionNotice(articleId, labels.linkCopied, 'positive')
  }

  function copyAnalysis(articleId: string) {
    const article = articleById.get(articleId)

    if (!article) {
      return
    }

    void copyTextToClipboard(article.reader.aiSummary)
    copiedAnalysisState.setTimedValue(articleId)
    showActionNotice(articleId, labels.analysisCopied, 'positive')
  }

  function showActionNotice(articleId: string, label: string, tone: 'neutral' | 'positive') {
    actionNoticeState.setTimedValue({ articleId, label, tone })
  }

  return {
    actionNotice: actionNoticeState.value,
    copiedAnalysisArticleId: copiedAnalysisState.value,
    actions: {
      copyAnalysis,
      shareArticle,
      toggleFavoriteArticle,
      toggleSaveArticle,
    },
  }
}
