import { describe, it, expect } from 'vitest'
import type { ImprovementItem } from '../types'
import {
  stampDecisionResolutions,
  isDecisionItem,
  sortForDecisions,
  decisionAgeDays,
  decisionAgeState,
  decisionLatencyDays,
  median,
  medianLatencyDaysByOwner,
} from './decision'

const DAY = 86_400_000

function item(overrides: Partial<ImprovementItem> = {}): ImprovementItem {
  return {
    id: 'i1',
    title: 'Item',
    description: '',
    category: 'process',
    status: 'identified',
    owner: '',
    copilot: '',
    createdAt: 0,
    updatedAt: 0,
    dialogueNotes: '',
    ...overrides,
  }
}

function decisionItem(overrides: Partial<ImprovementItem> = {}): ImprovementItem {
  return item({
    decisionRequired: true,
    decisionOpenedAt: 1_000 * DAY,
    ...overrides,
  })
}

describe('stampDecisionResolutions', () => {
  it('stamps decisionResolvedAt on identified→done transition', () => {
    const prev = [decisionItem()]
    const next = [{ ...prev[0], status: 'done' as const, updatedAt: 50 * DAY }]
    const stamped = stampDecisionResolutions(prev, next, 60 * DAY)
    expect(stamped[0].decisionResolvedAt).toBe(60 * DAY)
    // immutability: inputs untouched
    expect(next[0].decisionResolvedAt).toBeUndefined()
  })

  it('stamps in_progress→done and bulk transitions identically', () => {
    const opened = 1_000 * DAY
    const a = decisionItem({ id: 'a', decisionOpenedAt: opened, status: 'in_progress' })
    const b = decisionItem({ id: 'b', decisionOpenedAt: opened })
    const c = decisionItem({ id: 'c', decisionOpenedAt: opened })
    // single-card move (BoardView onUpdate), whole-array replace (kanban onItems),
    // and bulk mark-done all funnel into one prev→next diff:
    const viaSingle = stampDecisionResolutions([a], [{ ...a, status: 'done' as const }], 61 * DAY)
    const viaArray = stampDecisionResolutions([b], [{ ...b, status: 'done' as const }], 61 * DAY)
    const viaBulk = stampDecisionResolutions(
      [c],
      [{ ...c, status: 'done' as const }, decisionItem({ id: 'untouched' })],
      61 * DAY,
    )
    expect(viaSingle[0].decisionResolvedAt).toBe(61 * DAY)
    expect(viaArray[0].decisionResolvedAt).toBe(61 * DAY)
    expect(viaBulk[0].decisionResolvedAt).toBe(61 * DAY)
    expect(viaBulk[1].decisionResolvedAt).toBeUndefined()
  })

  it('does not stamp without decisionRequired', () => {
    const prev = [item({ status: 'identified' })]
    const next = [{ ...prev[0], status: 'done' as const }]
    expect(stampDecisionResolutions(prev, next, 60 * DAY)[0].decisionResolvedAt).toBeUndefined()
  })

  it('does not stamp without decisionOpenedAt', () => {
    const prev = [item({ decisionRequired: true, status: 'identified' })]
    const next = [{ ...prev[0], status: 'done' as const }]
    expect(stampDecisionResolutions(prev, next, 60 * DAY)[0].decisionResolvedAt).toBeUndefined()
  })

  it('does not stamp an already-resolved item again', () => {
    const prev = [decisionItem({ status: 'in_progress', decisionResolvedAt: 40 * DAY })]
    const next = [{ ...prev[0], status: 'done' as const }]
    expect(stampDecisionResolutions(prev, next, 60 * DAY)[0].decisionResolvedAt).toBe(40 * DAY)
  })

  it('keeps first stamp across done→undone→done', () => {
    let current = decisionItem({ status: 'in_progress' })
    current = stampDecisionResolutions([current], [{ ...current, status: 'done' as const }], 60 * DAY)[0]
    expect(current.decisionResolvedAt).toBe(60 * DAY)
    // moved back out of done…
    const reopened = { ...current, status: 'in_progress' as const }
    // …and back to done much later: the first stamp survives
    const redone = stampDecisionResolutions([reopened], [{ ...reopened, status: 'done' as const }], 90 * DAY)
    expect(redone[0].decisionResolvedAt).toBe(60 * DAY)
  })

  it('no-op when statuses are unchanged (outcome edit passes through untouched)', () => {
    const before = decisionItem({ status: 'done', decisionResolvedAt: 30 * DAY })
    const editedOutcome = [{ ...before, outcome: 'learned a lot', updatedAt: 31 * DAY }]
    const result = stampDecisionResolutions([before], editedOutcome, 32 * DAY)
    expect(result[0].decisionResolvedAt).toBe(30 * DAY)
    expect(result[0].outcome).toBe('learned a lot')
  })

  it('handles brand-new items and removals gracefully', () => {
    const added = stampDecisionResolutions([], [decisionItem({ status: 'done' })], 60 * DAY)
    // no prev-twin ⇒ never retroactively stamped
    expect(added[0].decisionResolvedAt).toBeUndefined()
    const removed = stampDecisionResolutions([decisionItem()], [], 60 * DAY)
    expect(removed).toEqual([])
  })
})

describe('isDecisionItem', () => {
  it('is true iff decisionRequired === true', () => {
    expect(isDecisionItem(decisionItem())).toBe(true)
    expect(isDecisionItem(item({}))).toBe(false)
    expect(isDecisionItem(item({ decisionRequired: false }))).toBe(false)
  })
})

describe('sortForDecisions', () => {
  it('puts decision-required first, oldest openedAt first', () => {
    const plainA = item({ id: 'pa' })
    const old = decisionItem({ id: 'old', decisionOpenedAt: 10 * DAY })
    const young = decisionItem({ id: 'young', decisionOpenedAt: 20 * DAY })
    const plainB = item({ id: 'pb' })
    const sorted = sortForDecisions([plainA, young, old, plainB])
    expect(sorted.map(i => i.id)).toEqual(['old', 'young', 'pa', 'pb'])
  })

  it('keeps non-decision items stable after them', () => {
    const x = item({ id: 'x' })
    const y = item({ id: 'y' })
    const z = decisionItem({ id: 'z', decisionOpenedAt: 5 * DAY })
    const sorted = sortForDecisions([y, z, x])
    expect(sorted.map(i => i.id)).toEqual(['z', 'y', 'x'])
    // full stability among non-decisions:
    expect(sortForDecisions([y, x]).map(i => i.id)).toEqual(['y', 'x'])
  })

  it('orders missing-openedAt decisions after known-age ones', () => {
    const noAge = decisionItem({ id: 'noage', decisionOpenedAt: undefined })
    const aged = decisionItem({ id: 'aged', decisionOpenedAt: 5 * DAY })
    const plain = item({ id: 'p' })
    const sorted = sortForDecisions([noAge, plain, aged])
    expect(sorted.map(i => i.id)).toEqual(['aged', 'noage', 'p'])
  })
})

describe('decision age display', () => {
  const now = 100 * DAY

  it('decisionAgeDays floors partial days', () => {
    expect(decisionAgeDays(now - 2.5 * DAY, now)).toBe(2)
    expect(decisionAgeDays(now - 3 * DAY, now)).toBe(3)
  })

  it('decisionAgeState boundaries fresh/aging/stale/done/none', () => {
    expect(decisionAgeState(undefined, false, now)).toBe('none')
    expect(decisionAgeState(now - 7 * DAY, false, now)).toBe('fresh')
    expect(decisionAgeState(now - 7 * DAY - 1, false, now)).toBe('aging') // just over 7d
    expect(decisionAgeState(now - 21 * DAY, false, now)).toBe('aging')
    expect(decisionAgeState(now - 21 * DAY - 1, false, now)).toBe('stale') // just over 21d
    expect(decisionAgeState(now - 90 * DAY, false, now)).toBe('stale')
    expect(decisionAgeState(now - 90 * DAY, true, now)).toBe('done')
  })
})

describe('median + reporting', () => {
  it('median: odd, even, single, empty inputs', () => {
    expect(median([])).toBe(0) // empty ⇒ 0 sentinel
    expect(median([5])).toBe(5)
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([10, 2])).toBe(6)
  })

  it('medianLatencyDaysByOwner groups by owner, sorts count desc then name', () => {
    const base = { decisionRequired: true, status: 'done' as const }
    const items: ImprovementItem[] = [
      item({ ...base, id: '1', decisionOwner: 'Sam', decisionOpenedAt: 10 * DAY, decisionResolvedAt: 13 * DAY }),
      item({ ...base, id: '2', decisionOwner: 'Alex', decisionOpenedAt: 10 * DAY, decisionResolvedAt: 12 * DAY }),
      item({ ...base, id: '3', decisionOwner: 'Alex', decisionOpenedAt: 10 * DAY, decisionResolvedAt: 15 * DAY }),
      item({ ...base, id: '4', decisionOwner: 'Alex', decisionOpenedAt: 10 * DAY, decisionResolvedAt: 11 * DAY }),
    ]
    const rows = medianLatencyDaysByOwner(items)
    expect(rows).toEqual([
      { owner: 'Alex', count: 3, medianDays: 2 },
      { owner: 'Sam', count: 1, medianDays: 3 },
    ])
  })

  it('unassigned owners land in one bucket (rendered as "—")', () => {
    const base = { decisionRequired: true, status: 'done' as const, decisionOpenedAt: 10 * DAY }
    const rows = medianLatencyDaysByOwner([
      item({ ...base, id: '1', decisionResolvedAt: 12 * DAY }),
      item({ ...base, id: '2', decisionOwner: '', decisionResolvedAt: 14 * DAY }),
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0].owner).toBe('')
    expect(rows[0].count).toBe(2)
    expect(rows[0].medianDays).toBe(3)
  })

  it('items lacking timestamps are excluded from medians', () => {
    const rows = medianLatencyDaysByOwner([
      item({ decisionRequired: true, status: 'done', decisionOwner: 'Sam' }), // no timestamps at all
      item({
        decisionRequired: true,
        status: 'done',
        decisionOwner: 'Sam',
        decisionOpenedAt: 10 * DAY, // resolvedAt missing
      }),
      item({
        decisionRequired: true,
        status: 'done',
        decisionOwner: 'Sam',
        decisionOpenedAt: 10 * DAY,
        decisionResolvedAt: 11 * DAY,
      }),
    ])
    expect(rows).toEqual([{ owner: 'Sam', count: 1, medianDays: 1 }])
  })

  it('negative latency clamps to 0 (clock skew)', () => {
    expect(
      decisionLatencyDays({ decisionOpenedAt: 20 * DAY, decisionResolvedAt: 19.5 * DAY }),
    ).toBe(0)
    expect(
      medianLatencyDaysByOwner([
        item({
          decisionRequired: true,
          status: 'done',
          decisionOwner: 'Sam',
          decisionOpenedAt: 20 * DAY,
          decisionResolvedAt: 19.5 * DAY,
        }),
      ]),
    ).toEqual([{ owner: 'Sam', count: 1, medianDays: 0 }])
  })
})
