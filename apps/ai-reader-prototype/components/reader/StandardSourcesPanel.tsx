'use client'

import { useMemo, useState } from 'react'
import { useSourcePanelPreferences } from '../../hooks/useSourcePanelPreferences'
import type { SourceContentType } from '../../services/sourceRegistry'
import type { StandardSource } from '../../types/reader'
import { joinClasses } from '../../utils/readerUtils'
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlayCircleIcon,
  Squares2X2Icon,
} from './ReaderIcons'
import { StandardSourceFilterMenu } from './StandardSourceFilterMenu'
import { StandardSourceInspector } from './StandardSourceInspector'

type StandardSourcesPanelProps = {
  sources: StandardSource[]
  activeSources: number
  selectedSourceId: string | null
  onCollapse: () => void
  onSelectSource: (sourceId: string) => void
}

type SourceContentFilter = SourceContentType | 'all'

const sourceContentTabs = [
  { id: 'all', label: '全部', icon: Squares2X2Icon },
  { id: 'article', label: '文章', icon: DocumentTextIcon },
  { id: 'social', label: '社交媒体', icon: ChatBubbleLeftRightIcon },
  { id: 'image', label: '图片', icon: PhotoIcon },
  { id: 'video', label: '视频', icon: PlayCircleIcon },
] satisfies Array<{ id: SourceContentFilter; label: string; icon: typeof Squares2X2Icon }>

export function StandardSourcesPanel({
  sources,
  activeSources,
  selectedSourceId,
  onCollapse,
  onSelectSource,
}: StandardSourcesPanelProps) {
  const [selectedContentType, setSelectedContentType] = useState<SourceContentFilter>('all')
  const groupNames = useMemo(() => [...new Set(sources.map((source) => source.category))], [sources])
  const sourcePanelPreferences = useSourcePanelPreferences(groupNames)
  const { collapsedGroups, showActiveOnly } = sourcePanelPreferences
  const selectedSource = sources.find((source) => source.feedSourceId === selectedSourceId)
  const contentFilteredSources =
    selectedContentType === 'all' ? sources : sources.filter((source) => source.contentType === selectedContentType)
  const visibleSources = showActiveOnly
    ? contentFilteredSources.filter((source) => source.active)
    : contentFilteredSources
  const contentCounts = sourceContentTabs.reduce<Record<SourceContentFilter, number>>(
    (acc, tab) => {
      acc[tab.id] = tab.id === 'all' ? sources.length : sources.filter((source) => source.contentType === tab.id).length
      return acc
    },
    { all: 0, article: 0, social: 0, image: 0, video: 0 },
  )
  const grouped = visibleSources.reduce<Record<string, StandardSource[]>>((acc, source) => {
    acc[source.category] ??= []
    acc[source.category].push(source)
    return acc
  }, {})

  return (
    <aside className="standard-sources-panel" aria-label="Sources">
      <header>
        <div className="standard-sources-panel-heading">
          <span>Sources</span>
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
              onShowActiveOnlyChange={sourcePanelPreferences.actions.setShowActiveOnly}
            />
            <button type="button" aria-label="Collapse sources panel" onClick={onCollapse}>
              <ArrowLeftStartOnRectangleIcon />
            </button>
          </div>
        </div>
        <div className="standard-source-content-tabs" aria-label="Source content types">
          {sourceContentTabs.map((tab) => {
            const ContentIcon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                className={tab.id === selectedContentType ? 'is-active' : undefined}
                aria-label={`Show ${tab.label} sources, ${contentCounts[tab.id]} total`}
                aria-pressed={tab.id === selectedContentType}
                data-tooltip={tab.label}
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
            <section key={category} className={joinClasses('standard-source-group', isCollapsed && 'is-collapsed')}>
              <h2>
                <button
                  type="button"
                  aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${category} sources`}
                  aria-expanded={!isCollapsed}
                  onClick={() => sourcePanelPreferences.actions.toggleGroup(category)}
                >
                  <span>{category}</span>
                  <ChevronDownIcon />
                </button>
              </h2>
              <div className="standard-source-group-body">
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
        })}
      </div>
      <StandardSourceInspector sources={sources} selectedSource={selectedSource} />
    </aside>
  )
}
