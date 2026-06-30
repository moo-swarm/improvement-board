import type { ImprovementItem } from '../types'

const CHANGE_PLANNER_BASE = 'https://agile-toolkit.github.io/change-planner/'

export function buildChangePlannerUrl(item: ImprovementItem): string {
  const params = new URLSearchParams({
    prefill: item.title,
    utm_source: 'improvement-board',
  })
  if (item.description) params.set('description', item.description)
  return `${CHANGE_PLANNER_BASE}?${params.toString()}`
}
