# cupel

**cupel** turns the LLM in your AI harness into a personal investing analyst: a research companion that learns *your* edges and stress-tests your ideas against the investing canon.

It is not a stock screener or a per-project linter. It is a stateful companion that lives in one folder — your *office* — and amasses everything it learns about you there: your circle of competence, your watchlist, your theses, your positions, and a dated decision journal. The premise is Peter Lynch's: your advantage is what you already know from your work and your life. cupel's job is to capture that edge, turn it into disciplined ideas, and keep you honest.

**Detection and discipline only.** cupel sharpens your own reasoning and surfaces what you are missing. It does not predict prices, place trades, or give buy/sell calls.

> A *cupel* is the bone-ash vessel used in fire assay: you melt a sample in it and the base metal burns away, leaving only the pure gold or silver. Burn off the dross; keep what is truly valuable.

## Status

Early. The repo scaffolding, the office folder convention, and skill distribution are in place; the companion's onboarding and command set are being designed.

## Install

```
npm install -g cupel
```

Set up your office (defaults to `~/cupel`, override with `CUPEL_HOME`):

```
cupel init
```

Add the skill to your AI harness (Claude Code, Cursor, Gemini CLI, Codex/Agents, OpenCode, Kiro, Pi, Qoder, Trae, GitHub Copilot):

```
cupel skills install            # auto-detects which harness dirs exist
cupel skills install --all      # install into every supported provider
cupel skills update             # re-sync after `npm update -g cupel`
cupel skills check              # show installed version + content-hash status
```

Then talk to it from any harness: `/cupel`.

## The office

```
~/cupel/
  EDGES.md      your circle of competence — what you see before Wall Street does
  MANDATE.md    your investment policy: goals, horizon, risk, position-size & sell rules
  watchlist/    ideas you're tracking, and why they're on your radar
  positions/    what you actually hold: cost basis, thesis, sell triggers
  theses/       full write-ups, one per idea
  journal/      a dated decision log — every buy, sell, and pass, with the reasoning
```

Keep it under git if you like — the decision journal is far more valuable when every change is versioned and timestamped.

## The canon

cupel's judgment is anchored in accessible investing classics, aimed at smart people who are experts in other fields rather than finance professionals:

- **Edge / what to buy** — Peter Lynch (*One Up on Wall Street*), Christopher Mayer (*100 Baggers*)
- **Quality / moats** — Pat Dorsey
- **Behavior / temperament** — Morgan Housel (*The Psychology of Money*)
- **Humility / risk / cost** — Bogle, William Bernstein
- **Don't overpay** — Benjamin Graham

## Develop

```
npm install
npm run build
npm test
```

## License

MIT
