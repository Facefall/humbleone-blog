'use client'

import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export type ReaderTheme = 'standard' | 'source-desk'

type ReaderThemeToggleProps = {
  currentTheme: ReaderTheme
}

const themeOptions: Array<{ id: ReaderTheme }> = [
  { id: 'standard' },
  { id: 'source-desk' },
]

export function ReaderThemeToggle({ currentTheme }: ReaderThemeToggleProps) {
  const router = useRouter()
  const { t } = useTranslation('common')

  function setTheme(theme: ReaderTheme) {
    const url = new URL(window.location.href)

    if (theme === 'standard') {
      url.searchParams.delete('theme')
    } else {
      url.searchParams.set('theme', theme)
    }

    const queryString = url.searchParams.toString()
    router.replace(queryString ? `${url.pathname}?${queryString}` : url.pathname, { scroll: false })
  }

  return (
    <div className="reader-theme-toggle" role="tablist" aria-label={t('theme.aria')}>
      {themeOptions.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="tab"
          aria-selected={theme.id === currentTheme}
          onClick={() => setTheme(theme.id)}
        >
          {t(`theme.${theme.id === 'source-desk' ? 'desk' : 'standard'}`)}
        </button>
      ))}
    </div>
  )
}
