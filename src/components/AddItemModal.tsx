import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImprovementItem, Category } from '../types'

const CATEGORIES: Category[] = ['process', 'technical', 'people', 'product', 'other']

interface Props {
  onAdd: (item: ImprovementItem) => void
  onClose: () => void
}

export default function AddItemModal({ onAdd, onClose }: Props) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('process')
  const [owner, setOwner] = useState('')
  const [copilot, setCopilot] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
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
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('add_form.title')}</h2>

          <div className="space-y-3">
            <div>
              <label className="label">{t('add_form.label_title')}</label>
              <input
                autoFocus
                className="input"
                placeholder={t('add_form.placeholder_title')}
                value={title}
                onChange={e => setTitle(e.target.value)}
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
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      category === c
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
          </div>
        </div>

        <div className="border-t border-gray-100 p-4 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{t('add_form.cancel')}</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="btn-primary">
            {t('add_form.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
