'use client'

import type { ComponentType, SVGProps } from 'react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  onActivateHome?: () => void
  onOpenLibrary?: () => void
  onOpenSettings?: () => void
  onSelectMode: (mode: string) => void
}

type RailIcon = ComponentType<SVGProps<SVGSVGElement>>

const railItems: Array<{ id: string; Icon: RailIcon }> = [
  { id: 'sources', Icon: RectangleStackIcon },
  { id: 'signals', Icon: RssIcon },
  { id: 'trends', Icon: ChartBarIcon },
  { id: 'radio', Icon: RadioIcon },
]

export function StandardSourceRail({
  selectedMode,
  sourcesCollapsed,
  onActivateHome,
  onOpenLibrary,
  onOpenSettings,
  onSelectMode,
}: StandardSourceRailProps) {
  const { t } = useTranslation('reader')
  const railRef = useRef<HTMLElement>(null)

  useGsapElementEntrance(railRef, sourcesCollapsed, {
    duration: 0.2,
    scale: 0.96,
    x: -10,
    y: 0,
  })

  return (
    <nav ref={railRef} className="standard-icon-rail" aria-label={t('rail.aria')}>
      <button
        type="button"
        className="standard-rail-mark"
        aria-label={t('rail.home')}
        title={t('rail.home')}
        onClick={onActivateHome}
      >
        <NewspaperIcon />
      </button>
      {railItems.map((item) => {
        const label = t(`rail.${item.id}`)

        return (
          <button
            key={item.id}
            type="button"
            className={joinClasses(
              selectedMode === item.id && 'is-active',
              item.id === 'sources' && sourcesCollapsed && 'is-collapsed-anchor',
            )}
            aria-label={label}
            aria-pressed={selectedMode === item.id}
            title={label}
            onClick={() => onSelectMode(item.id)}
          >
            <item.Icon />
          </button>
        )
      })}
      <div className="standard-rail-spacer" />
      <button
        type="button"
        className={selectedMode === 'library' ? 'is-active' : undefined}
        aria-label={t('rail.library')}
        title={t('rail.library')}
        onClick={onOpenLibrary}
      >
        <BookOpenIcon />
      </button>
      <button
        type="button"
        className={selectedMode === 'settings' ? 'is-active' : undefined}
        aria-label={t('rail.settings')}
        title={t('rail.settings')}
        onClick={onOpenSettings}
      >
        <Cog6ToothIcon />
      </button>
    </nav>
  )
}
