'use client'

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGsapElementEntrance } from '../../hooks/useGsapMotion'
import type { StandardArticle } from '../../types/reader'
import { ChevronRightIcon } from './ReaderIcons'

type StandardArticleRestorePanelProps = {
  article: StandardArticle
  onRestore: () => void
}

export function StandardArticleRestorePanel({ article, onRestore }: StandardArticleRestorePanelProps) {
  const { t } = useTranslation('reader')
  const panelRef = useRef<HTMLElement>(null)

  useGsapElementEntrance(panelRef, article.id, {
    duration: 0.18,
    scale: 0.99,
    x: 8,
    y: 0,
  })

  return (
    <aside ref={panelRef} className="standard-article-restore-panel" aria-label={t('restore.aria')}>
      <button type="button" onClick={onRestore}>
        <span>{t('restore.minimized')}</span>
        <strong>{article.title}</strong>
        <small>
          {t('restore.restoreDetail')}
          <ChevronRightIcon />
        </small>
      </button>
    </aside>
  )
}
