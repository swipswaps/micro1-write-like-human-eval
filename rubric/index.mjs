// The writing-evaluation rubric.
//
// Each dimension is scored 0 (absent), 1 (partial), or 2 (present). The
// pairwise winner is derived from the weighted totals. The discrimination
// matrix shows that the rubric disagrees with the shortcut verdict on every
// pair where the shortcut is wrong.
//
// Dimensions, mapped to the posting's own wording:
//
//   clarity      "judge clarity" — does the reader know what to do next?
//   tone         "judge tone" — does the register match the named reader?
//   helpfulness  "judge ... usefulness" — can the reader act on it?
//   adherence    "adherence to instructions" — did it answer the prompt asked?
//   substance    "AI slop" detection — would each claim survive a fact-check?

export const DIMENSIONS = [
  {
    id: 'clarity',
    label: 'Clarity',
    question: 'Does the reader know what to do next, or is the prose decoration?',
    weight: 0.20,
    // [2] Google Technical Writing: clarity is actionability, not grammar.
  },
  {
    id: 'tone',
    label: 'Tone',
    question: 'Does the register match the named reader (new contributor, integrator, junior, README reader)?',
    weight: 0.10,
    // [3] Google developer documentation style guide: conversational, not casual.
  },
  {
    id: 'helpfulness',
    label: 'Helpfulness',
    question: 'Can the reader act on this without asking a follow-up question?',
    weight: 0.25,
    // [4] Microsoft Writing Style Guide: actionability over completeness.
  },
  {
    id: 'adherence',
    label: 'Adherence',
    question: 'Did the response answer the prompt that was asked, including constraints?',
    weight: 0.15,
    // [5] Diataxis: the prompt names a mode; answering in a different mode is non-adherence.
  },
  {
    id: 'substance',
    label: 'Substance',
    question: 'Would each claim survive a fact-check, or is it fluent filler?',
    weight: 0.30,
    // [6] ISO 8601 as the reference for date/duration claims.
  },
]

export const RESPONSE_BANDS = ['publishable', 'needs-edit', 'ai-slop']

// Score one response. Returns { total, band, detail }.
// total is on a 0–2 scale (weighted sum, max 2).
export function scoreResponse(scores) {
  let weighted = 0
  let totalWeight = 0
  const detail = []
  for (const dim of DIMENSIONS) {
    const raw = scores[dim.id]
    if (typeof raw !== 'number' || raw < 0 || raw > 2) {
      return { error: `invalid score for ${dim.id}: ${raw}` }
    }
    weighted += raw * dim.weight
    totalWeight += 2 * dim.weight
    detail.push({ id: dim.id, label: dim.label, score: raw, question: dim.question })
  }
  const total = totalWeight > 0 ? (weighted / totalWeight) * 2 : 0
  // Band derivation, stated so it can be argued with:
  //   publishable  total >= 1.70
  //   needs-edit   1.00 <= total < 1.70
  //   ai-slop      total < 1.00
  let band
  if (total >= 1.70) band = 'publishable'
  else if (total >= 1.00) band = 'needs-edit'
  else band = 'ai-slop'
  return { total: Math.round(total * 100) / 100, band, detail }
}

// Evaluate one pair. Returns the full row used by the dashboard.
//
// A pairwise winner is derived from the totals. Ties are declared only on
// exact equality; with authored scores that will not happen, and the matrix
// is more useful if it is decisive than if it hedges.
export function evaluatePair(pair) {
  const a = scoreResponse(pair.responses.A.scores)
  const b = scoreResponse(pair.responses.B.scores)
  if (a.error || b.error) return { error: a.error ?? b.error }

  let rubricPick
  if (a.total > b.total) rubricPick = 'A'
  else if (b.total > a.total) rubricPick = 'B'
  else rubricPick = 'tie'

  return {
    pairId: pair.id,
    prompt: pair.prompt,
    shortcut: pair.shortcut,       // 'longer-wins' or 'cautious-wins'
    shortcutPick: pair.shortcutPick,
    referencePick: pair.referencePick,
    rubricPick,
    rejectsShortcut: rubricPick !== pair.shortcutPick,
    matchesReference: rubricPick === pair.referencePick,
    A: { label: pair.responses.A.label, text: pair.responses.A.text, ...a },
    B: { label: pair.responses.B.label, text: pair.responses.B.text, ...b },
    catches: pair.catches,
    note: buildNote(rubricPick, pair),
  }
}

function buildNote(rubricPick, pair) {
  const winner = rubricPick === 'A' ? pair.responses.A : pair.responses.B
  const loser = rubricPick === 'A' ? pair.responses.B : pair.responses.A
  return `Rubric picks ${rubricPick} (${winner.label}, ${winner.band} band); ${loser.label} scores in the ${loser.band} band. ${pair.catches}`
}
