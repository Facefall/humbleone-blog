'use client'

import { useRef } from 'react'
import type { DailyBrief } from '../../lib/prototype-data'
import { ReaderThemeToggle } from '../ReaderThemeToggle'
import { ResizableReaderLayout } from './ResizableReaderLayout'
import type { ResizableReaderLayoutControls } from './ResizableReaderLayout'
import { useStandardReaderKeyboard } from '../../hooks/useStandardReaderKeyboard'
import { useStandardReaderState } from '../../hooks/useStandardReaderState'
import { StandardArticlePanel } from './StandardArticlePanel'
import { StandardFeedPanel } from './StandardFeedPanel'
import { StandardSourceRail } from './StandardSourceRail'
import { StandardSourcesPanel } from './StandardSourcesPanel'
import { StandardTopBar } from './StandardTopBar'
import type { StandardReaderInitialState } from '../../types/reader'
import { StandardArticleRestorePanel } from './StandardArticleRestorePanel'

type StandardReaderPrototypeProps = {
  brief: DailyBrief
  initialState?: StandardReaderInitialState
  showThemeSwitch?: boolean
}

export function StandardReaderPrototype({ brief, initialState, showThemeSwitch = false }: StandardReaderPrototypeProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const readerState = useStandardReaderState(brief, initialState)
  useStandardReaderKeyboard({
    hasActiveFilters: readerState.hasActiveFilters,
    actions: readerState.actions,
    searchInputRef,
  })

  function selectRailMode(mode: string, controls: ResizableReaderLayoutControls) {
    readerState.actions.setSelectedRailMode(mode)

    if (mode === 'sources') {
      controls.expandSourcesPanel()
    }
  }

  return (
    <main className="standard-reader" data-theme="standard">
      <StandardTopBar
        brief={brief}
        feedCount={readerState.activeSources}
        resultCount={readerState.filteredArticles.length}
        searchQuery={readerState.searchQuery}
        searchInputRef={searchInputRef}
        actions={showThemeSwitch ? <ReaderThemeToggle currentTheme="standard" /> : null}
        onSearchQueryChange={readerState.actions.setSearchQuery}
      />
      <ResizableReaderLayout
        articlePanelOpen={readerState.articlePanelOpen}
        renderLeft={(controls) => (
          controls.sourcesCollapsed ? (
            <StandardSourceRail
              selectedMode={readerState.selectedRailMode}
              sourcesCollapsed={controls.sourcesCollapsed}
              onSelectMode={(mode) => selectRailMode(mode, controls)}
            />
          ) : (
            <StandardSourcesPanel
              sources={readerState.sources}
              activeSources={readerState.activeSources}
              selectedSourceId={readerState.selectedSourceId}
              onCollapse={controls.collapseSourcesPanel}
              onSelectSource={readerState.actions.selectSource}
            />
          )
        )}
        feed={
          <StandardFeedPanel
            articles={readerState.filteredArticles}
            selectedArticleId={readerState.selectedArticle.id}
            selectedCategory={readerState.selectedCategory}
            selectedSourceId={readerState.selectedSourceId}
            articlePanelOpen={readerState.articlePanelOpen}
            savedArticleIds={readerState.savedArticleIds}
            actionNotice={readerState.actionNotice}
            onSelectArticle={readerState.actions.selectArticle}
            onSelectCategory={readerState.actions.setSelectedCategory}
            onClearSource={readerState.actions.clearSourceFilter}
            onRestoreArticlePanel={readerState.actions.openArticlePanel}
            onSaveArticle={readerState.actions.toggleSaveArticle}
            onShareArticle={readerState.actions.shareArticle}
          />
        }
        renderArticle={(controls) => (
          readerState.articlePanelOpen ? (
            <StandardArticlePanel
              article={readerState.selectedArticle}
              feedback={readerState.feedback}
              copyStatus={readerState.copiedAnalysisArticleId === readerState.selectedArticle.id ? 'copied' : 'idle'}
              relatedArticles={readerState.relatedArticles}
              relatedOpen={readerState.relatedOpen}
              onClose={() => {
                readerState.actions.closeArticlePanel()
                controls.minimizeArticlePanel()
              }}
              onCopyAnalysis={readerState.actions.copyAnalysis}
              onFeedback={readerState.actions.setFeedback}
              onSelectRelatedArticle={readerState.actions.selectArticle}
              onToggleRelated={() => readerState.actions.setRelatedOpen(!readerState.relatedOpen)}
            />
          ) : (
            <StandardArticleRestorePanel
              article={readerState.selectedArticle}
              onRestore={() => {
                readerState.actions.openArticlePanel()
                controls.resetArticlePanel()
              }}
            />
          )
        )}
      />
    </main>
  )
}
