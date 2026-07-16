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

## Features (planned)

- **Live judge** — a real regex engine validates your pattern against a hidden corpus of
  positive/negative test strings on every keystroke; no "submit and hope."
- **Daily puzzle** — one puzzle per day, deterministic by date, same puzzle for everyone.
- **Golf scoring** — solved length vs. par, with a bonus for beating par.
- **Wordle-style share grid** — copy a colored emoji grid of your guesses to share your result
  without spoiling the answer.
- **Streaks** — daily streak tracking persisted locally.
- **Puzzle generation pipeline** — puzzles are generated and validated (a solvable, minimal
  pattern is confirmed to exist) rather than hand-picked one at a time.

## Stack

- **TypeScript** + **React** for the UI
- **Vite** for dev/build tooling
- **Vitest** for unit tests (regex judge, scoring, puzzle generation)
- Zero backend — a static site. The daily puzzle is derived from the date client-side, and
  results are stored in `localStorage`.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full plan and
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
