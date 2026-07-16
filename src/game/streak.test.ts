import { describe, expect, it } from 'vitest'
import { displayStreak, EMPTY_STREAK, recordSolve } from './streak'

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
})
