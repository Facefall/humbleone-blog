'use client'

import type { ComponentType, SVGProps } from 'react'
import { useRef } from 'react'
import { useGsapElementEntrance } from '../../hooks/useGsapMotion'
import { joinClasses } from '../../utils/readerUtils'
import {
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  NewspaperIcon,
  RadioIcon,
  RectangleStackIcon,
  RssIcon,
} from './ReaderIcons'

type StandardSourceRailProps = {
  selectedMode: string
  sourcesCollapsed: boolean
  onSelectMode: (mode: string) => void
}

type RailIcon = ComponentType<SVGProps<SVGSVGElement>>

const railItems: Array<{ id: string; label: string; Icon: RailIcon }> = [
  { id: 'sources', label: 'Sources', Icon: RectangleStackIcon },
  { id: 'signals', label: 'Signals', Icon: RssIcon },
  { id: 'trends', label: 'Trends', Icon: ChartBarIcon },
  { id: 'radio', label: 'Radio', Icon: RadioIcon },
]

export function StandardSourceRail({
  selectedMode,
  sourcesCollapsed,
  onSelectMode,
}: StandardSourceRailProps) {
  const railRef = useRef<HTMLElement>(null)

  useGsapElementEntrance(railRef, sourcesCollapsed, {
    duration: 0.2,
    scale: 0.96,
    x: -10,
    y: 0,
  })

  return (
    <nav ref={railRef} className="standard-icon-rail" aria-label="Reader modes">
      <div className="standard-rail-mark">
        <NewspaperIcon />
      </div>
      {railItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={joinClasses(
            selectedMode === item.id && 'is-active',
            item.id === 'sources' && sourcesCollapsed && 'is-collapsed-anchor',
          )}
          aria-label={item.label}
          aria-pressed={selectedMode === item.id}
          title={item.label}
          onClick={() => onSelectMode(item.id)}
        >
          <item.Icon />
        </button>
      ))}
      <div className="standard-rail-spacer" />
      <button type="button" aria-label="Library" title="Library">
        <BookOpenIcon />
      </button>
      <button type="button" aria-label="Settings" title="Settings">
        <Cog6ToothIcon />
      </button>
    </nav>
  )
}
