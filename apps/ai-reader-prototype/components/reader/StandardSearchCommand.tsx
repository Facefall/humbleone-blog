'use client'

import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { MagnifyingGlassIcon, XMarkIcon } from './ReaderIcons'

type StandardSearchCommandProps = {
  resultCount?: number
  searchInputRef?: RefObject<HTMLInputElement | null>
  searchQuery: string
  onSearchQueryChange: (value: string) => void
}

export function StandardSearchCommand({
  resultCount,
  searchInputRef,
  searchQuery,
  onSearchQueryChange,
}: StandardSearchCommandProps) {
  const { t } = useTranslation('reader')
  const [searchOpen, setSearchOpen] = useState(false)
  const localSearchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!searchOpen) {
      return
    }

    localSearchInputRef.current?.focus()
    localSearchInputRef.current?.select()
  }, [searchOpen])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

      if (isSearchShortcut) {
        event.preventDefault()
        setSearchOpen(true)
        return
      }

      if (event.key === 'Escape' && searchOpen) {
        event.preventDefault()
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [searchOpen])

  function setSearchInputNode(node: HTMLInputElement | null) {
    localSearchInputRef.current = node

    if (searchInputRef) {
      searchInputRef.current = node
    }
  }

  if (!searchOpen) {
    return null
  }

  return (
    <div className="standard-search-overlay" role="presentation" onMouseDown={() => setSearchOpen(false)}>
      <section
        className="standard-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('topbar.searchDialogAria')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="standard-search-modal-box" role="search">
          <MagnifyingGlassIcon />
          <input
            ref={setSearchInputNode}
            aria-label={t('topbar.searchInputAria')}
            placeholder={t('topbar.searchInputPlaceholder')}
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          {searchQuery ? (
            <button type="button" aria-label={t('topbar.searchClearAria')} onClick={() => onSearchQueryChange('')}>
              <XMarkIcon />
            </button>
          ) : null}
        </div>
        <div className="standard-search-modal-body">
          <span>
            {typeof resultCount === 'number'
              ? t('topbar.matchingItems', { count: resultCount })
              : t('topbar.filteringFeed')}
          </span>
          <p>{t('topbar.searchHint')}</p>
        </div>
        <footer className="standard-search-modal-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            {t('topbar.navigateFeed')}
          </span>
          <span>
            <kbd>Esc</kbd>
            {t('common:actions.close')}
          </span>
        </footer>
      </section>
    </div>
  )
}
