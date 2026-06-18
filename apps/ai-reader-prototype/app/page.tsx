import { Suspense } from 'react'
import { ReaderAppClient } from './ReaderAppClient'
import { I18nProvider } from '../providers/I18nProvider'

function ReaderAppFallback() {
  return (
    <I18nProvider>
      <main className="reader-csr-shell" aria-busy="true">
        <span>AI</span>
        <strong>…</strong>
      </main>
    </I18nProvider>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ReaderAppFallback />}>
      <ReaderAppClient />
    </Suspense>
  )
}
