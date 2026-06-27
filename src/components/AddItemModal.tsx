import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem, Category } from '../types'

const CATEGORIES: Category[] = ['process', 'technical', 'people', 'product', 'other']

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface Props {
  onAdd: (item: ImprovementItem) => void
  onClose: () => void
  initialTitle?: string
}

export default function AddItemModal({ onAdd, onClose, initialTitle }: Props) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initialTitle ?? '')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('process')
  const [owner, setOwner] = useState('')
  const [copilot, setCopilot] = useState('')
  const [dueDateStr, setDueDateStr] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const focusable = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(n => !n.hasAttribute('disabled'))

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const nodes = focusable()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = () => {
    if (!title.trim()) return
    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : undefined
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'identified',
      owner: owner.trim(),
      copilot: copilot.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dialogueNotes: '',
      dueDate,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl"
      >
        <div className="p-6">
          <h2 id="add-modal-title" className="font-semibold text-gray-900 dark:text-gray-50 mb-4">{t('add_form.title')}</h2>

          <div className="space-y-3">
            <div>
              <label className="label">{t('add_form.label_title')}</label>
              <input
                autoFocus
                className="input"
                placeholder={t('add_form.placeholder_title')}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
              />
            </div>

            <div>
              <label className="label">{t('add_form.label_description')}</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder={t('add_form.placeholder_description')}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="label">{t('add_form.label_category')}</label>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('add_form.label_category')}>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      category === c
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t(`add_form.categories.${c}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('add_form.label_owner')}</label>
                <input
                  className="input"
                  placeholder={t('add_form.placeholder_owner')}
                  value={owner}
                  onChange={e => setOwner(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t('add_form.label_copilot')}</label>
                <input
                  className="input"
                  placeholder={t('add_form.placeholder_copilot')}
                  value={copilot}
                  onChange={e => setCopilot(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">{t('add_form.label_due_date')}</label>
              <input
                type="date"
                className="input"
                value={dueDateStr}
                onChange={e => setDueDateStr(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">{t('add_form.cancel')}</button>
          <button type="button" onClick={handleSubmit} disabled={!title.trim()} className="btn-primary">
            {t('add_form.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
