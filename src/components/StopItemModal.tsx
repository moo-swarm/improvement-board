import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface Props {
  onConfirm: (freedEffort?: string) => void
  onClose: () => void
}

/**
 * E2 stop-flow modal (UX Flow C): celebratory-practical heading, one optional freed-effort
 * input, confirm always enabled. Shell + focus trap mirror AddItemModal; initial focus on
 * the freed-effort input.
 */
export default function StopItemModal({ onConfirm, onClose }: Props) {
  const { t } = useTranslation()
  const [freedEffort, setFreedEffort] = useState('')
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

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-modal-title"
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-xl"
      >
        <div className="p-6">
          <h2 id="stop-modal-title" className="font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {t('stop_modal.heading')}
          </h2>
          <input
            autoFocus
            aria-labelledby="stop-modal-title"
            className="input"
            placeholder={t('stop_modal.freed_placeholder')}
            value={freedEffort}
            onChange={e => setFreedEffort(e.target.value)}
          />
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">{t('add_form.cancel')}</button>
          <button type="button" onClick={() => onConfirm(freedEffort)} className="btn-primary">
            {t('stop_modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
