import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function ProblemTimer() {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(10);
  const [remaining, setRemaining] = useState(duration * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false);
            setFinished(true);
            clearInterval(intervalRef.current!);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function start() { setFinished(false); setRunning(true); }
  function pause() { setRunning(false); }
  function reset() { setRunning(false); setFinished(false); setRemaining(duration * 60); }

  function handleDurationChange(v: number) {
    setDuration(v);
    if (!running) setRemaining(v * 60);
  }

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const progress = 1 - remaining / (duration * 60);
  const circumference = 2 * Math.PI * 80;
  const steps: string[] = t('timer.guide.steps', { returnObjects: true }) as string[];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800">{t('timer.title')}</h2>

      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
        {t('timer.explainer')}
      </div>

      {/* Duration picker */}
      {!running && remaining === duration * 60 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">{t('timer.duration')}</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(d => (
              <button
                key={d}
                onClick={() => handleDurationChange(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${duration === d ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clock */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="80" fill="none"
              stroke={finished ? '#22c55e' : '#ea580c'}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-4xl font-bold tabular-nums ${finished ? 'text-green-600' : 'text-slate-800'}`}>
              {finished ? '✓' : `${mins}:${secs}`}
            </span>
            {finished && <span className="text-sm text-green-600 font-medium">{t('timer.timeUp')}</span>}
          </div>
        </div>

        <div className="flex gap-3">
          {!running && !finished && (
            <button onClick={start} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              {remaining < duration * 60 ? t('timer.resume') : t('timer.start')}
            </button>
          )}
          {running && (
            <button onClick={pause} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors">
              {t('timer.pause')}
            </button>
          )}
          <button onClick={reset} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg font-medium transition-colors">
            {t('timer.reset')}
          </button>
        </div>
      </div>

      {/* Facilitation guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3">{t('timer.guide.title')}</h3>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
