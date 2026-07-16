const REPO_URL = 'https://github.com/ctkrug/pattern-golf'
const PORTFOLIO_URL = 'https://apps.charliekrug.com'

/**
 * Below-the-fold reference copy: what the game is, how to play, and an FAQ.
 * It doubles as the page's search-intent content (regex golf game / daily
 * regex puzzle) and carries the required GitHub + portfolio links. Styled to
 * match the blueprint direction (docs/DESIGN.md), it sits under the board so
 * the game stays the hero.
 */
export function Guide() {
  return (
    <section className="guide" aria-label="About Pattern Golf">
      <div className="guide__inner">
        <article className="guide__block">
          <h2>What is Pattern Golf?</h2>
          <p>
            Pattern Golf is a daily regex golf game. Each day gives you two columns of strings:
            column A that your pattern must match, and column B that it must not. Your job is to
            write the shortest regular expression that catches all of A and none of B. It runs in
            the browser with no login and no install, and a fresh puzzle drops every day at midnight
            UTC.
          </p>
          <p>
            The name comes from code golf: the fewer characters you use, the better your score.
            Every puzzle has a par, and a solution shorter than par is a birdie. Solve the board and
            you can share a spoiler-free grid of green and red squares, the way you would share a
            Wordle result, without ever revealing the pattern you used.
          </p>
        </article>

        <article className="guide__block">
          <h2>How to play</h2>
          <ol className="guide__steps">
            <li>
              Read the two columns and find the feature every A string has and no B string has.
            </li>
            <li>
              Type a regex in the input bar. The board re-judges on every keystroke, so matches turn
              green and false matches turn red right away.
            </li>
            <li>Trim your pattern until every A cell is green and every B cell stays clear.</li>
            <li>Beat par, share your grid, and keep your streak going.</li>
          </ol>
        </article>

        <article className="guide__block">
          <h2>FAQ</h2>
          <dl className="faq">
            <dt>Is Pattern Golf a regex golf game?</dt>
            <dd>
              Yes. Every puzzle is a regex golf challenge: match one set of strings, reject another,
              in as few characters as you can. Unlike a static regex golf list, the board changes
              daily and scores you against par.
            </dd>

            <dt>How does the daily regex puzzle work?</dt>
            <dd>
              The daily regex puzzle is a pure function of the date, so everyone gets the same board
              on the same day. Consecutive days cycle through the whole library before any puzzle
              repeats.
            </dd>

            <dt>What regex matching does it use?</dt>
            <dd>
              Patterns compile with the browser&rsquo;s real RegExp engine and run as an unanchored
              substring search, so anchors like <code>^</code> and <code>$</code> work when you want
              them. Patterns that could hang the browser through catastrophic backtracking are
              refused.
            </dd>

            <dt>Do I need an account?</dt>
            <dd>
              No. There is no login and nothing to install. Your streak and daily progress are saved
              locally in your browser.
            </dd>
          </dl>
        </article>

        <div className="guide__links">
          <a className="btn btn--primary" href={REPO_URL} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
          <a className="guide__portfolio" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
            More by Charlie Krug &rarr; apps.charliekrug.com
          </a>
        </div>
      </div>
    </section>
  )
}
