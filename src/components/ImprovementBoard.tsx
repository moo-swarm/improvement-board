import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem, TeamMember, Category, ImprovementStatus } from '../types'

interface Props {
  items: ImprovementItem[]
  members: TeamMember[]
  onItems: (items: ImprovementItem[]) => void
}

const STATUSES: ImprovementStatus[] = ['identified', 'in_progress', 'done']
const CATEGORIES: Category[] = ['process', 'technical', 'people', 'product', 'other']

const STATUS_COLORS: Record<ImprovementStatus, string> = {
  identified: 'bg-slate-100 border-slate-300',
  in_progress: 'bg-amber-50 border-amber-200',
  done: 'bg-green-50 border-green-200',
}

const CAT_BADGE: Record<Category, string> = {
  process: 'bg-blue-100 text-blue-700',
  technical: 'bg-cyan-100 text-cyan-800',
  people: 'bg-purple-100 text-purple-700',
  product: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-600',
}

export default function ImprovementBoard({ items, members, onItems }: Props) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'process' as Category,
    copilotName: '',
  })

  function addItem() {
    if (!form.title.trim()) return
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
    }
    onItems([...items, item])
    setForm({ title: '', description: '', category: 'process', copilotName: '' })
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('kanban.title')}</h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + {t('kanban.addItem')}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            autoFocus
            value={form.title}
            placeholder={t('kanban.itemTitlePlaceholder')}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <textarea
            value={form.description}
            placeholder={t('kanban.descriptionPlaceholder')}
            rows={2}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
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
                className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">{t('kanban.noCopilot')}</option>
                {members.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
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
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {t('kanban.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map(status => (
          <div key={status} className={`rounded-xl border-2 p-3 ${STATUS_COLORS[status]}`}>
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center justify-between">
              <span>{t(`board.${status}`)}</span>
              <span className="bg-white text-slate-500 text-xs rounded-full px-2 py-0.5">
                {items.filter(i => i.status === status).length}
              </span>
            </h3>
            <div className="space-y-2 min-h-[60px]">
              {items
                .filter(i => i.status === status)
                .map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    members={members}
                    statuses={STATUSES}
                    catBadge={CAT_BADGE[item.category]}
                    onMove={moveItem}
                    onDelete={deleteItem}
                    onOutcome={updateOutcome}
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
  t,
}: {
  item: ImprovementItem
  members: TeamMember[]
  statuses: ImprovementStatus[]
  catBadge: string
  onMove: (id: string, s: ImprovementStatus) => void
  onDelete: (id: string) => void
  onOutcome: (id: string, o: string) => void
  t: (k: string) => string
}) {
  const [expanded, setExpanded] = useState(false)
  const copilot = members.find(m => m.name === item.copilot)

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-sm font-medium text-slate-800 text-left flex-1 hover:text-brand-700"
        >
          {item.title}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-slate-300 hover:text-red-400 text-base leading-none shrink-0"
        >
          ×
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${catBadge}`}>
          {t(`add_form.categories.${item.category}`)}
        </span>
        {(copilot || item.copilot) && (
          <span className="text-xs text-slate-400">
            👤 {copilot?.name ?? item.copilot}
          </span>
        )}
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
          {item.status === 'done' && (
            <textarea
              value={item.outcome ?? ''}
              placeholder={t('kanban.outcomePlaceholder')}
              rows={2}
              onChange={e => onOutcome(item.id, e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 resize-none"
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
                  className="text-xs border border-slate-200 hover:bg-slate-50 px-2 py-0.5 rounded transition-colors"
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
