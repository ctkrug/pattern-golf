import { useEffect, useState } from 'react'

interface InputBarProps {
  pattern: string
  onChange: (next: string) => void
  /** Error message when the pattern is invalid, else undefined. */
  error?: string
  solved: boolean
}

const EXAMPLES = ['^[A-Z]', '\\d{3}-\\d{4}', 'ing$', '(.)\\1', '\\s', '[aeiou]']

/**
 * The live pattern input: a monospace field framed like a regex literal
 * (`/ … /`). Typing re-judges the board on every keystroke — no submit.
 * When empty, an annotation slot cycles example patterns with a blinking
 * caret; an invalid pattern shows an inline indicator instead of crashing.
 */
export function InputBar({ pattern, onChange, error, solved }: InputBarProps) {
  const [exampleIdx, setExampleIdx] = useState(0)

  useEffect(() => {
    if (pattern.length > 0) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % EXAMPLES.length)
    }, 2600)
    return () => clearInterval(id)
  }, [pattern.length])

  const showExample = pattern.length === 0 && !solved

  return (
    <div className="inputbar" data-invalid={Boolean(error)}>
      <label className="inputbar__delim" htmlFor="pattern-input" aria-hidden="true">
        /
      </label>
      <div className="inputbar__field">
        <input
          id="pattern-input"
          className="inputbar__input"
          type="text"
          value={pattern}
          onChange={(e) => onChange(e.target.value)}
          readOnly={solved}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Regex pattern"
          aria-invalid={Boolean(error)}
          placeholder=""
        />
        {showExample && (
          <span className="inputbar__example" aria-hidden="true">
            {EXAMPLES[exampleIdx]}
            <span className="inputbar__caret" />
          </span>
        )}
      </div>
      <span className="inputbar__delim" aria-hidden="true">
        /
      </span>
      <span className="inputbar__status" role="status" aria-live="polite">
        {error ? (
          <span className="inputbar__error">⚠ {error}</span>
        ) : solved ? (
          <span className="inputbar__solved">solved</span>
        ) : (
          <span className="inputbar__len">
            {pattern.length} char{pattern.length === 1 ? '' : 's'}
          </span>
        )}
      </span>
    </div>
  )
}
