'use client'

import { useRef } from 'react'
import type { DailyBrief } from '../../lib/prototype-data'
import { ResizableReaderLayout } from './ResizableReaderLayout'
import type { ResizableReaderLayoutControls } from './ResizableReaderLayout'
import { useStandardReaderKeyboard } from '../../hooks/useStandardReaderKeyboard'
import { useStandardReaderState } from '../../hooks/useStandardReaderState'
import { StandardArticlePanel } from './StandardArticlePanel'
import { StandardFeedPanel } from './StandardFeedPanel'
import { StandardSourceRail } from './StandardSourceRail'
import { StandardSourcesPanel } from './StandardSourcesPanel'
import { StandardSearchCommand } from './StandardSearchCommand'
import type { StandardReaderInitialState } from '../../types/reader'
import { StandardArticleRestorePanel } from './StandardArticleRestorePanel'

type StandardReaderPrototypeProps = {
  brief: DailyBrief
  initialState?: StandardReaderInitialState
}

export function StandardReaderPrototype({ brief, initialState }: StandardReaderPrototypeProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const readerState = useStandardReaderState(brief, initialState)
  useStandardReaderKeyboard({
    hasActiveFilters: readerState.hasActiveFilters,
    actions: readerState.actions,
  })

  function selectRailMode(mode: string, controls: ResizableReaderLayoutControls) {
    readerState.actions.setSelectedRailMode(mode)

    if (mode === 'sources') {
      controls.expandSourcesPanel()
    }
  }

  return (
    <main className="standard-reader" data-theme="standard">
      <StandardSearchCommand
        resultCount={readerState.filteredArticles.length}
        searchQuery={readerState.searchQuery}
        searchInputRef={searchInputRef}
        onSearchQueryChange={readerState.actions.setSearchQuery}
      />
      <ResizableReaderLayout
        articlePanelOpen={readerState.articlePanelOpen}
        renderLeft={(controls) => (
          controls.sourcesCollapsed && !controls.sourcesCollapsing ? (
            <StandardSourceRail
              selectedMode={readerState.selectedRailMode}
              sourcesCollapsed={controls.sourcesCollapsed}
              onSelectMode={(mode) => selectRailMode(mode, controls)}
            />
          ) : (
            <StandardSourcesPanel
              sources={readerState.sources}
              activeSources={readerState.activeSources}
              collapsing={controls.sourcesCollapsing}
              libraryCounts={{
                bookmarks: readerState.savedArticleIds.size,
                favorites: readerState.favoritedArticleIds.size,
              }}
              libraryFilter={readerState.libraryFilter}
              selectedSourceId={readerState.selectedSourceId}
              onCollapse={controls.collapseSourcesPanel}
              onSelectLibraryFilter={readerState.actions.selectLibraryFilter}
              onSelectSource={readerState.actions.selectSource}
            />
          )
        )}
        feed={
          <StandardFeedPanel
            articles={readerState.filteredArticles}
            selectedArticleId={readerState.selectedArticle.id}
            selectedSourceId={readerState.selectedSourceId}
            articlePanelOpen={readerState.articlePanelOpen}
            unreadCount={readerState.unreadCount}
            readArticleIds={readerState.readArticleIds}
            savedArticleIds={readerState.savedArticleIds}
            favoritedArticleIds={readerState.favoritedArticleIds}
            showUnreadOnly={readerState.showUnreadOnly}
            actionNotice={readerState.actionNotice}
            feedNotice={readerState.feedNotice}
            libraryFilter={readerState.libraryFilter}
            onSelectArticle={readerState.actions.selectArticle}
            onClearLibraryFilter={readerState.actions.clearLibraryFilter}
            onClearSource={readerState.actions.clearSourceFilter}
            onRestoreArticlePanel={readerState.actions.openArticlePanel}
            onFavoriteArticle={readerState.actions.toggleFavoriteArticle}
            onMarkAllRead={readerState.actions.markAllRead}
            onRefreshFeed={readerState.actions.refreshFeed}
            onSaveArticle={readerState.actions.toggleSaveArticle}
            onShareArticle={readerState.actions.shareArticle}
            onToggleUnreadOnly={readerState.actions.setShowUnreadOnly}
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
