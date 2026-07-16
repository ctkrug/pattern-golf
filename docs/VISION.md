# Vision — Pattern Golf

## The problem

Daily-habit word games (Wordle, Connections, Nerdle) have proven that a single, small,
well-designed puzzle you solve once a day is a durable habit loop. Nothing in that space
targets regex — one of the most practically useful small languages a developer ever learns —
despite regex having exactly the property that makes for good golf: a huge space of possible
solutions with a genuine, satisfying "shortest correct answer" to hunt for.

Existing regex-practice tools (regex101, regexr, various "regex crossword" sites) are either
reference tools (no daily habit, no shared moment) or one-time puzzle sets (no ongoing reason to
come back). Pattern Golf is neither — it's a daily ritual with a real judge underneath it.

## Who it's for

Developers and technical hobbyists who already know roughly what a regex is and want a
1–3-minute daily brain exercise — the same audience that plays Wordle on their phone during a
coffee break, but one that gets more value out of "can I write `\d{4}` instead of
`(19|20)\d\d`" than out of guessing a five-letter word.

## The core idea

Every day, one puzzle: a column of strings that must match ("A") and a column that must not
("B"). The player types a regex pattern into a single input. On every keystroke, the pattern is
compiled and run — with the browser's real `RegExp` engine, not a toy matcher — against every
string in both columns, and each string lights up green (correctly matched/excluded) or red
(wrongly matched/excluded) immediately. There's no "submit" step to create false suspense; the
feedback is the game.

Once every A string is green and every B string is red, the puzzle is solved, scored against a
par length, and the player can share a Wordle-style emoji grid of their guess history without
revealing the answer pattern.

## Key design decisions

- **A real judge, not string equality.** The whole point is compiler-adjacent correctness
  checking — see [ADR 0001](adr/0001-static-site-no-backend.md) and
  [ADR 0002](adr/0002-substring-match-judge-semantics.md) for the judge's exact semantics and
  why they were chosen over the alternatives.
- **Static site, no backend.** The daily puzzle is a deterministic function of the date, so
  there's nothing to serve dynamically. See ADR 0001.
- **Instant feedback over "submit and check."** The wow moment is literally the live judge —
  type, watch it light up. Every later feature (scoring, sharing, streaks) sits on top of that
  loop rather than competing with it for attention.
- **One puzzle a day, same for everyone.** This is what makes the share grid meaningful — like
  Wordle, the value of sharing a result comes from everyone having solved the same problem.
- **Puzzles are generated and validated, not just hand-picked.** A puzzle generation pipeline
  confirms a solvable minimal pattern exists for a given corpus before it ships as a daily
  puzzle, so "today's puzzle" is never accidentally unsolvable or degenerate (e.g. solvable by
  a pattern shorter than intended because the corpora weren't chosen carefully).

## What "v1 done" looks like

- A player can load the site on any given day and solve that day's puzzle via the live
  green/red judge described above, with no prior explanation needed — the mechanic teaches
  itself in one guess.
- Solving records a score (final pattern length vs. par) and updates a persisted streak.
- The player can copy a shareable, spoiler-free emoji grid summarizing their result.
- A small library of validated puzzles exists and a deterministic daily-selection function
  picks one per calendar date, the same for every player.
- The page meets the bar in `docs/DESIGN.md` — a designed, "someone made this" page, not a
  functional-but-bare form — on both desktop and mobile.
- CI is green on `main`: lint, typecheck, unit tests (judge correctness, scoring, daily
  selection, share-grid rendering), and a production build all pass.

## Non-goals for v1

- Accounts, cloud-synced streaks, or leaderboards (would require a backend — see ADR 0001).
- A regex-syntax reference/tutorial built into the game (linking out is enough for v1).
- Puzzle difficulty tiers or user-submitted puzzles.
