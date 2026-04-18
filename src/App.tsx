import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, ImprovementItem } from './types'
import BoardView from './components/BoardView'
import DialogueView from './components/DialogueView'
import TimerView from './components/TimerView'
import LearnView from './components/LearnView'

const STORAGE_KEY = 'improvement-board-items'

function loadItems(): ImprovementItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveItems(items: ImprovementItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [screen, setScreen] = useState<Screen>('board')
  const [items, setItems] = useState<ImprovementItem[]>(loadItems)
  const [dialogueId, setDialogueId] = useState<string | null>(null)

  const updateItems = (updated: ImprovementItem[]) => {
    setItems(updated)
    saveItems(updated)
  }

  const navItems: { key: Screen; label: string }[] = [
    { key: 'board', label: t('nav.board') },
    { key: 'dialogue', label: t('nav.dialogue') },
    { key: 'timer', label: t('nav.timer') },
    { key: 'learn', label: t('nav.learn') },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setScreen('board')} className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            {t('app.title')}
          </button>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setScreen(item.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  screen === item.key
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {screen === 'board' && (
          <BoardView
            items={items}
            onAdd={item => updateItems([...items, item])}
            onUpdate={updated => updateItems(items.map(i => i.id === updated.id ? updated : i))}
            onDelete={id => updateItems(items.filter(i => i.id !== id))}
            onDialogue={item => { setDialogueId(item.id); setScreen('dialogue') }}
          />
        )}
        {screen === 'dialogue' && (
          <DialogueView
            items={items}
            selectedId={dialogueId}
            onSelect={setDialogueId}
            onSaveNotes={(id, notes) => updateItems(items.map(i => i.id === id ? { ...i, dialogueNotes: notes } : i))}
          />
        )}
        {screen === 'timer' && <TimerView />}
        {screen === 'learn' && <LearnView />}
      </main>
    </div>
  )
}
