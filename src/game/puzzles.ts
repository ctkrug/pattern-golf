import type { Puzzle } from './types'

/**
 * The seed puzzle library. Every entry carries a title, positives, negatives,
 * par, and a known solution, and every entry passes validateLibrary (enforced
 * by puzzles.test.ts). Pars span short (2) to longer (8) structural patterns.
 *
 * Substring-search semantics (ADR 0002): a negative must never contain a
 * positive as a substring, and vice versa — validation guards this.
 */
export const PUZZLES: Puzzle[] = [
  {
    id: 'digits',
    title: 'A number in there somewhere',
    positives: ['a1', 'x9', '7k', '42'],
    negatives: ['abc', 'xyz', 'foo'],
    par: 2,
    solution: '\\d',
  },
  {
    id: 'has-th',
    title: 'The "th" sound',
    positives: ['the', 'math', 'both'],
    negatives: ['cat', 'dog', 'sun'],
    par: 2,
    solution: 'th',
  },
  {
    id: 'whitespace',
    title: 'Mind the gap',
    positives: ['a b', 'x y', '1 2'],
    negatives: ['ab', 'xy', '12'],
    par: 2,
    solution: '\\s',
  },
  {
    id: 'ends-digit',
    title: 'Finishing on a number',
    positives: ['pin4', 'key9', 'id0'],
    negatives: ['abcd', 'tenXY', 'draft'],
    par: 3,
    solution: '\\d$',
  },
  {
    id: 'ends-ing',
    title: 'Still going',
    positives: ['running', 'singing', 'walking'],
    negatives: ['runs', 'songs', 'danced'],
    par: 3,
    solution: 'ing',
  },
  {
    id: 'has-upper',
    title: 'A capital somewhere',
    positives: ['aBc', 'xYz', 'helloWorld'],
    negatives: ['abc', 'xyz', 'planet'],
    par: 5,
    solution: '[A-Z]',
  },
  {
    id: 'starts-cap',
    title: 'Proper nouns',
    positives: ['Apple', 'Banana', 'Cat'],
    negatives: ['apple', 'banana', 'kiwi'],
    par: 6,
    solution: '^[A-Z]',
  },
  {
    id: 'starts-vowel',
    title: 'Opening on a vowel',
    positives: ['apple', 'orange', 'under'],
    negatives: ['grape', 'melon', 'kiwi'],
    par: 8,
    solution: '^[aeiou]',
  },
  {
    id: 'double-letter',
    title: 'Say it twice',
    positives: ['book', 'feed', 'pool'],
    negatives: ['cat', 'dog', 'pen'],
    par: 5,
    solution: '(.)\\1',
  },
  {
    id: 'three-digits',
    title: 'Three in a row',
    positives: ['abc123', 'x999y', 'road007'],
    negatives: ['12ab', 'a1b2c3', 'no9'],
    par: 6,
    solution: '\\d\\d\\d',
  },
  {
    id: 'three-caps',
    title: 'Shouting in threes',
    positives: ['ABCdef', 'jamMNO', '12QRS3'],
    negatives: ['ABcd', 'aBcDe', 'low'],
    par: 8,
    solution: '[A-Z]{3}',
  },
  {
    id: 'phone',
    title: 'Give me a call',
    positives: ['555-1234', '867-5309', '123-4567'],
    negatives: ['5551234', 'ab-cdef', '12-345'],
    par: 8,
    solution: '\\d\\d\\d-',
  },
]
