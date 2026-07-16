# Design — Pattern Golf

Locked at SCOPE. Every BUILD and QA run follows this. Change it only deliberately, in its own
commit, with a note on why.

## 1. Aesthetic direction

**Blueprint / technical.** Pattern Golf is a compiler-adjacent puzzle — the personality is an
engineering drafting sheet: a deep navy blueprint background with fine cyan grid lines, crisp
corner crop-marks framing panels, and monospace annotations, like the regex is being drafted on
a technical drawing rather than typed into a generic web form.

This direction is chosen deliberately over "dark gray cards + one accent" — the grid-line
texture, crop-mark framing, and stamp/annotation motifs give the page a distinct personality tied
to the product (pattern-drafting), not a reskin of a generic dark theme.

## 2. Tokens

```
--bg:            #0a1628   /* deep navy blueprint */
--surface-1:     #0f1f38   /* panel background */
--surface-2:     #16294a   /* raised panel / input bar */
--grid-line:     rgba(79, 214, 232, 0.08)   /* blueprint grid overlay */
--border:        rgba(127, 149, 184, 0.35)

--text:          #e8f0fb
--text-muted:    #7f95b8

--accent:        #4fd6e8   /* cyan — primary interactive, focus, wordmark */
--accent-support: #f5a623  /* amber — par marker, streak flame, secondary highlight */
--success:       #3ddc84   /* matched string */
--danger:        #ff5470   /* wrongly-matched string */

--font-display:  'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace
--font-ui:       'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif

--space: 4px base scale -> 4, 8, 12, 16, 24, 32, 48, 64
--radius-sm: 6px    /* inputs, buttons, string cells */
--radius-lg: 10px   /* panels */
--shadow-panel: 0 12px 32px -12px rgba(0, 0, 0, 0.55)
--glow-focus:  0 0 0 3px rgba(79, 214, 232, 0.35)

--motion-ui:   160ms cubic-bezier(0.16, 1, 0.3, 1)   /* ease-out */
--motion-game: 90ms cubic-bezier(0.16, 1, 0.3, 1)
```

Both fonts load from Google Fonts (`JetBrains Mono`, `IBM Plex Sans`) with the system-stack
fallbacks above so the page never blocks on font load for first paint.

## 3. Layout intent

**Hero = the puzzle board**: the live regex input bar and the two-column match grid (column A /
column B), framed as a blueprint sheet with corner crop-marks. The board is the thing you look
at and act on; everything else is secondary.

**Desktop (1440×900):** the board sits center-left and fills ~65% of viewport height —
input bar pinned at the top of the sheet, the two string columns below it, each string a cell
that flips to green/red on evaluation. A slim right rail (≈280px) holds today's date, par,
current length, streak, and the mute toggle. Blueprint grid-line texture covers the full page
background so the board doesn't float in empty space.

**Mobile (390×844):** single column. The input bar is sticky at the top (always reachable while
scrolling the board). The board stacks below at full width. The stats rail collapses into a
horizontal strip above the board (date · par · length · streak) rather than a sidebar.

## 4. Signature detail

The wordmark **"Pattern Golf"** renders as a blueprint title block: `JetBrains Mono`, wide
letter-spacing, underlined by a thin cyan rule with tick marks like a drafting scale. Beside it,
a small annotation slot cycles through example patterns (`/^[A-Z]/`, `/\d{3}-\d{4}/`, ...) typed
out with a blinking caret when the board is idle (no guess yet submitted) — it disappears once
the player starts typing their own pattern. Every panel is framed with small corner crop-marks
(┌ ┐ └ ┘ rendered as 8px cyan tick pairs), reinforcing the "drafting sheet" motif without adding
any binary assets.

## 5. Juice plan

- **Movement tween:** on evaluating a pattern, string cells reveal with a staggered flip
  cascade (90ms per cell, ~30ms stagger) — never an instant color snap.
- **Impact feedback:** a false-positive match (column-B string wrongly matched) gets a quick
  horizontal shake (±4px, 2 cycles) plus a red flash on that cell.
- **Goal/success pop:** a correctly matched column-A string pulses green with a scale bounce
  (1 → 1.08 → 1) as it flips.
- **Win celebration:** solving the puzzle triggers a blueprint ink-stamp animation ("SOLVED")
  slamming onto the board plus a brief burst of small cyan/amber tick-mark particles, followed
  by a stats overlay (final length vs. par, guess count, streak) with one clear CTA: **Share
  result**.
- **Synth SFX** (WebAudio oscillators generated in code — zero audio files), rate-throttled and
  quiet by default:
  - `matchBlip` — short rising sine tone (~90ms) per cell that flips green
  - `missThud` — short descending square/noise tone (~90ms) per cell that flips red
  - `solveChime` — three-note ascending arpeggio on solving the puzzle
  - `winFanfare` — four-note major arpeggio with a short decay on the win overlay
  - a mute toggle (speaker icon, top-right of the board) persists in `localStorage`; the
    `AudioContext` is created lazily on first user gesture and every SFX call is guarded for
    environments where `AudioContext` is unavailable (tests, some embedded webviews).
- All motion respects `prefers-reduced-motion`: shakes/particles/tweens drop to instant
  state changes, sound is unaffected (audio is a separate, user-controlled preference).
