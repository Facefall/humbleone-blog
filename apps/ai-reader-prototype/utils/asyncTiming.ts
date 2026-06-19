export function waitForMinimumDuration(startedAt: number, minDurationMs: number, signal?: AbortSignal) {
  const remainingMs = Math.max(0, minDurationMs - (Date.now() - startedAt))

  if (remainingMs <= 0 || signal?.aborted) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, remainingMs)

    function abort() {
      window.clearTimeout(timeout)
      resolve()
    }

    signal?.addEventListener('abort', abort, { once: true })
  })
}
