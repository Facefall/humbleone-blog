'use client'

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
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

function getCategoryLabel(t: (key: string) => string, article: StandardArticle) {
  if (article.sourceFamily) {
    return t(`categories.${article.sourceFamily}`)
  }

  return article.standardCategory
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
  const { t } = useTranslation('reader')
  const panelRef = useRef<HTMLElement>(null)
  const categoryLabel = getCategoryLabel(t, article)

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
    <aside ref={panelRef} className="standard-article-panel" aria-label={t('article.aria')}>
      <header className="standard-article-context">
        <div>
          <span>{categoryLabel}</span>
          <i>·</i>
          <span>{article.sourceName}</span>
        </div>
        <button type="button" aria-label={t('article.minimizeAria')} onClick={onClose}>
          <XMarkIcon />
        </button>
      </header>
      <section className="standard-article-lede">
        {article.importance === 'breaking' ? (
          <span className="standard-breaking">● {t('feed.breaking')}</span>
        ) : null}
        <h2>{article.title}</h2>
        <div className="standard-article-time">
          <span>
            <ClockIcon />
            {article.relativeTime}
          </span>
          <span>{t('feed.readTime', { minutes: article.readTime })}</span>
        </div>
      </section>
      {article.imageUrl ? <img className="standard-detail-image" src={article.imageUrl} alt="" loading="lazy" /> : null}
      <section className="standard-summary-block">
        <p>{article.summary}</p>
        <a href={article.url}>
          {t('article.readFull')}
          <ExternalIcon />
        </a>
      </section>
      <section className="standard-analysis-block">
        <header>
          <BotIcon />
          <span>{t('article.aiAnalysis')}</span>
          <strong>{t('article.sentimentPositive')}</strong>
        </header>
        <p>{article.reader.aiSummary}</p>
        <div className="standard-analysis-feedback">
          <span>{t('article.helpfulPrompt')}</span>
          <button
            type="button"
            className={feedback === 'helpful' ? 'is-selected' : undefined}
            aria-label={t('article.helpfulAria')}
            aria-pressed={feedback === 'helpful'}
            onClick={() => onFeedback('helpful')}
          >
            <ThumbsUpIcon />
          </button>
          <button
            type="button"
            className={feedback === 'not-helpful' ? 'is-selected' : undefined}
            aria-label={t('article.notHelpfulAria')}
            aria-pressed={feedback === 'not-helpful'}
            onClick={() => onFeedback('not-helpful')}
          >
            <ThumbsDownIcon />
          </button>
          <button
            type="button"
            className={copyStatus === 'copied' ? 'is-selected' : undefined}
            aria-label={t('article.copyAnalysisAria')}
            onClick={() => onCopyAnalysis?.(article.id)}
          >
            <CopyIcon />
          </button>
          {copyStatus === 'copied' ? (
            <strong className="standard-copy-status">{t('common:actions.copied')}</strong>
          ) : null}
        </div>
      </section>
      <section className="standard-key-points">
        <span>{t('article.keyPoints')}</span>
        {article.reader.sourceProof.concat(article.reader.followUpQuestions.slice(0, 2)).map((point) => (
          <p key={point}>
            <ArrowRightIcon />
            {point}
          </p>
        ))}
      </section>
      <section className="standard-related-block">
        <button type="button" aria-expanded={relatedOpen} onClick={onToggleRelated}>
          <span>{t('article.relatedStories')}</span>
          <small>{t('article.relatedCount', { count: relatedArticles.length })}</small>
          <ChevronRightIcon />
        </button>
        {relatedOpen ? (
          <div className="standard-related-list">
            {relatedArticles.length ? (
              relatedArticles.map((item) => (
                <button key={item.id} type="button" onClick={() => onSelectRelatedArticle?.(item.id)}>
                  <span>{getCategoryLabel(t, item)}</span>
                  <strong>{item.title}</strong>
                  <small>{item.sourceName}</small>
                </button>
              ))
            ) : (
              <p>{t('article.relatedEmpty')}</p>
            )}
          </div>
        ) : null}
      </section>
    </aside>
  )
}
