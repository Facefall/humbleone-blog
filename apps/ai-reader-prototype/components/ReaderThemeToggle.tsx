'use client'

import { useRouter } from 'next/navigation'

export type ReaderTheme = 'standard' | 'source-desk'

type ReaderThemeToggleProps = {
  currentTheme: ReaderTheme
}

const themeOptions: Array<{ id: ReaderTheme; label: string }> = [
  { id: 'standard', label: 'Standard' },
  { id: 'source-desk', label: 'Desk' },
]

export function ReaderThemeToggle({ currentTheme }: ReaderThemeToggleProps) {
  const router = useRouter()

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
    <div className="reader-theme-toggle" role="tablist" aria-label="Reader theme">
      {themeOptions.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="tab"
          aria-selected={theme.id === currentTheme}
          onClick={() => setTheme(theme.id)}
        >
          {theme.label}
        </button>
      ))}
    </div>
  )
}
