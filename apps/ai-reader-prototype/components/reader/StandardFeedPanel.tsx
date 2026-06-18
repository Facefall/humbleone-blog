import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { BookmarkIcon, ClockIcon, ExternalIcon, MessageIcon, ShareIcon } from './ReaderIcons'
import { activateFromKeyboard, joinClasses } from '../../utils/readerUtils'
import { categoryTabs } from '../../utils/standardReaderModel'
import type { StandardActionNotice, StandardArticle } from '../../types/reader'

type StandardFeedPanelProps = {
  articles: StandardArticle[]
  selectedArticleId: string
  selectedCategory: string
  selectedSourceId: string | null
  articlePanelOpen?: boolean
  savedArticleIds?: Set<string>
  actionNotice?: StandardActionNotice
  onSelectArticle: (articleId: string) => void
  onSelectCategory: (category: string) => void
  onClearSource: () => void
  onRestoreArticlePanel?: () => void
  onSaveArticle?: (articleId: string) => void
  onShareArticle?: (articleId: string) => void
}

const emptySavedArticleIds = new Set<string>()

export function StandardFeedPanel({
  articles,
  selectedArticleId,
  selectedCategory,
  selectedSourceId,
  articlePanelOpen = true,
  savedArticleIds = emptySavedArticleIds,
  actionNotice = null,
  onSelectArticle,
  onSelectCategory,
  onClearSource,
  onRestoreArticlePanel,
  onSaveArticle,
  onShareArticle,
}: StandardFeedPanelProps) {
  const selectedCardRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    selectedCardRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedArticleId])

  return (
    <section className="standard-feed-panel" aria-label="Today feed">
      <nav className="standard-category-tabs" aria-label="Feed categories">
        {categoryTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === selectedCategory ? 'is-active' : undefined}
            aria-selected={tab === selectedCategory}
            onClick={() => onSelectCategory(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      {selectedSourceId ? (
        <div className="standard-filter-strip">
          <span>Source filter active</span>
          <button type="button" onClick={onClearSource}>
            Clear
          </button>
        </div>
      ) : null}
      {!articlePanelOpen ? (
        <div className="standard-detail-restore-strip">
          <span>Article detail minimized</span>
          <button type="button" onClick={onRestoreArticlePanel}>
            Restore
          </button>
        </div>
      ) : null}
      <div className="standard-feed-list">
        {articles.length ? (
          articles.map((article, index) => {
            const isSaved = savedArticleIds.has(article.id)
            const articleNotice = actionNotice?.articleId === article.id ? actionNotice : null

            return (
              <article
                key={article.id}
                ref={selectedArticleId === article.id ? selectedCardRef : undefined}
                className={joinClasses(
                  'standard-feed-card',
                  `importance-${article.importance}`,
                  selectedArticleId === article.id && 'is-selected',
                  isSaved && 'is-saved',
                )}
                style={{ '--standard-card-index': index } as CSSProperties}
                role="button"
                tabIndex={0}
                aria-current={selectedArticleId === article.id ? 'true' : undefined}
                onClick={() => onSelectArticle(article.id)}
                onKeyDown={(event) => activateFromKeyboard(event, () => onSelectArticle(article.id))}
              >
                {article.importance === 'breaking' ? <span className="standard-breaking">● Breaking</span> : null}
                <div className="standard-feed-card-body">
                  <div className="standard-feed-card-main">
                    <div className="standard-feed-meta">
                      <span>{article.standardCategory}</span>
                      <i>·</i>
                      <span>{article.sourceName}</span>
                    </div>
                    <h2>{article.title}</h2>
                    {article.importance !== 'standard' ? <p>{article.summary}</p> : null}
                    {article.imageUrl && article.importance !== 'standard' ? (
                      <img src={article.imageUrl} alt="" loading="lazy" />
                    ) : null}
                    <footer>
                      <span>
                        <ClockIcon />
                        {article.relativeTime}
                      </span>
                      <span>{article.readTime}m read</span>
                      <span>
                        <MessageIcon />
                        {article.commentCount}
                      </span>
                      {articleNotice ? (
                        <span className={`standard-feed-card-status tone-${articleNotice.tone}`} aria-live="polite">
                          {articleNotice.label}
                        </span>
                      ) : null}
                    </footer>
                  </div>
                  <div className="standard-feed-actions" aria-label="Article actions">
                    <button
                      type="button"
                      className={isSaved ? 'is-active' : undefined}
                      aria-label={isSaved ? 'Remove saved article' : 'Save article'}
                      aria-pressed={isSaved}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSaveArticle?.(article.id)
                      }}
                    >
                      <BookmarkIcon />
                    </button>
                    <button
                      type="button"
                      aria-label="Copy article link"
                      onClick={(event) => {
                        event.stopPropagation()
                        onShareArticle?.(article.id)
                      }}
                    >
                      <ShareIcon />
                    </button>
                    <a href={article.url} aria-label="Open original article" onClick={(event) => event.stopPropagation()}>
                      <ExternalIcon />
                    </a>
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="standard-empty-state">
            <strong>No matching signals</strong>
            <span>Clear the source filter or search query.</span>
          </div>
        )}
      </div>
    </section>
  )
}
