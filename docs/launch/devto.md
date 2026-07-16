---
title: 'I built a daily regex golf game, and the hard part was not letting it hang your browser'
published: false
tags: javascript, typescript, regex, webdev
---

I like Wordle. I also spend a lot of my day writing regular expressions. So I built
[Pattern Golf](https://apps.charliekrug.com/pattern-golf/): a new regex golf puzzle every day.
You get two columns of strings, A and B. Write the shortest pattern that matches everything in
A and nothing in B. Beat par, share a grid, keep your streak.

The whole thing is a static site. No backend, no accounts, TypeScript and React and Vite. Here
are the two decisions that took the most thought.

## You cannot time out a regex

The core loop is simple: on every keystroke, compile the pattern and run it against a small
corpus of positive and negative strings. If it matches every positive and no negative, you win.

The problem is that a user types the pattern, and some patterns are dangerous. A classic like
`(a+)+$` against a long non-matching string is catastrophic backtracking: the match takes
exponential time. In a browser that runs on the main thread, so the tab freezes. And a
synchronous `RegExp.test` cannot be interrupted once it starts. There is no timeout to reach for.

You can move the match into a Web Worker and kill the worker after a deadline, which works but
adds real complexity for a puzzle game. I went the other way and refuse to run the dangerous
shapes at all. Before compiling, I scan the pattern for the one construct that actually blows
up: a group that is quantified with `+`, `*`, or `{n,}` and whose body already contains an
unbounded quantifier. That is the `(a+)+` family.

The tricky part is that the nesting can hide. `(a+)+` is obvious, but `((a+))+`, `(a+|b)+`, and
`(x(a*)y)+` are the same hazard wearing a disguise. A naive adjacent-characters regex misses
them. So the scanner walks the string with an open-paren stack, skips character classes and
escapes, and when a group closes it checks whether that group is unbounded-quantified and whether
its body held an unbounded quantifier. If both are true, the pattern is refused with a friendly
"pattern too complex" instead of freezing the page.

It is deliberately conservative. It rejects a small family of patterns, and none of them are
things a real solver needs to hit par. That felt like the right trade for a toy: a false refusal
on a pattern nobody would type, in exchange for never freezing a tab.

## Making a puzzle provably fair before it ships

The judge uses unanchored substring search, so `th` matches `math`. That has a subtle
consequence for puzzle design. If a string in column B contains a column A string as a substring,
then any pattern that matches the A string also matches the B string for free, and the intended
short solution becomes unreachable.

Rather than catch that by hand, I wrote a validator that runs over the whole library in a test.
For every puzzle it checks non-empty columns, that no negative contains a positive as a substring
or vice versa, that a known solution actually solves it, and that the solution length does not
exceed par. A puzzle that fails any check never ships. It turned an entire class of "this one is
impossible" bug reports into a red test.

## The share grid keeps the secret

Sharing copies a Wordle-style grid of green and red squares, one row per guess. The one rule: it
never emits the pattern itself, only the match/miss shape. So you can post your result without
handing everyone the answer. That is a two-line invariant in code and a property test that asserts
the pattern string never appears in the output.

## What I would do differently

If I added user-authored puzzles, the static-scan defense stops being enough and the Web Worker
timeout becomes worth the complexity. For a fixed, validated library it is overkill. Knowing
where that line is was most of the design.

Play it: [apps.charliekrug.com/pattern-golf](https://apps.charliekrug.com/pattern-golf/)
Code: [github.com/ctkrug/pattern-golf](https://github.com/ctkrug/pattern-golf)
