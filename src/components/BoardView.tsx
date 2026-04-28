import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem, ImprovementStatus } from '../types'
import ImprovementCard from './ImprovementCard'
import AddItemModal from './AddItemModal'

const COLUMNS: ImprovementStatus[] = ['identified', 'in_progress', 'done']
const SPRINT_METRICS_URL = 'https://agile-toolkit.github.io/sprint-metrics/'

interface Props {
  items: ImprovementItem[]
  onAdd: (item: ImprovementItem) => void
  onUpdate: (item: ImprovementItem) => void
  onDelete: (id: string) => void
  onDialogue: (item: ImprovementItem) => void
  prefillTitle?: string
  fromSprintMetrics?: boolean
}

export default function BoardView({ items, onAdd, onUpdate, onDelete, onDialogue, prefillTitle, fromSprintMetrics }: Props) {
  const { t } = useTranslation()
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (prefillTitle) setShowAdd(true)
  }, [prefillTitle])

  const getNext = (status: ImprovementStatus): ImprovementStatus | null => {
    if (status === 'identified') return 'in_progress'
    if (status === 'in_progress') return 'done'
    return null
  }

  const colItems = (status: ImprovementStatus) => items.filter(i => i.status === status)

  return (
    <div>
      {fromSprintMetrics && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span>📊</span>
          <span>{t('board.from_sprint_metrics')}</span>
          <a
            href={SPRINT_METRICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto underline hover:text-amber-900 text-xs"
          >
            {t('board.open_sprint_metrics')}
          </a>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('board.title')}</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + {t('board.add')}
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p>{t('board.empty')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <div key={col}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                {t(`board.${col}`)}
              </h2>
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                {colItems(col).length}
              </span>
            </div>
            <div className="space-y-3 min-h-[120px]">
              {colItems(col).map(item => (
                <ImprovementCard
                  key={item.id}
                  item={item}
                  onDelete={() => onDelete(item.id)}
                  onMoveForward={
                    getNext(item.status)
                      ? () => onUpdate({ ...item, status: getNext(item.status)!, updatedAt: Date.now() })
                      : undefined
                  }
                  onDialogue={item.status === 'in_progress' ? () => onDialogue(item) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>{t('board.suite_link_label')}</span>
        <a
          href={SPRINT_METRICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-brand-600 transition-colors"
        >
          📊 {t('board.open_sprint_metrics')}
        </a>
      </div>

      {showAdd && (
        <AddItemModal
          onAdd={item => { onAdd(item); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
          initialTitle={prefillTitle}
        />
      )}
    </div>
  )
}
