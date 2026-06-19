'use client'

import { useEffect, useMemo, useState } from 'react'
import type { StandardArticle } from '../../types/reader'
import {
  generateArticleBriefRequest,
  type ArticleBriefResponse,
} from '../../services/api/articleBriefApi'
import { isApiCanceledError, normalizeApiError, type ApiError } from '../../services/api/request'

type ArticleBriefState = {
  data: ArticleBriefResponse | null
  error: ApiError | null
  status: 'idle' | 'loading' | 'success' | 'error'
}

export function useArticleBrief(article: StandardArticle, enabled: boolean) {
  const requestKey = useMemo(
    () => [
      article.id,
      article.url,
      article.title,
      article.language,
      article.reader.body.join('\n\n'),
    ].join('\u001f'),
    [article.id, article.language, article.reader.body, article.title, article.url],
  )
  const [state, setState] = useState<ArticleBriefState>({
    data: null,
    error: null,
    status: 'idle',
  })

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const controller = new AbortController()

    setState((current) => {
      if (current.status === 'success' && current.data?.articleId === article.id) {
        return current
      }

      return {
        data: null,
        error: null,
        status: 'loading',
      }
    })

    void generateArticleBriefRequest({
      articleId: article.id,
      body: article.reader.body,
      sourceLanguage: article.language,
      targetLanguage: 'zh-CN',
      title: article.title,
      url: article.url,
    }, {
      signal: controller.signal,
    }).then((data) => {
      if (controller.signal.aborted) {
        return
      }

      setState({
        data,
        error: null,
        status: 'success',
      })
    }).catch((error) => {
      if (controller.signal.aborted || isApiCanceledError(error)) {
        return
      }

      setState({
        data: null,
        error: normalizeApiError(error),
        status: 'error',
      })
    })

    return () => {
      controller.abort()
    }
  }, [article, enabled, requestKey])

  return {
    ...state,
    isError: state.status === 'error',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
  }
}
