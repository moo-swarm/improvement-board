import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

const PRESETS = [5, 10, 15, 20]

export default function TimerView() {
  const { t } = useTranslation()
  const [duration, setDuration] = useState(10)
  const [remaining, setRemaining] = useState(duration * 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setRemaining(duration * 60)
    setRunning(false)
    setDone(false)
  }, [duration])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setDone(true)
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const reset = () => {
    setRemaining(duration * 60)
    setRunning(false)
    setDone(false)
  }

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0')
  const secs = (remaining % 60).toString().padStart(2, '0')
  const pct = ((duration * 60 - remaining) / (duration * 60)) * 100

  const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('timer.title')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t('timer.description')}</p>

      {/* Timer */}
      <div className="card text-center mb-6">
        {/* Ring */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="10" fill="none" />
            <circle
              cx="80" cy="80" r="70"
              stroke={done ? '#ef4444' : '#16a34a'}
              strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className={`absolute text-4xl font-bold tabular-nums ${done ? 'text-red-500' : 'text-gray-900'}`}>
            {mins}:{secs}
          </span>
        </div>

        {done && (
          <p className="text-red-600 font-medium mb-4">{t('timer.done_msg')}</p>
        )}

        {/* Duration selector */}
        <div className="flex justify-center gap-2 mb-4">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { if (!running) setDuration(p) }}
              disabled={running}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                duration === p
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {p}m
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {!running && !done && (
            <button onClick={() => setRunning(true)} className="btn-primary">
              {t('timer.start')}
            </button>
          )}
          {running && (
            <button onClick={() => setRunning(false)} className="btn-secondary">
              {t('timer.pause')}
            </button>
          )}
          {!running && remaining < duration * 60 && (
            <button onClick={() => setRunning(true)} className="btn-primary">
              {t('timer.resume')}
            </button>
          )}
          <button onClick={reset} className="btn-secondary">{t('timer.reset')}</button>
        </div>
      </div>

      {/* Practice guide */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">{t('timer.practice_title')}</h2>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-gray-600">
              <span className="flex-shrink-0 w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-semibold text-xs">
                {i + 1}
              </span>
              {t(`timer.${s}`)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
