import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, ImprovementItem, TeamMember } from './types'
import BoardView from './components/BoardView'
import ImprovementBoard from './components/ImprovementBoard'
import DialogueView from './components/DialogueView'
import ProblemTimer from './components/ProblemTimer'
import TeamView from './components/TeamView'
import LearnView from './components/LearnView'

const STORAGE_KEY = 'improvement-board-items'
const MEMBERS_KEY = 'improvement-board-members'

function loadItems(): ImprovementItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function loadMembers(): TeamMember[] {
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveItems(items: ImprovementItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function saveMembers(members: TeamMember[]) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

export default function App() {
  const { t, i18n } = useTranslation()
  const [screen, setScreen] = useState<Screen>('board')
  const [items, setItems] = useState<ImprovementItem[]>(loadItems)
  const [members, setMembers] = useState<TeamMember[]>(loadMembers)
  const [dialogueId, setDialogueId] = useState<string | null>(null)

  const updateItems = (updated: ImprovementItem[]) => {
    setItems(updated)
    saveItems(updated)
  }

  const updateMembers = (next: TeamMember[]) => {
    setMembers(next)
    saveMembers(next)
  }

  const navItems: { key: Screen; label: string }[] = [
    { key: 'board', label: t('nav.board') },
    { key: 'kanban', label: t('nav.kanban') },
    { key: 'team', label: t('nav.team') },
    { key: 'dialogue', label: t('nav.dialogue') },
    { key: 'timer', label: t('nav.timer') },
    { key: 'learn', label: t('nav.learn') },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen('board')}
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            {t('app.title')}
          </button>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {navItems.map(item => (
              <button
                key={item.key}
                type="button"
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
            <div className="ml-2 flex items-center gap-0.5">
              {(['en', 'es', 'be', 'ru'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`text-xs px-1.5 py-1 rounded transition-colors ${
                    i18n.language.startsWith(lang)
                      ? 'bg-brand-100 text-brand-700 font-semibold'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {screen === 'board' && (
          <BoardView
            items={items}
            onAdd={item => updateItems([...items, item])}
            onUpdate={updated => updateItems(items.map(i => (i.id === updated.id ? updated : i)))}
            onDelete={id => updateItems(items.filter(i => i.id !== id))}
            onDialogue={item => {
              setDialogueId(item.id)
              setScreen('dialogue')
            }}
          />
        )}
        {screen === 'kanban' && (
          <ImprovementBoard
            items={items}
            members={members}
            onItems={updateItems}
          />
        )}
        {screen === 'team' && (
          <TeamView
            members={members}
            items={items}
            onMembers={updateMembers}
            onItems={updateItems}
          />
        )}
        {screen === 'dialogue' && (
          <DialogueView
            items={items}
            selectedId={dialogueId}
            onSelect={setDialogueId}
            onSaveNotes={(id, notes) =>
              updateItems(items.map(i => (i.id === id ? { ...i, dialogueNotes: notes } : i)))
            }
          />
        )}
        {screen === 'timer' && <ProblemTimer />}
        {screen === 'learn' && <LearnView />}
      </main>
    </div>
  )
}
