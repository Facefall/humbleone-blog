import type { StandardSource } from '../../types/reader'

type StandardSourceInspectorProps = {
  sources: StandardSource[]
  selectedSource?: StandardSource
}

const fetchMethodLabels = {
  official_rss: 'official RSS',
  official_api: 'official API',
  rsshub: 'RSSHub',
  custom_scrape: 'custom scrape',
  manual: 'manual',
}

export function StandardSourceInspector({
  sources,
  selectedSource,
}: StandardSourceInspectorProps) {
  if (!selectedSource) {
    const activeCount = sources.filter((source) => source.active).length
    const failedCount = sources.filter((source) => source.health === 'failed').length

    return (
      <section className="standard-source-inspector" aria-label="Feed hub overview">
        <header>
          <span>Feed Hub</span>
          <strong>{activeCount}/{sources.length}</strong>
        </header>
        <div className="standard-source-stat-grid">
          <span>
            Active
            <b>{activeCount}</b>
          </span>
          <span>
            Failed
            <b>{failedCount}</b>
          </span>
        </div>
        <p>Official feeds first; RSSHub and manual capture stay visible as weaker adapters.</p>
      </section>
    )
  }

  const registry = selectedSource.registry

  return (
    <section className="standard-source-inspector" aria-label={`${selectedSource.label} registry`}>
      <header>
        <span>Registry</span>
        <strong>{registry?.priority ?? 'medium'}</strong>
      </header>
      <h3>{selectedSource.label}</h3>
      <div className="standard-source-health-row">
        <span className={`health-${selectedSource.health}`}>{selectedSource.health}</span>
        <span>{registry?.evidenceLevel ?? selectedSource.evidenceLevel ?? 'manual'}</span>
      </div>
      {registry ? (
        <>
          <div className="standard-source-registry-grid">
            <span>
              Method
              <b>{fetchMethodLabels[registry.fetchMethod]}</b>
            </span>
            <span>
              Cadence
              <b>{registry.updateFrequency}</b>
            </span>
            <span>
              Adapter
              <b>{registry.adapter}</b>
            </span>
            <span>
              Language
              <b>{registry.language}</b>
            </span>
          </div>
          <div className="standard-source-tags">
            {registry.topicTags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p>{registry.whyFollow}</p>
          <small>{registry.riskNotes}</small>
          <a href={registry.officialUrl}>Open source</a>
        </>
      ) : (
        <p>No registry record yet.</p>
      )}
    </section>
  )
}
