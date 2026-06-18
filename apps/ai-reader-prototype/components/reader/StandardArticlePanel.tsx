'use client'

import { useRef } from 'react'
import { useGsapStaggerReveal } from '../../hooks/useGsapMotion'
import type { StandardArticle, StandardFeedback } from '../../types/reader'
import {
  BotIcon,
  ChevronRightIcon,
  ClockIcon,
  CopyIcon,
  ExternalIcon,
  ArrowRightIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XMarkIcon,
} from './ReaderIcons'

  
type StandardArticlePanelProps = {
  article: StandardArticle
  feedback: StandardFeedback
  copyStatus?: 'idle' | 'copied'
  relatedArticles?: StandardArticle[]
  relatedOpen?: boolean
  onClose: () => void
  onCopyAnalysis?: (articleId: string) => void
  onFeedback: (value: Exclude<StandardFeedback, null>) => void
  onSelectRelatedArticle?: (articleId: string) => void
  onToggleRelated?: () => void
}

export function StandardArticlePanel({
  article,
  feedback,
  copyStatus = 'idle',
  relatedArticles = [],
  relatedOpen = false,
  onClose,
  onCopyAnalysis,
  onFeedback,
  onSelectRelatedArticle,
  onToggleRelated,
}: StandardArticlePanelProps) {
  const panelRef = useRef<HTMLElement>(null)

  useGsapStaggerReveal(panelRef, article.id, {
    selector:
      '.standard-article-context, .standard-article-lede, .standard-detail-image, .standard-summary-block, .standard-analysis-block, .standard-key-points, .standard-related-block',
    duration: 0.24,
    stagger: 0.026,
    x: 10,
    y: 0,
  })
  useGsapStaggerReveal(panelRef, copyStatus, {
    selector: '.standard-copy-status',
    duration: 0.16,
    scale: 0.94,
    stagger: 0,
    y: -2,
  })
  useGsapStaggerReveal(panelRef, relatedOpen ? `${article.id}:related` : null, {
    selector: '.standard-related-list button',
    duration: 0.18,
    stagger: 0.024,
    x: 5,
    y: 0,
  })

  return (
    <aside ref={panelRef} className="standard-article-panel" aria-label="Selected article">
      <header className="standard-article-context">
        <div>
          <span>{article.standardCategory}</span>
          <i>·</i>
          <span>{article.sourceName}</span>
        </div>
        <button type="button" aria-label="Minimize detail panel" onClick={onClose}>
          <XMarkIcon />
        </button>
      </header>
      <section className="standard-article-lede">
        {article.importance === 'breaking' ? <span className="standard-breaking">● Breaking</span> : null}
        <h2>{article.title}</h2>
        <div className="standard-article-time">
          <span>
            <ClockIcon />
            {article.relativeTime}
          </span>
          <span>{article.readTime}m read</span>
        </div>
      </section>
      {article.imageUrl ? <img className="standard-detail-image" src={article.imageUrl} alt="" loading="lazy" /> : null}
      <section className="standard-summary-block">
        <p>{article.summary}</p>
        <a href={article.url}>
          Read full article
          <ExternalIcon />
        </a>
      </section>
      <section className="standard-analysis-block">
        <header>
          <BotIcon />
          <span>AI Analysis</span>
          <strong>positive</strong>
        </header>
        <p>{article.reader.aiSummary}</p>
        <div className="standard-analysis-feedback">
          <span>Was this helpful?</span>
          <button
            type="button"
            className={feedback === 'helpful' ? 'is-selected' : undefined}
            aria-label="Helpful"
            aria-pressed={feedback === 'helpful'}
            onClick={() => onFeedback('helpful')}
          >
            <ThumbsUpIcon />
          </button>
          <button
            type="button"
            className={feedback === 'not-helpful' ? 'is-selected' : undefined}
            aria-label="Not helpful"
            aria-pressed={feedback === 'not-helpful'}
            onClick={() => onFeedback('not-helpful')}
          >
            <ThumbsDownIcon />
          </button>
          <button
            type="button"
            className={copyStatus === 'copied' ? 'is-selected' : undefined}
            aria-label="Copy analysis"
            onClick={() => onCopyAnalysis?.(article.id)}
          >
            <CopyIcon />
          </button>
          {copyStatus === 'copied' ? <strong className="standard-copy-status">Copied</strong> : null}
        </div>
      </section>
      <section className="standard-key-points">
        <span>Key Points</span>
        {article.reader.sourceProof.concat(article.reader.followUpQuestions.slice(0, 2)).map((point) => (
          <p key={point}>
            <ArrowRightIcon />
            {point}
          </p>
        ))}
      </section>
      <section className="standard-related-block">
        <button type="button" aria-expanded={relatedOpen} onClick={onToggleRelated}>
          <span>Related Stories</span>
          <small>{relatedArticles.length} articles</small>
          <ChevronRightIcon />
        </button>
        {relatedOpen ? (
          <div className="standard-related-list">
            {relatedArticles.length ? (
              relatedArticles.map((item) => (
                <button key={item.id} type="button" onClick={() => onSelectRelatedArticle?.(item.id)}>
                  <span>{item.standardCategory}</span>
                  <strong>{item.title}</strong>
                  <small>{item.sourceName}</small>
                </button>
              ))
            ) : (
              <p>No close signals in this brief.</p>
            )}
          </div>
        ) : null}
      </section>
    </aside>
  )
}
