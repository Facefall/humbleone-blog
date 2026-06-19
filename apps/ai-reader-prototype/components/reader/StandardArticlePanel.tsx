'use client'

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useArticleBrief } from '../../hooks/api/useArticleBrief'
import { useArticleTranslation } from '../../hooks/api/useArticleTranslation'
import { useGsapStaggerReveal } from '../../hooks/useGsapMotion'
import type { StandardArticle, StandardFeedback } from '../../types/reader'
import {
  BotIcon,
  BookOpenIcon,
  ChevronRightIcon,
  ClockIcon,
  CopyIcon,
  ExternalIcon,
  ArrowRightIcon,
  LanguageIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from './ReaderIcons'
import { ReaderAsyncBlock } from './ReaderAsyncBlock'

type ArticleDetailView = 'original' | 'translation' | 'brief'

type StandardArticlePanelProps = {
  article: StandardArticle
  feedback: StandardFeedback
  copyStatus?: 'idle' | 'copied'
  relatedArticles?: StandardArticle[]
  relatedOpen?: boolean
  onCopyAnalysis?: (articleId: string) => void
  onFeedback: (value: Exclude<StandardFeedback, null>) => void
  onSelectRelatedArticle?: (articleId: string) => void
  onToggleRelated?: () => void
}

const articleViewOptions = [
  { id: 'original', icon: BookOpenIcon },
  { id: 'translation', icon: LanguageIcon },
  { id: 'brief', icon: BotIcon },
] satisfies Array<{ id: ArticleDetailView; icon: typeof BookOpenIcon }>

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
  onCopyAnalysis,
  onFeedback,
  onSelectRelatedArticle,
  onToggleRelated,
}: StandardArticlePanelProps) {
  const { t } = useTranslation('reader')
  const panelRef = useRef<HTMLElement>(null)
  const [activeView, setActiveView] = useState<ArticleDetailView>('original')
  const translation = useArticleTranslation(article, activeView === 'translation')
  const brief = useArticleBrief(article, activeView === 'brief')
  const categoryLabel = getCategoryLabel(t, article)

  useGsapStaggerReveal(panelRef, article.id, {
    selector:
      '.standard-article-context, .standard-article-lede, .standard-detail-image, .standard-article-view, .standard-related-block',
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
  useGsapStaggerReveal(panelRef, `${article.id}:${activeView}`, {
    selector:
      '.standard-article-view > .standard-summary-block, .standard-article-view > .standard-fulltext-block, .standard-article-view > .standard-translation-block, .standard-article-view > .standard-analysis-block, .standard-article-view > .standard-key-points',
    duration: 0.2,
    stagger: 0.026,
    x: 6,
    y: 0,
  })

  return (
    <aside ref={panelRef} className="standard-article-panel" aria-label={t('article.aria')}>
      <header className="standard-article-context">
        <div className="standard-article-context-meta">
          <span>{categoryLabel}</span>
          <i>·</i>
          <span>{article.sourceName}</span>
        </div>
        <ArticleViewSwitcher activeView={activeView} onChange={setActiveView} />
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
        </div>
      </section>
      <div className="standard-article-view">
        {activeView === 'original' ? <ArticleOriginalView article={article} /> : null}
        {activeView === 'translation' ? <ArticleTranslationView translation={translation} /> : null}
        {activeView === 'brief' ? (
          <ArticleBriefView
            article={article}
            brief={brief}
            copyStatus={copyStatus}
            feedback={feedback}
            onCopyAnalysis={onCopyAnalysis}
            onFeedback={onFeedback}
          />
        ) : null}
      </div>
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

function ArticleViewSwitcher({
  activeView,
  onChange,
}: {
  activeView: ArticleDetailView
  onChange: (view: ArticleDetailView) => void
}) {
  const { t } = useTranslation('reader')

  return (
    <div className="standard-article-view-switcher" aria-label={t('article.viewSwitcherAria')} role="group">
      {articleViewOptions.map((option) => {
        const Icon = option.icon
        const active = option.id === activeView

        return (
          <button
            key={option.id}
            type="button"
            className={active ? 'is-active' : undefined}
            aria-pressed={active}
            onClick={() => onChange(option.id)}
          >
            <Icon />
            <span>{t(`article.views.${option.id}`)}</span>
          </button>
        )
      })}
    </div>
  )
}

function ArticleOriginalView({ article }: { article: StandardArticle }) {
  const { t } = useTranslation('reader')

  return (
    <>
      <section className="standard-summary-block">
        <p>{article.summary}</p>
        <a href={article.url}>
          {t('article.readFull')}
          <ExternalIcon />
        </a>
      </section>
      <section className="standard-fulltext-block">
        <span>{t('article.fullText')}</span>
        {article.reader.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </>
  )
}

function ArticleTranslationView({
  translation,
}: {
  translation: ReturnType<typeof useArticleTranslation>
}) {
  const { t } = useTranslation('reader')
  const targetLabel = translation.targetLanguage === 'zh-CN'
    ? t('article.translationChinese')
    : t('article.translationEnglish')

  return (
    <section className="standard-translation-block">
      <span>{t('article.translationTitle')}</span>
      {translation.isLoading || translation.status === 'idle' ? (
        <ReaderAsyncBlock
          label={t('article.translationLoading')}
          detail={t('article.translationLoadingHint', { target: targetLabel })}
        />
      ) : null}
      {translation.isError ? (
        <div className="standard-translation-state is-error">
          <strong>{t('article.translationFailed')}</strong>
          <p>{translation.error?.message ?? t('article.translationFailedHint')}</p>
        </div>
      ) : null}
      {translation.data ? (
        <article className="standard-translated-article">
          <small>
            {t('article.translationProviderMeta', {
              model: translation.data.model,
              target: targetLabel,
            })}
            {translation.data.cached ? ` · ${t('article.translationCached')}` : ''}
          </small>
          <h3>{translation.data.title}</h3>
          {translation.data.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
      ) : null}
    </section>
  )
}

function ArticleBriefView({
  article,
  brief,
  copyStatus,
  feedback,
  onCopyAnalysis,
  onFeedback,
}: {
  article: StandardArticle
  brief: ReturnType<typeof useArticleBrief>
  copyStatus: 'idle' | 'copied'
  feedback: StandardFeedback
  onCopyAnalysis?: (articleId: string) => void
  onFeedback: (value: Exclude<StandardFeedback, null>) => void
}) {
  const { t } = useTranslation('reader')
  const briefBody = brief.data?.body ?? article.reader.aiSummary
  const briefKeyPoints = brief.data?.keyPoints ?? article.reader.sourceProof.concat(article.reader.followUpQuestions.slice(0, 2))

  return (
    <>
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
          <strong>{brief.data?.cached ? t('article.briefCached') : t('article.briefChinese')}</strong>
        </header>
        {brief.isLoading || brief.status === 'idle' ? (
          <ReaderAsyncBlock
            label={t('article.briefLoading')}
            detail={t('article.briefLoadingHint')}
          />
        ) : null}
        {brief.isError ? (
          <div className="standard-translation-state is-error">
            <strong>{t('article.briefFailed')}</strong>
            <p>{brief.error?.message ?? t('article.briefFailedHint')}</p>
          </div>
        ) : null}
        <p>{briefBody}</p>
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
            className={`standard-copy-analysis-button${copyStatus === 'copied' ? ' is-selected' : ''}`}
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
        {briefKeyPoints.map((point) => (
          <p key={point}>
            <ArrowRightIcon />
            {point}
          </p>
        ))}
      </section>
    </>
  )
}
