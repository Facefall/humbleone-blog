'use client'

import { useEffect, useRef } from 'react'
import { isEditableTarget } from '../utils/readerUtils'

type StandardReaderKeyboardActions = {
  clearReaderFilters: () => void
  selectNextArticle: (direction: 1 | -1) => void
}

type UseStandardReaderKeyboardInput = {
  actions: StandardReaderKeyboardActions
  hasActiveFilters: boolean
}

export function useStandardReaderKeyboard({
  actions,
  hasActiveFilters,
}: UseStandardReaderKeyboardInput) {
  const keyboardStateRef = useRef({
    hasActiveFilters,
    actions,
  })

  useEffect(() => {
    keyboardStateRef.current = {
      hasActiveFilters,
      actions,
    }
  }, [actions, hasActiveFilters])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const editableTarget = isEditableTarget(event.target)
      const keyboardState = keyboardStateRef.current

      if (editableTarget) {
        return
      }

      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault()
        keyboardState.actions.selectNextArticle(1)
        return
      }

      if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault()
        keyboardState.actions.selectNextArticle(-1)
        return
      }

      if (event.key === 'Escape' && keyboardState.hasActiveFilters) {
        event.preventDefault()
        keyboardState.actions.clearReaderFilters()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
