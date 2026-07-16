import { describe, expect, it } from 'vitest'
import { formatDelta, scoreResult } from './scoring'

describe('scoreResult', () => {
  it('marks a shorter-than-par solve as a birdie', () => {
    const s = scoreResult(2, 4)
    expect(s.birdie).toBe(true)
    expect(s.term).toBe('birdie')
    expect(s.delta).toBe(-2)
  })

  it('marks an exactly-par solve as par', () => {
    const s = scoreResult(4, 4)
    expect(s.birdie).toBe(false)
    expect(s.term).toBe('par')
    expect(s.delta).toBe(0)
  })

  it('marks an over-par solve as bogey with a positive delta', () => {
    const s = scoreResult(6, 4)
    expect(s.birdie).toBe(false)
    expect(s.term).toBe('bogey')
    expect(s.delta).toBe(2)
  })

  it('marks a single-character solve as an ace', () => {
    expect(scoreResult(1, 3).term).toBe('ace')
  })
})

describe('formatDelta', () => {
  it('renders even par as E', () => {
    expect(formatDelta(0)).toBe('E')
  })

  it('renders under par with a minus sign', () => {
    expect(formatDelta(-2)).toBe('-2')
  })

  it('renders over par with a plus sign', () => {
    expect(formatDelta(3)).toBe('+3')
  })
})
