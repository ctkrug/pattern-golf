import { describe, expect, it } from 'vitest'
import { dayKey, dayNumber, EPOCH, puzzleForDate } from './daily'
import type { Puzzle } from './types'

const lib: Puzzle[] = [
  { id: 'a', title: 'A', positives: ['x'], negatives: ['y'], par: 1, solution: 'x' },
  { id: 'b', title: 'B', positives: ['x'], negatives: ['y'], par: 1, solution: 'x' },
  { id: 'c', title: 'C', positives: ['x'], negatives: ['y'], par: 1, solution: 'x' },
]

describe('dayNumber', () => {
  it('numbers the epoch date as day 1', () => {
    expect(dayNumber(new Date(EPOCH))).toBe(1)
  })

  it('increments by one per calendar day', () => {
    expect(dayNumber(new Date(Date.UTC(2026, 0, 2)))).toBe(2)
    expect(dayNumber(new Date(Date.UTC(2026, 0, 11)))).toBe(11)
  })
})

describe('dayKey', () => {
  it('formats a UTC YYYY-MM-DD key', () => {
    expect(dayKey(new Date(Date.UTC(2026, 6, 16, 23, 59)))).toBe('2026-07-16')
  })
})

describe('puzzleForDate', () => {
  it('returns the same puzzle for the same date', () => {
    const d1 = new Date(Date.UTC(2026, 5, 1, 8))
    const d2 = new Date(Date.UTC(2026, 5, 1, 20))
    expect(puzzleForDate(d1, lib).id).toBe(puzzleForDate(d2, lib).id)
  })

  it('cycles through the whole library before repeating', () => {
    const ids = []
    for (let i = 0; i < lib.length; i++) {
      const d = new Date(EPOCH + i * 86400000)
      ids.push(puzzleForDate(d, lib).id)
    }
    expect(new Set(ids).size).toBe(lib.length)
    // Day after a full cycle returns to the first puzzle.
    const wrap = new Date(EPOCH + lib.length * 86400000)
    expect(puzzleForDate(wrap, lib).id).toBe(lib[0].id)
  })

  it('handles dates before the epoch without going out of range', () => {
    const before = new Date(Date.UTC(2025, 11, 30))
    expect(lib.map((p) => p.id)).toContain(puzzleForDate(before, lib).id)
  })

  it('uses the real library by default', () => {
    expect(puzzleForDate(new Date(EPOCH)).id).toBeTruthy()
  })
})
