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
}
