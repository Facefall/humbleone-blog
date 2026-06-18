'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'

const collapsedSourceWidth = 50
const resizerWidth = 6
const feedDefaultWidth = 560
const feedMinWidth = 360
const feedMaxWidth = 680
const sourceDefaultWidth = 260
const sourceMinWidth = 224
const sourceMaxWidth = 340
const sourceCollapseWidth = 180
const articleMinWidth = 560
const articleCollapsedWidth = 64
const fallbackWorkspaceWidth = 1600
const sourceCollapseAnimationMs = 220

export type ResizableReaderLayoutControls = {
  sourcesCollapsed: boolean
  sourcesCollapsing: boolean
  collapseSourcesPanel: () => void
  expandSourcesPanel: () => void
  toggleSourcesPanel: () => void
  minimizeArticlePanel: () => void
  resetArticlePanel: () => void
}

type ResizableReaderLayoutProps = {
  articlePanelOpen?: boolean
  renderLeft: (controls: ResizableReaderLayoutControls) => ReactNode
  feed: ReactNode
  renderArticle: (controls: ResizableReaderLayoutControls) => ReactNode
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function ResizableReaderLayout({
  articlePanelOpen = true,
  renderLeft,
  feed,
  renderArticle,
}: ResizableReaderLayoutProps) {
  const { t } = useTranslation('reader')
  const workspaceRef = useRef<HTMLDivElement>(null)
  const collapseTimerRef = useRef<number | null>(null)
  const [sourcesWidth, setSourcesWidth] = useState(sourceDefaultWidth)
  const [feedWidth, setFeedWidth] = useState(feedDefaultWidth)
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false)
  const [sourcesCollapsing, setSourcesCollapsing] = useState(false)
  const [dragging, setDragging] = useState<'sources' | 'article' | null>(null)
  const [workspaceWidth, setWorkspaceWidth] = useState(fallbackWorkspaceWidth)

  useEffect(() => {
    function measureWorkspace() {
      setWorkspaceWidth(workspaceRef.current?.getBoundingClientRect().width ?? window.innerWidth)
    }

    measureWorkspace()
    window.addEventListener('resize', measureWorkspace)

    return () => window.removeEventListener('resize', measureWorkspace)
  }, [])

  useEffect(
    () => () => {
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current)
      }
    },
    [],
  )

  function clearCollapseTimer() {
    if (!collapseTimerRef.current) {
      return
    }

    window.clearTimeout(collapseTimerRef.current)
    collapseTimerRef.current = null
  }

  function getLeftWidth() {
    if (sourcesCollapsing) {
      return 0
    }

    return sourcesCollapsed ? collapsedSourceWidth : sourcesWidth
  }

  function getMaxFeedWidth(leftWidth = getLeftWidth()) {
    const measuredWorkspaceWidth = workspaceRef.current?.getBoundingClientRect().width ?? workspaceWidth
    const rightWidth = articlePanelOpen ? articleMinWidth : articleCollapsedWidth
    const maxByArticle = measuredWorkspaceWidth - leftWidth - rightWidth - resizerWidth * 2

    return Math.max(feedMinWidth, Math.min(feedMaxWidth, maxByArticle))
  }

  function expandSourcesPanel() {
    clearCollapseTimer()
    setSourcesCollapsing(false)
    setSourcesCollapsed(false)
    setSourcesWidth((current) => clamp(current, sourceMinWidth, sourceMaxWidth))
  }

  function collapseSourcesPanel() {
    if (sourcesCollapsed || sourcesCollapsing) {
      return
    }

    clearCollapseTimer()
    setSourcesCollapsing(true)
    collapseTimerRef.current = window.setTimeout(() => {
      setSourcesCollapsed(true)
      setSourcesCollapsing(false)
      collapseTimerRef.current = null
    }, sourceCollapseAnimationMs)
  }

  const controls: ResizableReaderLayoutControls = {
    sourcesCollapsed,
    sourcesCollapsing,
    collapseSourcesPanel,
    expandSourcesPanel,
    toggleSourcesPanel: () => {
      if (sourcesCollapsed) {
        expandSourcesPanel()
        return
      }

      collapseSourcesPanel()
    },
    minimizeArticlePanel: () => setFeedWidth(getMaxFeedWidth()),
    resetArticlePanel: () => setFeedWidth(feedDefaultWidth),
  }
  const workspaceStyle = {
    '--standard-left-width': `${getLeftWidth()}px`,
    '--standard-feed-width': `${Math.min(feedWidth, getMaxFeedWidth())}px`,
  } as CSSProperties

  function beginResize(panel: 'sources' | 'article', event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()

    const startX = event.clientX
    const startSourcesWidth = getLeftWidth()
    const startFeedWidth = feedWidth

    setDragging(panel)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (panel === 'sources') {
        const nextWidth = startSourcesWidth + moveEvent.clientX - startX

        if (nextWidth < sourceCollapseWidth) {
          clearCollapseTimer()
          setSourcesCollapsing(false)
          setSourcesCollapsed(true)
          return
        }

        setSourcesCollapsed(false)
        setSourcesWidth(clamp(nextWidth, sourceMinWidth, sourceMaxWidth))
        return
      }

      const nextWidth = startFeedWidth + moveEvent.clientX - startX

      setFeedWidth(clamp(nextWidth, feedMinWidth, getMaxFeedWidth()))
    }

    const onPointerUp = () => {
      setDragging(null)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
  }

  return (
    <div
      ref={workspaceRef}
      className={joinClasses(
        'standard-workspace',
        sourcesCollapsed && 'is-sources-collapsed',
        sourcesCollapsing && 'is-sources-collapsing',
        !articlePanelOpen && 'is-article-panel-closed',
        dragging === 'sources' && 'is-resizing-sources',
        dragging === 'article' && 'is-resizing-article',
      )}
      style={workspaceStyle}
      data-resizing={dragging ?? undefined}
    >
      {renderLeft(controls)}
      <div
        className={joinClasses('standard-resizer', 'standard-source-resizer', dragging === 'sources' && 'is-active')}
        role="separator"
        aria-orientation="vertical"
        aria-label={t('resizer.sourcesAria')}
        tabIndex={0}
        onPointerDown={(event) => beginResize('sources', event)}
        onDoubleClick={controls.toggleSourcesPanel}
      />
      {feed}
      <div
        className={joinClasses('standard-resizer', 'standard-article-resizer', dragging === 'article' && 'is-active')}
        role="separator"
        aria-orientation="vertical"
        aria-label={t('resizer.articleAria')}
        tabIndex={0}
        onPointerDown={(event) => beginResize('article', event)}
        onDoubleClick={controls.resetArticlePanel}
      />
      {renderArticle(controls)}
    </div>
  )
}
