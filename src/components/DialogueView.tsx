import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem, TeamMember } from '../types'

const QUESTIONS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const

interface Props {
  items: ImprovementItem[]
  members: TeamMember[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddComment: (id: string, text: string, author: string) => void
}

function formatTs(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

export default function DialogueView({ items, members, selectedId, onSelect, onAddComment }: Props) {
  const { t } = useTranslation()
  const [commentText, setCommentText] = useState('')
  const [activeQ, setActiveQ] = useState(0)
  const [authorOverride, setAuthorOverride] = useState<string>('')

  const inProgress = items.filter(i => i.status === 'in_progress')
  const selected = inProgress.find(i => i.id === selectedId)

  const handleSelect = (id: string) => {
    const item = inProgress.find(i => i.id === id)
    setCommentText('')
    setActiveQ(0)
    setAuthorOverride(item?.owner ?? '')
    onSelect(id)
  }

  const handleAdd = () => {
    if (!selected || !commentText.trim()) return
    onAddComment(selected.id, commentText.trim(), authorOverride || selected.owner || 'Unknown')
    setCommentText('')
  }

  const effectiveAuthor = authorOverride || selected?.owner || ''
  const memberOptions = members.length > 0 ? members.map(m => m.name) : []
  if (selected?.owner && !memberOptions.includes(selected.owner)) {
    memberOptions.unshift(selected.owner)
  }
  if (selected?.copilot && selected.copilot !== selected.owner && !memberOptions.includes(selected.copilot)) {
    memberOptions.push(selected.copilot)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dialogue.title')}</h1>

      {inProgress.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">{t('dialogue.none_available')}</div>
      ) : (
        <>
          {/* Item selector */}
          <div className="card mb-6">
            <p className="text-sm text-gray-600 mb-3">{t('dialogue.select_item')}</p>
            <div className="space-y-2">
              {inProgress.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    selectedId === item.id
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm text-gray-900">{item.title}</div>
                    {(item.comments?.length ?? 0) > 0 && (
                      <span className="text-xs text-gray-400 shrink-0">
                        💬 {item.comments!.length}
                      </span>
                    )}
                  </div>
                  {item.copilot && (
                    <div className="text-xs text-gray-400">Copilot: {item.copilot}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <>
              {/* Guide */}
              <div className="card mb-4 bg-brand-50 border-brand-100">
                <h3 className="font-semibold text-brand-800 text-sm mb-1">{t('dialogue.guide')}</h3>
                <p className="text-xs text-brand-700">{t('dialogue.guide_body')}</p>
              </div>

              {/* Questions */}
              <div className="card mb-4">
                <div className="space-y-2">
                  {QUESTIONS.map((q, i) => (
                    <button
                      key={q}
                      onClick={() => setActiveQ(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        activeQ === i
                          ? 'border-brand-400 bg-brand-50 shadow-sm'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${activeQ === i ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {i + 1}
                        </span>
                        <span className={`text-sm ${activeQ === i ? 'text-brand-800 font-medium' : 'text-gray-600'}`}>
                          {t(`dialogue.${q}`)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment thread */}
              <div className="card">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">{t('dialogue.notes_label')}</h3>

                {/* Existing comments */}
                {(selected.comments?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">{t('dialogue.comment_empty')}</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {selected.comments!.map(c => (
                      <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{c.author}</span>
                          <span className="text-xs text-gray-400">{formatTs(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment form */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {memberOptions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 shrink-0">{t('dialogue.comment_author')}:</label>
                      <select
                        className="input py-1 text-xs"
                        value={effectiveAuthor}
                        onChange={e => setAuthorOverride(e.target.value)}
                      >
                        {memberOptions.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder={t('dialogue.comment_placeholder')}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd()
                    }}
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!commentText.trim()}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('dialogue.comment_add')}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
