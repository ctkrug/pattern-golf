# Backlog — Pattern Golf

Epic/story breakdown for the build. Every story has 1-3 verifiable acceptance criteria — concrete
checks, not vibes. Story 1.1 is the wow moment and lands first.

## Epic 1 — Live Judge & Core Board

### [x] 1.1 — Live regex judge lights up the board on every keystroke (WOW MOMENT)

- [x] Typing a valid pattern into the input immediately (no submit button) marks each column-A
      string green if matched and each column-B string red if wrongly matched, updating within
      one keystroke/render cycle.
- [x] An empty pattern, or a pattern that matches nothing, leaves all cells in a neutral
      unevaluated state — never colored.
- [x] Typing an invalid/unparseable regex (e.g. an unclosed bracket) shows an inline "invalid
      pattern" indicator instead of crashing the app.

### [x] 1.2 — Puzzle board renders column A / column B as two labeled lists

- [x] Column A is visually labeled "must match" and column B "must exclude" (or equivalent),
      each rendering one cell per string from the puzzle data.
- [x] The board is responsive per `docs/DESIGN.md` at 390px, 768px, and 1440px with no
      horizontal scroll.

### [x] 1.3 — Solve detection and puzzle-complete state

- [x] When every column-A cell is green and every column-B cell is red, the app marks the
      puzzle solved and locks further edits to the winning pattern (read-only input or a
      "solved" banner).
- [x] Editing the pattern after an accidental near-solve state re-evaluates correctly — no
      false-positive solve on a partial pattern.

### [x] 1.4 — Design polish: juice for the live judge

- [x] Cell reveal uses the staggered flip-cascade tween from `docs/DESIGN.md` (never an instant
      color snap).
- [x] `matchBlip` / `missThud` synth SFX fire on each cell flip, respecting the mute toggle;
      `prefers-reduced-motion` disables the tween/shake but not the sound.

## Epic 2 — Daily Puzzle, Scoring & Par

### [x] 2.1 — Deterministic daily puzzle selection

- [x] Given the same calendar date, the daily-puzzle selector returns the same puzzle every
      time (pure function of date, no randomness).
- [x] Selecting across a run of consecutive dates cycles through the puzzle library without
      repeating a puzzle until the library is exhausted.

### [x] 2.2 — Golf scoring against par

- [x] On solve, the app displays the player's final pattern length next to the puzzle's par
      length.
- [x] Beating par (shorter than par) is visually distinguished (e.g. a "birdie" indicator) from
      meeting or exceeding it.

### [x] 2.3 — Guess history tracked per attempt

- [x] Each distinct pattern the player evaluates while solving is recorded in an ordered guess
      history for that puzzle.
- [x] Guess history persists across a page reload within the same day via `localStorage`, so
      refreshing mid-puzzle doesn't lose progress.

### [x] 2.4 — Design polish: win celebration

- [x] Solving triggers the ink-stamp "SOLVED" animation and stats overlay from
      `docs/DESIGN.md`, showing final length vs. par, guess count, and streak.
- [x] The win overlay includes one clear "Share result" CTA button.

## Epic 3 — Share Grid & Streaks

### [x] 3.1 — Wordle-style shareable emoji grid

- [x] After solving, a "copy result" action generates a text block of colored emoji squares
      representing the guess history (green/red per string), copyable via the Clipboard API.
- [x] The generated text includes the puzzle date/number and final score but never reveals the
      solving pattern.

### [x] 3.2 — Daily streak tracking

- [x] Solving the current day's puzzle increments a persisted streak counter if the previous
      day was also solved; otherwise the streak resets to 1.
- [x] The streak count is visible on the board (stats rail on desktop, stats strip on mobile,
      per `docs/DESIGN.md`).

### [x] 3.3 — Missed-day handling

- [x] Opening the app after skipping one or more calendar days without solving resets the
      streak to 0 before the new attempt, reflected immediately in the UI.

### [x] 3.4 — Design polish: stats rail / mobile stats strip

- [x] Desktop stats rail and mobile stats strip both render date, par, current length, and
      streak per the `docs/DESIGN.md` layout intent, with no dead space at 1440px and no
      overlap at 390px.

## Epic 4 — Puzzle Generation Pipeline & Content Library

### [x] 4.1 — Puzzle corpus validation

- [x] A validation function rejects a candidate puzzle if any column-B string contains a
      column-A string as a substring (or vice versa) in a way that makes the intended par
      unreachable, with an error identifying the offending pair.
- [x] A validation function confirms at least one known solving pattern exists for a candidate
      puzzle before it's accepted into the library.

### [x] 4.2 — Seed puzzle library

- [x] At least 10 hand-authored puzzles ship in the library, each passing 4.1's validation,
      spanning a range of par lengths (some solvable in 1-3 characters, some requiring 6+).
- [x] Every seed puzzle records a title, positives, negatives, and a par value.

### [x] 4.3 — Regex evaluation hardening against pathological patterns

- [x] A pattern that would cause catastrophic backtracking (e.g. nested quantifiers) on the
      corpus is evaluated under a time budget; exceeding it surfaces a "pattern too complex"
      inline message instead of freezing the tab.
- [x] Covered by a unit test using at least one known ReDoS-triggering pattern against a
      representative corpus.
