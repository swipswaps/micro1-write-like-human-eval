import { useMemo, useState } from 'react'
import data from './generated/matrix.json'

const BAND_CLASS = { publishable: 'band--good', 'needs-edit': 'band--warn', 'ai-slop': 'band--bad' }

function Band({ band }) {
  return <span className={`band ${BAND_CLASS[band] ?? ''}`}>{band}</span>
}

function ScoreBars({ detail }) {
  if (!detail) return null
  return (
    <div className="bars">
      {detail.map((d) => (
        <div key={d.id} className="bar-row">
          <span className="bar-label">{d.label}</span>
          <span className="bar-track"><i style={{ width: `${(d.score / 2) * 100}%` }} /></span>
          <span className="bar-num">{d.score}</span>
        </div>
      ))}
    </div>
  )
}

function TheCatch() {
  const caught = (data.matrix ?? []).filter((r) => r.rejectsShortcut)
  if (caught.length === 0) return <p className="empty-state">No shortcut verdicts caught.</p>
  const first = caught[0]
  const pair = (data.pairs ?? []).find((p) => p.id === first.pairId)
  const shortcutLabel = first.shortcut === 'cautious-wins' ? 'cautious-sounding is better' : 'longer is better'
  return (
    <div className="catch" data-testid="catch">
      <p className="catch-kicker">{caught.length} pair(s) where the shortcut would pick the weaker response</p>
      <p><strong>{first.pairId}</strong> <span className="label">prompt</span> {pair?.prompt}</p>
      <p className="catch-shortcut">
        <span className="label">shortcut</span> "{shortcutLabel}" → picks {first.shortcutPick}
        {' · '}
        <span className="label">rubric</span> picks {first.rubricPick}
      </p>
      <p className="catch-note" data-testid="catch-note">{first.note}</p>
    </div>
  )
}

function PairView({ pair, row }) {
  if (!pair || !row) return null
  return (
    <article className="pair" data-testid="pair-view">
      <p className="pair-prompt"><span className="label">prompt</span> {pair.prompt}</p>
      <div className="pair-grid">
        {['A', 'B'].map((k) => {
          const side = row[k]
          const isWinner = row.rubricPick === k
          return (
            <div key={k} className={`side ${isWinner ? 'side--winner' : ''}`}>
              <div className="side-head">
                <span className="side-id">{k}</span>
                <span className="side-label">{side.label}</span>
                <Band band={side.band} />
                <span className="side-total">{side.total.toFixed(2)}</span>
              </div>
              <p className="side-text">{side.text}</p>
              <ScoreBars detail={side.detail} />
            </div>
          )
        })}
      </div>
      <p className="pair-catches"><span className="label">what the rubric catches</span> {pair.catches}</p>
    </article>
  )
}

function Matrix() {
  const rows = data.matrix ?? []
  const dims = data.dimensions ?? []
  if (rows.length === 0) return <p className="empty-state">No matrix yet. Run npm run review.</p>
  return (
    <div className="matrix-scroll">
      <table className="matrix" data-testid="matrix">
        <thead>
          <tr>
            <th>pair</th>
            <th>side</th>
            {dims.map((d) => <th key={d.id}>{d.label}</th>)}
            <th>total</th>
            <th>band</th>
            <th>shortcut</th>
            <th>rubric</th>
            <th>rejects?</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row) =>
            ['A', 'B'].map((k) => {
              const side = row[k]
              const isWinner = row.rubricPick === k
              return (
                <tr key={`${row.pairId}-${k}`} className={isWinner ? 'row-win' : ''}>
                  {k === 'A' ? (
                    <th scope="row" rowSpan={2} className="pair-cell">
                      <span className="pid">{row.pairId}</span>
                      <span className="pid-shortcut">{row.shortcut}</span>
                    </th>
                  ) : null}
                  <td className="side-cell">{k}{isWinner ? ' ★' : ''}</td>
                  {dims.map((d) => {
                    const detail = side.detail?.find((x) => x.id === d.id)
                    return <td key={d.id} className="num">{detail?.score ?? '—'}</td>
                  })}
                  <td className="num strong">{side.total.toFixed(2)}</td>
                  <td><Band band={side.band} /></td>
                  {k === 'A' ? (
                    <>
                      <th scope="row" rowSpan={2} className="pick-cell">{row.shortcutPick}</th>
                      <td rowSpan={2} className={`pick-cell pick-cell--rubric ${isWinner ? 'is-win' : ''}`}>{row.rubricPick}</td>
                      <td rowSpan={2} className={`num ${row.rejectsShortcut ? 'yes' : 'no'}`}>{row.rejectsShortcut ? 'yes' : 'no'}</td>
                    </>
                  ) : null}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function App() {
  const s = data.summary ?? {}
  const pairs = data.pairs ?? []
  const rows = data.matrix ?? []
  const [selectedId, setSelectedId] = useState(pairs[0]?.id ?? null)
  const pair = useMemo(() => pairs.find((p) => p.id === selectedId) ?? pairs[0] ?? null, [pairs, selectedId])
  const row = useMemo(() => rows.find((r) => r.pairId === selectedId) ?? rows[0] ?? null, [rows, selectedId])

  return (
    <div className="app">
      <header className="page-header">
        <p className="eyebrow">Write-like-Human Eval · clarity · tone · helpfulness · adherence · substance</p>
        <h1>Fluency is not quality.</h1>
        <p className="page-sub">
          A pairwise rubric for evaluating AI-generated technical writing. Two responses per prompt, five dimensions, one winner. The shortcut picks the longer or more cautious answer. The rubric rejects that on every pair where the shortcut is wrong, and the matrix shows it.
        </p>
        <dl className="stats">
          <div><dt>pairs</dt><dd>{s.total ?? 0}</dd></div>
          <div><dt>publishable</dt><dd className="stat-ok">{s.publishable ?? 0}</dd></div>
          <div><dt>needs edit</dt><dd className="stat-warn">{s.needsEdit ?? 0}</dd></div>
          <div><dt>AI slop</dt><dd className="stat-bad">{s.aiSlop ?? 0}</dd></div>
          <div><dt>rejects shortcut</dt><dd className={s.sound ? 'stat-ok' : 'stat-bad'}>{s.rejectsShortcut ?? 0}/{s.total ?? 0}</dd></div>
          <div><dt>sound</dt><dd className={s.sound ? 'stat-ok' : 'stat-bad'}>{s.sound ? 'yes' : 'no'}</dd></div>
        </dl>
      </header>

      <main>
        <section className="panel-block">
          <h2 className="panel-heading">The catch</h2>
          <TheCatch />
        </section>

        <section className="panel-block">
          <h2 className="panel-heading">Pairs</h2>
          <nav className="pair-nav">
            {pairs.map((p) => (
              <button key={p.id} type="button" className={`pair-tab ${p.id === selectedId ? 'is-active' : ''}`} onClick={() => setSelectedId(p.id)} aria-pressed={p.id === selectedId}>
                <span className="tab-id">{p.id}</span>
                <span className="tab-prompt">{p.prompt.length > 72 ? p.prompt.slice(0, 72) + '…' : p.prompt}</span>
              </button>
            ))}
          </nav>
          <PairView pair={pair} row={row} />
        </section>

        <section className="panel-block">
          <h2 className="panel-heading">Discrimination matrix</h2>
          <p className="panel-hint">
            Each dimension is scored 0–2. The band is derived from the weighted total, not from how fluent the prose sounds. The “rejects?” column is the claim: the rubric disagrees with the shortcut on every pair where the shortcut is wrong.
          </p>
          <Matrix />
        </section>

        <section className="panel-block">
          <h2 className="panel-heading">Known limits</h2>
          <ul className="limits-list">
            <li>Four pairs is a demonstration of the rubric, not a benchmark. A real evaluation queue needs dozens, across prompt modes (tutorial, how-to, reference, explanation).</li>
            <li>The scores are authored, not measured. The rubric is a scoring scheme, not a classifier; a production version needs inter-rater agreement data and a calibration pass against a second reviewer.</li>
            <li>The band thresholds (publishable ≥ 1.70, needs-edit ≥ 1.00, ai-slop &lt; 1.00) and the dimension weights are choices, stated so they can be argued with.</li>
            <li>The responses are representative of the class, not captured from a live model. No prompt-and-capture harness is included.</li>
            <li>Only English is evaluated. The posting requires native-level English fluency; it does not evaluate other languages, and neither does this rubric.</li>
          </ul>
        </section>
      </main>

      <footer className="page-footer">
        <p>Source: <a href="https://github.com/swipswaps/micro1-write-like-human-eval">github.com/swipswaps/micro1-write-like-human-eval</a> · raw: <a href="matrix.json" download>matrix.json</a></p>
      </footer>
    </div>
  )
}
