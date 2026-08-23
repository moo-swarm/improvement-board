/**
 * Decision-latency tracking (E3). Pure module — no React/DOM/localStorage imports.
 *
 * Latency = decisionResolvedAt − decisionOpenedAt. resolution stamping happens once,
 * at the App.updateItems choke point, via stampDecisionResolutions(prev, next, now).
 */
import type { ImprovementItem } from '../types'

const MS_PER_DAY = 86_400_000

export type DecisionAgeState = 'fresh' | 'aging' | 'stale' | 'done' | 'none'

/**
 * Stamp decisionResolvedAt on items that transition to done in `next` relative to `prev`.
 * Idempotent: only items with decisionRequired === true, a decisionOpenedAt, and no
 * existing decisionResolvedAt get stamped, so re-opening and re-completing an item
 * keeps its FIRST stamp.
 */
export function stampDecisionResolutions(
  prev: ImprovementItem[],
  next: ImprovementItem[],
  now: number,
): ImprovementItem[] {
  const prevById = new Map(prev.map(item => [item.id, item]))
  return next.map(item => {
    const before = prevById.get(item.id)
    if (!before) return item
    if (
      before.status !== 'done' &&
      item.status === 'done' &&
      item.decisionRequired === true &&
      item.decisionOpenedAt != null &&
      item.decisionResolvedAt == null
    ) {
      return { ...item, decisionResolvedAt: now }
    }
    return item
  })
}

/** Filter primitive for "decision-required" (AC3.2). Strict: true iff the flag is exactly true. */
export function isDecisionItem(item: ImprovementItem): boolean {
  return item.decisionRequired === true
}

/**
 * Decisions-first stable partition for board sorting (AC3.2): decision-required items first,
 * oldest decisionOpenedAt on top; decisions without an openedAt come after those; all other
 * items keep their original order after them.
 */
export function sortForDecisions(items: ImprovementItem[]): ImprovementItem[] {
  const withAge: ImprovementItem[] = []
  const withoutAge: ImprovementItem[] = []
  const rest: ImprovementItem[] = []
  for (const item of items) {
    if (item.decisionRequired !== true) rest.push(item)
    else if (item.decisionOpenedAt != null) withAge.push(item)
    else withoutAge.push(item)
  }
  // Array.prototype.sort is stable (ES2019+), so equal timestamps preserve board order.
  withAge.sort((a, b) => (a.decisionOpenedAt ?? 0) - (b.decisionOpenedAt ?? 0))
  return [...withAge, ...withoutAge, ...rest]
}

/** Whole days since the decision was opened; same floor convention as ageDaysOld (dueDate.ts). */
export function decisionAgeDays(openedAt: number, now: number = Date.now()): number {
  return Math.floor((now - openedAt) / MS_PER_DAY)
}

/** Age bucket mirroring getAgeState thresholds (>7 aging, >21 stale); done ⇒ neutral. */
export function decisionAgeState(
  openedAt: number | undefined,
  isDone: boolean,
  now: number = Date.now(),
): DecisionAgeState {
  if (!openedAt) return 'none'
  if (isDone) return 'done'
  const days = (now - openedAt) / MS_PER_DAY
  if (days > 21) return 'stale'
  if (days > 7) return 'aging'
  return 'fresh'
}

/**
 * Latency in whole days for one resolved decision; null when either timestamp is missing
 * (honest absence). Clock skew (resolved before opened) clamps at 0.
 */
export function decisionLatencyDays(
  item: Pick<ImprovementItem, 'decisionOpenedAt' | 'decisionResolvedAt'>,
): number | null {
  if (item.decisionResolvedAt == null || item.decisionOpenedAt == null) return null
  return Math.max(0, Math.floor((item.decisionResolvedAt - item.decisionOpenedAt) / MS_PER_DAY))
}

/** Standard median (mean of middle two for even counts); empty input ⇒ 0 sentinel. */
export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

export interface OwnerLatencyRow {
  /** Owner name; '' marks the unassigned bucket (rendered as "—") */
  owner: string
  count: number
  medianDays: number
}

/**
 * Median decision latency split by owner over resolved decision items (AC3.3 reporting core).
 * Items lacking timestamps are excluded. Rows sort by count desc, then owner name asc.
 */
export function medianLatencyDaysByOwner(items: ImprovementItem[]): OwnerLatencyRow[] {
  const latenciesByOwner = new Map<string, number[]>()
  for (const item of items) {
    const latency = decisionLatencyDays(item)
    if (latency === null) continue
    const owner = item.decisionOwner ?? ''
    const bucket = latenciesByOwner.get(owner) ?? []
    bucket.push(latency)
    latenciesByOwner.set(owner, bucket)
  }
  return [...latenciesByOwner.entries()]
    .map(([owner, values]) => ({ owner, count: values.length, medianDays: median(values) }))
    .sort((a, b) => b.count - a.count || a.owner.localeCompare(b.owner))
}
