import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { puzzleForDate } from './game/daily'

beforeEach(() => {
  localStorage.clear()
})

describe('App — the live judge (wow moment)', () => {
  it('renders the wordmark and both columns', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /pattern\s+golf/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Strings that must match')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Strings that must not match'),
    ).toBeInTheDocument()
  })

  it('leaves every cell neutral before any pattern is typed', () => {
    render(<App />)
    const cells = screen.getAllByRole('listitem')
    expect(cells.every((c) => c.getAttribute('data-state') === 'neutral')).toBe(
      true,
    )
  })

  it('lights up cells as the pattern is typed, with no submit', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: /regex pattern/i })
    fireEvent.change(input, { target: { value: '\\d' } })

    const positives = screen.getByLabelText('Strings that must match')
    const posCells = within(positives).getAllByRole('listitem')
    // At least one positive should have left the neutral state immediately.
    expect(posCells.some((c) => c.getAttribute('data-state') !== 'neutral')).toBe(
      true,
    )
  })

  it('shows an inline warning for an invalid pattern instead of crashing', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: /regex pattern/i })
    fireEvent.change(input, { target: { value: '[' } })
    expect(screen.getByText(/invalid pattern/i)).toBeInTheDocument()
    // The board still renders.
    expect(screen.getByLabelText('Strings that must match')).toBeInTheDocument()
  })

  it('stays unsolved for a pattern that matches nothing', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByRole('textbox', { name: /regex pattern/i })
    await user.type(input, 'zzzzz')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('solves today’s puzzle with its known solution and opens the win overlay', () => {
    render(<App />)
    const input = screen.getByRole('textbox', { name: /regex pattern/i })
    // Type today's known solution directly (fireEvent avoids userEvent's
    // special handling of regex metachars like { and [).
    const solution = puzzleForDate(new Date()).solution!
    fireEvent.change(input, { target: { value: solution } })

    const dialog = screen.getByRole('dialog', { name: /puzzle solved/i })
    expect(within(dialog).getByText('SOLVED')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /share result/i })).toBeInTheDocument()
    // Input is now locked to the winning pattern.
    expect(input).toHaveAttribute('readonly')
  })

  it('persists progress across a remount (reload)', () => {
    const { unmount } = render(<App />)
    const input = screen.getByRole('textbox', { name: /regex pattern/i })
    const solution = puzzleForDate(new Date()).solution!
    fireEvent.change(input, { target: { value: solution } })
    unmount()

    render(<App />)
    // Reloaded solved: input is read-only again without retyping.
    expect(
      screen.getByRole('textbox', { name: /regex pattern/i }),
    ).toHaveAttribute('readonly')
  })
})
