export type Category = 'process' | 'people' | 'tools' | 'environment' | 'other';
export type ItemStatus = 'identified' | 'in_progress' | 'done';

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: ItemStatus;
  copilotId: string | null;
  createdAt: string;
  updatedAt: string;
  outcome?: string;
}

export interface TeamMember {
  id: string;
  name: string;
}

export interface DialogueNote {
  id: string;
  itemId: string;
  question: string;
  answer: string;
  timestamp: string;
}

export type View = 'board' | 'timer' | 'dialogue' | 'team';
