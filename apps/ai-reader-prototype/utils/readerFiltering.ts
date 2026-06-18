import { normalizeFilter } from './standardReaderModel'
import type { StandardArticle } from '../types/reader'

type FilterStandardArticlesInput = {
  articles: StandardArticle[]
  searchQuery: string
  selectedSourceId: string | null
}

export function filterStandardArticles({
  articles,
  searchQuery,
  selectedSourceId,
}: FilterStandardArticlesInput) {
  const query = normalizeFilter(searchQuery)

  return articles.filter((article) => {
    const sourceMatch = selectedSourceId ? article.sourceId === selectedSourceId : true
    const queryMatch = query
      ? [article.title, article.summary, article.sourceName, article.standardCategory, ...article.tags]
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true

    return sourceMatch && queryMatch
  })
}
