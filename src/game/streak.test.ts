import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { dayKey, offsetDayKey } from './daily'
import { displayStreak, EMPTY_STREAK, recordSolve } from './streak'

const MS_PER_DAY = 86_400_000

describe('recordSolve', () => {
  it('starts a streak at one on the first solve', () => {
    const next = recordSolve(EMPTY_STREAK, '2026-07-16', '2026-07-15')
    expect(next).toEqual({ count: 1, lastSolvedKey: '2026-07-16' })
  })

  it('extends the streak when yesterday was solved', () => {
    const state = { count: 3, lastSolvedKey: '2026-07-15' }
    const next = recordSolve(state, '2026-07-16', '2026-07-15')
    expect(next.count).toBe(4)
    expect(next.lastSolvedKey).toBe('2026-07-16')
  })

  it('restarts at one when a day was skipped', () => {
    const state = { count: 5, lastSolvedKey: '2026-07-13' }
    const next = recordSolve(state, '2026-07-16', '2026-07-15')
    expect(next.count).toBe(1)
  })

  it('is idempotent for a same-day re-solve', () => {
    const state = { count: 4, lastSolvedKey: '2026-07-16' }
    const next = recordSolve(state, '2026-07-16', '2026-07-15')
    expect(next).toEqual(state)
  })

  it('property: N consecutive days of solves accumulate to a count of N', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        fc.integer({ min: 0, max: 5000 }),
        (days, startOffset) => {
          const base = Date.UTC(2026, 0, 1) + startOffset * MS_PER_DAY
          let state = EMPTY_STREAK
          for (let i = 0; i < days; i++) {
            const d = new Date(base + i * MS_PER_DAY)
            state = recordSolve(state, dayKey(d), offsetDayKey(d, -1))
          }
          expect(state.count).toBe(days)
        },
      ),
    )
  })

  it('property: a gap of two or more days resets the streak to one', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 2, max: 400 }),
        (count, gap) => {
          const base = new Date(Date.UTC(2026, 5, 1))
          const state = { count, lastSolvedKey: dayKey(base) }
          const later = new Date(base.getTime() + gap * MS_PER_DAY)
          expect(recordSolve(state, dayKey(later), offsetDayKey(later, -1)).count).toBe(1)
        },
      ),
    )
  })
})

describe('displayStreak', () => {
  it('shows the count when the last solve was today', () => {
    const state = { count: 4, lastSolvedKey: '2026-07-16' }
    expect(displayStreak(state, '2026-07-16', '2026-07-15')).toBe(4)
  })

  it('shows the count when the last solve was yesterday (still alive)', () => {
    const state = { count: 4, lastSolvedKey: '2026-07-15' }
    expect(displayStreak(state, '2026-07-16', '2026-07-15')).toBe(4)
  })

  it('shows 0 when one or more days were skipped', () => {
    const state = { count: 9, lastSolvedKey: '2026-07-10' }
    expect(displayStreak(state, '2026-07-16', '2026-07-15')).toBe(0)
  })

  it('shows 0 for an empty streak', () => {
    expect(displayStreak(EMPTY_STREAK, '2026-07-16', '2026-07-15')).toBe(0)
  })

  it('property: a last solve two+ days ago always displays 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }),
        fc.integer({ min: 2, max: 400 }),
        (count, gap) => {
          const base = new Date(Date.UTC(2026, 5, 1))
          const state = { count, lastSolvedKey: dayKey(base) }
          const later = new Date(base.getTime() + gap * MS_PER_DAY)
          expect(displayStreak(state, dayKey(later), offsetDayKey(later, -1))).toBe(0)
        },
      ),
    )
  })
})
