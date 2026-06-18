import type { DailyBrief, FeedItem } from '../lib/prototype-data'
import { getSourceRegistryRecord } from '../services/sourceRegistry'
import type { StandardArticle, StandardSource } from '../types/reader'

const articleImages = [
  '/standard-media/ai-grid.svg',
  '/standard-media/runtime-terminal.svg',
  '/standard-media/builder-notes.svg',
]


export { formatIssueDate } from '../lib/i18n/formatters'

export function flattenArticles(brief: DailyBrief): StandardArticle[] {
  return brief.sections.flatMap((section) =>
    section.items.map((item, index) => ({
      ...item,
      sectionTitle: section.title,
      standardCategory: mapCategory(item, section.title),
      readTime: Math.max(3, Math.round(item.reader.body.join(' ').length / 190)),
      commentCount: Math.round(item.importanceScore * 8 + item.noveltyScore * 5 + index * 71),
      imageUrl: index < 2 ? articleImages[index % articleImages.length] : undefined,
      importance:
        section.id === 'hard_news' && index === 0 ? 'breaking' : item.importanceScore >= 82 ? 'top' : 'standard',
    })),
  )
}

export function buildSources(brief: DailyBrief): StandardSource[] {
  return brief.sourceDesk.sourceSlips.map((source) => {
    const feedSourceId = source.id.replace(/^slip-/, 'source-')
    const registry = getSourceRegistryRecord(feedSourceId)

    return {
      ...source,
      category: source.sourceFamily ?? 'general',
      active: source.health !== 'failed' && source.state !== 'stale',
      contentType: registry?.contentType ?? (source.sourceFamily === 'community' ? 'social' : 'article'),
      feedSourceId,
      registry,
    }
  })
}

export function getSelectedArticle(articles: StandardArticle[], selectedItemId: string) {
  return articles.find((article) => article.id === selectedItemId) ?? articles[0]
}

export function normalizeFilter(value: string) {
  return value.trim().toLowerCase()
}

function mapCategory(item: FeedItem, sectionTitle: string) {
  if (item.sourceFamily === 'model_lab') {
    return 'AI LABS'
  }

  if (item.sourceFamily === 'project_changelog') {
    return 'RUNTIME'
  }

  if (item.sourceFamily === 'community') {
    return 'COMMUNITY'
  }

  if (item.sourceFamily === 'builder' || item.sourceFamily === 'personal_repo') {
    return 'BUILDERS'
  }

  if (item.sourceFamily === 'research') {
    return 'RESEARCH'
  }

  return sectionTitle.toUpperCase()
}
