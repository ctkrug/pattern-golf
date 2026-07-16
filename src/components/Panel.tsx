import type { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
  /** Optional label rendered in the panel's title-block corner. */
  label?: string
}

/**
 * A blueprint "sheet" panel: a bordered surface framed with cyan corner
 * crop-marks (the drafting-sheet motif from docs/DESIGN.md). The crop-marks
 * are pure CSS pseudo-elements, so no binary assets.
 */
export function Panel({ children, className, label }: PanelProps) {
  return (
    <section className={`panel${className ? ` ${className}` : ''}`}>
      <span className="panel__crop panel__crop--tl" aria-hidden="true" />
      <span className="panel__crop panel__crop--tr" aria-hidden="true" />
      <span className="panel__crop panel__crop--bl" aria-hidden="true" />
      <span className="panel__crop panel__crop--br" aria-hidden="true" />
      {label && <span className="panel__label">{label}</span>}
      {children}
    </section>
  )
}
