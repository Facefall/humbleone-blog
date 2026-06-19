'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimedState<TValue>(clearValue: TValue, defaultDelayMs = 1800) {
  const [value, setValue] = useState<TValue>(clearValue)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (!timerRef.current) {
      return
    }

    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const clear = useCallback(() => {
    clearTimer()
    setValue(clearValue)
  }, [clearTimer, clearValue])

  const setTimedValue = useCallback((nextValue: TValue, delayMs = defaultDelayMs) => {
    clearTimer()
    setValue(nextValue)
    timerRef.current = window.setTimeout(() => {
      setValue(clearValue)
      timerRef.current = null
    }, delayMs)
  }, [clearTimer, clearValue, defaultDelayMs])

  useEffect(() => clearTimer, [clearTimer])

  return {
    clear,
    setTimedValue,
    setValue,
    value,
  }
}
