import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WinOverlay } from './WinOverlay'

const baseProps = {
  length: 2,
  par: 3,
  guessCount: 4,
  streak: 5,
  shareText: 'Pattern Golf #10 — 2/3 (-1)\n🟩🟩🟥',
  onCelebrate: () => {},
  onClose: () => {},
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('WinOverlay', () => {
  it('renders as a labelled modal dialog with the run stats', () => {
    render(<WinOverlay {...baseProps} />)
    const dialog = screen.getByRole('dialog', { name: /puzzle solved/i })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('SOLVED')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument() // guesses
    expect(screen.getByText(/birdie/i)).toBeInTheDocument()
    // The spoiler-free preview is exposed for manual copy.
    expect(screen.getByLabelText('Share preview')).toHaveTextContent('Pattern Golf #10')
  })

  it('fires the celebration exactly once on mount', () => {
    const onCelebrate = vi.fn()
    render(<WinOverlay {...baseProps} onCelebrate={onCelebrate} />)
    expect(onCelebrate).toHaveBeenCalledTimes(1)
  })

  it('copies the share text and confirms on the button', async () => {
    // fireEvent (not user-event, which installs its own clipboard stub).
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<WinOverlay {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /share result/i }))

    expect(writeText).toHaveBeenCalledWith(baseProps.shareText)
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument()
  })

  it('still confirms (preview is the fallback) when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: undefined })

    render(<WinOverlay {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /share result/i }))
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument()
  })

  it('closes via the Close button', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<WinOverlay {...baseProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
