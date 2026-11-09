import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PAIRS } from '../corpus/index.mjs'
import { evaluatePair, DIMENSIONS } from '../rubric/index.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

function main() {
  const rows = PAIRS.map((p) => evaluatePair(p))
  const errors = rows.filter((r) => r.error)
  if (errors.length) {
    for (const e of errors) console.error('  !! ' + e.error)
    process.exit(3)
  }

  const checks = rows.map((r) => ({
    pairId: r.pairId,
    shortcut: r.shortcut,
    shortcutPick: r.shortcutPick,
    referencePick: r.referencePick,
    rubricPick: r.rubricPick,
    rejectsShortcut: r.rejectsShortcut,
    matchesReference: r.matchesReference,
  }))
  const failures = checks.filter((c) => !c.rejectsShortcut || !c.matchesReference)

  const bands = { publishable: 0, 'needs-edit': 0, 'ai-slop': 0 }
  for (const r of rows) {
    bands[r.A.band] += 1
    bands[r.B.band] += 1
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    generator: 'scripts/review.mjs',
    buildId: process.env.GITHUB_SHA ?? null,
    dimensions: DIMENSIONS.map((d) => ({ id: d.id, label: d.label, question: d.question, weight: d.weight })),
    pairs: PAIRS.map((p) => ({
      id: p.id, prompt: p.prompt, shortcut: p.shortcut,
      shortcutPick: p.shortcutPick, referencePick: p.referencePick,
      responses: {
        A: { label: p.responses.A.label, text: p.responses.A.text, scores: p.responses.A.scores },
        B: { label: p.responses.B.label, text: p.responses.B.text, scores: p.responses.B.scores },
      },
      catches: p.catches,
    })),
    matrix: rows,
    checks,
    summary: {
      total: rows.length,
      rejectsShortcut: checks.filter((c) => c.rejectsShortcut).length,
      matchesReference: checks.filter((c) => c.matchesReference).length,
      publishable: bands.publishable,
      needsEdit: bands['needs-edit'],
      aiSlop: bands['ai-slop'],
      sound: failures.length === 0,
    },
  }

  const json = JSON.stringify(payload, null, 2)
  mkdirSync(resolve(ROOT, 'src', 'generated'), { recursive: true })
  mkdirSync(resolve(ROOT, 'public'), { recursive: true })
  writeFileSync(resolve(ROOT, 'src', 'generated', 'matrix.json'), json)
  writeFileSync(resolve(ROOT, 'public', 'matrix.json'), json)

  for (const row of rows) {
    const mark = row.rejectsShortcut && row.matchesReference ? 'ok   ' : 'MISS '
    console.log(`  ${mark} ${row.pairId.padEnd(3)} rubric=${row.rubricPick} shortcut=${row.shortcutPick} ref=${row.referencePick}  A=${row.A.total}(${row.A.band})  B=${row.B.total}(${row.B.band})`)
  }
  console.log(`\nbands: publishable=${bands.publishable} needs-edit=${bands['needs-edit']} ai-slop=${bands['ai-slop']}`)
  console.log(`rejects shortcut: ${checks.filter((c) => c.rejectsShortcut).length}/${checks.length}`)
  console.log(`matches reference: ${checks.filter((c) => c.matchesReference).length}/${checks.length}`)
  console.log(`sound: ${payload.summary.sound ? 'yes' : 'NO'}`)
  process.exit(0)
}

main()
