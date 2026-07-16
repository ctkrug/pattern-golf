import { judge } from './judge'
import type { Puzzle } from './types'

export interface ValidationError {
  puzzleId: string
  reason: string
}

/**
 * Validate a candidate puzzle. Returns null when the puzzle is sound, or a
 * ValidationError describing the first problem found.
 *
 * Checks, in order:
 *  1. Non-empty columns.
 *  2. No negative contains a positive as a substring (or vice versa) — that
 *     would let any pattern matching the positive also match the negative
 *     "for free", making the intended par unreachable (ADR 0002).
 *  3. A known solution exists and actually solves the puzzle, so the puzzle
 *     is provably solvable before it ships.
 *  4. The solution's length does not exceed par (par must be reachable).
 */
export function validatePuzzle(puzzle: Puzzle): ValidationError | null {
  const err = (reason: string): ValidationError => ({
    puzzleId: puzzle.id,
    reason,
  })

  if (puzzle.positives.length === 0) {
    return err('no positive strings')
  }
  if (puzzle.negatives.length === 0) {
    return err('no negative strings')
  }

  for (const pos of puzzle.positives) {
    for (const neg of puzzle.negatives) {
      if (neg.includes(pos)) {
        return err(`negative "${neg}" contains positive "${pos}" as a substring`)
      }
      if (pos.includes(neg)) {
        return err(`positive "${pos}" contains negative "${neg}" as a substring`)
      }
    }
  }

  if (!puzzle.solution) {
    return err('no known solution provided')
  }
  const result = judge(puzzle.solution, puzzle)
  if (!result.valid) {
    return err(`known solution "${puzzle.solution}" is not a valid regex`)
  }
  if (!result.solved) {
    return err(`known solution "${puzzle.solution}" does not solve the puzzle`)
  }
  if (puzzle.solution.length > puzzle.par) {
    return err(
      `known solution "${puzzle.solution}" (${puzzle.solution.length}) exceeds par ${puzzle.par}`,
    )
  }

  return null
}

/** Validate a whole library, returning every error found. */
export function validateLibrary(puzzles: Puzzle[]): ValidationError[] {
  const errors: ValidationError[] = []
  const seen = new Set<string>()
  for (const puzzle of puzzles) {
    if (seen.has(puzzle.id)) {
      errors.push({ puzzleId: puzzle.id, reason: 'duplicate id' })
    }
    seen.add(puzzle.id)
    const err = validatePuzzle(puzzle)
    if (err) errors.push(err)
  }
  return errors
}
