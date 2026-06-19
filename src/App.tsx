import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Screen, ImprovementItem, TeamMember, SprintArchive, ItemComment } from './types'
import AppHeader from './components/AppHeader'
import BoardView from './components/BoardView'
import ImprovementBoard from './components/ImprovementBoard'
import DialogueView from './components/DialogueView'
import ProblemTimer from './components/ProblemTimer'
import TeamView from './components/TeamView'
import LearnView from './components/LearnView'

const STORAGE_KEY = 'improvement-board-items'
const MEMBERS_KEY = 'improvement-board-members'
const SESSION_KEY = 'improvement-board:lastSession'
const SPRINT_HISTORY_KEY = 'improvement-board:sprintHistory'

function migrateItems(items: ImprovementItem[]): ImprovementItem[] {
  return items.map(item => {
    if (item.dialogueNotes && (!item.comments || item.comments.length === 0)) {
      const migrated: ItemComment = {
        id: `migrated-${item.id}`,
        text: item.dialogueNotes,
        author: item.owner || 'Unknown',
        createdAt: item.updatedAt,
      }
      return { ...item, comments: [migrated], dialogueNotes: '' }
    }
    return item
  })
}

function loadItems(): ImprovementItem[] {
  try {
    const raw: ImprovementItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return migrateItems(raw)
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

function loadSprintHistory(): SprintArchive[] {
  try {
    return JSON.parse(localStorage.getItem(SPRINT_HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveSession(items: ImprovementItem[], members: TeamMember[]) {
  const session = {
    identified: items.filter(i => i.status === 'identified').length,
    inProgress: items.filter(i => i.status === 'in_progress').length,
    done: items.filter(i => i.status === 'done').length,
    total: items.length,
    memberCount: members.length,
    lastUpdated: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export default function App() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState<Screen>('board')
  const [items, setItems] = useState<ImprovementItem[]>(loadItems)
  const [members, setMembers] = useState<TeamMember[]>(loadMembers)
  const [sprintHistory, setSprintHistory] = useState<SprintArchive[]>(loadSprintHistory)
  const [dialogueId, setDialogueId] = useState<string | null>(null)

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const prefillTitle = urlParams.get('prefill') ?? undefined
  const fromSprintMetrics = urlParams.get('utm_source') === 'sprint-metrics'

  const updateItems = (updated: ImprovementItem[]) => {
    setItems(updated)
    saveItems(updated)
    saveSession(updated, members)
  }

  const updateMembers = (next: TeamMember[]) => {
    setMembers(next)
    saveMembers(next)
    saveSession(items, next)
  }

  const handleVote = (id: string) => {
    updateItems(items.map(i => i.id === id ? { ...i, votes: (i.votes ?? 0) + 1 } : i))
  }

  const handleResetVotes = () => {
    updateItems(items.map(i => ({ ...i, votes: 0 })))
  }

  const handleEndSprint = () => {
    const doneItems = items.filter(i => i.status === 'done')
    if (doneItems.length === 0) return
    const archive: SprintArchive = {
      sprintNumber: sprintHistory.length + 1,
      archivedAt: new Date().toISOString(),
      items: doneItems,
    }
    const updated = [...sprintHistory, archive]
    setSprintHistory(updated)
    localStorage.setItem(SPRINT_HISTORY_KEY, JSON.stringify(updated))
    updateItems(items.filter(i => i.status !== 'done'))
  }

  return (
    <div className="min-h-screen flex flex-col" data-accent="violet">
      <AppHeader
        title={t('app.title')}
        onTitleClick={() => setScreen('board')}
        navItems={[
          { key: 'board', label: t('nav.board'), active: screen === 'board', onClick: () => setScreen('board') },
          { key: 'kanban', label: t('nav.kanban'), active: screen === 'kanban', onClick: () => setScreen('kanban') },
          { key: 'team', label: t('nav.team'), active: screen === 'team', onClick: () => setScreen('team') },
          { key: 'dialogue', label: t('nav.dialogue'), active: screen === 'dialogue', onClick: () => setScreen('dialogue') },
          { key: 'timer', label: t('nav.timer'), active: screen === 'timer', onClick: () => setScreen('timer') },
          { key: 'learn', label: t('nav.learn'), active: screen === 'learn', onClick: () => setScreen('learn') },
        ]}
      />

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
            onVote={handleVote}
            onResetVotes={handleResetVotes}
            prefillTitle={prefillTitle}
            fromSprintMetrics={fromSprintMetrics}
            currentSprint={sprintHistory.length + 1}
            onEndSprint={handleEndSprint}
          />
        )}
        {screen === 'kanban' && (
          <ImprovementBoard
            items={items}
            members={members}
            onItems={updateItems}
            onVote={handleVote}
            onResetVotes={handleResetVotes}
            currentSprint={sprintHistory.length + 1}
            onEndSprint={handleEndSprint}
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
            members={members}
            selectedId={dialogueId}
            onSelect={setDialogueId}
            onAddComment={(id, text, author) => {
              const comment: ItemComment = {
                id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                text,
                author,
                createdAt: Date.now(),
              }
              updateItems(
                items.map(i =>
                  i.id === id ? { ...i, comments: [...(i.comments ?? []), comment] } : i
                )
              )
            }}
          />
        )}
        {screen === 'timer' && <ProblemTimer />}
        {screen === 'learn' && <LearnView />}
      </main>
    </div>
  )
}
