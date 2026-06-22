import type { RsshubData } from './types'
import rsshub from 'rsshub';

type RSSHubModule = {
  init: (config?: Record<string, string | undefined>) => Promise<void>
  request: (path: string) => Promise<RsshubData>
}

let rsshubModulePromise: Promise<RSSHubModule> | null = null
let rsshubInitPromise: Promise<void> | null = null

async function loadRSSHub() {
  setRSSHubEnvironmentDefaults()
  rsshubModulePromise ??= import('rsshub') as Promise<RSSHubModule>
  return rsshubModulePromise
}

export function buildRSSHubRequestPath(route: string) {
  const trimmedRoute = route.trim()

  if (!trimmedRoute) {
    throw new Error('RSSHub route is required.')
  }

  const parsed = parseRSSHubRoute(trimmedRoute)
  const path = ensureLeadingSlash(parsed.pathname)
  const queryEntries = Array.from(parsed.searchParams.entries())
  const query = queryEntries.map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join('&')

  return `${path}${query ? `?${query}` : ''}`
}

function parseRSSHubRoute(route: string) {
  const parsed = route.startsWith('http://') || route.startsWith('https://')
    ? new URL(route)
    : new URL(route, 'https://rsshub.internal')

  return parsed
}

function ensureLeadingSlash(path: string) {
  const normalizedPath = path.trim() || '/'
  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
}

export async function requestRSSHubRoute(route: string) {
  const requestPath = buildRSSHubRequestPath(route)
  const rsshub = await loadRSSHub()

  await ensureRSSHubInitialized(rsshub)

  return rsshub.request(requestPath)
}

function getRSSHubInitConfig() {
  return {
    CACHE_TYPE: 'memory',
    LOGGER_LEVEL: process.env.RSSHUB_LOGGER_LEVEL ?? 'error',
    NO_LOGFILES: 'true',
    REQUEST_TIMEOUT: process.env.RSSHUB_REQUEST_TIMEOUT ?? '12000',
  }
}

async function ensureRSSHubInitialized(rsshub: RSSHubModule) {
  rsshubInitPromise ??= rsshub.init(getRSSHubInitConfig()).catch((error) => {
    rsshubInitPromise = null
    throw error
  })

  await rsshubInitPromise
}

function setRSSHubEnvironmentDefaults() {
  process.env.IS_PACKAGE ??= 'true'
  process.env.LOGGER_LEVEL ??= 'error'
  process.env.NO_LOGFILES ??= 'true'
}
