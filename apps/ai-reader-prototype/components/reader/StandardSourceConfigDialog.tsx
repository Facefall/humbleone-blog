'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StandardSource } from '../../types/reader'
import { XMarkIcon } from './ReaderIcons'

export type StandardSourceConfigDialogValue = {
  enabled: boolean
  lookbackDays: number
}

type StandardSourceConfigDialogProps = {
  open: boolean
  source: StandardSource | null
  submitError?: string | null
  submitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: StandardSourceConfigDialogValue) => Promise<void> | void
}

export function StandardSourceConfigDialog({
  open,
  source,
  submitError = null,
  submitting = false,
  onOpenChange,
  onSubmit,
}: StandardSourceConfigDialogProps) {
  const { t } = useTranslation('reader')
  const [enabled, setEnabled] = useState(false)
  const [lookbackDays, setLookbackDays] = useState(365)
  const configurable = Boolean(source?.fetchConfigurable)
  const canSubmit = Boolean(source && configurable && Number.isInteger(lookbackDays) && lookbackDays > 0 && !submitting)

  useEffect(() => {
    if (!open || !source) {
      return
    }

    setEnabled(Boolean(source.fetchEnabled))
    setLookbackDays(source.fetchLookbackDays ?? 365)
  }, [open, source])

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    await onSubmit({
      enabled,
      lookbackDays,
    })
  }

  if (!source) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="standard-source-dialog-overlay" />
        <Dialog.Content className="standard-source-dialog standard-source-config-dialog">
          <div className="standard-source-dialog-header">
            <Dialog.Title>{t('sourceManagement.sourceConfigTitle', { name: source.label })}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label={t('sourceManagement.closeDialogAria')}>
                <XMarkIcon />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description>{t('sourceManagement.sourceConfigDescription')}</Dialog.Description>
          <form className="standard-source-dialog-form" onSubmit={submitForm}>
            <div className="standard-source-config-summary">
              <span>{source.adapter ?? t('sources.noAdapter')}</span>
              <small>{source.feedSourceId}</small>
            </div>
            {configurable ? (
              <>
                <label className="standard-source-config-switch">
                  <input
                    checked={enabled}
                    type="checkbox"
                    onChange={(event) => setEnabled(event.target.checked)}
                  />
                  <span>
                    <strong>{t('sourceManagement.sourceFetchEnabledLabel')}</strong>
                    <small>{t('sourceManagement.sourceFetchEnabledHint')}</small>
                  </span>
                </label>
                <label>
                  <span>{t('sourceManagement.sourceLookbackDaysLabel')}</span>
                  <input
                    min={1}
                    step={1}
                    type="number"
                    value={lookbackDays}
                    onChange={(event) => setLookbackDays(Number(event.target.value))}
                  />
                </label>
              </>
            ) : (
              <p className="standard-source-config-disabled">
                {t('sourceManagement.sourceConfigUnavailable')}
              </p>
            )}
            <p className={submitError ? 'is-error' : undefined}>
              {submitError ?? t('sourceManagement.sourceConfigHint')}
            </p>
            <div className="standard-source-dialog-actions">
              <span>{submitting ? t('sourceManagement.sourceConfigSaving') : t('sourceManagement.sourceConfigPending')}</span>
              <Dialog.Close asChild>
                <button type="button" disabled={submitting}>{t('sourceManagement.cancel')}</button>
              </Dialog.Close>
              <button type="submit" className="is-primary" disabled={!canSubmit}>
                {t('sourceManagement.save')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
