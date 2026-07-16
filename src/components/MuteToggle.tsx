interface MuteToggleProps {
  muted: boolean
  onToggle: () => void
}

/** Speaker button toggling synth SFX; state persists via the game hook. */
export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      type="button"
      className="mute"
      onClick={onToggle}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
