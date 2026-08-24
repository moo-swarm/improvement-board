import { describe, it, expect } from 'vitest'
import type { ImprovementItem, StopItemRecord } from '../types'
import {
  DEFAULT_REVIEW_INTERVAL_DAYS,
  reviewBaseline,
  isReviewDue,
  parseReviewIntervalDays,
  createStopRecord,
  parseStoppedLog,
} from './sunset'

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

describe('review baseline', () => {
  it('reviewBaseline prefers lastReviewedAt over createdAt', () => {
    expect(reviewBaseline({ lastReviewedAt: 30 * DAY, createdAt: 10 * DAY, updatedAt: 20 * DAY })).toBe(30 * DAY)
    // no lastReviewedAt ⇒ createdAt
    expect(reviewBaseline({ createdAt: 10 * DAY, updatedAt: 20 * DAY })).toBe(10 * DAY)
    // defensive tail: impossibly-old record missing createdAt
    expect(reviewBaseline({ updatedAt: 20 * DAY })).toBe(20 * DAY)
    expect(reviewBaseline({})).toBeUndefined()
  })

  it('falls back to createdAt when lastReviewedAt absent', () => {
    const subject = item({ createdAt: 10 * DAY, updatedAt: 11 * DAY })
    // baseline = createdAt = day 10; due strictly after day 24
    expect(isReviewDue(subject, 10 * DAY + 14 * DAY)).toBe(false)
    expect(isReviewDue(subject, 10 * DAY + 14 * DAY + 1)).toBe(true)
  })
})

describe('isReviewDue', () => {
  it('isReviewDue boundary: exactly interval ⇒ false, +1ms ⇒ true', () => {
    const fresh = item({ createdAt: 0, updatedAt: 0 })
    expect(isReviewDue(fresh, DEFAULT_REVIEW_INTERVAL_DAYS * DAY)).toBe(false)
    expect(isReviewDue(fresh, DEFAULT_REVIEW_INTERVAL_DAYS * DAY + 1)).toBe(true)
    expect(DEFAULT_REVIEW_INTERVAL_DAYS).toBe(14)
  })

  it('done items are never due', () => {
    const ancient = item({ status: 'done', createdAt: 0, updatedAt: 0 })
    expect(isReviewDue(ancient, 400 * DAY)).toBe(false)
  })

  it('future lastReviewedAt ⇒ not due', () => {
    // clock skew: reviewed "in the future" relative to now
    const skewed = item({ createdAt: 0, lastReviewedAt: 50 * DAY })
    expect(isReviewDue(skewed, 20 * DAY)).toBe(false)
  })

  it('custom interval widens/narrows the window', () => {
    const subject = item({ createdAt: 0 })
    expect(isReviewDue(subject, 30 * DAY, 30)).toBe(false)
    expect(isReviewDue(subject, 30 * DAY + 1, 30)).toBe(true)
    expect(isReviewDue(subject, 3 * DAY + 1, 3)).toBe(true)
  })
})

describe('parseReviewIntervalDays', () => {
  it('parseReviewIntervalDays accepts int, clamps 1..365, rejects garbage', () => {
    expect(parseReviewIntervalDays('14')).toBe(14)
    expect(parseReviewIntervalDays('1')).toBe(1)
    expect(parseReviewIntervalDays('365')).toBe(365)
    // out of range, floats, junk and absence all ⇒ undefined ⇒ caller uses default
    expect(parseReviewIntervalDays('0')).toBeUndefined()
    expect(parseReviewIntervalDays('-5')).toBeUndefined()
    expect(parseReviewIntervalDays('99999')).toBeUndefined()
    expect(parseReviewIntervalDays('2.5')).toBeUndefined()
    expect(parseReviewIntervalDays('abc')).toBeUndefined()
    expect(parseReviewIntervalDays('')).toBeUndefined()
    expect(parseReviewIntervalDays(null)).toBeUndefined()
  })
})

describe('createStopRecord', () => {
  const now = 100 * DAY

  it('createStopRecord snapshots fields and drops empty freedEffort', () => {
    const src = item({ id: 'i9', title: 'Legacy report', category: 'process', owner: 'Sam' })
    expect(createStopRecord(src, '  ~4 h/week  ', now)).toEqual({
      id: 'i9',
      title: 'Legacy report',
      category: 'process',
      owner: 'Sam',
      freedEffort: '~4 h/week',
      stoppedAt: now,
    })
  })

  it('omits optional fields entirely when empty/blank (absence, not empty string)', () => {
    const rec = createStopRecord(item({ id: 'i2', title: 'T', category: 'people' }), '   ', now)
    expect(rec).toEqual({ id: 'i2', title: 'T', category: 'people', stoppedAt: now })
    expect('owner' in rec).toBe(false)
    expect('freedEffort' in rec).toBe(false)
    // undefined freed effort behaves identically to blank
    expect(createStopRecord(item({}), undefined, now).freedEffort).toBeUndefined()
  })

  it('record round-trips through parseStoppedLog unchanged', () => {
    const src = item({ id: 'r1', title: 'Ritual', category: 'other', owner: 'Ana' })
    const log = [createStopRecord(src, 'two meetings', now)]
    expect(parseStoppedLog(JSON.stringify(log))).toEqual(log)
  })
})

describe('parseStoppedLog', () => {
  it('parseStoppedLog filters malformed rows, survives corrupt JSON', () => {
    const good: StopItemRecord = { id: 'a', title: 'A', category: 'process', stoppedAt: 5 }
    const full: StopItemRecord = { id: 'b', title: 'B', category: 'technical', owner: 'X', freedEffort: '3h', stoppedAt: 6 }
    const mixed = JSON.stringify([
      good,
      null,
      'junk',
      42,
      { id: 7 }, // wrong field types
      { title: 'no id', category: 'process', stoppedAt: 1 },
      { id: 'c', title: 'bad category', category: 'nope', stoppedAt: 2 },
      { id: 'd', title: 'no timestamp', category: 'process' },
      full,
    ])
    expect(parseStoppedLog(mixed)).toEqual([good, full])

    // total loss only on unparseable JSON or non-array payloads
    expect(parseStoppedLog('not json {')).toEqual([])
    expect(parseStoppedLog(JSON.stringify({ oops: true }))).toEqual([])
    expect(parseStoppedLog(null)).toEqual([])
    expect(parseStoppedLog('')).toEqual([])
  })

  it('drops unknown extra fields instead of passing them through', () => {
    const sneaky = JSON.stringify([{ id: 'x', title: 'X', category: 'product', stoppedAt: 9, injected: 'payload' }])
    expect(parseStoppedLog(sneaky)).toEqual([{ id: 'x', title: 'X', category: 'product', stoppedAt: 9 }])
  })
})
