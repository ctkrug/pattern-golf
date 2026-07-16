import { useEffect, useState } from 'react'
import { formatDelta, scoreResult } from '../game/scoring'

interface WinOverlayProps {
  length: number
  par: number
  guessCount: number
  streak: number
  shareText: string
  onCelebrate: () => void
  onClose: () => void
}

async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    }
  } catch {
    // Clipboard blocked or unavailable — the on-screen preview is the fallback.
  }
}

/**
 * The win moment: an ink-stamp "SOLVED" over a stats card (length vs par,
 * guesses, streak) with a Share CTA. A burst of tick-mark particles plays on
 * mount alongside the win fanfare; both drop out under prefers-reduced-motion
 * (particles are decorative and hidden via CSS).
 */
export function WinOverlay({
  length,
  par,
  guessCount,
  streak,
  shareText,
  onCelebrate,
  onClose,
}: WinOverlayProps) {
  const [copied, setCopied] = useState(false)
  const score = scoreResult(length, par)

  useEffect(() => {
    onCelebrate()
    // onCelebrate is stable enough for a mount-only fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleShare() {
    await copyText(shareText)
    // Always confirm: on the rare clipboard failure the visible preview below
    // is the guaranteed manual-copy fallback.
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const particles = Array.from({ length: 14 }, (_, i) => i)

  return (
    <div className="win" role="dialog" aria-modal="true" aria-label="Puzzle solved">
      <div className="win__particles" aria-hidden="true">
        {particles.map((i) => (
          <span key={i} className="win__tick" style={{ ['--p' as string]: i }} />
        ))}
      </div>
      <div className="win__card">
        <div className="win__stamp">SOLVED</div>
        <p className="win__term" data-term={score.term}>
          {score.term} · {length}/{par} ({formatDelta(score.delta)})
        </p>
        <dl className="win__stats">
          <div>
            <dt>Length</dt>
            <dd>{length}</dd>
          </div>
          <div>
            <dt>Guesses</dt>
            <dd>{guessCount}</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>🔥 {streak}</dd>
          </div>
        </dl>
        <div className="win__actions">
          <button type="button" className="btn btn--primary" onClick={handleShare}>
            {copied ? 'Copied ✓' : 'Share result'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <pre className="win__preview" aria-label="Share preview">
          {shareText}
        </pre>
      </div>
    </div>
  )
}
