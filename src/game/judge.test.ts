import { describe, expect, it } from 'vitest'
import { compilePattern, isPathological, judge } from './judge'
import { PUZZLES } from './puzzles'
import type { Puzzle } from './types'

const puzzle: Puzzle = {
  id: 'test',
  title: 'Test',
  positives: ['foo', 'food', 'fool'],
  negatives: ['bar', 'baz'],
  par: 3,
}

describe('judge', () => {
  it('marks positives correct when matched and negatives correct when excluded', () => {
    const result = judge('foo', puzzle)
    expect(result.valid).toBe(true)
    expect(result.positives.map((c) => c.state)).toEqual(['correct', 'correct', 'correct'])
    expect(result.negatives.map((c) => c.state)).toEqual(['correct', 'correct'])
    expect(result.solved).toBe(true)
  })

  it('uses substring search, not full-string equality', () => {
    // "foo" is a substring of "food"/"fool", so an unanchored pattern matches.
    const result = judge('foo', puzzle)
    expect(result.positives.every((c) => c.matched)).toBe(true)
  })

  it('marks a positive wrong when the pattern fails to match it', () => {
    const result = judge('food', puzzle)
    const states = result.positives.map((c) => c.state)
    // Only "food" contains "food"; "foo" and "fool" do not.
    expect(states).toEqual(['wrong', 'correct', 'wrong'])
    expect(result.solved).toBe(false)
  })

  it('marks a negative wrong when the pattern wrongly matches it', () => {
    const result = judge('ba', puzzle)
    expect(result.negatives.map((c) => c.state)).toEqual(['wrong', 'wrong'])
    expect(result.solved).toBe(false)
  })

  it('leaves every cell neutral for an empty pattern', () => {
    const result = judge('', puzzle)
    expect(result.empty).toBe(true)
    expect(result.valid).toBe(false)
    expect(result.positives.every((c) => c.state === 'neutral')).toBe(true)
    expect(result.negatives.every((c) => c.state === 'neutral')).toBe(true)
    expect(result.solved).toBe(false)
  })

  it('surfaces an error and neutral cells for an invalid pattern', () => {
    const result = judge('[', puzzle)
    expect(result.valid).toBe(false)
    expect(result.empty).toBe(false)
    expect(result.error).toBe('invalid pattern')
    expect(result.positives.every((c) => c.state === 'neutral')).toBe(true)
  })

  it('never reports solved on a partial pattern', () => {
    // "f" matches all positives but neither negative — should still solve here,
    // so use "o" which also matches nothing wrong but misses "bar"/"baz"... check a real partial.
    const result = judge('o', puzzle)
    // "o" is in every positive but not in negatives -> actually solved. Use a true partial:
    const partial = judge('food', puzzle)
    expect(result.solved).toBe(true)
    expect(partial.solved).toBe(false)
  })
})

describe('isPathological', () => {
  it('flags nested unbounded quantifiers', () => {
    expect(isPathological('(a+)+')).toBe(true)
    expect(isPathological('(a*)*')).toBe(true)
    expect(isPathological('(.*)*')).toBe(true)
    expect(isPathological('(ab+)*')).toBe(true)
    expect(isPathological('(a{2,})+')).toBe(true)
  })

  it('flags nesting hidden behind extra parens or alternation', () => {
    // Classic bombs the old adjacent-only regex missed.
    expect(isPathological('((a+))+')).toBe(true)
    expect(isPathological('(a+|b)+')).toBe(true)
    expect(isPathological('((ab+))*')).toBe(true)
    expect(isPathological('(x(a*)y)+')).toBe(true)
    expect(isPathological('(a{2,}|z)+')).toBe(true)
  })

  it('does not flag ordinary patterns', () => {
    expect(isPathological('foo')).toBe(false)
    expect(isPathological('\\d{3}-\\d{4}')).toBe(false)
    expect(isPathological('[a-z]+')).toBe(false)
    expect(isPathological('(ab)+')).toBe(false)
  })

  it('does not flag safe quantified groups without inner unbounded quantifiers', () => {
    // A quantified group is only dangerous when its BODY is itself unbounded.
    expect(isPathological('(ab|cd)+')).toBe(false)
    expect(isPathological('(a{2})+')).toBe(false)
    expect(isPathological('(\\d)+')).toBe(false)
    // Escaped parens are literal text, not a group.
    expect(isPathological('\\(a+\\)+')).toBe(false)
    // A '+' inside a character class is a literal, not a quantifier.
    expect(isPathological('([+*])+')).toBe(false)
  })
})

describe('compilePattern', () => {
  it('refuses a known ReDoS pattern instead of running it', () => {
    // Classic exponential blowup; must be rejected without evaluation.
    const result = compilePattern('(a+)+$')
    expect(result).toEqual({ error: 'pattern too complex' })
  })

  it('reports invalid syntax', () => {
    expect(compilePattern('(')).toEqual({ error: 'invalid pattern' })
  })

  it('compiles a valid pattern to a usable RegExp', () => {
    const result = compilePattern('\\d+')
    expect('re' in result && result.re.test('a1b')).toBe(true)
  })
})

describe('judge — hostile input against the real library', () => {
  // Adversarial patterns: ReDoS bombs, huge literals, unicode, anchors,
  // whitespace. None may throw; all must return a well-formed Judgement and
  // finish effectively instantly (the ReDoS bombs are refused, not run).
  const hostile = [
    '(a+)+$',
    '((a+))+',
    '(a+|b)+',
    '(.*)*',
    'a'.repeat(5000),
    '😀',
    '\\u{1F600}',
    '   ',
    '^$',
    '(?:)',
    '\\',
    '(',
    '[',
    '*abc',
  ]

  it('never throws and returns a full board for every puzzle', () => {
    for (const puzzle of PUZZLES) {
      for (const pattern of hostile) {
        const result = judge(pattern, puzzle)
        expect(result.positives).toHaveLength(puzzle.positives.length)
        expect(result.negatives).toHaveLength(puzzle.negatives.length)
        // A refused/invalid pattern leaves the whole board neutral.
        if (!result.valid) {
          expect(result.positives.every((c) => c.state === 'neutral')).toBe(true)
        }
      }
    }
  })

  it('evaluates the whole hostile batch across the library well under a second', () => {
    const start = performance.now()
    for (const puzzle of PUZZLES) {
      for (const pattern of hostile) judge(pattern, puzzle)
    }
    expect(performance.now() - start).toBeLessThan(500)
  })
})

describe('judge — property: substring matching agrees with String.includes for literals', () => {
  it('matches exactly the strings that contain the literal pattern', () => {
    const literals = ['a', 'xy', '42', 'z', 'oo']
    const corpus = ['banana', 'xylophone', '42nd', 'pizza', 'balloon', 'dry']
    for (const lit of literals) {
      const p: Puzzle = { id: 'p', title: 't', positives: corpus, negatives: [], par: 1 }
      const result = judge(lit, p)
      result.positives.forEach((cell) => {
        expect(cell.matched).toBe(cell.value.includes(lit))
      })
    }
  })
})
