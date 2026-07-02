import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'

export default function UpdateToast() {
  const { t } = useTranslation()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-brand-700 px-4 py-3 text-white shadow-lg dark:bg-brand-600">
      <span className="text-sm">{t('app.update_available')}</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="rounded bg-white px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
      >
        {t('app.reload')}
      </button>
    </div>
  )
}
