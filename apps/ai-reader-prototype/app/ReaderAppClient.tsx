'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { TodayPrototype, type PrototypeVariant } from '../components/TodayPrototype'
import { StandardReaderPrototype } from '../components/reader/StandardReaderPrototype'
import { useFeedHubBrief } from '../hooks/api/useFeedHubBrief'
import { dailyBrief } from '../lib/prototype-data'
import { I18nProvider } from '../providers/I18nProvider'

type ReaderTheme = 'standard' | 'source-desk'

const variants: PrototypeVariant[] = ['A', 'B', 'C']

function normalizeVariant(value: string | null): PrototypeVariant {
  const candidate = value?.toUpperCase()

  if (candidate && variants.includes(candidate as PrototypeVariant)) {
    return candidate as PrototypeVariant
  }

  return 'A'
}

function normalizeTheme(value: string | null): ReaderTheme {
  if (value === 'source-desk') {
    return 'source-desk'
  }

  return 'standard'
}

function ReaderAppClientFallback() {
  const { t } = useTranslation('common')

  return (
    <main className="reader-csr-shell" aria-busy="true" aria-label={t('loading.aria')}>
      <span>AI</span>
      <strong>{t('loading.reader')}</strong>
    </main>
  )
}

export function ReaderAppClient() {
  const [mounted, setMounted] = useState(false)
  const feedHubBrief = useFeedHubBrief()
  const searchParams = useSearchParams()
  const brief = feedHubBrief.data?.brief ?? dailyBrief

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <I18nProvider>
        <ReaderAppClientFallback />
      </I18nProvider>
    )
  }

  const variant = normalizeVariant(searchParams.get('variant'))
  const theme = normalizeTheme(searchParams.get('theme'))

  return (
    <I18nProvider>
      {theme === 'source-desk' ? (
        <TodayPrototype brief={brief} variant={variant} />
      ) : (
        <StandardReaderPrototype brief={brief} showThemeSwitch />
      )}
    </I18nProvider>
  )
}
