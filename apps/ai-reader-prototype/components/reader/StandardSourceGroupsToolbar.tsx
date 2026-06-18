'use client'

import { useTranslation } from 'react-i18next'

type StandardSourceGroupsToolbarProps = {
  groupCount: number
}

export function StandardSourceGroupsToolbar({ groupCount }: StandardSourceGroupsToolbarProps) {
  const { t } = useTranslation('reader')

  return (
    <div className="standard-source-groups-toolbar" aria-label={t('sourceManagement.groupsToolbarAria')}>
      <div>
        <span>{t('sourceManagement.groupsTitle')}</span>
        <small>{t('sourceManagement.groupsCount', { count: groupCount })}</small>
      </div>
    </div>
  )
}
