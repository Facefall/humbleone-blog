'use client'

import { useMemo, useRef, useState } from 'react'
import countBy from 'lodash/countBy'
import { useTranslation } from 'react-i18next'
import { useGsapElementEntrance, useGsapElementPulse } from '../../hooks/useGsapMotion'
import { useSourceCollections } from '../../hooks/useSourceCollections'
import { useSourcePanelPreferences } from '../../hooks/useSourcePanelPreferences'
import type { SourceCollectionConfig, SourceContentType } from '../../lib/prototype-data'
import type { SourceCollection, StandardLibraryFilter, StandardSource } from '../../types/reader'
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
import { StandardSourceGroupsToolbar } from './StandardSourceGroupsToolbar'
import { StandardSourceInspector } from './StandardSourceInspector'

type StandardSourcesPanelProps = {
  sources: StandardSource[]
  activeSources: number
  collapsing?: boolean
  configuredCollections?: SourceCollectionConfig[]
  libraryCounts?: Record<StandardLibraryFilter, number>
  libraryFilter?: StandardLibraryFilter | null
  selectedSourceId: string | null
  onCollapse: () => void
  onSelectLibraryFilter?: (filter: StandardLibraryFilter) => void
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
  configuredCollections,
  libraryCounts = { bookmarks: 0, favorites: 0 },
  libraryFilter = null,
  selectedSourceId,
  onCollapse,
  onSelectLibraryFilter,
  onSelectSource,
}: StandardSourcesPanelProps) {
  const { t } = useTranslation('reader')
  const panelRef = useRef<HTMLElement>(null)
  const [selectedContentType, setSelectedContentType] = useState<SourceContentFilter>('all')
  const [filterMenuMotionKey, setFilterMenuMotionKey] = useState(0)
  const sourceCollections = useSourceCollections(sources, configuredCollections)
  const groupIds = useMemo(
    () => sourceCollections.collections.map((collection) => collection.id),
    [sourceCollections.collections],
  )
  const sourcePanelPreferences = useSourcePanelPreferences(groupIds)
  const { collapsedGroups, showActiveOnly } = sourcePanelPreferences
  const contentCounts = useMemo(() => {
    const counts = countBy(sourceCollections.sources, 'contentType') as Partial<Record<SourceContentType, number>>

    return {
      all: sourceCollections.sources.length,
      article: counts.article ?? 0,
      image: counts.image ?? 0,
      social: counts.social ?? 0,
      video: counts.video ?? 0,
    } satisfies Record<SourceContentFilter, number>
  }, [sourceCollections.sources])
  const visibleSources = useMemo(() => {
    const contentFilteredSources =
      selectedContentType === 'all'
        ? sourceCollections.sources
        : sourceCollections.sources.filter((source) => source.contentType === selectedContentType)

    return showActiveOnly ? contentFilteredSources.filter((source) => source.active) : contentFilteredSources
  }, [selectedContentType, showActiveOnly, sourceCollections.sources])
  const sourceGroups = useMemo(() => {
    const visibleSourceById = new Map(visibleSources.map((source) => [source.feedSourceId, source]))

    return sourceCollections.collections
      .map((collection) => ({
        collection,
        items: collection.sourceIds
          .map((sourceId) => visibleSourceById.get(sourceId))
          .filter((source): source is StandardSource => Boolean(source)),
      }))
  }, [selectedContentType, showActiveOnly, sourceCollections.collections, visibleSources])

  function getCollectionLabel(collection: SourceCollection) {
    return collection.systemCategory
      ? t(`categories.${collection.systemCategory}`, { defaultValue: collection.name })
      : collection.name
  }

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
      <StandardSourceGroupsToolbar groupCount={sourceCollections.collections.length} />
      <div className="standard-source-groups">
        {sourceGroups.map(({ collection, items }) => {
          const isCollapsed = collapsedGroups.has(collection.id)
          const collectionLabel = getCollectionLabel(collection)

          return (
            <StandardSourceGroup
              key={collection.id}
              collection={collection}
              collectionLabel={collectionLabel}
              collapsed={isCollapsed}
              items={items}
              selectedSourceId={selectedSourceId}
              onSelectSource={onSelectSource}
              onToggle={sourcePanelPreferences.actions.toggleGroup}
            />
          )
        })}
      </div>
      <StandardSourceInspector
        libraryCounts={libraryCounts}
        libraryFilter={libraryFilter}
        onSelectLibraryFilter={onSelectLibraryFilter}
      />
    </aside>
  )
}
