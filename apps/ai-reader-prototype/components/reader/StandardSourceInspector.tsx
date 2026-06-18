'use client'

import { useTranslation } from 'react-i18next'
import type { StandardSource } from '../../types/reader'

type StandardSourceInspectorProps = {
  sources: StandardSource[]
  selectedSource?: StandardSource
}

type FetchMethod = 'official_rss' | 'official_api' | 'rsshub' | 'custom_scrape' | 'manual'

export function StandardSourceInspector({
  sources,
  selectedSource,
}: StandardSourceInspectorProps) {
  const { t } = useTranslation('reader')

  if (!selectedSource) {
    const activeCount = sources.filter((source) => source.active).length
    const failedCount = sources.filter((source) => source.health === 'failed').length

    return (
      <section className="standard-source-inspector" aria-label={t('inspector.overviewAria')}>
        <header>
          <span>{t('inspector.feedHub')}</span>
          <strong>
            {activeCount}/{sources.length}
          </strong>
        </header>
        <div className="standard-source-stat-grid">
          <span>
            {t('inspector.active')}
            <b>{activeCount}</b>
          </span>
          <span>
            {t('inspector.failed')}
            <b>{failedCount}</b>
          </span>
        </div>
        <p>{t('inspector.overviewHint')}</p>
      </section>
    )
  }

  const registry = selectedSource.registry

  return (
    <section
      className="standard-source-inspector"
      aria-label={t('inspector.registryAria', { name: selectedSource.label })}
    >
      <header>
        <span>{t('inspector.registry')}</span>
        <strong>{registry?.priority ?? 'medium'}</strong>
      </header>
      <h3>{selectedSource.label}</h3>
      <div className="standard-source-health-row">
        <span className={`health-${selectedSource.health}`}>{selectedSource.health}</span>
        <span>{registry?.evidenceLevel ?? selectedSource.evidenceLevel ?? 'manual'}</span>
      </div>
      {registry ? (
        <>
          <div className="standard-source-registry-grid">
            <span>
              {t('inspector.method')}
              <b>{t(`fetchMethod.${registry.fetchMethod as FetchMethod}`)}</b>
            </span>
            <span>
              {t('inspector.cadence')}
              <b>{registry.updateFrequency}</b>
            </span>
            <span>
              {t('inspector.adapter')}
              <b>{registry.adapter}</b>
            </span>
            <span>
              {t('inspector.language')}
              <b>
                {t(`registryLanguage.${registry.language}`, { defaultValue: registry.language })}
              </b>
            </span>
          </div>
          <div className="standard-source-tags">
            {registry.topicTags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p>{registry.whyFollow}</p>
          <small>{registry.riskNotes}</small>
          <a href={registry.officialUrl}>{t('inspector.openSource')}</a>
        </>
      ) : (
        <p>{t('inspector.noRegistry')}</p>
      )}
    </section>
  )
}
