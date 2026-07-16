import { EMPTY_STREAK, type StreakState } from './streak'

/** Per-day solving progress, persisted so a reload doesn't lose work. */
export interface DayProgress {
  /** Ordered distinct patterns evaluated while solving this day's puzzle. */
  guesses: string[]
  solved: boolean
  /** The winning pattern's length, once solved. */
  length: number | null
}

export const EMPTY_PROGRESS: DayProgress = {
  guesses: [],
  solved: false,
  length: null,
}

const PROGRESS_PREFIX = 'pg:progress:'
const STREAK_KEY = 'pg:streak'
const MUTE_KEY = 'pg:muted'

/**
 * A safe localStorage handle. Returns null when storage is unavailable
 * (private mode, tests, embedded webviews) so callers degrade to in-memory
 * defaults instead of throwing.
 */
function store(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function readJSON<T>(key: string, fallback: T): T {
  const s = store()
  if (!s) return fallback
  const raw = s.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // Corrupt value — discard and fall back rather than crash the app.
    return fallback
  }
}

function writeJSON(key: string, value: unknown): void {
  const s = store()
  if (!s) return
  try {
    s.setItem(key, JSON.stringify(value))
  } catch {
    // Quota or disabled storage — persistence is best-effort, never fatal.
  }
}

export function loadProgress(dayKey: string): DayProgress {
  return readJSON<DayProgress>(PROGRESS_PREFIX + dayKey, EMPTY_PROGRESS)
}

export function saveProgress(dayKey: string, progress: DayProgress): void {
  writeJSON(PROGRESS_PREFIX + dayKey, progress)
}

export function loadStreak(): StreakState {
  return readJSON<StreakState>(STREAK_KEY, EMPTY_STREAK)
}

export function saveStreak(state: StreakState): void {
  writeJSON(STREAK_KEY, state)
}

export function loadMuted(): boolean {
  return readJSON<boolean>(MUTE_KEY, false)
}

export function saveMuted(muted: boolean): void {
  writeJSON(MUTE_KEY, muted)
}
