import { Suspense } from 'react'
import { ReaderAppClient } from './ReaderAppClient'

function ReaderAppFallback() {
  return (
    <main className="reader-csr-shell" aria-busy="true" aria-label="Loading reader">
      <span>AI</span>
      <strong>Loading reader workspace</strong>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ReaderAppFallback />}>
      <ReaderAppClient />
    </Suspense>
  )
}
