import { formatDelta, scoreResult } from '../game/scoring'
import { MuteToggle } from './MuteToggle'
import { Panel } from './Panel'

interface StatsRailProps {
  dateLabel: string
  puzzleNumber: number
  par: number
  length: number
  streak: number
  solved: boolean
  muted: boolean
  onToggleMute: () => void
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
    </div>
  )
}

/**
 * The stats panel: date/puzzle number, par, current-or-final length, and
 * streak. Rendered as a right rail on desktop and a horizontal strip on
 * mobile via CSS. Once solved it shows the score delta (birdie/par/bogey).
 */
export function StatsRail({
  dateLabel,
  puzzleNumber,
  par,
  length,
  streak,
  solved,
  muted,
  onToggleMute,
}: StatsRailProps) {
  const score = solved ? scoreResult(length, par) : null
  const lengthValue = score
    ? `${length} (${formatDelta(score.delta)})`
    : String(length)

  return (
    <Panel className="stats" label={`#${puzzleNumber}`}>
      <div className="stats__head">
        <span className="stats__date">{dateLabel}</span>
        <MuteToggle muted={muted} onToggle={onToggleMute} />
      </div>
      <div className="stats__grid">
        <Stat label="Par" value={String(par)} />
        <Stat label="Length" value={lengthValue} />
        <Stat label="Streak" value={`🔥 ${streak}`} />
        <Stat
          label="Status"
          value={solved ? (score?.term ?? 'solved') : 'drafting'}
        />
      </div>
    </Panel>
  )
}
