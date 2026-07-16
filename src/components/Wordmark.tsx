/**
 * The Pattern Golf wordmark, rendered as a blueprint title block: monospace,
 * wide letter-spacing, underlined by a ticked drafting rule (docs/DESIGN.md
 * signature detail). The slash glyph is accented to echo the regex motif.
 */
export function Wordmark() {
  return (
    <div className="wordmark">
      <h1 className="wordmark__title">
        <span className="wordmark__slash">/</span>Pattern&nbsp;Golf
        <span className="wordmark__slash">/</span>
      </h1>
      <div className="wordmark__rule" aria-hidden="true" />
    </div>
  )
}
