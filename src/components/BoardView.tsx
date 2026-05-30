import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import type { ImprovementItem, ImprovementStatus } from '../types'
import ImprovementCard from './ImprovementCard'
import AddItemModal from './AddItemModal'

const COLUMNS: ImprovementStatus[] = ['identified', 'in_progress', 'done']
const SPRINT_METRICS_URL = 'https://agile-toolkit.github.io/sprint-metrics/'

type SortMode = 'default' | 'due' | 'stale'

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
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [exportState, setExportState] = useState<'idle' | 'busy' | 'done'>('idle')
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefillTitle) setShowAdd(true)
  }, [prefillTitle])

  async function handleExport() {
    if (!boardRef.current || exportState === 'busy') return
    setExportState('busy')
    try {
      const canvas = await html2canvas(boardRef.current, { useCORS: true, backgroundColor: '#f9fafb' })
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (blob && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      } else {
        const date = new Date().toISOString().slice(0, 10)
        const link = document.createElement('a')
        link.download = `improvement-board-${date}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      setExportState('done')
      setTimeout(() => setExportState('idle'), 2000)
    } catch {
      setExportState('idle')
    }
  }

  const getNext = (status: ImprovementStatus): ImprovementStatus | null => {
    if (status === 'identified') return 'in_progress'
    if (status === 'in_progress') return 'done'
    return null
  }

  const colItems = (status: ImprovementStatus) => {
    const filtered = items.filter(i => i.status === status)
    if (sortMode === 'due') {
      return [...filtered].sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return 0
      })
    }
    if (sortMode === 'stale') {
      return [...filtered].sort((a, b) => a.updatedAt - b.updatedAt)
    }
    return filtered
  }

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('board.title')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button
              onClick={() => setSortMode('default')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sortMode === 'default' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('board.sort_default')}
            </button>
            <button
              onClick={() => setSortMode('due')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
                sortMode === 'due' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('board.sort_due')}
            </button>
            <button
              onClick={() => setSortMode('stale')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
                sortMode === 'stale' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('board.sort_stale_first')}
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={exportState === 'busy'}
            className="btn-secondary text-xs"
          >
            {exportState === 'busy'
              ? t('board.export_downloading')
              : exportState === 'done'
              ? t('board.export_copied')
              : t('board.export_png')}
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            + {t('board.add')}
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p>{t('board.empty')}</p>
        </div>
      )}

      <div ref={boardRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
