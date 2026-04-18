import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem } from '../types'

const QUESTIONS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const

interface Props {
  items: ImprovementItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onSaveNotes: (id: string, notes: string) => void
}

export default function DialogueView({ items, selectedId, onSelect, onSaveNotes }: Props) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeQ, setActiveQ] = useState(0)

  const inProgress = items.filter(i => i.status === 'in_progress')
  const selected = inProgress.find(i => i.id === selectedId)

  const handleSelect = (id: string) => {
    const item = inProgress.find(i => i.id === id)
    setNotes(item?.dialogueNotes ?? '')
    setSaved(false)
    setActiveQ(0)
    onSelect(id)
  }

  const handleSave = () => {
    if (!selected) return
    onSaveNotes(selected.id, notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                  <div className="font-medium text-sm text-gray-900">{item.title}</div>
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

              {/* Notes */}
              <div className="card">
                <label className="label">{t('dialogue.notes_label')}</label>
                <textarea
                  className="input resize-none mb-3"
                  rows={5}
                  placeholder={t('dialogue.notes_placeholder')}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <button onClick={handleSave} className="btn-primary">
                  {saved ? t('dialogue.saved') : t('dialogue.save')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
