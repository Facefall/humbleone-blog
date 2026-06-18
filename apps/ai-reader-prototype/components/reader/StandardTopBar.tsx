import type { ReactNode, Ref } from 'react'
import type { DailyBrief } from '../../lib/prototype-data'
import { formatIssueDate } from '../../utils/standardReaderModel'
import { MagnifyingGlassIcon, XMarkIcon } from './ReaderIcons'

type StandardTopBarProps = {
  brief: DailyBrief
  feedCount: number
  resultCount?: number
  searchQuery: string
  searchInputRef?: Ref<HTMLInputElement>
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
  return (
    <header className="standard-topbar">
      <div className="standard-brand">
        <span>AI</span>
        <i />
        <strong>Newspaper Reader</strong>
      </div>
      <div className="standard-search" role="search" data-active={searchQuery ? 'true' : undefined}>
        <MagnifyingGlassIcon />
        <input
          ref={searchInputRef}
          aria-label="Search articles, sources, topics"
          placeholder="search articles, sources, topics..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
        {searchQuery ? (
          <button type="button" aria-label="Clear search" onClick={() => onSearchQueryChange('')}>
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
    </header>
  )
}
