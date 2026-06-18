'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleSwitcher } from '../LocaleSwitcher'
import { ReaderThemeToggle, type ReaderTheme } from '../ReaderThemeToggle'
import { Cog8ToothIcon, XMarkIcon } from './ReaderIcons'

type StandardReaderSettingsDialogProps = {
  currentTheme: ReaderTheme
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StandardReaderSettingsDialog({
  currentTheme,
  open,
  onOpenChange,
}: StandardReaderSettingsDialogProps) {
  const { t } = useTranslation('reader')
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="standard-source-dialog-overlay" />
          <Dialog.Content className="standard-source-dialog standard-settings-dialog">
            <div className="standard-source-dialog-header">
              <Dialog.Title>{t('settings.title')}</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" aria-label={t('sourceManagement.closeDialogAria')}>
                  <XMarkIcon />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description>{t('settings.description')}</Dialog.Description>
            <div className="standard-settings-list">
              <section className="standard-settings-row">
                <div>
                  <span>{t('settings.language')}</span>
                  <small>{t('settings.languageDescription')}</small>
                </div>
                <LocaleSwitcher />
              </section>
              <section className="standard-settings-row">
                <div>
                  <span>{t('settings.theme')}</span>
                  <small>{t('settings.themeDescription')}</small>
                </div>
                <ReaderThemeToggle currentTheme={currentTheme} />
              </section>
              <button type="button" className="standard-settings-detail-trigger" onClick={() => setDetailsOpen(true)}>
                <Cog8ToothIcon />
                <span>{t('settings.detail')}</span>
                <small>{t('settings.detailDescription')}</small>
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={detailsOpen} onOpenChange={setDetailsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="standard-source-dialog-overlay" />
          <Dialog.Content className="standard-source-dialog standard-settings-dialog is-compact">
            <div className="standard-source-dialog-header">
              <Dialog.Title>{t('settings.detailTitle')}</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" aria-label={t('sourceManagement.closeDialogAria')}>
                  <XMarkIcon />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description>{t('settings.detailEmpty')}</Dialog.Description>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
