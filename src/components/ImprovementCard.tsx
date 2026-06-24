import { useTranslation } from 'react-i18next'
import type { ImprovementItem } from '../types'
import { getDueDateState, dueBadgeClasses, formatDueDate, getAgeState, ageDaysOld } from '../utils/dueDate'

const CATEGORY_COLORS: Record<string, string> = {
  process: 'bg-blue-100 text-blue-700',
  technical: 'bg-purple-100 text-purple-700',
  people: 'bg-orange-100 text-orange-700',
  product: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
}

interface Props {
  item: ImprovementItem
  onMoveForward?: () => void
  onDelete: () => void
  onDialogue?: () => void
  onVote?: () => void
}

export default function ImprovementCard({ item, onMoveForward, onDelete, onDialogue, onVote }: Props) {
  const { t } = useTranslation()
  const dueDateState = getDueDateState(item.dueDate, item.status === 'done')
  const ageState = getAgeState(item.updatedAt, item.status === 'done')
  const daysOld = ageDaysOld(item.updatedAt)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}>
            {t(`add_form.categories.${item.category}`)}
          </span>
          {ageState === 'aging' && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0"
              title={t('board.age_aging_tooltip', { days: daysOld })}
            />
          )}
          {ageState === 'stale' && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0"
              title={t('board.age_stale_tooltip', { days: daysOld })}
            />
          )}
        </div>
        <button onClick={onDelete} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors text-xs">
          ✕
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm mb-1">{item.title}</h3>
      {item.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{item.description}</p>
      )}
      <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5 mb-2">
        <div>{t('board.owner')}: <span className="text-gray-600 dark:text-gray-300">{item.owner || '—'}</span></div>
        <div>
          {t('board.copilot')}:{' '}
          <span className="text-gray-600 dark:text-gray-300">{item.copilot || t('board.no_copilot')}</span>
        </div>
      </div>
      {dueDateState !== 'none' && item.dueDate && (
        <div className="mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dueBadgeClasses(dueDateState)}`}>
            {dueDateState === 'overdue'
              ? t('board.overdue')
              : dueDateState === 'today'
              ? t('board.due_today')
              : `${t('board.due')}: ${formatDueDate(item.dueDate)}`}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {onMoveForward && (
            <button onClick={onMoveForward} className="btn-primary text-xs py-1 px-3">
              {item.status === 'identified' ? t('board.move_to_progress') : t('board.move_to_done')}
            </button>
          )}
          {onDialogue && item.status === 'in_progress' && (
            <button onClick={onDialogue} className="btn-secondary text-xs py-1 px-3">
              {t('board.start_dialogue')}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(item.comments?.length ?? 0) > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">💬 {item.comments!.length}</span>
          )}
          <button
            onClick={onVote}
            title={t('board.vote')}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-brand-600 transition-colors"
          >
            <span>▲</span>
            <span className={item.votes ? 'text-brand-600 font-semibold' : ''}>{item.votes ?? 0}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
