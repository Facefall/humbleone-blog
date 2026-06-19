'use client'

import { useEffect, useMemo, useState } from 'react'
import type { StandardArticle } from '../../types/reader'
import {
  getArticleState,
  updateArticleState,
} from '../../services/api/articleStateApi'

export function useArticleLibraryState(articles: StandardArticle[]) {
  const articleIds = useMemo(() => articles.map((article) => article.id), [articles])
  const articleIdsKey = articleIds.join('\u001f')
  const [savedArticleIds, setSavedArticleIds] = useState(() => new Set<string>())
  const [favoritedArticleIds, setFavoritedArticleIds] = useState(() => new Set<string>())

  useEffect(() => {
    const controller = new AbortController()
    const validArticleIds = new Set(articleIds)

    setSavedArticleIds((current) => filterIds(current, validArticleIds))
    setFavoritedArticleIds((current) => filterIds(current, validArticleIds))

    void getArticleState(articleIds, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) {
        return
      }

      setSavedArticleIds(filterIds(new Set(data.savedArticleIds), validArticleIds))
      setFavoritedArticleIds(filterIds(new Set(data.favoritedArticleIds), validArticleIds))
    }).catch(() => {
      // Keep the current optimistic state when the DB-backed lookup fails.
    })

    return () => {
      controller.abort()
    }
  }, [articleIdsKey])

  function toggleSaveArticle(article: StandardArticle) {
    const willSave = !savedArticleIds.has(article.id)
    const previousSavedArticleIds = savedArticleIds

    setSavedArticleIds(toggleId(savedArticleIds, article.id, willSave))
    void updateArticleState({
      article,
      saved: willSave,
    }).catch(() => {
      setSavedArticleIds(previousSavedArticleIds)
    })

    return willSave
  }

  function toggleFavoriteArticle(article: StandardArticle) {
    const willFavorite = !favoritedArticleIds.has(article.id)
    const previousFavoritedArticleIds = favoritedArticleIds

    setFavoritedArticleIds(toggleId(favoritedArticleIds, article.id, willFavorite))
    void updateArticleState({
      article,
      favorited: willFavorite,
    }).catch(() => {
      setFavoritedArticleIds(previousFavoritedArticleIds)
    })

    return willFavorite
  }

  return {
    favoritedArticleIds,
    savedArticleIds,
    actions: {
      toggleFavoriteArticle,
      toggleSaveArticle,
    },
  }
}

function toggleId(current: Set<string>, articleId: string, enabled: boolean) {
  const next = new Set(current)

  if (enabled) {
    next.add(articleId)
  } else {
    next.delete(articleId)
  }

  return next
}

function filterIds(articleIds: Set<string>, validArticleIds: Set<string>) {
  return new Set([...articleIds].filter((articleId) => validArticleIds.has(articleId)))
}
