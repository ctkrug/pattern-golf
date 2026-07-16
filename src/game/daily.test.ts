import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { dayKey, dayNumber, EPOCH, puzzleForDate } from './daily'
import { PUZZLES } from './puzzles'
import type { Puzzle } from './types'

const MS_PER_DAY = 86_400_000

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

  it('property: always returns an in-library puzzle for any date', () => {
    fc.assert(
      fc.property(fc.integer({ min: -50_000, max: 50_000 }), (offsetDays) => {
        const d = new Date(EPOCH + offsetDays * MS_PER_DAY)
        expect(PUZZLES).toContain(puzzleForDate(d))
      }),
    )
  })

  it('property: the selection is stable across times within the same UTC day', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -20_000, max: 20_000 }),
        fc.integer({ min: 0, max: MS_PER_DAY - 1 }),
        (offsetDays, msIntoDay) => {
          const midnight = EPOCH + offsetDays * MS_PER_DAY
          const a = puzzleForDate(new Date(midnight))
          const b = puzzleForDate(new Date(midnight + msIntoDay))
          expect(b.id).toBe(a.id)
        },
      ),
    )
  })

  it('property: any run of library-length consecutive days covers every puzzle once', () => {
    fc.assert(
      fc.property(fc.integer({ min: -10_000, max: 10_000 }), (startDay) => {
        const ids = new Set<string>()
        for (let i = 0; i < PUZZLES.length; i++) {
          ids.add(puzzleForDate(new Date(EPOCH + (startDay + i) * MS_PER_DAY)).id)
        }
        expect(ids.size).toBe(PUZZLES.length)
      }),
    )
  })
})
