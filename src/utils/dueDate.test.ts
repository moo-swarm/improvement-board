import { describe, it, expect } from 'vitest'
import { getDueDateState, getAgeState, ageDaysOld } from './dueDate'

const DAY = 86_400_000

// Regression suite: decision-latency tracking (utils/decision.ts) builds on these
// helpers' conventions — they must stay put.

describe('getAgeState', () => {
  // Mid-bucket ages only: getAgeState reads Date.now() internally, so exact
  // 7/21-day boundaries would race the clock; those live in decision.test.ts
  // against decisionAgeState's injectable now.
  const now = Date.now()
  it('fresh below 7 days', () => {
    expect(getAgeState(now - 1 * DAY, false)).toBe('fresh')
  })
  it('aging above 7 days, stale above 21 days', () => {
    expect(getAgeState(now - 8 * DAY, false)).toBe('aging')
    expect(getAgeState(now - 22 * DAY, false)).toBe('stale')
  })
  it('done is neutral regardless of age', () => {
    expect(getAgeState(now - 90 * DAY, true)).toBe('fresh')
  })
})

describe('getDueDateState', () => {
  const now = Date.now()
  it('none without a due date', () => {
    expect(getDueDateState(undefined, false)).toBe('none')
  })
  it('done overrides everything when complete', () => {
    expect(getDueDateState(now - 5 * DAY, true)).toBe('done')
  })
  it('overdue / today / soon / future buckets', () => {
    expect(getDueDateState(now - 2 * DAY, false)).toBe('overdue')
    expect(getDueDateState(now + 0.5 * DAY, false)).toBe('today')
    expect(getDueDateState(now + 2 * DAY, false)).toBe('soon')
    expect(getDueDateState(now + 10 * DAY, false)).toBe('future')
  })
})

describe('ageDaysOld', () => {
  const now = Date.now()
  it('floors partial days like the decision-age convention', () => {
    expect(ageDaysOld(now - 2.5 * DAY)).toBe(2)
    expect(ageDaysOld(now)).toBe(0)
  })
})
