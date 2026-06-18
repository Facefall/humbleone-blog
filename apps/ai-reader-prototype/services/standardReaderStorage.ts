import type { SourcePanelPreferences, StandardArticle } from '../types/reader'

const savedArticlesStorageKey = 'humbleone.ai-reader.standard.savedArticles.v1'
const articleStateStorageKey = 'humbleone.ai-reader.standard.articleState.v1'
const sourcePanelStorageKey = 'humbleone.ai-reader.standard.sourcePanel.v1'

const defaultSourcePanelPreferences: SourcePanelPreferences = {
  activeOnly: false,
  collapsedGroups: [],
}

export function readSavedArticleIds(articles: StandardArticle[]) {
  const seededIds = articles.filter((article) => article.status === 'saved').map((article) => article.id)
  const storedValue = readJson<unknown>(savedArticlesStorageKey)
  const storedIds = Array.isArray(storedValue)
    ? storedValue.filter((item): item is string => typeof item === 'string')
    : null
  const validArticleIds = new Set(articles.map((article) => article.id))
  const sourceIds = storedIds ?? seededIds

  return new Set(sourceIds.filter((id) => validArticleIds.has(id)))
}

export function writeSavedArticleIds(articleIds: Set<string>) {
  writeJson(savedArticlesStorageKey, [...articleIds])
}

export type StandardArticleStateSets = {
  readArticleIds: Set<string>
  savedArticleIds: Set<string>
  favoritedArticleIds: Set<string>
}

type StoredArticleState = {
  readIds?: unknown
  savedIds?: unknown
  favoritedIds?: unknown
}

export function readStandardArticleState(articles: StandardArticle[]): StandardArticleStateSets {
  const validArticleIds = new Set(articles.map((article) => article.id))
  const stored = readJson<StoredArticleState>(articleStateStorageKey)
  const storedSavedIds = parseStoredIds(stored?.savedIds, validArticleIds)
  const storedFavoritedIds = parseStoredIds(stored?.favoritedIds, validArticleIds)

  return {
    readArticleIds: parseStoredIds(stored?.readIds, validArticleIds) ?? new Set<string>(),
    savedArticleIds: storedSavedIds ?? readSavedArticleIds(articles),
    favoritedArticleIds: storedFavoritedIds ?? new Set<string>(),
  }
}

export function writeStandardArticleState(state: StandardArticleStateSets) {
  writeJson(articleStateStorageKey, {
    readIds: [...state.readArticleIds],
    savedIds: [...state.savedArticleIds],
    favoritedIds: [...state.favoritedArticleIds],
  })
}

export function readSourcePanelPreferences(validGroups: string[]) {
  const stored = readJson<Partial<SourcePanelPreferences>>(sourcePanelStorageKey)
  const validGroupNames = new Set(validGroups)

  return {
    activeOnly: typeof stored?.activeOnly === 'boolean' ? stored.activeOnly : defaultSourcePanelPreferences.activeOnly,
    collapsedGroups: Array.isArray(stored?.collapsedGroups)
      ? stored.collapsedGroups.filter((group) => validGroupNames.has(group))
      : defaultSourcePanelPreferences.collapsedGroups,
  }
}

export function writeSourcePanelPreferences(preferences: SourcePanelPreferences) {
  writeJson(sourcePanelStorageKey, preferences)
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)

    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Non-critical prototype state should not interrupt reading.
  }
}

function parseStoredIds(value: unknown, validArticleIds: Set<string>) {
  if (!Array.isArray(value)) {
    return null
  }

  return new Set(value.filter((item): item is string => typeof item === 'string' && validArticleIds.has(item)))
}
