'use client'

import { useMemo } from 'react'
import { useSourcePanelPreferences } from '../../hooks/useSourcePanelPreferences'
import type { StandardSource } from '../../types/reader'
import { joinClasses } from '../../utils/readerUtils'
import { ArrowLeftStartOnRectangleIcon, ChevronDownIcon } from './ReaderIcons'
import { StandardSourceFilterMenu } from './StandardSourceFilterMenu'
import { StandardSourceInspector } from './StandardSourceInspector'

type StandardSourcesPanelProps = {
  sources: StandardSource[]
  activeSources: number
  selectedSourceId: string | null
  onCollapse: () => void
  onSelectSource: (sourceId: string) => void
}

export function StandardSourcesPanel({
  sources,
  activeSources,
  selectedSourceId,
  onCollapse,
  onSelectSource,
}: StandardSourcesPanelProps) {
  const groupNames = useMemo(() => [...new Set(sources.map((source) => source.category))], [sources])
  const sourcePanelPreferences = useSourcePanelPreferences(groupNames)
  const { collapsedGroups, showActiveOnly } = sourcePanelPreferences
  const selectedSource = sources.find((source) => source.feedSourceId === selectedSourceId)
  const visibleSources = showActiveOnly ? sources.filter((source) => source.active) : sources
  const grouped = visibleSources.reduce<Record<string, StandardSource[]>>((acc, source) => {
    acc[source.category] ??= []
    acc[source.category].push(source)
    return acc
  }, {})

  return (
    <aside className="standard-sources-panel" aria-label="Sources">
      <header>
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
