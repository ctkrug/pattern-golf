import type { Judgement } from '../game/types'
import { Panel } from './Panel'
import { StringCell } from './StringCell'

interface BoardProps {
  judgement: Judgement
}

/**
 * The two-column match grid: column A ("must match") and column B ("must
 * exclude"). Each string is a StringCell that lights up as the pattern is
 * judged. This is the hero of the page.
 */
export function Board({ judgement }: BoardProps) {
  return (
    <div className="board">
      <Panel className="board__col" label="A · must match">
        <ul className="board__list" aria-label="Strings that must match">
          {judgement.positives.map((cell, i) => (
            <StringCell key={cell.value} cell={cell} index={i} />
          ))}
        </ul>
      </Panel>
      <Panel className="board__col" label="B · must exclude">
        <ul className="board__list" aria-label="Strings that must not match">
          {judgement.negatives.map((cell, i) => (
            <StringCell key={cell.value} cell={cell} index={i} />
          ))}
        </ul>
      </Panel>
    </div>
  )
}
