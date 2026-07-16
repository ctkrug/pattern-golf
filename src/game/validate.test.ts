import { describe, expect, it } from 'vitest'
import { validateLibrary, validatePuzzle } from './validate'
import type { Puzzle } from './types'

const sound: Puzzle = {
  id: 'sound',
  title: 'Sound',
  positives: ['cat', 'car', 'can'],
  negatives: ['dog', 'bug'],
  par: 2,
  solution: 'ca',
}

describe('validatePuzzle', () => {
  it('accepts a sound puzzle', () => {
    expect(validatePuzzle(sound)).toBeNull()
  })

  it('rejects a puzzle with no positives', () => {
    const err = validatePuzzle({ ...sound, positives: [] })
    expect(err?.reason).toMatch(/no positive/)
  })

  it('rejects a puzzle with no negatives', () => {
    const err = validatePuzzle({ ...sound, negatives: [] })
    expect(err?.reason).toMatch(/no negative/)
  })

  it('rejects when a negative contains a positive as a substring', () => {
    const err = validatePuzzle({
      ...sound,
      positives: ['cat'],
      negatives: ['scatter'],
      solution: 'cat',
    })
    expect(err?.reason).toMatch(/contains positive "cat"/)
  })

  it('rejects when a positive contains a negative as a substring', () => {
    const err = validatePuzzle({
      ...sound,
      positives: ['scatter'],
      negatives: ['cat'],
      solution: 'scatter',
    })
    expect(err?.reason).toMatch(/contains negative "cat"/)
  })

  it('rejects a puzzle with no known solution', () => {
    const err = validatePuzzle({ ...sound, solution: undefined })
    expect(err?.reason).toMatch(/no known solution/)
  })

  it('rejects a puzzle whose solution does not solve it', () => {
    const err = validatePuzzle({ ...sound, solution: 'dog' })
    expect(err?.reason).toMatch(/does not solve/)
  })

  it('rejects a puzzle whose solution is not a valid regex', () => {
    // An unclosed group compiles to an error, so the solution is unusable.
    const err = validatePuzzle({ ...sound, solution: '(' })
    expect(err?.reason).toMatch(/is not a valid regex/)
  })

  it('rejects a puzzle whose solution is longer than par', () => {
    const err = validatePuzzle({ ...sound, par: 1, solution: 'ca' })
    expect(err?.reason).toMatch(/exceeds par/)
  })

  it('identifies the offending puzzle by id', () => {
    const err = validatePuzzle({ ...sound, id: 'xyz', solution: 'dog' })
    expect(err?.puzzleId).toBe('xyz')
  })
})

describe('validateLibrary', () => {
  it('returns no errors for a sound library', () => {
    expect(validateLibrary([sound])).toEqual([])
  })

  it('flags duplicate ids', () => {
    const errors = validateLibrary([sound, sound])
    expect(errors.some((e) => e.reason === 'duplicate id')).toBe(true)
  })
})
