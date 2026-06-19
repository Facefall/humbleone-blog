import { Suspense } from 'react'
import { ReaderAppClient } from './ReaderAppClient'
import { I18nProvider } from '../providers/I18nProvider'
import { ReaderLoadingScreen } from '../components/reader/ReaderLoadingScreen'

function ReaderAppFallback() {
  return (
    <I18nProvider>
      <ReaderLoadingScreen detail="INITIALIZING READER" />
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
