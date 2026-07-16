/** A golf-style score for a solved puzzle: pattern length measured against par. */
export interface Score {
  length: number
  par: number
  /** length - par: negative beats par, zero meets it, positive is over. */
  delta: number
  /** True when the pattern is strictly shorter than par. */
  birdie: boolean
  /** Golf term for the delta, for display. */
  term: 'ace' | 'birdie' | 'par' | 'bogey'
}

/**
 * Score a solving pattern against par.
 *
 * A one-character solve is an "ace"; strictly shorter than par is a "birdie";
 * exactly par is "par"; longer than par is "bogey" (the delta carries the
 * exact over-par amount).
 */
export function scoreResult(patternLength: number, par: number): Score {
  const delta = patternLength - par
  let term: Score['term']
  if (patternLength === 1) {
    term = 'ace'
  } else if (delta < 0) {
    term = 'birdie'
  } else if (delta === 0) {
    term = 'par'
  } else {
    term = 'bogey'
  }
  return { length: patternLength, par, delta, birdie: delta < 0, term }
}

/** Human-readable delta, e.g. "-2", "E" (even/par), "+1". */
export function formatDelta(delta: number): string {
  if (delta === 0) return 'E'
  return delta > 0 ? `+${delta}` : `${delta}`
}
