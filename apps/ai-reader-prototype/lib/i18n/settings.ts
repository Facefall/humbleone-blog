export const defaultLocale = 'zh-CN' as const
export const supportedLocales = ['zh-CN', 'en'] as const

export type AppLocale = (typeof supportedLocales)[number]

export const localeStorageKey = 'ai-reader.locale'

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale)
}

export function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const stored = window.localStorage.getItem(localeStorageKey)

  return isAppLocale(stored) ? stored : defaultLocale
}

export function writeStoredLocale(locale: AppLocale) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(localeStorageKey, locale)
}
