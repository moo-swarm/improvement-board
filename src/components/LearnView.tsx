import { useTranslation } from 'react-i18next'

export default function LearnView() {
  const { t } = useTranslation()
  const sections = [
    { title: 'dialogue_title', body: 'dialogue_body', icon: '💬' },
    { title: 'copilot_title', body: 'copilot_body', icon: '🤝' },
    { title: 'problem_time_title', body: 'problem_time_body', icon: '⏱' },
  ]
  const principles = ['p1', 'p2', 'p3', 'p4'] as const

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t('learn.title')}</h1>
      {sections.map(s => (
        <div key={s.title} className="card">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-50 mb-2">{t(`learn.${s.title}`)}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t(`learn.${s.body}`)}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="card bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
        <h2 className="font-semibold text-green-900 dark:text-green-300 mb-3">{t('learn.principles_title')}</h2>
        <ul className="space-y-2">
          {principles.map(p => (
            <li key={p} className="flex gap-2 text-sm text-green-800 dark:text-green-400">
              <span className="text-green-500 dark:text-green-400 font-bold">✓</span>
              {t(`learn.${p}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
