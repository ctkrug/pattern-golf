import type { CellResult, Judgement, Puzzle } from './types'

/**
 * Heuristic screen for patterns prone to catastrophic backtracking (ReDoS).
 *
 * A synchronous `RegExp.test` cannot be interrupted once it starts, so the
 * only safe defense in a single thread is to refuse to run the dangerous
 * shapes at all. We flag nested unbounded quantifiers — `(a+)+`, `(a*)*`,
 * `(.*)*`, `(a+)*` and friends — which are the classic exponential-blowup
 * constructs. This is intentionally conservative: it rejects a small family
 * of patterns, none of which a real solver needs.
 */
export function isPathological(pattern: string): boolean {
  // A group whose body ends in an unbounded quantifier, itself followed by
  // an unbounded quantifier: (…+)+ / (…*)* / (…+)* / (…*)+ / (…{2,})+ …
  const nestedQuantifier = /\([^)]*[+*]\)[+*]/
  const nestedBraceQuantifier = /\([^)]*\{\d+,\}\)[+*]/
  return nestedQuantifier.test(pattern) || nestedBraceQuantifier.test(pattern)
}

/**
 * Compile a user pattern into a RegExp, or return an error message.
 * Empty and pathological patterns are treated as "cannot evaluate".
 */
export function compilePattern(pattern: string): { re: RegExp } | { error: string } {
  if (isPathological(pattern)) {
    return { error: 'pattern too complex' }
  }
  try {
    return { re: new RegExp(pattern) }
  } catch {
    return { error: 'invalid pattern' }
  }
}

function judgeColumn(values: string[], re: RegExp, shouldMatch: boolean): CellResult[] {
  return values.map((value) => {
    const matched = re.test(value)
    return {
      value,
      matched,
      state: matched === shouldMatch ? 'correct' : 'wrong',
    }
  })
}

function neutralColumn(values: string[]): CellResult[] {
  return values.map((value) => ({ value, matched: false, state: 'neutral' }))
}

/**
 * Judge a pattern against a puzzle using substring-search semantics
 * (unanchored `RegExp.test`, per ADR 0002).
 *
 * An empty, invalid, or pathological pattern leaves every cell neutral —
 * the board never shows colour for a pattern the player hasn't really made.
 */
export function judge(pattern: string, puzzle: Puzzle): Judgement {
  if (pattern.length === 0) {
    return {
      valid: false,
      empty: true,
      positives: neutralColumn(puzzle.positives),
      negatives: neutralColumn(puzzle.negatives),
      solved: false,
    }
  }

  const compiled = compilePattern(pattern)
  if ('error' in compiled) {
    return {
      valid: false,
      empty: false,
      error: compiled.error,
      positives: neutralColumn(puzzle.positives),
      negatives: neutralColumn(puzzle.negatives),
      solved: false,
    }
  }

  const positives = judgeColumn(puzzle.positives, compiled.re, true)
  const negatives = judgeColumn(puzzle.negatives, compiled.re, false)
  const solved =
    positives.every((c) => c.state === 'correct') && negatives.every((c) => c.state === 'correct')

  return { valid: true, empty: false, positives, negatives, solved }
}
