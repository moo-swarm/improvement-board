const SESSION_KEY = 'moving-motivators:lastSession'

export interface MovingMotivatorsSession {
  date: string
  savedAt: number
  ranked: string[]
  change?: string
  changes?: Record<string, string>
}

export const MOTIVATOR_EMOJI: Record<string, string> = {
  curiosity: '🔍',
  honor: '🏅',
  acceptance: '❤️',
  mastery: '🎯',
  power: '⚡',
  freedom: '🦋',
  relatedness: '🤝',
  order: '📋',
  goal: '🌟',
  status: '🏆',
}

export function readMovingMotivatorsSession(): MovingMotivatorsSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.ranked) || parsed.ranked.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

/** Lowest-ranked (worst-scoring) motivators first, capped at `count`. */
export function bottomMotivators(session: MovingMotivatorsSession, count = 3): { id: string; rank: number }[] {
  return session.ranked
    .slice(-count)
    .reverse()
    .map((id, i) => ({ id, rank: session.ranked.length - i }))
}
