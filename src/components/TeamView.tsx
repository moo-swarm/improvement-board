import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TeamMember, ImprovementItem } from '../types'

interface Props {
  members: TeamMember[]
  items: ImprovementItem[]
  onMembers: (m: TeamMember[]) => void
  onItems: (i: ImprovementItem[]) => void
}

export default function TeamView({ members, items, onMembers, onItems }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  function addMember() {
    if (!name.trim()) return
    onMembers([...members, { id: crypto.randomUUID(), name: name.trim() }])
    setName('')
  }

  function removeMember(id: string) {
    const removed = members.find(m => m.id === id)
    onMembers(members.filter(m => m.id !== id))
    if (removed) {
      onItems(
        items.map(i =>
          i.copilot === removed.name ? { ...i, copilot: '' } : i
        )
      )
    }
  }

  const assignedItems = items.filter(i => i.copilot.trim() && i.status !== 'done')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">{t('team.title')}</h2>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
        {t('team.explainer')}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          placeholder={t('team.namePlaceholder')}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMember()}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button
          type="button"
          onClick={addMember}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + {t('team.add')}
        </button>
      </div>

      {members.length === 0 ? (
        <p className="text-slate-400 text-sm italic">{t('team.noMembers')}</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {members.map((m, idx) => {
            const activeCopilot = assignedItems.filter(i => i.copilot === m.name)
            return (
              <div
                key={m.id}
                className={`flex items-center justify-between px-4 py-3 ${idx > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <div>
                  <span className="font-medium text-slate-800">{m.name}</span>
                  {activeCopilot.length > 0 && (
                    <span className="ml-2 text-xs text-brand-600">
                      {t('team.copilot_prefix')}{' '}
                      {activeCopilot.length}{' '}
                      {activeCopilot.length > 1 ? t('team.items_plural') : t('team.items_one')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(m.id)}
                  className="text-slate-300 hover:text-red-400 text-sm transition-colors"
                >
                  {t('team.remove')}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {assignedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">{t('team.copilotAssignments')}</h3>
          <div className="space-y-2">
            {assignedItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center justify-between shadow-sm"
              >
                <span className="text-sm text-slate-700">{item.title}</span>
                <span className="text-xs text-brand-600 font-medium">👤 {item.copilot}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
