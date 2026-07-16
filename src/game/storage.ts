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

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

/**
 * Coerce an arbitrary parsed value into a sound DayProgress. Persisted data
 * can be hand-edited or left over from an older version, so we never trust its
 * shape: a missing/non-string guess list, or any non-object, resets to empty.
 */
function sanitizeProgress(v: unknown): DayProgress {
  if (typeof v !== 'object' || v === null) return EMPTY_PROGRESS
  const o = v as Record<string, unknown>
  if (!isStringArray(o.guesses)) return EMPTY_PROGRESS
  const length = typeof o.length === 'number' && Number.isFinite(o.length) ? o.length : null
  return { guesses: o.guesses, solved: o.solved === true, length }
}

/** Coerce an arbitrary parsed value into a sound StreakState. */
function sanitizeStreak(v: unknown): StreakState {
  if (typeof v !== 'object' || v === null) return EMPTY_STREAK
  const o = v as Record<string, unknown>
  const count =
    typeof o.count === 'number' && Number.isFinite(o.count) && o.count >= 0
      ? Math.floor(o.count)
      : null
  const lastSolvedKey = typeof o.lastSolvedKey === 'string' ? o.lastSolvedKey : null
  if (count === null) return EMPTY_STREAK
  return { count, lastSolvedKey }
}

export function loadProgress(dayKey: string): DayProgress {
  return sanitizeProgress(readJSON<unknown>(PROGRESS_PREFIX + dayKey, null))
}

export function saveProgress(dayKey: string, progress: DayProgress): void {
  writeJSON(PROGRESS_PREFIX + dayKey, progress)
}

export function loadStreak(): StreakState {
  return sanitizeStreak(readJSON<unknown>(STREAK_KEY, null))
}

export function saveStreak(state: StreakState): void {
  writeJSON(STREAK_KEY, state)
}

export function loadMuted(): boolean {
  // Only a literal `true` mutes; any other stored value degrades to unmuted.
  return readJSON<unknown>(MUTE_KEY, false) === true
}

export function saveMuted(muted: boolean): void {
  writeJSON(MUTE_KEY, muted)
}
