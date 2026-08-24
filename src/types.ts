export type ImprovementStatus = 'identified' | 'in_progress' | 'done'
export type Category = 'process' | 'technical' | 'people' | 'product' | 'other'
export type Screen = 'board' | 'kanban' | 'team' | 'dialogue' | 'timer' | 'learn'

export interface SprintArchive {
  sprintNumber: number
  archivedAt: string
  items: ImprovementItem[]
}

export interface TeamMember {
  id: string
  name: string
}

export interface ItemComment {
  id: string
  text: string
  author: string
  createdAt: number
}

export interface ImprovementItem {
  id: string
  title: string
  description: string
  category: Category
  status: ImprovementStatus
  owner: string
  copilot: string
  createdAt: number
  updatedAt: number
  /** @deprecated migrated to comments on load */
  dialogueNotes: string
  /** Timestamped comment thread for async dialogue notes */
  comments?: ItemComment[]
  /** Outcome notes when status is done (Kanban view) */
  outcome?: string
  /** Unix timestamp (ms) for optional due date */
  dueDate?: number
  /** Team upvote count for priority sorting */
  votes?: number
  /** Decision-latency tracking: this item is blocked on an explicit decision (AC3.1) */
  decisionRequired?: boolean
  /** Who owns making the decision (free text); missing ⇒ grouped as unassigned in reports */
  decisionOwner?: string
  /** When the need for a decision was recognised (ms); stamped once when the checkbox is ticked */
  decisionOpenedAt?: number
  /** Which decision model applies */
  decisionModel?: 'daci' | 'consent' | 'manager' | 'other'
  /** First time the item reached done while decision-required (ms); auto-stamped at the updateItems choke point.
   *  Kept across done → undone → done: latency measures first resolution, re-stamping would flatter the number. */
  decisionResolvedAt?: number
  /** Kill criteria: what would make us stop this (E2). Optional; absence ⇒ feature silent for the item. */
  killCriteria?: string
  /** Last sunset review (ms); absent items fall back to createdAt when computing review-due (E2) */
  lastReviewedAt?: number
}

/**
 * Snapshot appended to `improvement-board:stopped` when an item is stopped (E2, DR-E2-1).
 * Append-only log — one record per stop, never mutated after write; the counter is log.length.
 */
export interface StopItemRecord {
  id: string
  title: string
  category: Category
  owner?: string
  /** Free text or hours (OQ2: free text v1); omitted entirely when empty after trim */
  freedEffort?: string
  stoppedAt: number
}
