// Core domain types shared across the game logic and UI.

/** A single daily puzzle: match every positive, exclude every negative. */
export interface Puzzle {
  /** Stable identifier used for storage keys and the share grid. */
  id: string
  /** Human-readable title shown on the board. */
  title: string
  /** Column A — strings the pattern MUST match. */
  positives: string[]
  /** Column B — strings the pattern must NOT match. */
  negatives: string[]
  /** Target pattern length ("par"), in characters. */
  par: number
  /**
   * A known pattern that solves this puzzle. Used by validation to prove the
   * puzzle is solvable and to sanity-check par; players never see it.
   */
  solution?: string
}

/** How a single string in a column evaluated against the current pattern. */
export type CellState =
  /** No pattern yet, or the pattern is invalid — nothing decided. */
  | 'neutral'
  /** Correct: positive matched, or negative excluded. */
  | 'correct'
  /** Wrong: positive missed, or negative wrongly matched. */
  | 'wrong'

/** Result of judging one string. */
export interface CellResult {
  value: string
  /** Whether the pattern matched this string (substring search). */
  matched: boolean
  state: CellState
}

/** The full evaluation of a pattern against a puzzle. */
export interface Judgement {
  /** True when the pattern compiled to a valid RegExp. */
  valid: boolean
  /** Present when the pattern was empty (a distinct kind of "not yet"). */
  empty: boolean
  /** Compile/eval error message, when not valid. */
  error?: string
  positives: CellResult[]
  negatives: CellResult[]
  /** True when every positive matched and every negative was excluded. */
  solved: boolean
}
