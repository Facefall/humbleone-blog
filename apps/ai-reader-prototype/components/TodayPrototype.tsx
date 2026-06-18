'use client'

import { useTranslation } from 'react-i18next'
import type { DailyBrief, FeedItem, SourceDeskItem } from '../lib/prototype-data'
import { formatDeskDate } from '../lib/i18n/formatters'
import { LocaleSwitcher } from './LocaleSwitcher'
import { PrototypeSwitcher } from './PrototypeSwitcher'
import { ReaderThemeToggle } from './ReaderThemeToggle'
import {
  ClippingCard,
  DeskFooterAction,
  DeskHeaderTools,
  PinnedNoteCard,
  SourceDeskFooter,
  SourceDeskHeader,
  SourceDeskSection,
  SourceDeskShell,
  SourceSlip,
  StampBadge,
} from './source-desk/SourceDeskPrimitives'

export type PrototypeVariant = 'A' | 'B' | 'C'

function flattenItems(brief: DailyBrief) {
  return brief.sections.flatMap((section) => section.items)
}

function getFeaturedItem(brief: DailyBrief) {
  const items = flattenItems(brief)

  return items.find((item) => item.id === brief.reader.selectedItemId) ?? items.find((item) => item.id === brief.selectedItemId) ?? items[0]
}

export function TodayPrototype({
  brief,
  variant,
}: {
  brief: DailyBrief
  variant: PrototypeVariant
}) {
  const { i18n, t } = useTranslation('sourceDesk')
  const featuredItem = getFeaturedItem(brief)

  return (
    <main className={`reader-shell variant-${variant.toLowerCase()}`}>
      <div className="prototype-controls" aria-label={t('reader:prototype.controlsAria')}>
        <LocaleSwitcher />
        <ReaderThemeToggle currentTheme="source-desk" />
        <PrototypeSwitcher variant={variant} />
      </div>
      <section className="prototype-masthead" aria-labelledby="prototype-title">
        <div>
          <p className="prototype-kicker">{t(`variants.${variant}.label`)}</p>
          <h1 id="prototype-title">{brief.title}</h1>
          <p>{brief.judgment}</p>
        </div>
        <aside className="masthead-card" aria-label={t('reader:prototype.framingAria')}>
          <span>{formatDeskDate(brief.date, i18n.language)}</span>
          <strong>{t(`variants.${variant}.title`)}</strong>
          <small>{t(`variants.${variant}.note`)}</small>
        </aside>
      </section>
      <section className="three-pane-stage" aria-label={t('reader:prototype.stageAria')}>
        <SourceDesk brief={brief} compact={variant !== 'A'} />
        <TodayTimeline brief={brief} dominant={variant === 'B'} />
        <NewspaperReader brief={brief} item={featuredItem} dominant={variant === 'C'} />
      </section>
    </main>
  )
}

function SourceDesk({ brief, compact }: { brief: DailyBrief; compact?: boolean }) {
  const { t } = useTranslation('sourceDesk')
  const desk = brief.sourceDesk
  const visibleNavigation = compact ? desk.navigation.slice(0, 3) : desk.navigation
  const visibleGroups = compact ? desk.sourceGroups.slice(0, 3) : desk.sourceGroups
  const visibleSlips = compact ? desk.sourceSlips.slice(0, 5) : desk.sourceSlips
  const visibleNotes = compact ? desk.pinnedNotes.slice(0, 1) : desk.pinnedNotes.slice(0, 3)

  return (
    <SourceDeskShell density={compact ? 'compact' : 'regular'} aria-label={t('sourceDesk.deskAria')}>
      <SourceDeskHeader
        label={desk.issueLabel}
        title={compact ? t('sourceDesk.title') : desk.masthead}
        action={<DeskHeaderTools />}
      />
      <div className="desk-nav" aria-label={t('reader:prototype.deskNavAria')}>
        {visibleNavigation.map((item) => (
          <DeskChip key={item.id} item={item} />
        ))}
      </div>
      <SourceDeskSection label={t('sourceDesk.sectionLabel')} tab kind="folders">
        {visibleGroups.map((source, index) => (
          <SourceSlip key={source.id} source={source} index={index} density={compact ? 'compact' : 'regular'} />
        ))}
      </SourceDeskSection>
      <SourceDeskSection label={t('sourceDesk.watchedSources')}>
        {visibleSlips.map((source, index) => (
          <SourceSlip key={source.id} source={source} index={index} density={compact ? 'compact' : 'regular'} />
        ))}
      </SourceDeskSection>
      <SourceDeskSection label={t('sourceDesk.pinnedNotes')} action={t('common:actions.edit')} kind="notes">
        {visibleNotes.map((note) => (
          <PinnedNoteCard key={note.id} note={note} />
        ))}
      </SourceDeskSection>
      {!compact ? (
        <SourceDeskSection label={t('sourceDesk.quickAccess')} action={t('sourceDesk.dragToPin')} kind="clippings">
          {desk.quickAccess.slice(0, 4).map((item) => (
            <ClippingCard key={item.id} item={item} />
          ))}
        </SourceDeskSection>
      ) : null}
      <SourceDeskFooter>
        <DeskFooterAction>{desk.footerAction.label}</DeskFooterAction>
        {!compact ? <span>{desk.footerAction.secondaryLabel}</span> : null}
      </SourceDeskFooter>
    </SourceDeskShell>
  )
}

function DeskChip({ item }: { item: SourceDeskItem }) {
  return (
    <span className={`desk-chip state-${item.state} health-${item.health}`}>
      {item.label}
      {item.count ? <b>{item.count}</b> : null}
    </span>
  )
}

function TodayTimeline({ brief, dominant }: { brief: DailyBrief; dominant?: boolean }) {
  const { t } = useTranslation('sourceDesk')

  return (
    <section className={`today-timeline panel ${dominant ? 'is-dominant' : ''}`} aria-label={t('timeline.aria')}>
      <header className="panel-header">
        <div>
          <p className="panel-label">{t('timeline.label')}</p>
          <h2>{dominant ? t('timeline.morningOrder') : t('timeline.todayPicks')}</h2>
        </div>
        <StampBadge>{t('timeline.filed', { count: brief.itemCount })}</StampBadge>
      </header>
      <div className="timeline-list">
        {brief.sections.map((section) => (
          <section key={section.id} className="timeline-section" aria-label={section.title}>
            <header>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </header>
            {section.items.map((item, index) => (
              <TimelineCard key={item.id} item={item} index={index} dominant={dominant} />
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}

function TimelineCard({ item, index, dominant }: { item: FeedItem; index: number; dominant?: boolean }) {
  const { t } = useTranslation('reader')

  return (
    <article className="timeline-card">
      <div className="timeline-index">{String(index + 1).padStart(2, '0')}</div>
      <div>
        <div className="timeline-meta">
          <span>{item.sourceName}</span>
          <span>{item.relativeTime}</span>
        </div>
        <h4>{item.title}</h4>
        <p>{dominant ? item.whyItMatters : item.summary}</p>
        <footer>
          {item.tags.slice(0, dominant ? 4 : 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </footer>
      </div>
      <aside className="score-stamp" aria-label={t('prototype.importanceScoreAria', { score: item.importanceScore })}>
        <span>{item.importanceScore}</span>
      </aside>
    </article>
  )
}

function NewspaperReader({
  brief,
  item,
  dominant,
}: {
  brief: DailyBrief
  item?: FeedItem
  dominant?: boolean
}) {
  const { t } = useTranslation('sourceDesk')

  if (!item) {
    return (
      <article className={`newspaper-reader panel ${dominant ? 'is-dominant' : ''}`}>
        <p className="panel-label">{t('newspaper.label')}</p>
        <h2>{t('newspaper.emptyTitle')}</h2>
        <p>{t('newspaper.emptyHint')}</p>
      </article>
    )
  }

  return (
    <article className={`newspaper-reader panel ${dominant ? 'is-dominant' : ''}`} aria-label={t('newspaper.aria')}>
      <header className="newspaper-flag">
        <p>{brief.reader.masthead}</p>
        <span>{brief.reader.editionLine}</span>
      </header>
      <p className="reader-kicker">{item.reader.kicker}</p>
      <h2>{item.reader.headline}</h2>
      <p className="reader-standfirst">{item.reader.aiSummary}</p>
      <div className="newspaper-body">
        {item.reader.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="proof-box" aria-label={t('newspaper.sourceProof')}>
        <h3>{t('newspaper.sourceProof')}</h3>
        {item.reader.sourceProof.map((proof) => (
          <p key={proof}>{proof}</p>
        ))}
      </section>
      <footer className="reader-footer">
        <span>{item.status}</span>
        <span>{item.language}</span>
        <span>{item.evidenceLevel}</span>
      </footer>
    </article>
  )
}
