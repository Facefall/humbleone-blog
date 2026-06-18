'use client'

import { useMemo, useRef, useState } from 'react'
import countBy from 'lodash/countBy'
import groupBy from 'lodash/groupBy'
import uniq from 'lodash/uniq'
import { useTranslation } from 'react-i18next'
import { useGsapElementEntrance, useGsapElementPulse } from '../../hooks/useGsapMotion'
import { useSourcePanelPreferences } from '../../hooks/useSourcePanelPreferences'
import type { SourceContentType } from '../../services/sourceRegistry'
import type { StandardSource } from '../../types/reader'
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayCircleIcon,
  Squares2X2Icon,
} from './ReaderIcons'
import { StandardSourceFilterMenu } from './StandardSourceFilterMenu'
import { StandardSourceGroup } from './StandardSourceGroup'
import { StandardSourceInspector } from './StandardSourceInspector'

type StandardSourcesPanelProps = {
  sources: StandardSource[]
  activeSources: number
  collapsing?: boolean
  selectedSourceId: string | null
  onCollapse: () => void
  onSelectSource: (sourceId: string) => void
}

type SourceContentFilter = SourceContentType | 'all'

const sourceContentTabs = [
  { id: 'all', icon: Squares2X2Icon },
  { id: 'article', icon: DocumentTextIcon },
  { id: 'social', icon: ChatBubbleLeftRightIcon },
  { id: 'image', icon: PhotoIcon },
  { id: 'video', icon: PlayCircleIcon },
] satisfies Array<{ id: SourceContentFilter; icon: typeof Squares2X2Icon }>

export function StandardSourcesPanel({
  sources,
  activeSources,
  collapsing = false,
  selectedSourceId,
  onCollapse,
  onSelectSource,
}: StandardSourcesPanelProps) {
  const { t } = useTranslation('reader')
  const panelRef = useRef<HTMLElement>(null)
  const [selectedContentType, setSelectedContentType] = useState<SourceContentFilter>('all')
  const [filterMenuMotionKey, setFilterMenuMotionKey] = useState(0)
  const groupNames = useMemo(() => uniq(sources.map((source) => source.category)), [sources])
  const sourcePanelPreferences = useSourcePanelPreferences(groupNames)
  const { collapsedGroups, showActiveOnly } = sourcePanelPreferences
  const selectedSource = sources.find((source) => source.feedSourceId === selectedSourceId)
  const contentCounts = useMemo(() => {
    const counts = countBy(sources, 'contentType') as Partial<Record<SourceContentType, number>>

    return {
      all: sources.length,
      article: counts.article ?? 0,
      image: counts.image ?? 0,
      social: counts.social ?? 0,
      video: counts.video ?? 0,
    } satisfies Record<SourceContentFilter, number>
  }, [sources])
  const visibleSources = useMemo(() => {
    const contentFilteredSources =
      selectedContentType === 'all' ? sources : sources.filter((source) => source.contentType === selectedContentType)

    return showActiveOnly ? contentFilteredSources.filter((source) => source.active) : contentFilteredSources
  }, [selectedContentType, showActiveOnly, sources])
  const grouped = useMemo(() => groupBy(visibleSources, 'category'), [visibleSources])

  useGsapElementEntrance(panelRef, 'standard-sources-panel', {
    duration: 0.22,
    scale: 0.985,
    x: -14,
    y: 0,
  })
  useGsapElementPulse(panelRef, filterMenuMotionKey, {
    duration: 0.18,
    scale: 0.988,
    x: -2,
  })

  return (
    <aside
      ref={panelRef}
      className={`standard-sources-panel${collapsing ? ' is-collapsing' : ''}`}
      aria-label={t('sources.aria')}
    >
      <header>
        <div className="standard-sources-panel-heading">
          <span>{t('sources.title')}</span>
          <div className="standard-sources-panel-actions">
            <small>
              {showActiveOnly ? visibleSources.length : activeSources}/{sources.length}
            </small>
            <StandardSourceFilterMenu
              activeCount={activeSources}
              totalCount={sources.length}
              showActiveOnly={showActiveOnly}
              onCollapseAll={sourcePanelPreferences.actions.collapseAllGroups}
              onExpandAll={sourcePanelPreferences.actions.expandAllGroups}
              onOpenChange={() => setFilterMenuMotionKey((current) => current + 1)}
              onShowActiveOnlyChange={sourcePanelPreferences.actions.setShowActiveOnly}
            />
            <button type="button" aria-label={t('sources.collapseAria')} onClick={onCollapse}>
              <ArrowLeftStartOnRectangleIcon />
            </button>
          </div>
        </div>
        <div className="standard-source-content-tabs" aria-label={t('sources.contentTypesAria')}>
          {sourceContentTabs.map((tab) => {
            const ContentIcon = tab.icon
            const label = t(`sources.tabs.${tab.id}`)

            return (
              <button
                key={tab.id}
                type="button"
                className={tab.id === selectedContentType ? 'is-active' : undefined}
                aria-label={t('sources.showTabAria', { label, count: contentCounts[tab.id] })}
                aria-pressed={tab.id === selectedContentType}
                data-tooltip={label}
                onClick={() => setSelectedContentType(tab.id)}
              >
                <ContentIcon />
                <small>{contentCounts[tab.id]}</small>
              </button>
            )
          })}
        </div>
      </header>
      <div className="standard-source-groups">
        {Object.entries(grouped).map(([category, items]) => {
          const isCollapsed = collapsedGroups.has(category)

          return (
            <StandardSourceGroup
              key={category}
              category={category}
              collapsed={isCollapsed}
              items={items}
              selectedSourceId={selectedSourceId}
              onSelectSource={onSelectSource}
              onToggle={sourcePanelPreferences.actions.toggleGroup}
            />
          )
        })}
      </div>
      <StandardSourceInspector sources={sources} selectedSource={selectedSource} />
    </aside>
  )
}
