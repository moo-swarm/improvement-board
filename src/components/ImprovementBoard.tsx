import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import type { ImprovementItem, TeamMember, Category, ImprovementStatus } from '../types'
import { getDueDateState, dueBadgeClasses, formatDueDate, getAgeState, ageDaysOld } from '../utils/dueDate'
import { buildKanbanUrl } from '../utils/kanbanLink'

interface Props {
  items: ImprovementItem[]
  members: TeamMember[]
  onItems: (items: ImprovementItem[]) => void
  onVote: (id: string) => void
  onResetVotes: () => void
  currentSprint: number
  onEndSprint: () => void
}

const STATUSES: ImprovementStatus[] = ['identified', 'in_progress', 'done']
const CATEGORIES: Category[] = ['process', 'technical', 'people', 'product', 'other']

const STATUS_COLORS: Record<ImprovementStatus, string> = {
  identified: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
  in_progress: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  done: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
}

const CAT_BADGE: Record<Category, string> = {
  process: 'bg-blue-100 text-blue-700',
  technical: 'bg-cyan-100 text-cyan-800',
  people: 'bg-purple-100 text-purple-700',
  product: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-600',
}

type SortMode = 'default' | 'due' | 'stale' | 'votes'

export default function ImprovementBoard({ items, members, onItems, onVote, onResetVotes, currentSprint, onEndSprint }: Props) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [exportState, setExportState] = useState<'idle' | 'busy' | 'done'>('idle')
  const boardRef = useRef<HTMLDivElement>(null)

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
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'process' as Category,
    copilotName: '',
    dueDateStr: '',
  })

  function addItem() {
    if (!form.title.trim()) return
    const dueDate = form.dueDateStr ? new Date(form.dueDateStr).getTime() : undefined
    const item: ImprovementItem = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: 'identified',
      owner: '',
      copilot: form.copilotName.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dialogueNotes: '',
      dueDate,
    }
    onItems([...items, item])
    setForm({ title: '', description: '', category: 'process', copilotName: '', dueDateStr: '' })
    setAdding(false)
  }

  function moveItem(id: string, status: ImprovementStatus) {
    onItems(
      items.map(i =>
        i.id === id ? { ...i, status, updatedAt: Date.now() } : i
      )
    )
  }

  function deleteItem(id: string) {
    onItems(items.filter(i => i.id !== id))
  }

  function updateOutcome(id: string, outcome: string) {
    onItems(
      items.map(i =>
        i.id === id ? { ...i, outcome, updatedAt: Date.now() } : i
      )
    )
  }

  function colItems(status: ImprovementStatus) {
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
    if (sortMode === 'votes') {
      return [...filtered].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    }
    return filtered
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-50">{t('kanban.title')}</h2>
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
            {t('board.sprint_count', { n: currentSprint })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setSortMode('default')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sortMode === 'default' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('board.sort_default')}
            </button>
            <button
              type="button"
              onClick={() => setSortMode('due')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-slate-200 dark:border-gray-700 ${
                sortMode === 'due' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('board.sort_due')}
            </button>
            <button
              type="button"
              onClick={() => setSortMode('stale')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-slate-200 dark:border-gray-700 ${
                sortMode === 'stale' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('board.sort_stale_first')}
            </button>
            <button
              type="button"
              onClick={() => setSortMode('votes')}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-slate-200 dark:border-gray-700 ${
                sortMode === 'votes' ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
            >
              {t('board.sort_votes')}
            </button>
          </div>
          {items.some(i => (i.votes ?? 0) > 0) && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t('board.reset_votes_confirm'))) onResetVotes()
              }}
              className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('board.reset_votes')}
            </button>
          )}
          <a
            href={buildKanbanUrl(items)}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={t('board.open_kanban_designer_title')}
          >
            {t('board.open_kanban_designer')}
          </a>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportState === 'busy'}
            className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exportState === 'busy'
              ? t('board.export_downloading')
              : exportState === 'done'
              ? t('board.export_copied')
              : t('board.export_png')}
          </button>
          {items.some(i => i.status === 'done') && (
            <button
              type="button"
              onClick={() => {
                const count = items.filter(i => i.status === 'done').length
                if (window.confirm(t('board.end_sprint_confirm', { count, next: currentSprint + 1 }))) {
                  onEndSprint()
                }
              }}
              className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('board.end_sprint')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + {t('kanban.addItem')}
          </button>
        </div>
      </div>

      {adding && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            autoFocus
            value={form.title}
            placeholder={t('kanban.itemTitlePlaceholder')}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <textarea
            value={form.description}
            placeholder={t('kanban.descriptionPlaceholder')}
            rows={2}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              className="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {t(`add_form.categories.${c}`)}
                </option>
              ))}
            </select>
            {members.length > 0 && (
              <select
                value={form.copilotName}
                onChange={e => setForm(f => ({ ...f, copilotName: e.target.value }))}
                className="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">{t('kanban.noCopilot')}</option>
                {members.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="date"
              value={form.dueDateStr}
              onChange={e => setForm(f => ({ ...f, dueDateStr: e.target.value }))}
              className="bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder={t('add_form.label_due_date')}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addItem}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {t('kanban.add')}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {t('kanban.cancel')}
            </button>
          </div>
        </div>
      )}

      <div ref={boardRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map(status => (
          <div key={status} className={`rounded-xl border-2 p-3 ${STATUS_COLORS[status]}`}>
            <h3 className="font-semibold text-slate-700 dark:text-gray-300 text-sm mb-3 flex items-center justify-between">
              <span>{t(`board.${status}`)}</span>
              <span className="bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 text-xs rounded-full px-2 py-0.5">
                {items.filter(i => i.status === status).length}
              </span>
            </h3>
            <div className="space-y-2 min-h-[60px]">
              {colItems(status).map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  members={members}
                  statuses={STATUSES}
                  catBadge={CAT_BADGE[item.category]}
                  onMove={moveItem}
                  onDelete={deleteItem}
                  onOutcome={updateOutcome}
                  onVote={onVote}
                  t={t}
                />
              ))}
              {items.filter(i => i.status === status).length === 0 && (
                <p className="text-slate-400 text-xs italic text-center py-2">{t('kanban.noItems')}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemCard({
  item,
  members,
  statuses,
  catBadge,
  onMove,
  onDelete,
  onOutcome,
  onVote,
  t,
}: {
  item: ImprovementItem
  members: TeamMember[]
  statuses: ImprovementStatus[]
  catBadge: string
  onMove: (id: string, s: ImprovementStatus) => void
  onDelete: (id: string) => void
  onOutcome: (id: string, o: string) => void
  onVote: (id: string) => void
  t: (k: string, opts?: Record<string, unknown>) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const copilot = members.find(m => m.name === item.copilot)
  const dueDateState = getDueDateState(item.dueDate, item.status === 'done')
  const ageState = getAgeState(item.updatedAt, item.status === 'done')
  const daysOld = ageDaysOld(item.updatedAt)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm p-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-sm font-medium text-slate-800 dark:text-gray-100 text-left flex-1 hover:text-brand-700 dark:hover:text-brand-400"
        >
          {item.title}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={t('board.delete')}
          className="text-slate-300 dark:text-gray-600 hover:text-red-400 text-base leading-none shrink-0"
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${catBadge}`}>
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
        {(copilot || item.copilot) && (
          <span className="text-xs text-slate-400 dark:text-gray-500">
            👤 {copilot?.name ?? item.copilot}
          </span>
        )}
        {dueDateState !== 'none' && item.dueDate && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${dueBadgeClasses(dueDateState)}`}>
            {dueDateState === 'overdue'
              ? t('board.overdue')
              : dueDateState === 'today'
              ? t('board.due_today')
              : `${t('board.due')}: ${formatDueDate(item.dueDate)}`}
          </span>
        )}
        {(item.comments?.length ?? 0) > 0 && (
          <span className="text-xs text-slate-400 dark:text-gray-500">💬 {item.comments!.length}</span>
        )}
        <button
          type="button"
          onClick={() => onVote(item.id)}
          title={t('board.vote')}
          aria-label={t('board.vote')}
          className="flex items-center gap-0.5 text-xs text-slate-400 dark:text-gray-500 hover:text-brand-600 transition-colors ml-auto"
        >
          <span>▲</span>
          <span className={item.votes ? 'text-brand-600 font-semibold' : ''}>{item.votes ?? 0}</span>
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          {item.description && <p className="text-xs text-slate-500 dark:text-gray-400">{item.description}</p>}
          {item.status === 'done' && (
            <textarea
              value={item.outcome ?? ''}
              placeholder={t('kanban.outcomePlaceholder')}
              rows={2}
              onChange={e => onOutcome(item.id, e.target.value)}
              className="w-full text-xs bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
            />
          )}
          <div className="flex gap-1 flex-wrap">
            {statuses
              .filter(s => s !== item.status)
              .map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onMove(item.id, s)}
                  className="text-xs border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 px-2 py-0.5 rounded transition-colors"
                >
                  → {t(`board.${s}`)}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
