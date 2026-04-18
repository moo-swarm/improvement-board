import { useTranslation } from 'react-i18next'
import type { ImprovementItem } from '../types'

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
}

export default function ImprovementCard({ item, onMoveForward, onDelete, onDialogue }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}>
          {t(`add_form.categories.${item.category}`)}
        </span>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors text-xs">
          ✕
        </button>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
      {item.description && (
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">{item.description}</p>
      )}
      <div className="text-xs text-gray-400 space-y-0.5 mb-3">
        <div>{t('board.owner')}: <span className="text-gray-600">{item.owner || '—'}</span></div>
        <div>
          {t('board.copilot')}:{' '}
          <span className="text-gray-600">{item.copilot || t('board.no_copilot')}</span>
        </div>
      </div>
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
    </div>
  )
}
