import type { CellResult } from '../game/types'

interface StringCellProps {
  cell: CellResult
  /** Position in the column, used to stagger the flip-cascade animation. */
  index: number
}

/**
 * One string in a column. Its data-state drives the green/red/neutral theme
 * and the reveal animation (staggered via the --i custom property). A wrongly
 * matched negative also carries data-shake for the impact feedback.
 */
export function StringCell({ cell, index }: StringCellProps) {
  return (
    <li
      className="cell"
      data-state={cell.state}
      style={{ ['--i' as string]: index }}
    >
      <span className="cell__text">{cell.value}</span>
      <span className="cell__mark" aria-hidden="true">
        {cell.state === 'correct' ? '✓' : cell.state === 'wrong' ? '✕' : ''}
      </span>
    </li>
  )
}
