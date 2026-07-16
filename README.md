# Pattern Golf

A daily regex-golf puzzle: write the **shortest possible pattern** that matches every string
in column A but none of the strings in column B. Type a guess, hit enter, and watch it light
up green across every match and red across every string it wrongly catches — instantly, no
submit button, no loading spinner.

Pattern Golf is built around a real regex-matching judge, not string equality. Your pattern is
compiled and run against a hidden test corpus of positive and negative strings on every
keystroke, so partial credit and near-misses are visible immediately. Solve it in fewer
characters than par and you're golfing; share your grid, keep your streak.

## Why

Most word-of-the-day games (Wordle, Connections, etc.) test vocabulary or lateral thinking.
Pattern Golf tests a different, under-served daily habit: pattern-matching literacy. Regex is
one of the most useful small languages a developer ever learns, and there's no daily-habit game
that makes practicing it feel like play instead of a chore. The instant green/red feedback loop
is what makes that possible — you see the cost of every mistake the moment you make it.

## Features

- **Live judge** — the browser's real `RegExp` engine validates your pattern against a corpus of
  positive/negative test strings on every keystroke; no "submit and hope." Substring-search
  semantics, so you hunt the structural feature that separates the columns.
- **Daily puzzle** — one puzzle per day, a deterministic function of the date, the same for
  everyone; consecutive days cycle the whole library before repeating.
- **Golf scoring** — solved length vs. par, scored ace / birdie / par / bogey.
- **Wordle-style share grid** — copy a colored emoji grid of your guess history without ever
  revealing your pattern.
- **Streaks** — daily streak tracking, persisted locally, with automatic missed-day reset.
- **Validated puzzle library** — every puzzle is checked for solvability, reachable par, and
  no cross-column substring overlaps before it ships; pathological (ReDoS) patterns are refused.

## Stack

- **TypeScript** + **React** for the UI
- **Vite** for dev/build tooling
- **Vitest** for unit tests (regex judge, scoring, puzzle generation)
- Zero backend — a static site. The daily puzzle is derived from the date client-side, and
  results are stored in `localStorage`.

## Status

[![CI](https://github.com/ctkrug/pattern-golf/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/pattern-golf/actions/workflows/ci.yml)

Core game is playable end to end — live judge, daily puzzle, scoring, share grid, and streaks.
See [`docs/VISION.md`](docs/VISION.md) for the full plan, [`docs/DESIGN.md`](docs/DESIGN.md) for
the visual direction, [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the codebase map, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build breakdown.

## Development

```bash
npm install
npm run dev       # start the dev server
npm test          # run the unit tests
npm run build     # typecheck + production build
```

## License

MIT — see [LICENSE](LICENSE).
