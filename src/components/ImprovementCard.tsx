import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem } from '../types'
import { getDueDateState, dueBadgeClasses, formatDueDate, getAgeState, ageDaysOld } from '../utils/dueDate'
import { buildChangePlannerUrl } from '../utils/changePlannerLink'
import { decisionAgeState, decisionAgeDays, type DecisionAgeState } from '../utils/decision'
import { DEFAULT_REVIEW_INTERVAL_DAYS, isReviewDue } from '../utils/sunset'

const CATEGORY_COLORS: Record<string, string> = {
  process: 'bg-blue-100 text-blue-700',
  technical: 'bg-purple-100 text-purple-700',
  people: 'bg-orange-100 text-orange-700',
  product: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
}

const DECISION_MODEL_OPTIONS = ['daci', 'consent', 'manager', 'other'] as const

const DECISION_DOT_CLASSES: Record<DecisionAgeState, string> = {
  fresh: 'bg-brand-400',
  aging: 'bg-amber-400',
  stale: 'bg-red-500',
  done: 'bg-gray-300 dark:bg-gray-600',
  none: '',
}

interface Props {
  item: ImprovementItem
  onMoveForward?: () => void
  onDelete: () => void
  onDialogue?: () => void
  onVote?: () => void
  selectMode?: boolean
  selected?: boolean
  onToggleSelect?: () => void
  /** Present on the board view only; enables inline decision-tracking edits */
  onUpdate?: (item: ImprovementItem) => void
  /** E2 stop flow (both card variants — UX decision 5); opens the StopItemModal upstream */
  onStop?: () => void
  /** Per-board sunset-review interval in days (DR-E2-3); defaults to 14 */
  reviewIntervalDays?: number
}

export default function ImprovementCard({ item, onMoveForward, onDelete, onDialogue, onVote, selectMode, selected, onToggleSelect, onUpdate, onStop, reviewIntervalDays = DEFAULT_REVIEW_INTERVAL_DAYS }: Props) {
  const { t } = useTranslation()
  const [decisionOpen, setDecisionOpen] = useState(false)
  const [criteriaOpen, setCriteriaOpen] = useState(false)
  const dueDateState = getDueDateState(item.dueDate, item.status === 'done')
  const ageState = getAgeState(item.updatedAt, item.status === 'done')
  const daysOld = ageDaysOld(item.updatedAt)
  const decisionState = decisionAgeState(item.decisionOpenedAt, item.status === 'done')
  const decisionDays = item.decisionOpenedAt != null ? decisionAgeDays(item.decisionOpenedAt) : 0
  const reviewDue = isReviewDue(item, Date.now(), reviewIntervalDays)

  const toggleDecisionRequired = () => {
    if (!onUpdate) return
    const next = item.decisionRequired !== true
    onUpdate({
      ...item,
      decisionRequired: next,
      // opened-at stamps once, on the first tick — re-ticking later keeps the original clock
      decisionOpenedAt: next ? (item.decisionOpenedAt ?? Date.now()) : item.decisionOpenedAt,
    })
  }

  const patchDecision = (patch: Partial<Pick<ImprovementItem, 'decisionOwner' | 'decisionModel'>>) => {
    onUpdate?.({ ...item, ...patch })
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border p-4 shadow-sm ${selected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectMode && (
            <input
              type="checkbox"
              checked={!!selected}
              onChange={onToggleSelect}
              aria-label={t('board.select_item')}
              className="mr-0.5 shrink-0"
            />
          )}
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
          {item.decisionRequired === true && item.decisionOpenedAt != null && (
            <span
              className={`inline-block w-2 h-2 rounded-full shrink-0 ${DECISION_DOT_CLASSES[decisionState]}`}
              title={t('board.decision_badge_title', { days: decisionDays })}
            />
          )}
        </div>
        <button onClick={onDelete} aria-label={t('board.delete')} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors text-xs">
          ✕
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-50 text-sm mb-1">{item.title}</h3>
      {item.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{item.description}</p>
      )}
      {item.killCriteria && (
        <div
          className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate"
          title={`${t('board.kill_criteria_label')}: ${item.killCriteria}`}
        >
          ⚑ {item.killCriteria}
        </div>
      )}
      <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5 mb-2">
        <div>{t('board.owner')}: <span className="text-gray-600 dark:text-gray-300">{item.owner || '—'}</span></div>
        <div>
          {t('board.copilot')}:{' '}
          <span className="text-gray-600 dark:text-gray-300">{item.copilot || t('board.no_copilot')}</span>
        </div>
      </div>
      {reviewDue && onUpdate && (
        <div className="mb-2">
          {/* Click-to-complete (UX decision 3): badge sets lastReviewedAt = now, no confirm */}
          <button
            type="button"
            onClick={() => onUpdate({ ...item, lastReviewedAt: Date.now() })}
            title={t('board.mark_reviewed')}
            aria-label={t('board.mark_reviewed')}
            className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
          >
            {t('board.review_due')}
          </button>
        </div>
      )}
      {onUpdate && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setDecisionOpen(v => !v)}
            aria-expanded={decisionOpen}
            className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
          >
            ⚑ {t('board.decision_required')}
          </button>
          {decisionOpen && (
            <div className="mt-2 rounded-lg border border-gray-100 p-3 space-y-2 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={item.decisionRequired === true}
                  onChange={toggleDecisionRequired}
                />
                <span>{t('board.decision_required')}</span>
              </label>
              {item.decisionRequired === true && (
                <>
                  <div>
                    <label className="block mb-1 text-gray-500 dark:text-gray-400">
                      {t('board.decision_owner_label')}
                    </label>
                    <input
                      value={item.decisionOwner ?? ''}
                      onChange={e => patchDecision({ decisionOwner: e.target.value })}
                      aria-label={t('board.decision_owner_label')}
                      className="w-full text-xs bg-transparent border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-500 dark:text-gray-400">
                      {t('board.decision_model_label')}
                    </label>
                    <select
                      value={item.decisionModel ?? ''}
                      onChange={e =>
                        patchDecision({ decisionModel: (e.target.value || undefined) as ImprovementItem['decisionModel'] })
                      }
                      aria-label={t('board.decision_model_label')}
                      className="w-full text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    >
                      <option value="">—</option>
                      {DECISION_MODEL_OPTIONS.map(m => (
                        <option key={m} value={m}>{t(`board.decision_model_${m}`)}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      {onUpdate && (
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setCriteriaOpen(v => !v)}
            aria-expanded={criteriaOpen}
            className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
          >
            ✎ {t('board.kill_criteria_label')}
          </button>
          {criteriaOpen && (
            <div className="mt-2">
              <textarea
                value={item.killCriteria ?? ''}
                rows={2}
                aria-label={t('board.kill_criteria_label')}
                placeholder={t('add_form.placeholder_kill_criteria')}
                onChange={e => onUpdate({ ...item, killCriteria: e.target.value })}
                className="w-full text-xs bg-transparent border border-gray-200 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-gray-700 dark:text-gray-100 resize-none"
              />
            </div>
          )}
        </div>
      )}
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
          {/* Stop is a separate verb from delete (UX decision 1): neutral, not red, not ✕.
              Done items completed — they were never stopped, so the action hides there. */}
          {onStop && item.status !== 'done' && (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-brand-600 transition-colors"
            >
              <span>⏹</span>
              <span>{t('board.stop_item')}</span>
            </button>
          )}
          <a
            href={buildChangePlannerUrl(item)}
            target="_blank"
            rel="noopener noreferrer"
            title={t('board.promote_to_change_planner')}
            aria-label={t('board.promote_to_change_planner')}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand-600 transition-colors leading-none"
          >
            ↗
          </a>
          <button
            onClick={onVote}
            title={t('board.vote')}
            aria-label={t('board.vote')}
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
