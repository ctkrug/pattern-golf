import type { CellResult, Judgement, Puzzle } from './types'

/**
 * True if `s` contains an unescaped, non-character-class unbounded quantifier
 * (`+`, `*`, or `{n,}`). Character classes and escaped characters are skipped
 * so `[+*]` and `\+` read as literals, not quantifiers.
 */
function hasUnboundedQuantifier(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '\\') {
      i++ // skip the escaped character
      continue
    }
    if (ch === '[') {
      i++
      while (i < s.length && s[i] !== ']') {
        if (s[i] === '\\') i++
        i++
      }
      continue
    }
    if (ch === '+' || ch === '*') return true
    if (ch === '{' && /^\{\d+,\}/.test(s.slice(i))) return true
  }
  return false
}

/**
 * Heuristic screen for patterns prone to catastrophic backtracking (ReDoS).
 *
 * A synchronous `RegExp.test` cannot be interrupted once it starts, so the
 * only safe defense in a single thread is to refuse the dangerous shapes
 * outright. We scan for the classic exponential construct: a group that is
 * itself unbounded-quantified AND whose body already contains an unbounded
 * quantifier — `(a+)+`, `(a*)*`, `((a+))+`, `(a+|b)+`, `(x(a*)y)+`. Nesting
 * behind extra parens or alternation no longer slips past (unlike the old
 * adjacent-only regex). Intentionally conservative: safe quantified groups
 * like `(ab|cd)+` or `(a{2})+` are left alone, as no real solver needs the
 * shapes we reject.
 */
export function isPathological(pattern: string): boolean {
  const openStack: number[] = []
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '\\') {
      i++
      continue
    }
    if (ch === '[') {
      i++
      while (i < pattern.length && pattern[i] !== ']') {
        if (pattern[i] === '\\') i++
        i++
      }
      continue
    }
    if (ch === '(') {
      openStack.push(i)
    } else if (ch === ')') {
      const open = openStack.pop()
      if (open === undefined) continue
      const next = pattern[i + 1]
      const unboundedlyQuantified =
        next === '+' || next === '*' || (next === '{' && /^\{\d+,\}/.test(pattern.slice(i + 1)))
      if (unboundedlyQuantified && hasUnboundedQuantifier(pattern.slice(open + 1, i))) {
        return true
      }
    }
  }
  return false
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
