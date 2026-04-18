export type ImprovementStatus = 'identified' | 'in_progress' | 'done'
export type Category = 'process' | 'technical' | 'people' | 'product' | 'other'
export type Screen = 'board' | 'kanban' | 'team' | 'dialogue' | 'timer' | 'learn'

export interface TeamMember {
  id: string
  name: string
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
  dialogueNotes: string
  /** Outcome notes when status is done (Kanban view) */
  outcome?: string
}
