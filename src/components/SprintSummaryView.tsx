import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SprintArchive } from '../types'
import { medianLatencyDaysByOwner } from '../utils/decision'

/**
 * Collapsible bottom-of-board summary panel — first reader of sprintHistory,
 * which was write-only storage until E3. Sectioned on purpose: upcoming epics
 * (E2 saved-by-stopping) append sections here without restructuring.
 */
export default function SprintSummaryView({ sprintHistory }: { sprintHistory: SprintArchive[] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const archivedItems = sprintHistory.flatMap(archive => archive.items)
  const latencyRows = medianLatencyDaysByOwner(archivedItems)

  return (
    <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          🗂 {t('archive.title')}
          <span className="ml-2 text-xs font-normal bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
            {sprintHistory.length}
          </span>
        </span>
        <span aria-hidden="true" className="text-gray-400">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('archive.explainer')}</p>

          {sprintHistory.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center dark:text-gray-600">{t('archive.empty')}</p>
          ) : (
            <section aria-label={t('archive.title')}>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...sprintHistory].reverse().map(archive => (
                  <li key={archive.sprintNumber} className="py-2 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {t('archive.sprint_n', { n: archive.sprintNumber })}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {new Date(archive.archivedAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>{t('archive.done_count', { count: archive.items.length })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-label={t('archive.latency_title')}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 dark:text-gray-400">
              {t('archive.latency_title')}
            </h4>
            {latencyRows.length === 0 ? (
              <p className="text-sm text-gray-400 py-2 dark:text-gray-600">{t('archive.latency_no_data')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                    <th scope="col" className="py-1 font-medium">{t('archive.latency_owner_col')}</th>
                    <th scope="col" className="py-1 font-medium text-right">{t('archive.latency_median_days')}</th>
                  </tr>
                </thead>
                <tbody>
                  {latencyRows.map(row => (
                    <tr key={row.owner} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-1.5 text-gray-700 dark:text-gray-200">
                        {row.owner === '' ? t('board.decision_owner_missing') : row.owner}
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">×{row.count}</span>
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-gray-700 dark:text-gray-200">
                        {t('archive.latency_days_short', { days: row.medianDays })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
