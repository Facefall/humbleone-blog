import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { watch, type FSWatcher } from 'chokidar'
import { readerLogger } from './logging/readerLogger'
import type {
  DailySectionKind,
  EvidenceLevel,
  SourceCollectionConfig,
  SourceContentType,
  SourceFamily,
} from '../lib/prototype-data'

export type FetchMethod = 'official_rss' | 'official_api' | 'rsshub' | 'custom_scrape' | 'manual'

export type SourceRegistryFeedHubConfig = {
  enabled: boolean
  lookbackDays: number
  section: DailySectionKind
}

export type SourceRegistryFeedHubOverride = {
  enabled?: boolean
  lookbackDays?: number
}

export type SourceRegistrySourceOverride = {
  sourceId: string
  feedHub?: SourceRegistryFeedHubOverride
}

export type SourceRegistryRecord = {
  sourceId: string
  displayName: string
  sourceFamily: SourceFamily
  topicTags: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  language: 'zh-CN' | 'en' | 'mixed'
  officialUrl: string
  fetchMethod: FetchMethod
  contentType: SourceContentType
  adapter: string
  feedUrl?: string
  apiEndpoint?: string
  rsshubRoute?: string
  updateFrequency: string
  evidenceLevel: EvidenceLevel
  whyFollow: string
  riskNotes: string
  feedHub?: SourceRegistryFeedHubConfig
}

export type EffectiveSourceRegistry = {
  records: SourceRegistryRecord[]
  recordById: Map<string, SourceRegistryRecord>
  groups: SourceCollectionConfig[]
}

type SourceRegistryFile = {
  schemaVersion: 1
  sources: SourceRegistryRecord[]
  groups: SourceCollectionConfig[]
  sourceOverrides: SourceRegistrySourceOverride[]
}

type SourceRegistryState = {
  cache: EffectiveSourceRegistry | null
  cachePromise: Promise<EffectiveSourceRegistry> | null
  watcher: FSWatcher | null
}

const sourceRegistryRootPath = path.join(process.cwd(), 'config', 'source-registry')
const sourceRegistryBasePath = path.join(sourceRegistryRootPath, 'base.json')
export const sourceRegistryGeneratedDirPath = path.join(sourceRegistryRootPath, 'generated')
const sourceRegistryState = getSourceRegistryState()
const sourceFamilies = new Set<SourceFamily>([
  'model_lab',
  'builder',
  'community',
  'project_changelog',
  'personal_repo',
  'research',
])
const evidenceLevels = new Set<EvidenceLevel>(['official', 'github', 'builder', 'community', 'rss', 'manual'])
const fetchMethods = new Set<FetchMethod>(['official_rss', 'official_api', 'rsshub', 'custom_scrape', 'manual'])
const contentTypes = new Set<SourceContentType>(['article', 'social', 'image', 'video'])
const priorities = new Set<SourceRegistryRecord['priority']>(['critical', 'high', 'medium', 'low'])
const languages = new Set<SourceRegistryRecord['language']>(['zh-CN', 'en', 'mixed'])
const sections = new Set<DailySectionKind>(['hard_news', 'cases', 'interesting'])

export async function loadEffectiveSourceRegistry(): Promise<EffectiveSourceRegistry> {
  ensureSourceRegistryWatcher()

  if (sourceRegistryState.cache) {
    return sourceRegistryState.cache
  }

  sourceRegistryState.cachePromise ??= readEffectiveSourceRegistry().then((registry) => {
    sourceRegistryState.cache = registry
    sourceRegistryState.cachePromise = null

    return registry
  }, (error) => {
    sourceRegistryState.cachePromise = null
    throw error
  })

  return sourceRegistryState.cachePromise
}

export function invalidateSourceRegistryCache() {
  sourceRegistryState.cache = null
  sourceRegistryState.cachePromise = null
}

export function getSourceRegistryRecord(registry: EffectiveSourceRegistry, sourceId: string) {
  return registry.recordById.get(sourceId)
}

export function getSourceRegistryGeneratedOverridesPath() {
  const overridePath = process.env.AI_READER_SOURCE_REGISTRY_OVERRIDES_PATH

  return overridePath ? path.resolve(overridePath) : path.join(sourceRegistryGeneratedDirPath, 'overrides.json')
}

async function readEffectiveSourceRegistry(): Promise<EffectiveSourceRegistry> {
  const files = await readSourceRegistryFiles()
  const records = mergeSourceRegistryFiles(files)
  const groups = mergeSourceRegistryGroups(files)
  const recordById = new Map<string, SourceRegistryRecord>()

  records.forEach((record) => {
    if (recordById.has(record.sourceId)) {
      throw new Error(`Duplicate source registry id: ${record.sourceId}`)
    }

    recordById.set(record.sourceId, record)
  })
  validateSourceRegistryGroups(groups, recordById)

  return {
    records,
    recordById,
    groups,
  }
}

async function readSourceRegistryFiles(): Promise<SourceRegistryFile[]> {
  const baseFile = await readSourceRegistryFile(sourceRegistryBasePath)
  const generatedOverrideFile = await readOptionalSourceRegistryFile(getSourceRegistryGeneratedOverridesPath())

  return [baseFile, generatedOverrideFile].filter((file): file is SourceRegistryFile => Boolean(file))
}

async function readSourceRegistryFile(filePath: string): Promise<SourceRegistryFile> {
  const rawConfig = await readFile(filePath, 'utf8')
  const parsedConfig = JSON.parse(rawConfig) as unknown

  return parseSourceRegistryFile(parsedConfig)
}

async function readOptionalSourceRegistryFile(filePath: string): Promise<SourceRegistryFile | null> {
  try {
    return await readSourceRegistryFile(filePath)
  } catch (error) {
    if (isNodeError(error, 'ENOENT')) {
      return null
    }

    throw error
  }
}

function mergeSourceRegistryFiles(files: SourceRegistryFile[]) {
  const recordsById = new Map<string, SourceRegistryRecord>()
  const orderedIds: string[] = []

  files.forEach((file) => {
    file.sources.forEach((record) => {
      if (!recordsById.has(record.sourceId)) {
        orderedIds.push(record.sourceId)
      }

      recordsById.set(record.sourceId, record)
    })
  })
  files.forEach((file) => {
    file.sourceOverrides.forEach((override) => {
      const currentRecord = recordsById.get(override.sourceId)

      if (!currentRecord) {
        throw new Error(`Source registry override references missing source: ${override.sourceId}`)
      }

      recordsById.set(override.sourceId, applySourceRegistryOverride(currentRecord, override))
    })
  })

  return orderedIds.map((sourceId) => {
    const record = recordsById.get(sourceId)

    if (!record) {
      throw new Error(`Source registry merge lost source: ${sourceId}`)
    }

    return record
  })
}

function applySourceRegistryOverride(
  record: SourceRegistryRecord,
  override: SourceRegistrySourceOverride,
): SourceRegistryRecord {
  if (!override.feedHub) {
    return record
  }

  if (!record.feedHub) {
    throw new Error(`Source ${record.sourceId} cannot receive feedHub override before it has feedHub config.`)
  }

  const nextRecord = {
    ...record,
    feedHub: {
      ...record.feedHub,
      ...override.feedHub,
    },
  }
  validateEnabledFeedHubEndpoint(nextRecord)

  return nextRecord
}

function validateEnabledFeedHubEndpoint(record: SourceRegistryRecord) {
  if (record.fetchMethod === 'rsshub' && record.feedHub?.enabled && !record.rsshubRoute) {
    throw new Error(`Source ${record.sourceId} is enabled for Feed Hub via RSSHub but has no rsshubRoute.`)
  }

  if (record.fetchMethod === 'official_rss' && record.feedHub?.enabled && !record.feedUrl) {
    throw new Error(`Source ${record.sourceId} is enabled for Feed Hub via official RSS but has no feedUrl.`)
  }

  if (record.fetchMethod === 'official_api' && record.feedHub?.enabled && !record.apiEndpoint) {
    throw new Error(`Source ${record.sourceId} is enabled for Feed Hub via official API but has no apiEndpoint.`)
  }
}

function mergeSourceRegistryGroups(files: SourceRegistryFile[]) {
  const groupsById = new Map<string, SourceCollectionConfig>()
  const orderedIds: string[] = []

  files.forEach((file) => {
    file.groups.forEach((group) => {
      if (!groupsById.has(group.id)) {
        orderedIds.push(group.id)
        groupsById.set(group.id, group)
        return
      }

      const currentGroup = groupsById.get(group.id)

      if (!currentGroup) {
        throw new Error(`Source registry merge lost group while merging: ${group.id}`)
      }

      groupsById.set(group.id, {
        ...currentGroup,
        ...group,
        sourceIds: uniqueStrings([...currentGroup.sourceIds, ...group.sourceIds]),
      })
    })
  })

  return orderedIds.map((groupId) => {
    const group = groupsById.get(groupId)

    if (!group) {
      throw new Error(`Source registry merge lost group: ${groupId}`)
    }

    return group
  })
}

function validateSourceRegistryGroups(
  groups: SourceCollectionConfig[],
  recordById: Map<string, SourceRegistryRecord>,
) {
  groups.forEach((group) => {
    group.sourceIds.forEach((sourceId) => {
      if (!recordById.has(sourceId)) {
        throw new Error(`Source registry group ${group.id} references missing source: ${sourceId}`)
      }
    })
  })
}

function ensureSourceRegistryWatcher() {
  if (sourceRegistryState.watcher || process.env.AI_READER_SOURCE_REGISTRY_WATCH === 'false') {
    return
  }

  sourceRegistryState.watcher = watch([sourceRegistryBasePath, getSourceRegistryGeneratedOverridesPath()], {
    awaitWriteFinish: {
      stabilityThreshold: 120,
      pollInterval: 40,
    },
    ignoreInitial: true,
  })

  sourceRegistryState.watcher
    .on('add', invalidateSourceRegistryCache)
    .on('change', invalidateSourceRegistryCache)
    .on('unlink', invalidateSourceRegistryCache)
    .on('error', (error) => {
      readerLogger.warn('source-registry', 'file watcher failed', {
        error: error instanceof Error ? error.message : String(error),
      })
    })
}

function getSourceRegistryState(): SourceRegistryState {
  const globalState = globalThis as typeof globalThis & {
    __aiReaderSourceRegistryState?: SourceRegistryState
  }

  globalState.__aiReaderSourceRegistryState ??= {
    cache: null,
    cachePromise: null,
    watcher: null,
  }

  return globalState.__aiReaderSourceRegistryState
}

function parseSourceRegistryFile(value: unknown): SourceRegistryFile {
  if (!isRecord(value)) {
    throw new Error('Source registry config must be an object.')
  }

  if (value.schemaVersion !== 1) {
    throw new Error('Source registry config schemaVersion must be 1.')
  }

  if (typeof value.sources !== 'undefined' && !Array.isArray(value.sources)) {
    throw new Error('Source registry config sources must be an array when provided.')
  }

  if (typeof value.sourceOverrides !== 'undefined' && !Array.isArray(value.sourceOverrides)) {
    throw new Error('Source registry config sourceOverrides must be an array when provided.')
  }

  const groupedSourceConfig = parseGroupedSourceConfig(value)
  const flatSources = Array.isArray(value.sources) ? value.sources.map(parseSourceRegistryRecord) : []
  const flatGroups = Array.isArray(value.groups) ? value.groups.map(parseSourceRegistryGroup) : []
  const sourceOverrides = Array.isArray(value.sourceOverrides)
    ? value.sourceOverrides.map(parseSourceRegistrySourceOverride)
    : []

  return {
    schemaVersion: 1,
    groups: [...flatGroups, ...groupedSourceConfig.map((group) => group.group)],
    sourceOverrides,
    sources: [...flatSources, ...groupedSourceConfig.flatMap((group) => group.sources)],
  }
}

function parseSourceRegistrySourceOverride(value: unknown): SourceRegistrySourceOverride {
  if (!isRecord(value)) {
    throw new Error('Source registry sourceOverride must be an object.')
  }

  const sourceId = readRequiredStringAlias(value, ['sourceId', 'id'], 'sourceId')
  const feedHub = parseFeedHubOverride(value.feedHub, sourceId)

  return {
    sourceId,
    ...(feedHub ? { feedHub } : {}),
  }
}

function parseFeedHubOverride(value: unknown, sourceId: string): SourceRegistryFeedHubOverride | undefined {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (!isRecord(value)) {
    throw new Error(`Source ${sourceId} feedHub override must be an object.`)
  }

  const enabled = readOptionalBoolean(value, 'enabled')
  const lookbackDays = readOptionalPositiveInteger(value, 'lookbackDays')

  return {
    ...(typeof enabled === 'boolean' ? { enabled } : {}),
    ...(lookbackDays ? { lookbackDays } : {}),
  }
}

function parseGroupedSourceConfig(value: Record<string, unknown>) {
  const sourceGroups = [
    ...readSourceGroupArray(value, 'rssSources'),
    ...readSourceGroupArray(value, 'sourceGroups'),
  ]

  return sourceGroups.map(parseSourceRegistrySourceGroup)
}

function parseSourceRegistryGroup(value: unknown): SourceCollectionConfig {
  if (!isRecord(value)) {
    throw new Error('Source registry group must be an object.')
  }

  const id = readRequiredString(value, 'id')
  const name = readRequiredString(value, 'name')
  const sourceIds = readStringArray(value, 'sourceIds')
  const systemCategory = readOptionalString(value, 'systemCategory')

  return {
    id,
    name,
    sourceIds,
    ...(systemCategory ? { systemCategory } : {}),
  }
}

function parseSourceRegistrySourceGroup(value: unknown): {
  group: SourceCollectionConfig
  sources: SourceRegistryRecord[]
} {
  if (!isRecord(value)) {
    throw new Error('Source registry grouped source must be an object.')
  }

  const id = readRequiredString(value, 'id')
  const name = readFirstOptionalString(value, ['displayName', 'groupName', 'name']) ?? id
  const systemCategory = readOptionalString(value, 'systemCategory')
  const sources = readSourceArray(value, 'sources').map(parseSourceRegistryRecord)
  const sourceIds = uniqueStrings([...readOptionalStringArray(value, 'sourceIds'), ...sources.map((source) => source.sourceId)])

  return {
    group: {
      id,
      name,
      sourceIds,
      ...(systemCategory ? { systemCategory } : {}),
    },
    sources,
  }
}

function parseSourceRegistryRecord(value: unknown): SourceRegistryRecord {
  if (!isRecord(value)) {
    throw new Error('Source registry source must be an object.')
  }

  const sourceId = readRequiredStringAlias(value, ['sourceId', 'id'], 'sourceId')
  const displayName = readRequiredString(value, 'displayName')
  const sourceFamily = readRequiredEnum(value, 'sourceFamily', sourceFamilies)
  const topicTags = readStringArray(value, 'topicTags')
  const priority = readRequiredEnum(value, 'priority', priorities)
  const language = readRequiredEnum(value, 'language', languages)
  const officialUrl = readRequiredString(value, 'officialUrl')
  const fetchMethod = readRequiredEnum(value, 'fetchMethod', fetchMethods)
  const contentType = readRequiredEnum(value, 'contentType', contentTypes)
  const adapter = readRequiredString(value, 'adapter')
  const feedUrl = readOptionalString(value, 'feedUrl')
  const apiEndpoint = readOptionalString(value, 'apiEndpoint')
  const rsshubRoute = readOptionalString(value, 'rsshubRoute')
  const updateFrequency = readRequiredString(value, 'updateFrequency')
  const evidenceLevel = readRequiredEnum(value, 'evidenceLevel', evidenceLevels)
  const whyFollow = readRequiredString(value, 'whyFollow')
  const riskNotes = readRequiredString(value, 'riskNotes')
  const feedHub = parseFeedHubConfig(value.feedHub, sourceId)

  const record = {
    sourceId,
    displayName,
    sourceFamily,
    topicTags,
    priority,
    language,
    officialUrl,
    fetchMethod,
    contentType,
    adapter,
    ...(feedUrl ? { feedUrl } : {}),
    ...(apiEndpoint ? { apiEndpoint } : {}),
    ...(rsshubRoute ? { rsshubRoute } : {}),
    updateFrequency,
    evidenceLevel,
    whyFollow,
    riskNotes,
    ...(feedHub ? { feedHub } : {}),
  }
  validateEnabledFeedHubEndpoint(record)

  return record
}

function parseFeedHubConfig(value: unknown, sourceId: string): SourceRegistryFeedHubConfig | undefined {
  if (typeof value === 'undefined') {
    return undefined
  }

  if (!isRecord(value)) {
    throw new Error(`Source ${sourceId} feedHub must be an object.`)
  }

  const enabled = readBoolean(value, 'enabled')
  const lookbackDays = readOptionalPositiveInteger(value, 'lookbackDays') ?? 365
  const section = readRequiredEnum(value, 'section', sections)

  return {
    enabled,
    lookbackDays,
    section,
  }
}

function readRequiredString(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue !== 'string' || !nextValue.trim()) {
    throw new Error(`Source registry field ${key} must be a non-empty string.`)
  }

  return nextValue.trim()
}

function readOptionalString(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined' || nextValue === null || nextValue === '') {
    return undefined
  }

  if (typeof nextValue !== 'string') {
    throw new Error(`Source registry field ${key} must be a string when provided.`)
  }

  return nextValue.trim()
}

function readFirstOptionalString(value: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const nextValue = readOptionalString(value, key)

    if (nextValue) {
      return nextValue
    }
  }

  return undefined
}

function readRequiredStringAlias(value: Record<string, unknown>, keys: string[], label: string) {
  const nextValue = readFirstOptionalString(value, keys)

  if (!nextValue) {
    throw new Error(`Source registry field ${label} must be a non-empty string.`)
  }

  return nextValue
}

function readStringArray(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (!Array.isArray(nextValue) || nextValue.some((item) => typeof item !== 'string')) {
    throw new Error(`Source registry field ${key} must be a string array.`)
  }

  return nextValue.map((item) => item.trim()).filter(Boolean)
}

function readOptionalStringArray(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined') {
    return []
  }

  if (!Array.isArray(nextValue) || nextValue.some((item) => typeof item !== 'string')) {
    throw new Error(`Source registry field ${key} must be a string array when provided.`)
  }

  return nextValue.map((item) => item.trim()).filter(Boolean)
}

function readSourceGroupArray(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined') {
    return []
  }

  if (!Array.isArray(nextValue)) {
    throw new Error(`Source registry field ${key} must be an array when provided.`)
  }

  return nextValue
}

function readSourceArray(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined') {
    return []
  }

  if (!Array.isArray(nextValue)) {
    throw new Error(`Source registry field ${key} must be an array when provided.`)
  }

  return nextValue
}

function readBoolean(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue !== 'boolean') {
    throw new Error(`Source registry field ${key} must be a boolean.`)
  }

  return nextValue
}

function readOptionalBoolean(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined') {
    return undefined
  }

  if (typeof nextValue !== 'boolean') {
    throw new Error(`Source registry field ${key} must be a boolean when provided.`)
  }

  return nextValue
}

function readOptionalPositiveInteger(value: Record<string, unknown>, key: string) {
  const nextValue = value[key]

  if (typeof nextValue === 'undefined') {
    return undefined
  }

  if (!Number.isInteger(nextValue) || typeof nextValue !== 'number' || nextValue <= 0) {
    throw new Error(`Source registry field ${key} must be a positive integer when provided.`)
  }

  return nextValue
}

function readRequiredEnum<T extends string>(value: Record<string, unknown>, key: string, allowedValues: Set<T>): T {
  const nextValue = value[key]

  if (typeof nextValue !== 'string' || !allowedValues.has(nextValue as T)) {
    throw new Error(`Source registry field ${key} must be one of: ${Array.from(allowedValues).join(', ')}.`)
  }

  return nextValue as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNodeError(error: unknown, code: string) {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === code
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values))
}
