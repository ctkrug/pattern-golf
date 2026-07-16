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

  it('falls back to defaults on valid JSON of the wrong shape', () => {
    // Hand-edited / stale storage: parseable JSON, but not a DayProgress.
    localStorage.setItem('pg:progress:2026-07-16', '"hello"')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
    localStorage.setItem('pg:progress:2026-07-16', '42')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
    localStorage.setItem('pg:progress:2026-07-16', 'null')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
  })

  it('repairs a partial progress object with a null/missing guess list', () => {
    localStorage.setItem('pg:progress:2026-07-16', '{"solved":true,"length":5}')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
    localStorage.setItem('pg:progress:2026-07-16', '{"guesses":null,"solved":true,"length":5}')
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
  })

  it('rejects a guess list that is not all strings', () => {
    localStorage.setItem(
      'pg:progress:2026-07-16',
      '{"guesses":[1,2,3],"solved":false,"length":null}',
    )
    expect(loadProgress('2026-07-16')).toEqual(EMPTY_PROGRESS)
  })

  it('coerces a non-numeric length to null', () => {
    localStorage.setItem(
      'pg:progress:2026-07-16',
      '{"guesses":["a"],"solved":true,"length":"five"}',
    )
    expect(loadProgress('2026-07-16')).toEqual({ guesses: ['a'], solved: true, length: null })
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

  it('falls back to an empty streak on wrong-shape or corrupt data', () => {
    localStorage.setItem('pg:streak', '"nope"')
    expect(loadStreak()).toEqual(EMPTY_STREAK)
    localStorage.setItem('pg:streak', '{"count":"lots"}')
    expect(loadStreak()).toEqual(EMPTY_STREAK)
    localStorage.setItem('pg:streak', '{"count":-4,"lastSolvedKey":5}')
    expect(loadStreak()).toEqual(EMPTY_STREAK)
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

  it('treats non-boolean stored mute values as unmuted', () => {
    localStorage.setItem('pg:muted', '"yes"')
    expect(loadMuted()).toBe(false)
    localStorage.setItem('pg:muted', '1')
    expect(loadMuted()).toBe(false)
  })
})
