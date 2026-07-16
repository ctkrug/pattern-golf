# Pattern Golf

**▶ Live demo: [apps.charliekrug.com/pattern-golf](https://apps.charliekrug.com/pattern-golf/)**

[![CI](https://github.com/ctkrug/pattern-golf/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/pattern-golf/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A daily regex golf game. Each day you get two columns of strings: column A that your pattern
must match, and column B that it must not. Write the shortest regular expression that catches
all of A and none of B, beat par, and share a spoiler-free grid.

The board judges on every keystroke. Type a pattern and the matches light up green while any
string it wrongly catches turns red, so you see the cost of a mistake the moment you make it.
No submit button, no loading spinner, no login.

## Why I built it

Wordle and its cousins test vocabulary or lateral thinking. Regex is one of the most useful
small languages a developer learns, and I wanted a daily habit that made practicing it feel
like play instead of a chore. The instant green/red feedback is the whole point: you learn the
shape of a pattern by watching it succeed and fail in real time.

## How to play

1. Read the two columns and find the feature every A string shares and no B string has.
2. Type a regex in the input bar. The board re-judges live.
3. Trim the pattern until every A cell is green and every B cell stays clear.
4. Solve under par for a birdie, then copy your grid and keep your streak.

For example, given these columns:

```
A (must match)     B (must exclude)
  Apple              apple
  Banana             banana
  Cat                kiwi
```

`^[A-Z]` solves it in six characters: every A word starts with a capital, no B word does.

## Sample share grid

Sharing copies a Wordle-style grid. It shows the match/miss shape of each guess and never the
pattern itself, so posting a result cannot leak the answer:

```
Pattern Golf #12 · 2/2 (E)
🟥🟥🟥🟩🟩🟩🟩
🟩🟩🟩🟩🟩🟩🟩
```

## Features

- **Live judge.** The browser's real `RegExp` engine runs your pattern against a corpus of
  positive and negative strings on every keystroke. Substring-search semantics, so you hunt the
  structural feature that separates the columns.
- **One puzzle a day.** The daily puzzle is a pure function of the date, identical for everyone.
  Consecutive days cycle the whole library before any puzzle repeats.
- **Golf scoring.** Solved length against par, scored ace, birdie, par, or bogey.
- **Shareable grid.** A colored emoji grid of your guess history, with the pattern kept secret.
- **Streaks.** Daily streak tracking in `localStorage`, with an automatic missed-day reset.
- **Validated library.** Every puzzle is checked for solvability, reachable par, and no
  cross-column substring overlap before it ships. Patterns that could hang the browser through
  catastrophic backtracking are refused.

## Stack

- **TypeScript** and **React** for the UI
- **Vite** for dev and build tooling
- **Vitest** with **fast-check** property tests for the regex judge, scoring, and generation
- No backend. The daily puzzle is derived from the date on the client, and progress lives in
  `localStorage`.

## Development

```bash
npm install
npm run dev        # start the dev server
npm test           # run the unit and property tests
npm run typecheck  # type-check the project
npm run build      # type-check and produce the production build in site/
```

## Documentation

- [`docs/VISION.md`](docs/VISION.md) for the goals and scope
- [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the codebase map
- [`docs/adr/`](docs/adr) for the design decisions (static site, judge semantics)

## License

MIT, see [LICENSE](LICENSE).

More of Charlie's projects: [apps.charliekrug.com](https://apps.charliekrug.com)
