import { beforeEach, describe, expect, it } from 'vitest'
import {
  EMPTY_PROGRESS,
  loadMuted,
  loadProgress,
  loadStreak,
  saveMuted,
  saveProgress,
  saveStreak,
} from './storage'
import { EMPTY_STREAK } from './streak'

beforeEach(() => {
  localStorage.clear()
})

describe('progress persistence', () => {
  it('returns empty progress for an unseen day', () => {
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
  })

  it('round-trips saved progress', () => {
    const progress = { guesses: ['a', 'ab'], solved: true, length: 2 }
    saveProgress('2026-07-16', progress)
    expect(loadProgress('2026-07-16')).toEqual(progress)
  })

  it('keeps progress separate per day', () => {
    saveProgress('2026-07-16', { guesses: ['x'], solved: false, length: null })
    expect(loadProgress('2026-07-17')).toEqual(EMPTY_PROGRESS)
  })

  it('falls back to defaults on corrupt stored JSON', () => {
    localStorage.setItem('pg:progress:2026-07-16', '{not json')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
  })
})

describe('streak persistence', () => {
  it('returns an empty streak when none is stored', () => {
    expect(loadStreak()).toEqual(EMPTY_STREAK)
  })

  it('round-trips a saved streak', () => {
    saveStreak({ count: 3, lastSolvedKey: '2026-07-16' })
    expect(loadStreak()).toEqual({ count: 3, lastSolvedKey: '2026-07-16' })
  })
})

describe('mute persistence', () => {
  it('defaults to unmuted', () => {
    expect(loadMuted()).toBe(false)
  })

  it('round-trips the mute flag', () => {
    saveMuted(true)
    expect(loadMuted()).toBe(true)
  })
})
