'use client'

import { useEffect, useRef, useState } from 'react'
import { joinClasses } from '../../utils/readerUtils'
import { FunnelIcon } from './ReaderIcons'

type StandardSourceFilterMenuProps = {
  activeCount: number
  totalCount: number
  showActiveOnly: boolean
  onCollapseAll: () => void
  onExpandAll: () => void
  onShowActiveOnlyChange: (value: boolean) => void
}

export function StandardSourceFilterMenu({
  activeCount,
  totalCount,
  showActiveOnly,
  onCollapseAll,
  onExpandAll,
  onShowActiveOnlyChange,
}: StandardSourceFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return
      }

      setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function selectSourceScope(activeOnly: boolean) {
    onShowActiveOnlyChange(activeOnly)
    setOpen(false)
  }

  function runMenuAction(action: () => void) {
    action()
    setOpen(false)
  }

  return (
    <div className="standard-source-filter-menu" ref={menuRef}>
      <button
        type="button"
        className={joinClasses('standard-source-filter-trigger', showActiveOnly && 'is-active')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open source filters"
        title="Source filters"
        onClick={() => setOpen((current) => !current)}
      >
        <FunnelIcon />
      </button>
      {open ? (
        <div className="standard-source-filter-popover" role="menu">
          <span>Source view</span>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={!showActiveOnly}
            className={!showActiveOnly ? 'is-selected' : undefined}
            onClick={() => selectSourceScope(false)}
          >
            <strong>All sources</strong>
            <small>{totalCount} feeds</small>
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={showActiveOnly}
            className={showActiveOnly ? 'is-selected' : undefined}
            onClick={() => selectSourceScope(true)}
          >
            <strong>Active only</strong>
            <small>{activeCount} live</small>
          </button>
          <i />
          <button type="button" role="menuitem" onClick={() => runMenuAction(onExpandAll)}>
            <strong>Expand groups</strong>
            <small>Show every section</small>
          </button>
          <button type="button" role="menuitem" onClick={() => runMenuAction(onCollapseAll)}>
            <strong>Collapse groups</strong>
            <small>Compact source list</small>
          </button>
        </div>
      ) : null}
    </div>
  )
}
