'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StandardLibraryFilter } from '../../types/reader'
import { BookmarkIcon, Cog8ToothIcon, StarIcon } from './ReaderIcons'
import { StandardReaderSettingsDialog } from './StandardReaderSettingsDialog'

type StandardSourceInspectorProps = {
  libraryCounts?: Record<StandardLibraryFilter, number>
  libraryFilter?: StandardLibraryFilter | null
  onSelectLibraryFilter?: (filter: StandardLibraryFilter) => void
}

export function StandardSourceInspector({
  libraryCounts = { bookmarks: 0, favorites: 0 },
  libraryFilter = null,
  onSelectLibraryFilter,
}: StandardSourceInspectorProps) {
  const { t } = useTranslation('reader')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <section className="standard-source-inspector" aria-label={t('inspector.overviewAria')}>
      <header>
        <span>{t('inspector.quickAccess')}</span>
      </header>
      <div className="standard-quick-access-list" aria-label={t('inspector.quickAccessAria')}>
        <button
          type="button"
          className={libraryFilter === 'bookmarks' ? 'is-active' : undefined}
          aria-pressed={libraryFilter === 'bookmarks'}
          onClick={() => onSelectLibraryFilter?.('bookmarks')}
        >
          <BookmarkIcon />
          <span>{t('inspector.bookmarks')}</span>
          <b>{libraryCounts.bookmarks}</b>
        </button>
        <button
          type="button"
          className={libraryFilter === 'favorites' ? 'is-active' : undefined}
          aria-pressed={libraryFilter === 'favorites'}
          onClick={() => onSelectLibraryFilter?.('favorites')}
        >
          <StarIcon />
          <span>{t('inspector.favorites')}</span>
          <b>{libraryCounts.favorites}</b>
        </button>
        <button
          type="button"
          className={settingsOpen ? 'is-active' : undefined}
          aria-haspopup="dialog"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(true)}
        >
          <Cog8ToothIcon />
          <span>{t('inspector.settings')}</span>
          <b>{t('inspector.settingsMeta')}</b>
        </button>
      </div>
      <p>{t('inspector.overviewHint')}</p>
      <StandardReaderSettingsDialog currentTheme="standard" open={settingsOpen} onOpenChange={setSettingsOpen} />
    </section>
  )
}
