import type { StandardArticle } from '../../types/reader'
import { ChevronRightIcon } from './ReaderIcons'

type StandardArticleRestorePanelProps = {
  article: StandardArticle
  onRestore: () => void
}

export function StandardArticleRestorePanel({ article, onRestore }: StandardArticleRestorePanelProps) {
  return (
    <aside className="standard-article-restore-panel" aria-label="Minimized article detail">
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
