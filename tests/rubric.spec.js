import { test, expect } from '@playwright/test'
import { PAIRS } from '../corpus/index.mjs'
import { evaluatePair } from '../rubric/index.mjs'

test('every pair evaluates without error', () => {
  for (const p of PAIRS) {
    const r = evaluatePair(p)
    expect(r.error, p.id).toBeUndefined()
    expect(['A', 'B', 'tie']).toContain(r.rubricPick)
  }
})

test('the rubric rejects the shortcut verdict on every pair where the shortcut is wrong', () => {
  for (const p of PAIRS) {
    const r = evaluatePair(p)
    if (p.shortcutPick !== p.referencePick) {
      expect(r.rubricPick, p.id).not.toBe(p.shortcutPick)
      expect(r.rubricPick, p.id).toBe(p.referencePick)
    }
  }
})

test('a response in the ai-slop band has substance at 0', () => {
  for (const p of PAIRS) {
    const r = evaluatePair(p)
    for (const k of ['A', 'B']) {
      if (r[k].band !== 'ai-slop') continue
      const sub = r[k].detail.find((d) => d.id === 'substance')
      expect(sub.score, `${p.id}/${k}`).toBe(0)
    }
  }
})

test('a response in the publishable band has every dimension at least 1', () => {
  for (const p of PAIRS) {
    const r = evaluatePair(p)
    for (const k of ['A', 'B']) {
      if (r[k].band !== 'publishable') continue
      for (const d of r[k].detail) expect(d.score, `${p.id}/${k}/${d.id}`).toBeGreaterThanOrEqual(1)
    }
  }
})

test('evaluation is deterministic', () => {
  const p = PAIRS[0]
  expect(JSON.stringify(evaluatePair(p))).toBe(JSON.stringify(evaluatePair(p)))
})
