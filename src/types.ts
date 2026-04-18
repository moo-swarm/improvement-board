export type ImprovementStatus = 'identified' | 'in_progress' | 'done'
export type Category = 'process' | 'technical' | 'people' | 'product' | 'other'
export type Screen = 'board' | 'dialogue' | 'timer' | 'learn'

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
}
