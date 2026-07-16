import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dayKey, dayNumber, offsetDayKey, puzzleForDate } from '../game/daily'
import { judge } from '../game/judge'
import { buildShareText } from '../game/share'
import { createSfx } from '../game/sfx'
import {
  loadMuted,
  loadProgress,
  loadStreak,
  saveMuted,
  saveProgress,
  saveStreak,
} from '../game/storage'
import { displayStreak, recordSolve } from '../game/streak'

/** Everything the board UI needs, derived from one source of truth. */
export interface Game {
  puzzleNumber: number
  dateLabel: string
  puzzle: ReturnType<typeof puzzleForDate>
  pattern: string
  setPattern: (next: string) => void
  judgement: ReturnType<typeof judge>
  solved: boolean
  /** Length of the winning pattern once solved, else the current length. */
  length: number
  par: number
  streak: number
  guesses: string[]
  muted: boolean
  toggleMute: () => void
  shareText: string
  showWin: boolean
  dismissWin: () => void
  /** Play the win fanfare (fired by the win overlay on mount). */
  celebrate: () => void
}

export function useGame(now: Date = new Date()): Game {
  const today = useMemo(() => dayKey(now), [now])
  const yesterday = useMemo(() => offsetDayKey(now, -1), [now])
  const puzzle = useMemo(() => puzzleForDate(now), [now])
  const puzzleNumber = useMemo(() => dayNumber(now), [now])

  const sfx = useRef(createSfx(loadMuted())).current

  const initial = useMemo(() => loadProgress(today), [today])
  const [pattern, setPatternRaw] = useState(
    initial.solved && initial.guesses.length
      ? initial.guesses[initial.guesses.length - 1]
      : '',
  )
  const [guesses, setGuesses] = useState<string[]>(initial.guesses)
  const [solved, setSolved] = useState(initial.solved)
  const [winLength, setWinLength] = useState<number | null>(initial.length)
  const [showWin, setShowWin] = useState(false)
  const [streakState, setStreakState] = useState(() => loadStreak())
  const [muted, setMuted] = useState(sfx.muted)

  const judgement = useMemo(() => judge(pattern, puzzle), [pattern, puzzle])

  const setPattern = useCallback(
    (next: string) => {
      if (solved) return // input locks to the winning pattern once solved
      setPatternRaw(next)

      const result = judge(next, puzzle)

      // Record each distinct, valid, non-empty pattern in guess history.
      if (result.valid && next.length > 0) {
        setGuesses((prev) =>
          prev[prev.length - 1] === next ? prev : [...prev, next],
        )
      }

      // Play per-cell feedback for the fresh evaluation.
      if (result.valid) {
        if (result.negatives.some((c) => c.state === 'wrong')) {
          sfx.play('missThud')
        } else if (result.positives.some((c) => c.state === 'correct')) {
          sfx.play('matchBlip')
        }
      }

      if (result.solved && !solved) {
        setSolved(true)
        setWinLength(next.length)
        setShowWin(true)
        sfx.play('solveChime')
        setStreakState((prev) => {
          const updated = recordSolve(prev, today, yesterday)
          saveStreak(updated)
          return updated
        })
      }
    },
    [solved, puzzle, sfx, today, yesterday],
  )

  // Persist progress whenever it changes.
  useEffect(() => {
    saveProgress(today, { guesses, solved, length: winLength })
  }, [today, guesses, solved, winLength])

  const toggleMute = useCallback(() => {
    const next = !muted
    setMuted(next)
    sfx.setMuted(next)
    saveMuted(next)
  }, [muted, sfx])

  const length = winLength ?? pattern.length
  const streak = displayStreak(streakState, today, yesterday)
  const shareText = useMemo(
    () =>
      buildShareText({
        puzzleNumber,
        puzzle,
        guesses,
        length: winLength ?? pattern.length,
      }),
    [puzzleNumber, puzzle, guesses, winLength, pattern.length],
  )

  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [now],
  )

  return {
    puzzleNumber,
    dateLabel,
    puzzle,
    pattern,
    setPattern,
    judgement,
    solved,
    length,
    par: puzzle.par,
    streak,
    guesses,
    muted,
    toggleMute,
    shareText,
    showWin,
    dismissWin: () => setShowWin(false),
    celebrate: () => sfx.play('winFanfare'),
  }
}
