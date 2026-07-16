import { Board } from './components/Board'
import { Guide } from './components/Guide'
import { InputBar } from './components/InputBar'
import { Panel } from './components/Panel'
import { StatsRail } from './components/StatsRail'
import { WinOverlay } from './components/WinOverlay'
import { Wordmark } from './components/Wordmark'
import { useGame } from './hooks/useGame'

function App() {
  const game = useGame()

  return (
    <div className="app">
      <div className="app__grid" aria-hidden="true" />
      <header className="app__header">
        <Wordmark />
        <p className="app__tagline">
          Write the shortest regex that matches every <strong>A</strong> and no <strong>B</strong>.
        </p>
      </header>

      <main className="app__main">
        <div className="app__play">
          <Panel className="sheet" label={game.puzzle.title}>
            <InputBar
              pattern={game.pattern}
              onChange={game.setPattern}
              error={
                !game.judgement.valid && !game.judgement.empty ? game.judgement.error : undefined
              }
              solved={game.solved}
            />
            <Board judgement={game.judgement} />
          </Panel>
        </div>

        <aside className="app__rail">
          <StatsRail
            dateLabel={game.dateLabel}
            puzzleNumber={game.puzzleNumber}
            par={game.par}
            length={game.length}
            streak={game.streak}
            solved={game.solved}
            muted={game.muted}
            onToggleMute={game.toggleMute}
          />
        </aside>
      </main>

      <Guide />

      <footer className="app__footer">
        <span>A new puzzle every day · substring match, unanchored</span>
      </footer>

      {game.showWin && (
        <WinOverlay
          length={game.length}
          par={game.par}
          guessCount={game.guesses.length}
          streak={game.streak}
          shareText={game.shareText}
          onCelebrate={game.celebrate}
          onClose={game.dismissWin}
        />
      )}
    </div>
  )
}

export default App
