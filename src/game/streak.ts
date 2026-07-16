/** Persisted streak state: how long the run is and when it was last extended. */
export interface StreakState {
  count: number
  /** UTC day key (YYYY-MM-DD) of the last solved puzzle, or null if never. */
  lastSolvedKey: string | null
}

export const EMPTY_STREAK: StreakState = { count: 0, lastSolvedKey: null }

/**
 * Record a solve for `todayKey`, given yesterday's key.
 *
 * - Already solved today: unchanged (a puzzle can't be solved twice).
 * - Last solve was yesterday: the streak extends by one.
 * - Otherwise (first solve, or a gap): the streak restarts at one.
 */
export function recordSolve(
  state: StreakState,
  todayKey: string,
  yesterdayKey: string,
): StreakState {
  if (state.lastSolvedKey === todayKey) {
    return state
  }
  if (state.lastSolvedKey === yesterdayKey) {
    return { count: state.count + 1, lastSolvedKey: todayKey }
  }
  return { count: 1, lastSolvedKey: todayKey }
}

/**
 * The streak to display right now, before today is solved.
 *
 * A streak is only "alive" if the last solve was today or yesterday; opening
 * the app after skipping one or more days shows 0 (the run is broken), which
 * is what the player sees until they solve again.
 */
export function displayStreak(
  state: StreakState,
  todayKey: string,
  yesterdayKey: string,
): number {
  if (
    state.lastSolvedKey === todayKey ||
    state.lastSolvedKey === yesterdayKey
  ) {
    return state.count
  }
  return 0
}
