import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImprovementItem, DialogueNote } from '../types';

interface Props {
  items: ImprovementItem[];
  notes: DialogueNote[];
  onNotes: (notes: DialogueNote[]) => void;
}

export default function DialogueView({ items, notes, onNotes }: Props) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions: string[] = t('dialogue.questions', { returnObjects: true }) as string[];
  const itemNotes = notes.filter(n => n.itemId === selectedId);
  const selectedItem = items.find(i => i.id === selectedId);

  function saveNote(question: string) {
    const answer = answers[question]?.trim();
    if (!answer) return;
    const note: DialogueNote = {
      id: crypto.randomUUID(),
      itemId: selectedId!,
      question,
      answer,
      timestamp: new Date().toISOString(),
    };
    onNotes([...notes, note]);
    setAnswers(a => ({ ...a, [question]: '' }));
  }

  function clearNotes() {
    onNotes(notes.filter(n => n.itemId !== selectedId));
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">{t('dialogue.noItems')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">{t('dialogue.title')}</h2>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
        {t('dialogue.explainer')}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">{t('dialogue.selectItem')}</label>
        <select
          value={selectedId ?? ''}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {items.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
      </div>

      {selectedItem && (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                <span className="text-brand-500 mr-2">{idx + 1}.</span>{q}
              </p>
              <textarea
                value={answers[q] ?? ''}
                placeholder={t('dialogue.answerPlaceholder')}
                rows={2}
                onChange={e => setAnswers(a => ({ ...a, [q]: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
              <button
                onClick={() => saveNote(q)}
                className="mt-2 text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-3 py-1 rounded-lg transition-colors"
              >
                {t('dialogue.saveNote')}
              </button>
            </div>
          ))}
        </div>
      )}

      {itemNotes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">{t('dialogue.savedNotes')}</h3>
            <button onClick={clearNotes} className="text-xs text-red-400 hover:text-red-600 transition-colors">{t('dialogue.clearNotes')}</button>
          </div>
          <div className="space-y-3">
            {itemNotes.map(n => (
              <div key={n.id} className="border-l-2 border-brand-200 pl-3">
                <p className="text-xs font-semibold text-slate-500 mb-0.5">{n.question}</p>
                <p className="text-sm text-slate-700">{n.answer}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
