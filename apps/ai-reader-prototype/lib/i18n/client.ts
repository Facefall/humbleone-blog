'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enReader from './locales/en/reader.json'
import enSourceDesk from './locales/en/sourceDesk.json'
import zhCommon from './locales/zh-CN/common.json'
import zhReader from './locales/zh-CN/reader.json'
import zhSourceDesk from './locales/zh-CN/sourceDesk.json'
import { defaultLocale, isAppLocale, readStoredLocale, writeStoredLocale } from './settings'

const resources = {
  'zh-CN': {
    common: zhCommon,
    reader: zhReader,
    sourceDesk: zhSourceDesk,
  },
  en: {
    common: enCommon,
    reader: enReader,
    sourceDesk: enSourceDesk,
  },
} as const

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: readStoredLocale(),
    fallbackLng: defaultLocale,
    defaultNS: 'common',
    ns: ['common', 'reader', 'sourceDesk'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

  i18n.on('languageChanged', (locale) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }

    if (isAppLocale(locale)) {
      writeStoredLocale(locale)
    }
  })

  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.language
  }
}

export default i18n
