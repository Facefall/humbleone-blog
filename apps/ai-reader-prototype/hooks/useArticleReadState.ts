'use client'

import { useEffect, useState } from 'react'
import { readStandardReadState, writeStandardReadState } from '../services/standardReaderStorage'
import type { StandardArticle } from '../types/reader'

export function useArticleReadState(articles: StandardArticle[]) {
  const [readArticleIds, setReadArticleIds] = useState(() => readStandardReadState(articles).readArticleIds)
  const [hydrated, setHydrated] = useState(false)
  const unreadCount = articles.reduce((count, article) => count + (readArticleIds.has(article.id) ? 0 : 1), 0)

  useEffect(() => {
    const nextArticleState = readStandardReadState(articles)

    setReadArticleIds(nextArticleState.readArticleIds)
    setHydrated(true)
  }, [articles])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    writeStandardReadState({
      readArticleIds,
    })
  }, [hydrated, readArticleIds])

  function markArticleRead(articleId: string) {
    setReadArticleIds((current) => {
      if (current.has(articleId)) {
        return current
      }

      const next = new Set(current)

      next.add(articleId)
      return next
    })
  }

  function markArticlesRead(articleIds: string[]) {
    setReadArticleIds((current) => {
      const next = new Set(current)

      articleIds.forEach((articleId) => next.add(articleId))
      return next
    })
  }

  return {
    readArticleIds,
    unreadCount,
    actions: {
      markArticleRead,
      markArticlesRead,
    },
  }
}
