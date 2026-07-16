import fc from 'fast-check'
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

  it('property: delta is always length - par, and birdie iff delta < 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 40 }), fc.integer({ min: 1, max: 20 }), (len, par) => {
        const s = scoreResult(len, par)
        expect(s.delta).toBe(len - par)
        expect(s.length).toBe(len)
        expect(s.par).toBe(par)
        expect(s.birdie).toBe(len - par < 0)
      }),
    )
  })

  it('property: exactly one term applies and matches the delta sign (len > 1)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 40 }), fc.integer({ min: 1, max: 20 }), (len, par) => {
        const { term, delta } = scoreResult(len, par)
        if (delta < 0) expect(term).toBe('birdie')
        else if (delta === 0) expect(term).toBe('par')
        else expect(term).toBe('bogey')
      }),
    )
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

  it('property: sign prefix round-trips to the original delta', () => {
    fc.assert(
      fc.property(fc.integer({ min: -30, max: 30 }), (delta) => {
        const s = formatDelta(delta)
        if (delta === 0) expect(s).toBe('E')
        else expect(Number(s)).toBe(delta) // "+3" -> 3, "-2" -> -2
      }),
    )
  })
})
