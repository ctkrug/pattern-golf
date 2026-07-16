import { judge } from './judge'
import { formatDelta, scoreResult } from './scoring'
import type { CellResult, Puzzle } from './types'

const EMOJI: Record<CellResult['state'], string> = {
  correct: '🟩',
  wrong: '🟥',
  neutral: '⬜',
}

export interface ShareInput {
  puzzleNumber: number
  puzzle: Puzzle
  /** Ordered list of distinct patterns the player evaluated while solving. */
  guesses: string[]
  /** Length of the winning pattern. */
  length: number
}

/**
 * Build a Wordle-style, spoiler-free share text.
 *
 * The header carries the puzzle number and score; each row is one guess in
 * history rendered as green/red squares (positives then negatives). The
 * solving pattern itself is NEVER emitted — only its match/miss shape — so
 * sharing a result never leaks the answer.
 */
export function buildShareText(input: ShareInput): string {
  const { puzzle, guesses, length, puzzleNumber } = input
  const score = scoreResult(length, puzzle.par)
  const header = `Pattern Golf #${puzzleNumber} · ${length}/${puzzle.par} (${formatDelta(
    score.delta,
  )})`

  const rows = guesses.map((pattern) => {
    const result = judge(pattern, puzzle)
    const cells = [...result.positives, ...result.negatives]
    return cells.map((c) => EMOJI[c.state]).join('')
  })

  return [header, ...rows].join('\n')
}
