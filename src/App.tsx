import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImprovementItem, TeamMember, DialogueNote, View } from './types';
import ImprovementBoard from './components/ImprovementBoard';
import ProblemTimer from './components/ProblemTimer';
import DialogueView from './components/DialogueView';
import TeamView from './components/TeamView';

const ITEMS_KEY = 'ib-items';
const MEMBERS_KEY = 'ib-members';
const NOTES_KEY = 'ib-notes';

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

export default function App() {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('board');
  const [items, setItems] = useState<ImprovementItem[]>(() => load(ITEMS_KEY, []));
  const [members, setMembers] = useState<TeamMember[]>(() => load(MEMBERS_KEY, []));
  const [notes, setNotes] = useState<DialogueNote[]>(() => load(NOTES_KEY, []));

  useEffect(() => { localStorage.setItem(ITEMS_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(MEMBERS_KEY, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }, [notes]);

  const navItems: { key: View; icon: string; labelKey: string }[] = [
    { key: 'board', icon: '📋', labelKey: 'nav.board' },
    { key: 'timer', icon: '⏱️', labelKey: 'nav.timer' },
    { key: 'dialogue', icon: '💬', labelKey: 'nav.dialogue' },
    { key: 'team', icon: '👥', labelKey: 'nav.team' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">Improvement Board</span>
          <button
            onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
            className="text-sm bg-brand-700 hover:bg-brand-500 px-3 py-1 rounded transition-colors"
          >
            {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-1 flex gap-1">
          {navItems.map(n => (
            <NavBtn key={n.key} active={view === n.key} icon={n.icon} labelKey={n.labelKey} onClick={() => setView(n.key)} />
          ))}
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {view === 'board' && <ImprovementBoard items={items} members={members} onItems={setItems} />}
        {view === 'timer' && <ProblemTimer />}
        {view === 'dialogue' && <DialogueView items={items} notes={notes} onNotes={setNotes} />}
        {view === 'team' && <TeamView members={members} items={items} onMembers={setMembers} onItems={setItems} />}
      </main>
    </div>
  );
}

function NavBtn({ active, icon, labelKey, onClick }: { active: boolean; icon: string; labelKey: string; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-t transition-colors ${active ? 'bg-white text-brand-700 font-semibold' : 'text-orange-100 hover:text-white hover:bg-brand-500'}`}
    >
      <span>{icon}</span><span>{t(labelKey)}</span>
    </button>
  );
}
