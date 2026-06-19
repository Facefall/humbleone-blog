'use client'

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGsapDisclosure } from '../../hooks/useGsapMotion'
import type { SourceCollection, StandardSource } from '../../types/reader'
import { joinClasses } from '../../utils/readerUtils'
import { ChevronDownIcon } from './ReaderIcons'

type StandardSourceGroupProps = {
  collection: SourceCollection
  collectionLabel: string
  collapsed: boolean
  items: StandardSource[]
  selectedSourceId: string | null
  onSelectSource: (sourceId: string) => void
  onToggle: (collectionId: string) => void
}

export function StandardSourceGroup({
  collection,
  collectionLabel,
  collapsed,
  items,
  selectedSourceId,
  onSelectSource,
  onToggle,
}: StandardSourceGroupProps) {
  const { t } = useTranslation('reader')
  const bodyRef = useRef<HTMLDivElement>(null)

  useGsapDisclosure(bodyRef, !collapsed, {
    childSelector: '.standard-source-row-shell',
    duration: 0.2,
  })

  return (
    <section
      className={joinClasses(
        'standard-source-group',
        collapsed && 'is-collapsed',
      )}
    >
      <div className="standard-source-group-header">
        <button
          type="button"
          className="standard-source-group-toggle"
          aria-label={collapsed ? t('group.expandAria', { category: collectionLabel }) : t('group.collapseAria', { category: collectionLabel })}
          aria-expanded={!collapsed}
          onClick={() => onToggle(collection.id)}
        >
          <ChevronDownIcon />
          <span>{collectionLabel}</span>
          <small>{collection.sourceIds.length}</small>
        </button>
      </div>
      <div ref={bodyRef} className="standard-source-group-body" aria-hidden={collapsed}>
        {items.length ? (
          items.map((source) => (
            <StandardSourceRow
              key={`${collection.id}-${source.feedSourceId}`}
              selected={selectedSourceId === source.feedSourceId}
              source={source}
              onSelectSource={onSelectSource}
            />
          ))
        ) : (
          <div
            className="standard-source-empty-slot"
            aria-label={t('group.empty')}
          >
            <span className="is-empty-label">{t('group.empty')}</span>
          </div>
        )}
      </div>
    </section>
  )
}

type StandardSourceRowProps = {
  selected: boolean
  source: StandardSource
  onSelectSource: (sourceId: string) => void
}

function StandardSourceRow({
  selected,
  source,
  onSelectSource,
}: StandardSourceRowProps) {
  return (
    <div
      className={joinClasses(
        'standard-source-row-shell',
        selected && 'is-selected',
      )}
    >
      <button
        type="button"
        className={joinClasses('standard-source-row', source.active && 'is-active', selected && 'is-selected')}
        onClick={() => onSelectSource(source.feedSourceId)}
        aria-pressed={selected}
      >
        <span className="standard-source-dot" />
        <span>{source.label}</span>
        {source.count ? <small>{source.count}</small> : null}
      </button>
    </div>
  )
}
