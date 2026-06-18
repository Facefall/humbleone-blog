'use client'

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useGsapDisclosure } from '../../hooks/useGsapMotion'
import type { StandardSource } from '../../types/reader'
import { joinClasses } from '../../utils/readerUtils'
import { ChevronDownIcon } from './ReaderIcons'

type StandardSourceGroupProps = {
  category: string
  collapsed: boolean
  items: StandardSource[]
  selectedSourceId: string | null
  onSelectSource: (sourceId: string) => void
  onToggle: (category: string) => void
}

export function StandardSourceGroup({
  category,
  collapsed,
  items,
  selectedSourceId,
  onSelectSource,
  onToggle,
}: StandardSourceGroupProps) {
  const { t } = useTranslation('reader')
  const bodyRef = useRef<HTMLDivElement>(null)
  const categoryLabel = t(`categories.${category}`, { defaultValue: category })

  useGsapDisclosure(bodyRef, !collapsed, {
    childSelector: '.standard-source-row',
    duration: 0.2,
  })

  return (
    <section className={joinClasses('standard-source-group', collapsed && 'is-collapsed')}>
      <h2>
        <button
          type="button"
          aria-label={collapsed ? t('group.expandAria', { category: categoryLabel }) : t('group.collapseAria', { category: categoryLabel })}
          aria-expanded={!collapsed}
          onClick={() => onToggle(category)}
        >
          <span>{categoryLabel}</span>
          <ChevronDownIcon />
        </button>
      </h2>
      <div ref={bodyRef} className="standard-source-group-body" aria-hidden={collapsed}>
        {items.map((source) => (
          <button
            key={source.id}
            type="button"
            className={joinClasses(
              'standard-source-row',
              source.active && 'is-active',
              selectedSourceId === source.feedSourceId && 'is-selected',
            )}
            aria-pressed={selectedSourceId === source.feedSourceId}
            onClick={() => onSelectSource(source.feedSourceId)}
          >
            <span className="standard-source-dot" />
            <span>{source.label}</span>
            {source.count ? <small>{source.count}</small> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
