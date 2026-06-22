import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  invalidateSourceRegistryCache,
  loadEffectiveSourceRegistry,
  getSourceRegistryGeneratedOverridesPath,
  type SourceRegistryFeedHubOverride,
  type SourceRegistrySourceOverride,
} from './sourceRegistry'

export type SourceFeedHubConfigPatch = {
  sourceId: string
  enabled?: boolean
  lookbackDays?: number
}

type GeneratedSourceRegistryFile = {
  schemaVersion: 1
  sourceOverrides?: SourceRegistrySourceOverride[]
  [key: string]: unknown
}

export async function updateSourceFeedHubConfigOverride(patch: SourceFeedHubConfigPatch) {
  if (typeof patch.enabled === 'undefined' && typeof patch.lookbackDays === 'undefined') {
    throw new Error('enabled or lookbackDays is required.')
  }

  const registry = await loadEffectiveSourceRegistry()
  const record = registry.recordById.get(patch.sourceId)

  if (!record) {
    throw new Error(`Source not found: ${patch.sourceId}`)
  }

  if (!record.feedHub) {
    throw new Error(`${record.displayName} is not connected to Feed Hub yet.`)
  }

  const nextFeedHub: SourceRegistryFeedHubOverride = {
    ...(typeof patch.enabled === 'boolean' ? { enabled: patch.enabled } : {}),
    ...(patch.lookbackDays ? { lookbackDays: patch.lookbackDays } : {}),
  }
  const generatedFile = await readGeneratedSourceRegistryFile()
  const sourceOverrides = mergeSourceOverrides(
    readGeneratedSourceOverrides(generatedFile),
    {
      sourceId: patch.sourceId,
      feedHub: nextFeedHub,
    },
  )
  const nextFile: GeneratedSourceRegistryFile = {
    ...generatedFile,
    schemaVersion: 1,
    sourceOverrides,
  }
  const overridesPath = getSourceRegistryGeneratedOverridesPath()

  await mkdir(path.dirname(overridesPath), { recursive: true })
  await writeFile(overridesPath, `${JSON.stringify(nextFile, null, 2)}\n`, 'utf8')
  invalidateSourceRegistryCache()

  return {
    sourceId: patch.sourceId,
    feedHub: {
      ...record.feedHub,
      ...nextFeedHub,
    },
  }
}

async function readGeneratedSourceRegistryFile(): Promise<GeneratedSourceRegistryFile> {
  try {
    const rawConfig = await readFile(getSourceRegistryGeneratedOverridesPath(), 'utf8')
    const parsedConfig = JSON.parse(rawConfig) as unknown

    if (!isRecord(parsedConfig)) {
      throw new Error('Generated source registry config must be an object.')
    }

    if (parsedConfig.schemaVersion !== 1) {
      throw new Error('Generated source registry config schemaVersion must be 1.')
    }

    return {
      ...parsedConfig,
      schemaVersion: 1,
    }
  } catch (error) {
    if (isNodeError(error, 'ENOENT')) {
      return {
        schemaVersion: 1,
        sourceOverrides: [],
      }
    }

    throw error
  }
}

function readGeneratedSourceOverrides(file: GeneratedSourceRegistryFile) {
  if (typeof file.sourceOverrides === 'undefined') {
    return []
  }

  if (!Array.isArray(file.sourceOverrides)) {
    throw new Error('Generated source registry sourceOverrides must be an array.')
  }

  return file.sourceOverrides.map((override) => {
    if (!isRecord(override)) {
      throw new Error('Generated source registry sourceOverride must be an object.')
    }

    if (typeof override.sourceId !== 'string' || !override.sourceId.trim()) {
      throw new Error('Generated source registry sourceOverride.sourceId is required.')
    }

    return {
      sourceId: override.sourceId.trim(),
      feedHub: isRecord(override.feedHub)
        ? readFeedHubOverride(override.feedHub)
        : undefined,
    }
  })
}

function readFeedHubOverride(value: Record<string, unknown>): SourceRegistryFeedHubOverride {
  const enabled = value.enabled
  const lookbackDays = value.lookbackDays

  if (typeof enabled !== 'undefined' && typeof enabled !== 'boolean') {
    throw new Error('Generated source registry feedHub.enabled must be boolean when provided.')
  }

  if (typeof lookbackDays !== 'undefined' && (!Number.isInteger(lookbackDays) || typeof lookbackDays !== 'number' || lookbackDays <= 0)) {
    throw new Error('Generated source registry feedHub.lookbackDays must be a positive integer when provided.')
  }

  return {
    ...(typeof enabled === 'boolean' ? { enabled } : {}),
    ...(typeof lookbackDays === 'number' ? { lookbackDays } : {}),
  }
}

function mergeSourceOverrides(
  overrides: SourceRegistrySourceOverride[],
  nextOverride: SourceRegistrySourceOverride,
) {
  const overrideBySourceId = new Map(overrides.map((override) => [override.sourceId, override]))
  const orderedSourceIds = overrides.map((override) => override.sourceId)
  const existingOverride = overrideBySourceId.get(nextOverride.sourceId)

  if (!existingOverride) {
    orderedSourceIds.push(nextOverride.sourceId)
  }

  overrideBySourceId.set(nextOverride.sourceId, {
    sourceId: nextOverride.sourceId,
    feedHub: {
      ...existingOverride?.feedHub,
      ...nextOverride.feedHub,
    },
  })

  return orderedSourceIds.map((sourceId) => {
    const override = overrideBySourceId.get(sourceId)

    if (!override) {
      throw new Error(`Generated source registry lost override: ${sourceId}`)
    }

    return override
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNodeError(error: unknown, code: string) {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === code
}
