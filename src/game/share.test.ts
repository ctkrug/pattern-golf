import { describe, expect, it } from 'vitest'
import { buildShareText } from './share'
import type { Puzzle } from './types'

const puzzle: Puzzle = {
  id: 'test',
  title: 'Test',
  positives: ['foo', 'food'],
  negatives: ['bar'],
  par: 3,
  solution: 'foo',
}

describe('buildShareText', () => {
  it('includes the puzzle number and score in the header', () => {
    const text = buildShareText({
      puzzleNumber: 42,
      puzzle,
      guesses: ['foo'],
      length: 3,
    })
    expect(text.split('\n')[0]).toBe('Pattern Golf #42 — 3/3 (E)')
  })

  it('renders one emoji row per guess with green/red squares', () => {
    const text = buildShareText({
      puzzleNumber: 1,
      puzzle,
      guesses: ['foo'],
      length: 3,
    })
    // foo matches both positives (🟩🟩) and excludes the negative (🟩).
    expect(text.split('\n')[1]).toBe('🟩🟩🟩')
  })

  it('shows reds for a non-solving intermediate guess', () => {
    const text = buildShareText({
      puzzleNumber: 1,
      puzzle,
      guesses: ['ba', 'foo'],
      length: 3,
    })
    const rows = text.split('\n').slice(1)
    // "ba" misses both positives (🟥🟥) and wrongly matches "bar" (🟥).
    expect(rows[0]).toBe('🟥🟥🟥')
    expect(rows[1]).toBe('🟩🟩🟩')
  })

  it('never reveals the solving pattern text', () => {
    const text = buildShareText({
      puzzleNumber: 1,
      puzzle,
      guesses: ['foo'],
      length: 3,
    })
    expect(text).not.toContain('foo')
  })

  it('shows a birdie delta with a minus sign', () => {
    const text = buildShareText({
      puzzleNumber: 7,
      puzzle,
      guesses: ['foo'],
      length: 2,
    })
    expect(text.split('\n')[0]).toContain('(-1)')
  })
})
