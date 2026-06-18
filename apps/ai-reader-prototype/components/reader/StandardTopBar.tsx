import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { DailyBrief } from '../../lib/prototype-data'
import { isEditableTarget } from '../../utils/readerUtils'
import { formatIssueDate } from '../../utils/standardReaderModel'
import { MagnifyingGlassIcon, XMarkIcon } from './ReaderIcons'

type StandardTopBarProps = {
  brief: DailyBrief
  feedCount: number
  resultCount?: number
  searchQuery: string
  searchInputRef?: RefObject<HTMLInputElement | null>
  actions?: ReactNode
  onSearchQueryChange: (value: string) => void
}

export function StandardTopBar({
  brief,
  feedCount,
  resultCount,
  searchQuery,
  searchInputRef,
  actions,
  onSearchQueryChange,
}: StandardTopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const localSearchInputRef = useRef<HTMLInputElement | null>(null)
  const shortcutLabel = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'

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

      if (event.key === '/' && !isEditableTarget(event.target)) {
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

  return (
    <header className="standard-topbar">
      <div className="standard-brand">
        <span>AI</span>
        <i />
        <strong>Newspaper Reader</strong>
      </div>
      <div className="standard-search" data-active={searchQuery ? 'true' : undefined}>
        <button
          type="button"
          className="standard-search-trigger"
          aria-label="Open content search"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(true)}
        >
          <MagnifyingGlassIcon />
          <span>{searchQuery || 'Search content...'}</span>
          <kbd>{shortcutLabel}</kbd>
        </button>
        {searchQuery ? (
          <button className="standard-search-clear" type="button" aria-label="Clear content search" onClick={() => onSearchQueryChange('')}>
            <XMarkIcon />
          </button>
        ) : null}
      </div>
      <div className="standard-status">
        <span className="standard-live-dot" />
        <span>LIVE</span>
        <span>{feedCount.toLocaleString('en-US')} FEEDS</span>
        {typeof resultCount === 'number' ? <span>{resultCount.toLocaleString('en-US')} ITEMS</span> : null}
        <span>01:36</span>
        <span>{formatIssueDate(brief.date)}</span>
      </div>
      {actions ? <div className="standard-topbar-actions">{actions}</div> : null}
      {searchOpen ? (
        <div className="standard-search-overlay" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <section
            className="standard-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Content search"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="standard-search-modal-box" role="search">
              <MagnifyingGlassIcon />
              <input
                ref={setSearchInputNode}
                aria-label="Content search"
                placeholder="Search articles, sources, summaries..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
              />
              {searchQuery ? (
                <button type="button" aria-label="Clear content search" onClick={() => onSearchQueryChange('')}>
                  <XMarkIcon />
                </button>
              ) : null}
            </div>
            <div className="standard-search-modal-body">
              <span>{typeof resultCount === 'number' ? `${resultCount.toLocaleString('en-US')} matching items` : 'Filtering current feed'}</span>
              <p>Search titles, sources, authors, summaries, tags, topics, and fetched RSS content.</p>
            </div>
            <footer className="standard-search-modal-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                Navigate feed
              </span>
              <span>
                <kbd>Esc</kbd>
                Close
              </span>
            </footer>
          </section>
        </div>
      ) : null}
    </header>
  )
}
