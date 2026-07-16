# ADR 0002: The judge matches by substring search, not full-string equality

## Status

Accepted

## Context

The core mechanic is: given a pattern, does it match every string in column A (positives) and
none of the strings in column B (negatives)? There are two reasonable semantics for "match":

1. **Full match** — the pattern, implicitly anchored (`^...$`), must match the entire string.
2. **Substring search** — the pattern matches if it's found anywhere in the string (JS
   `RegExp.prototype.test` default behavior, no implicit anchors).

This is the same choice the original "Regex Golf" (Peter Norvig, 2014) made, and it's what
makes the puzzle interesting: with full-match semantics most puzzles degenerate into "list the
alternatives" (`a|b|c|...`) with no shorter structural pattern to discover. With substring
search, players have to find the structural feature that distinguishes the two columns (a
shared prefix, a digit, a doubled letter), which is the actual puzzle.

## Decision

The judge uses substring search semantics: `new RegExp(pattern).test(str)`, unanchored. Players
who want full-string behavior can still write `^...$` themselves — the judge doesn't take that
away, it just doesn't impose it.

## Consequences

- Puzzle authors must choose positive/negative corpora where substring search actually
  discriminates (e.g. a negative string can't merely *contain* a positive string as a
  substring, or every pattern that solves the positive would also match the negative "for
  free" in a way that breaks the puzzle's intended difficulty). This is a puzzle-generation
  validation concern, not a judge concern — tracked in the BACKLOG under puzzle validation.
- User patterns run directly through the browser's native `RegExp` engine (no custom NFA/DFA
  implementation), which is simple and correct but not immune to catastrophic backtracking on
  pathological patterns. Mitigated by keeping corpus strings short; a hard evaluation timeout
  is tracked in the BACKLOG as a follow-up hardening story rather than solved here.
