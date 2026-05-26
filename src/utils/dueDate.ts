export type DueDateState = 'overdue' | 'today' | 'soon' | 'future' | 'done' | 'none'

export function getDueDateState(dueDate: number | undefined, isDone: boolean): DueDateState {
  if (!dueDate) return 'none'
  if (isDone) return 'done'
  const now = Date.now()
  const msPerDay = 86_400_000
  const daysUntil = (dueDate - now) / msPerDay
  if (daysUntil < 0) return 'overdue'
  if (daysUntil < 1) return 'today'
  if (daysUntil <= 2) return 'soon'
  return 'future'
}

export function dueBadgeClasses(state: DueDateState): string {
  switch (state) {
    case 'overdue': return 'bg-red-100 text-red-700 line-through'
    case 'today':   return 'bg-amber-100 text-amber-700'
    case 'soon':    return 'bg-amber-100 text-amber-700'
    case 'future':  return 'bg-gray-100 text-gray-500'
    case 'done':    return 'bg-gray-100 text-gray-400 line-through'
    default:        return ''
  }
}

export function formatDueDate(dueDate: number): string {
  return new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
