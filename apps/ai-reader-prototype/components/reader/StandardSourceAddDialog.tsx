'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SourceContentType } from '../../lib/prototype-data'
import type { SourceCollection } from '../../types/reader'
import { XMarkIcon } from './ReaderIcons'

export type StandardSourceAddDialogValue = {
  collectionId: string | null
  contentType: SourceContentType
  displayName: string
  newTagName: string
  tagMode: 'existing' | 'new'
  url: string
}

type StandardSourceAddDialogProps = {
  collections: SourceCollection[]
  getCollectionLabel: (collection: SourceCollection) => string
  open: boolean
  submitError?: string | null
  submitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (value: StandardSourceAddDialogValue) => Promise<void> | void
}

const sourceContentTypes: SourceContentType[] = ['article', 'social', 'image', 'video']

export function StandardSourceAddDialog({
  collections,
  getCollectionLabel,
  open,
  submitError = null,
  submitting = false,
  onOpenChange,
  onSubmit,
}: StandardSourceAddDialogProps) {
  const { t } = useTranslation('reader')
  const defaultCollectionId = collections[0]?.id ?? ''
  const [url, setUrl] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [contentType, setContentType] = useState<SourceContentType>('article')
  const [tagMode, setTagMode] = useState<'existing' | 'new'>('existing')
  const [selectedCollectionId, setSelectedCollectionId] = useState(defaultCollectionId)
  const [newTagName, setNewTagName] = useState('')
  const trimmedUrl = url.trim()
  const trimmedNewTagName = newTagName.trim()
  const canSubmit = Boolean(trimmedUrl) && (tagMode === 'existing' ? Boolean(selectedCollectionId) : Boolean(trimmedNewTagName))

  useEffect(() => {
    if (!open) {
      return
    }

    setUrl('')
    setDisplayName('')
    setContentType('article')
    setTagMode(collections.length ? 'existing' : 'new')
    setSelectedCollectionId(defaultCollectionId)
    setNewTagName('')
  }, [collections.length, defaultCollectionId, open])

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || submitting) {
      return
    }

    try {
      await onSubmit({
        collectionId: tagMode === 'existing' ? selectedCollectionId : null,
        contentType,
        displayName: displayName.trim(),
        newTagName: tagMode === 'new' ? trimmedNewTagName : '',
        tagMode,
        url: trimmedUrl,
      })
    } catch {
      // The parent owns the visible API error state.
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="standard-source-dialog-overlay" />
        <Dialog.Content className="standard-source-dialog is-wide">
          <div className="standard-source-dialog-header">
            <Dialog.Title>{t('sourceManagement.addSourceUrlTitle')}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label={t('sourceManagement.closeDialogAria')}>
                <XMarkIcon />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description>{t('sourceManagement.addSourceUrlDescription')}</Dialog.Description>
          <form className="standard-source-dialog-form standard-source-url-dialog" onSubmit={submitForm}>
            <label>
              <span>{t('sourceManagement.sourceUrlLabel')}</span>
              <input
                autoFocus
                inputMode="url"
                type="text"
                value={url}
                placeholder={t('sourceManagement.sourceUrlPlaceholder')}
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>
            <label>
              <span>{t('sourceManagement.sourceDisplayNameLabel')}</span>
              <input
                value={displayName}
                placeholder={t('sourceManagement.sourceDisplayNamePlaceholder')}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
            <label>
              <span>{t('sourceManagement.sourceContentTypeLabel')}</span>
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value as SourceContentType)}
              >
                {sourceContentTypes.map((nextContentType) => (
                  <option key={nextContentType} value={nextContentType}>
                    {t(`sources.tabs.${nextContentType}`)}
                  </option>
                ))}
              </select>
            </label>
            <div className="standard-source-tag-mode" role="group" aria-label={t('sourceManagement.sourceTagPickerAria')}>
              <button
                type="button"
                className={tagMode === 'existing' ? 'is-active' : undefined}
                disabled={!collections.length}
                aria-pressed={tagMode === 'existing'}
                onClick={() => setTagMode('existing')}
              >
                {t('sourceManagement.tagModeExisting')}
              </button>
              <button
                type="button"
                className={tagMode === 'new' ? 'is-active' : undefined}
                aria-pressed={tagMode === 'new'}
                onClick={() => setTagMode('new')}
              >
                {t('sourceManagement.tagModeNew')}
              </button>
            </div>
            {tagMode === 'existing' ? (
              <div className="standard-source-tag-list" aria-label={t('sourceManagement.sourceTagLabel')}>
                {collections.map((collection) => (
                  <label key={collection.id}>
                    <input
                      checked={selectedCollectionId === collection.id}
                      name="source-tag"
                      type="radio"
                      value={collection.id}
                      onChange={() => setSelectedCollectionId(collection.id)}
                    />
                    <span>{getCollectionLabel(collection)}</span>
                    <small>{collection.sourceIds.length}</small>
                  </label>
                ))}
              </div>
            ) : (
              <label>
                <span>{t('sourceManagement.sourceTagNewLabel')}</span>
                <input
                  value={newTagName}
                  placeholder={t('sourceManagement.sourceTagPlaceholder')}
                  onChange={(event) => setNewTagName(event.target.value)}
                />
              </label>
            )}
            <p className={submitError ? 'is-error' : undefined}>
              {submitError ?? t('sourceManagement.addSourceUrlHint')}
            </p>
            <div className="standard-source-dialog-actions">
              <span>{submitting ? t('sourceManagement.addSourceSubmitting') : t('sourceManagement.addSourcePending')}</span>
              <Dialog.Close asChild>
                <button type="button" disabled={submitting}>{t('sourceManagement.cancel')}</button>
              </Dialog.Close>
              <button type="submit" className="is-primary" disabled={!canSubmit || submitting}>
                {t('sourceManagement.addSourceSubmit')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
