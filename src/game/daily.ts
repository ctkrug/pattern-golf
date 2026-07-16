import { PUZZLES } from './puzzles'
import type { Puzzle } from './types'

/** The day the puzzle series begins; day number 1 is this date (UTC). */
export const EPOCH = Date.UTC(2026, 0, 1)

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Convert a Date to a UTC day key `YYYY-MM-DD`, ignoring local time zone so
 * "today's puzzle" is the same for every player regardless of where they are.
 */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * The 1-based puzzle number for a date: whole UTC days since EPOCH, plus one.
 * Used as the puzzle's public number in the share grid.
 */
export function dayNumber(date: Date): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )
  return Math.floor((utcMidnight - EPOCH) / MS_PER_DAY) + 1
}

/**
 * The puzzle for a given date. Pure function of the date: the same calendar
 * day always yields the same puzzle, and consecutive days cycle through the
 * whole library before any puzzle repeats.
 */
export function puzzleForDate(
  date: Date,
  library: Puzzle[] = PUZZLES,
): Puzzle {
  const n = dayNumber(date)
  // Modulo the 0-based offset so day 1 -> library[0]; guard negatives (dates
  // before EPOCH) so the index is always in range.
  const index = ((((n - 1) % library.length) + library.length) %
    library.length) as number
  return library[index]
}
