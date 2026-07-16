import { describe, expect, it } from 'vitest'
import { PUZZLES } from './puzzles'
import { validateLibrary } from './validate'

describe('seed puzzle library', () => {
  it('passes full validation with no errors', () => {
    expect(validateLibrary(PUZZLES)).toEqual([])
  })

  it('ships at least 10 puzzles', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(10)
  })

  it('has unique ids', () => {
    const ids = new Set(PUZZLES.map((p) => p.id))
    expect(ids.size).toBe(PUZZLES.length)
  })

  it('spans a range of par lengths (some short, some 6+)', () => {
    const pars = PUZZLES.map((p) => p.par)
    expect(Math.min(...pars)).toBeLessThanOrEqual(3)
    expect(Math.max(...pars)).toBeGreaterThanOrEqual(6)
  })

  it('gives every puzzle a title, positives, negatives, and par', () => {
    for (const p of PUZZLES) {
      expect(p.title.length).toBeGreaterThan(0)
      expect(p.positives.length).toBeGreaterThan(0)
      expect(p.negatives.length).toBeGreaterThan(0)
      expect(p.par).toBeGreaterThan(0)
    }
  })
})
