'use client'

import { useRef } from 'react'
import { useGsapElementEntrance } from '../../hooks/useGsapMotion'
import type { StandardArticle } from '../../types/reader'
import { ChevronRightIcon } from './ReaderIcons'

type StandardArticleRestorePanelProps = {
  article: StandardArticle
  onRestore: () => void
}

export function StandardArticleRestorePanel({ article, onRestore }: StandardArticleRestorePanelProps) {
  const panelRef = useRef<HTMLElement>(null)

  useGsapElementEntrance(panelRef, article.id, {
    duration: 0.18,
    scale: 0.99,
    x: 8,
    y: 0,
  })

  return (
    <aside ref={panelRef} className="standard-article-restore-panel" aria-label="Minimized article detail">
      <button type="button" onClick={onRestore}>
        <span>Reader minimized</span>
        <strong>{article.title}</strong>
        <small>
          Restore detail
          <ChevronRightIcon />
        </small>
      </button>
    </aside>
  )
}
