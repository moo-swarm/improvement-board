import type { ImprovementItem, ImprovementStatus } from '../types'

const KANBAN_DESIGNER_URL = 'https://agile-toolkit.github.io/kanban-designer/'

const STATUS_COLUMN_NAMES: Record<ImprovementStatus, string> = {
  identified: 'Identified',
  in_progress: 'In Progress',
  done: 'Done',
}

export function buildKanbanUrl(items: ImprovementItem[]): string {
  const columns = (['identified', 'in_progress', 'done'] as ImprovementStatus[]).map(status => ({
    id: status,
    name: STATUS_COLUMN_NAMES[status],
    wipLimit: null,
    cards: items
      .filter(i => i.status === status)
      .map(i => ({
        id: i.id,
        title: i.title,
        description: i.description || undefined,
      })),
    subColumns: [],
  }))

  const board = {
    id: crypto.randomUUID(),
    name: 'Improvement Board',
    columns,
    swimLanes: [],
    showWipWarnings: false,
  }

  const params = new URLSearchParams({
    prefill: JSON.stringify(board),
    utm_source: 'improvement-board',
  })

  return `${KANBAN_DESIGNER_URL}?${params.toString()}`
}
