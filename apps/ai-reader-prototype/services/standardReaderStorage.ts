import type { SourcePanelPreferences, StandardArticle } from '../types/reader'

const articleStateStorageKey = 'humbleone.ai-reader.standard.articleState.v1'
const sourcePanelStorageKey = 'humbleone.ai-reader.standard.sourcePanel.v1'

const defaultSourcePanelPreferences: SourcePanelPreferences = {
  activeOnly: false,
  collapsedGroups: [],
}

export type StandardReadStateSets = {
  readArticleIds: Set<string>
}

type StoredArticleState = {
  readIds?: unknown
}

export function readStandardReadState(articles: StandardArticle[]): StandardReadStateSets {
  const validArticleIds = new Set(articles.map((article) => article.id))
  const stored = readJson<StoredArticleState>(articleStateStorageKey)

  return {
    readArticleIds: parseStoredIds(stored?.readIds, validArticleIds) ?? new Set<string>(),
  }
}

export function writeStandardReadState(state: StandardReadStateSets) {
  writeJson(articleStateStorageKey, {
    readIds: [...state.readArticleIds],
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
