# Contributing

Pattern Golf is a solo side project, but issues and PRs are welcome.

## Setup

```bash
npm install
npm run dev
```

## Before opening a PR

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

All five must pass — this is exactly what CI runs on every push and PR.

## Commit style

Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, ...), imperative
mood, with a short body explaining _why_ for anything non-trivial. See the git log for examples.

## Puzzle changes

New or edited puzzles must pass the corpus validation described in
[`docs/BACKLOG.md`](docs/BACKLOG.md) (Epic 4) before they're accepted — a puzzle isn't valid
just because it "looks right."
