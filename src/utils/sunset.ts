/**
 * Kill criteria & sunset reviews (E2). Pure module — no React/DOM/localStorage writes.
 *
 * A stopped item leaves the board entirely and is snapshotted into the append-only
 * `improvement-board:stopped` log (DR-E2-1); review-due compares a baseline timestamp
 * against a validated per-board interval (DR-E2-3).
 */
import type { Category, ImprovementItem, StopItemRecord } from '../types'

const MS_PER_DAY = 86_400_000

export const DEFAULT_REVIEW_INTERVAL_DAYS = 14

/** localStorage key holding the raw per-board review interval (no UI v1; DR-E2-3) */
export const REVIEW_INTERVAL_KEY = 'improvement-board:reviewIntervalDays'
/** localStorage key holding the append-only StopItemRecord[] log (one writer: App.handleStopItem) */
export const STOPPED_KEY = 'improvement-board:stopped'

/**
 * Sunset-review baseline (AC2.2): lastReviewedAt wins, then createdAt, then updatedAt —
 * the tail guards impossibly-old records that predate required fields, so every link of
 * the chain may be absent.
 */
export function reviewBaseline(
  item: Pick<Partial<ImprovementItem>, 'lastReviewedAt' | 'createdAt' | 'updatedAt'>,
): number | undefined {
  return item.lastReviewedAt ?? item.createdAt ?? item.updatedAt
}

/**
 * Review is due iff the baseline ages past `intervalDays` — strict inequality, mirroring
 * getAgeState's threshold style. Done items are never due (mirrors age-dot treatment of
 * done-as-fresh); a missing baseline or negative age (future lastReviewedAt / clock skew)
 * reads as not due.
 */
export function isReviewDue(
  item: Pick<ImprovementItem, 'status' | 'lastReviewedAt' | 'createdAt' | 'updatedAt'>,
  now: number,
  intervalDays: number = DEFAULT_REVIEW_INTERVAL_DAYS,
): boolean {
  if (item.status === 'done') return false
  const baseline = reviewBaseline(item)
  if (baseline == null) return false
  return (now - baseline) / MS_PER_DAY > intervalDays
}

const CATEGORIES: Category[] = ['process', 'technical', 'people', 'product', 'other']

/**
 * Raw localStorage value → interval in 1..365, or undefined when absent/garbage/out of
 * range ⇒ caller falls back to DEFAULT_REVIEW_INTERVAL_DAYS. Integers only.
 */
export function parseReviewIntervalDays(raw: string | null): number | undefined {
  const n = Number(raw)
  if (!Number.isInteger(n)) return undefined
  if (n < 1 || n > 365) return undefined
  return n
}

/**
 * Snapshot an item at stop time (AC2.3). freedEffort is trimmed; empty-after-trim ⇒ field
 * omitted (absence, never empty string), same for owner. The item itself leaves the board;
 * only this record survives.
 */
export function createStopRecord(
  item: ImprovementItem,
  freedEffort: string | undefined,
  now: number,
): StopItemRecord {
  const record: StopItemRecord = {
    id: item.id,
    title: item.title,
    category: item.category,
    stoppedAt: now,
  }
  const trimmedEffort = freedEffort?.trim()
  if (trimmedEffort) record.freedEffort = trimmedEffort
  if (item.owner.trim()) record.owner = item.owner.trim()
  return record
}

function toStopItemRecord(value: unknown): StopItemRecord | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const row = value as Record<string, unknown>
  if (
    typeof row.id !== 'string' ||
    row.id.length === 0 ||
    typeof row.title !== 'string' ||
    typeof row.category !== 'string' ||
    !CATEGORIES.includes(row.category as Category) ||
    typeof row.stoppedAt !== 'number' ||
    !Number.isFinite(row.stoppedAt)
  ) {
    return undefined
  }
  // rebuild from known fields only — unknown extras never pass through
  const record: StopItemRecord = {
    id: row.id,
    title: row.title,
    category: row.category as Category,
    stoppedAt: row.stoppedAt,
  }
  if (typeof row.owner === 'string') record.owner = row.owner
  if (typeof row.freedEffort === 'string') record.freedEffort = row.freedEffort
  return record
}

/**
 * Hardened loader for the stopped log: try/catch parse, array check, per-row shape filter.
 * Malformed rows are dropped individually; total loss only on unparseable JSON ⇒ [].
 */
export function parseStoppedLog(raw: string | null): StopItemRecord[] {
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  const records: StopItemRecord[] = []
  for (const row of parsed) {
    const record = toStopItemRecord(row)
    if (record) records.push(record)
  }
  return records
}
