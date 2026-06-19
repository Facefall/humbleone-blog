type ReaderLoadingScreenProps = {
  detail?: string
  label?: string
}

export function ReaderLoadingScreen({ detail = 'SYNCING SOURCES', label = 'AI' }: ReaderLoadingScreenProps) {
  return (
    <main className="reader-csr-shell" aria-busy="true" aria-label={detail}>
      <div className="reader-loading-emblem" aria-hidden="true">
        <span>{label}</span>
        <div className="reader-loading-orbit">
          <i />
          <i />
          <i />
        </div>
      </div>
      <strong>{detail}</strong>
      <small>
        <span />
        <span />
        <span />
      </small>
    </main>
  )
}
