# Architecture — Pattern Golf

A static, single-page React + TypeScript app (Vite). No backend: the daily
puzzle is a pure function of the date, and all progress lives in
`localStorage`. Built output is base-path-relative (`vite base: './'`) so it
serves correctly from a subpath (`apps.charliekrug.com/pattern-golf/`).

## Data flow

```
date ──► daily.puzzleForDate ──► Puzzle
                                   │
 keystroke ──► useGame.setPattern ─┤
                                   ▼
                          judge(pattern, puzzle) ──► Judgement
                                   │                    │
                    guess history, streak, sfx          ▼
                    (localStorage via storage)     Board / cells light up
                                   │
                        solved? ──► WinOverlay ──► share.buildShareText
```

Every keystroke re-judges the whole board; there is no submit step. The judge
is the single source of truth for cell colour, solved state, and (via the
share module) the emoji grid.

## Modules

### `src/game/` — pure logic (no React, fully unit-tested)

- **`types.ts`** — `Puzzle`, `CellResult`, `Judgement`, `CellState`.
- **`judge.ts`** — `judge(pattern, puzzle)`: compiles the pattern and marks
  each positive/negative correct/wrong via unanchored `RegExp.test`
  (substring search, ADR 0002). Empty/invalid/pathological patterns leave the
  board neutral. `isPathological` statically refuses nested-quantifier ReDoS
  shapes.
- **`puzzles.ts`** — `PUZZLES`, the 12-puzzle seed library (par 2–8).
- **`validate.ts`** — `validatePuzzle` / `validateLibrary`: reject empty
  columns, cross-column substring overlaps, and unsolvable/over-par puzzles.
- **`daily.ts`** — `puzzleForDate` (deterministic, cycles the library),
  `dayNumber`, `dayKey`, `offsetDayKey` (all UTC).
- **`scoring.ts`** — `scoreResult` (ace/birdie/par/bogey vs par), `formatDelta`.
- **`streak.ts`** — `recordSolve` / `displayStreak` with missed-day reset.
- **`share.ts`** — `buildShareText`: spoiler-free Wordle-style emoji grid.
- **`storage.ts`** — guarded `localStorage` for progress, streak, and mute.
- **`sfx.ts`** — `createSfx`: WebAudio-synthesized SFX, lazy context, mute,
  throttle; no-op without `AudioContext`.

### `src/hooks/`

- **`useGame.ts`** — the single state hook. Wires judge + streak + sfx +
  persistence; records distinct guesses, fires per-cell SFX, locks the input
  and opens the win overlay on the first solve of the day. Accepts an optional
  `now: Date` for testing.

### `src/components/`

- **`Panel`** — blueprint sheet with crop-mark corners + optional label.
- **`Wordmark`** — designed title block with a ticked drafting rule.
- **`Board`** / **`StringCell`** — the two-column hero grid; cells flip
  green/red with a staggered cascade.
- **`InputBar`** — live regex input, invalid indicator, idle example cycler.
- **`StatsRail`** / **`MuteToggle`** — date/par/length/streak + mute.
- **`WinOverlay`** — SOLVED stamp, stats, particle burst, share CTA.

### `src/`

- **`App.tsx`** — composes header, play area, rail, and win overlay.
- **`index.css`** — the full blueprint theme (tokens, grid background,
  animations, responsive layout, reduced-motion).

## Run / test / build

```
npm run dev         # local dev server
npm test            # vitest (75 tests: judge, validation, daily, scoring,
                    #   streak, share, storage, sfx, App integration)
npm run typecheck   # tsc --noEmit
npm run lint        # oxlint
npm run build       # tsc -b && vite build  ->  dist/  (base-relative)
```
