# ADR 0001: Static site, no backend

## Status

Accepted

## Context

Pattern Golf needs a daily puzzle (same puzzle for every player on a given date), a scoring
judge, a share grid, and streak tracking. All of that can be computed client-side: the daily
puzzle is a deterministic function of the date, the judge is pure regex evaluation, and streaks
are per-player state that doesn't need to be shared or verified server-side.

## Decision

Ship Pattern Golf as a static, self-contained site (Vite build output, one `dist/` directory,
relative asset paths). No server, no database, no accounts. Player state (streak, last-played
date, guess history) lives in `localStorage`.

## Consequences

- Zero hosting cost and zero backend to operate or secure — deploys to any static host,
  including a subpath like `apps.charliekrug.com/pattern-golf`.
- No server-side anti-cheat: a player can read the puzzle's answer key out of the shipped JS if
  they try. Acceptable for a casual daily-habit game; not acceptable if this ever needs
  competitive integrity (leaderboards), which would require rethinking this decision.
- Streaks and history are per-device, not per-account. Clearing browser storage resets a streak.
  This is a known, accepted trade-off for v1 rather than a gap to silently patch later.
