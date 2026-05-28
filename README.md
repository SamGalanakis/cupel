# cupel

**cupel** turns the LLM in your AI harness into a personal investing analyst: a research companion that learns *your* edges and stress-tests your ideas against the investing canon.

It lives in one folder — your *office* — and accumulates what it learns about you: your circle of competence, watchlist, theses, positions, and a dated decision journal. The premise is Peter Lynch's: your edge is what you already know from your work and daily life. cupel captures that edge, turns it into researched ideas, and keeps your reasoning honest over time.

cupel gives reasoned, mandate-grounded calls — the likely scenarios, rough upside and timeframe, and the risks named. Investing is a bet; cupel helps you make an *informed* one: bear/base/bull, rough magnitude and horizon, tied to your assumptions, given as ranges, with the falsifier named. What it refuses is false precision dressed as fact and bare tips with no reasoning; it never invents a number — scenarios project from real, dated figures — and it never places trades. The decisions stay yours.

## Status

Early but working. The companion — onboarding, the `scout`/`watch → assay → crux`/`premortem` discipline loop, portfolio-level `allocate`, and `pulse`/`brief` reviews — plus the deterministic office tooling (`doctor`, `portfolio`, `show`, `board`, `tickers`) are built and dogfooded. Market data comes from a recorded market-data MCP, with `cupel data doctor` to check setup. Read-only DEGIRO CSV import is built for broker sync; live broker APIs are still planned, never order execution.

For DEGIRO specifically, cupel can import exported `Portfolio.csv` and
`Transactions.csv` files today. A future live connector can build on the
unofficial [`degiro-api`](https://github.com/icastillejogomez/degiro-api)
package, but any broker connector must be read-only by default: installing a
library is not permission to place, execute, modify, or cancel orders.

## Quickstart

```
npm install -g @samgalanakis/cupel        # 1 · install
cupel init                  # 2 · create your office at ~/cupel
cupel skills install        # 3 · add the skill to your AI harness
```

Then, inside your harness:

1. **`/cupel`** — on the first run it interviews you and writes your `PROFILE`, `EDGES`, `MANDATE`, and a few trusted `sources/`. A few minutes; stop and resume any time.
2. **`/cupel I keep seeing <product> everywhere at work`** — hand it an edge-driven idea. It resumes any prior notes, researches the company, runs the discipline gate (good business at a fair price, inside your edge?), and files a thesis with explicit falsifiers.
3. **`/cupel brief`** — any time later, a status check: what changed, what's over your mandate, what's due for review.

cupel reads and writes your office and gives you reasoned calls — the likely scenarios, rough upside and timeframe, with the risks named; you make and place every trade. It won't dress false precision as fact or hand you tips with no reasoning, and it never invents a number.

## Install

```
npm install -g @samgalanakis/cupel
```

Set up your office (defaults to `~/cupel`, override with `CUPEL_HOME`):

```
cupel init
```

Add the skill to your AI harness (Claude Code, Cursor, Gemini CLI, Codex/Agents, OpenCode, Kiro, Pi, Qoder, Trae, GitHub Copilot):

```
cupel skills install            # auto-detects which harness dirs exist
cupel skills install --all      # install into every supported provider
cupel skills update             # re-sync after `npm update -g @samgalanakis/cupel`
cupel skills check              # show installed version + content-hash status
```

Then talk to it from any harness: `/cupel`.

### Without the npm package

The skill is committed at `skills/cupel/`, so you can pull it straight from GitHub without installing the npm package first:

```
npx skills add SamGalanakis/cupel          # via skills.sh (skills.sh/SamGalanakis/cupel)
```

Or add it as a Claude Code plugin marketplace:

```
/plugin marketplace add SamGalanakis/cupel
/plugin install cupel@cupel
```

### Claude Cowork

Cowork installs plugins from a zip. Every [release](https://github.com/SamGalanakis/cupel/releases/latest) ships a `cupel-cowork.zip` asset that bundles the CLI (zero npm deps, so `cupel init`/`doctor` run in the sandbox on `node` alone). Download it, then in Cowork: Customize : Plugins : Install : upload the zip. Build it yourself with `npm run build:cowork`.

## The office

```
~/cupel/
  PROFILE.md    who you are operationally: brokers, currency, constraints, how you work
  EDGES.md      your circle of competence — what you see before Wall Street does
  MANDATE.md    your investment policy: goals, horizon, risk, position-size & sell rules
  sources/      people and sources you trust, each with context and a last-checked date
  watchlist/    ideas you're tracking, with provenance back to a source or hunch
  themes/       edge trends mapped to the public names that express them
  positions/    what you hold (core + satellite), each with a role and size; cash is the remainder
  theses/       full write-ups, one per idea
  journal/      a dated decision log — every buy, sell, and pass, with the reasoning
```

`PROFILE.md`, `EDGES.md`, and `MANDATE.md` are the three top-level notes cupel reads every session; `PROFILE.md` is free-form (your brokers, base currency, constraints, and preferences — and a place cupel records durable facts it should always remember). It's an Obsidian-compatible vault: notes use YAML frontmatter for structure and `[[wikilinks]]` for provenance (a thesis links its `[[source]]`; a position links its `[[thesis]]`). Watchlist and thesis notes carry optional-but-recommended frontmatter — `tier`, `conviction`, `edge`, `correlation`, `url`, `horizon`, `figures-as-of`, and `entry-trigger` — and `cupel board` ranks the watchlist by `tier` so you see what's live at a glance. The principle is *rank on merit, show correlation as information*: an idea earns its tier on its own thesis, and its correlation to what you already hold is surfaced beside it rather than baked into the score. Theses include a **Scenarios & timeframe** block (bear/base/bull with rough magnitude, horizon, and the falsifier). Dotted tickers file with a hyphen — `SOP.PA` becomes `SOP-PA.md`. Open it in Obsidian for the graph view, or just read the markdown. Keep it under git — the decision journal's value compounds as its history grows.

`cupel doctor` keeps the vault honest: it checks frontmatter and required fields, dangling `[[links]]`, mandate breaches (a position over your `max-position-pct`, or total satellite over your `satellite-target-pct`), stale reviews, decisions whose `review-on` date has arrived, stale figures (a `figures-as-of` date gone old), and ticker/filename mismatches. The LLM does the judgment; the linter guards the filing cabinet — pure arithmetic, dates, and string matching, no heuristics.

### Choosing the office folder, and using Obsidian

The office defaults to `~/cupel`. To keep it elsewhere — inside an existing Obsidian vault, or a synced folder (Dropbox, iCloud) for backup and multi-device — set `CUPEL_HOME`:

```
export CUPEL_HOME="$HOME/Documents/MyVault/cupel"   # add this to your shell profile
cupel init
cupel where                                          # confirms the resolved path
```

Set `CUPEL_HOME` in your **shell profile**, not just once in a terminal: the `/cupel` skill locates the office by running `cupel where`, so the variable must be in the environment your AI harness inherits. Pointing different `CUPEL_HOME` values at different folders gives you separate offices.

**With Obsidian**, open the office folder as a vault. Because every note carries its provenance as `[[wikilinks]]`, the graph view becomes your idea lineage — source → edge → watchlist → thesis → position, with journal entries hanging off each — and backlinks surface every decision that touched a holding. Tags filter by Lynch category (`#fast-grower`, …) and status (`#held`, `#passed`). It's a strict superset of plain markdown, so cupel never *requires* Obsidian; Obsidian just makes the graph visible.

## CLI

The deterministic tooling. You can run these yourself; the companion runs them too.

```
cupel init                 Scaffold the office (~/cupel, or $CUPEL_HOME)
cupel where                Print the office path
cupel show <ticker>        Print every note for a ticker — "where were we?"
cupel board [A|B|C|PASS]   The whole watchlist ranked by tier at a glance
cupel tickers              List every ticker the office knows (feeds scout dedupe)
cupel portfolio            What you hold: core/satellite/cash, sizing vs the cap, and gain from recorded prices
cupel capital [amt [ccy]]  Set/show total capital, so portfolio can show value and gain in money
cupel import degiro --portfolio Portfolio.csv --transactions Transactions.csv
                           Sync read-only DEGIRO exports into positions/capital/journal
cupel data doctor          Check market-data/MCP and broker setup hints
cupel doctor               Check the office for inconsistencies
cupel stamp <event>        Timestamp an event (e.g. cupel stamp pulse)
cupel skills <subcommand>  Install / update the skill in your AI harness
```

## Commands inside the harness

Talk to `/cupel` and it figures out what you need. Or go direct:

| Command | Job |
|---|---|
| `onboard` | Interview you; write your edges, mandate, and trusted sources |
| `watch` | Turn a seed (a source's idea or your hunch) into a provenance-tracked watchlist entry |
| `scout` | Branch outward from every seed in your office (fanned out over subagents), research the adjacencies for real, and return many ranked opportunities |
| `assay` | Test one idea: a good business at a fair price, inside your edge? |
| `crux` | Find the single load-bearing claim a thesis rests on, and test it |
| `premortem` | Assume it failed in three years; surface the risks you're underweighting |
| `allocate` | Deploy cash or rebalance: exposure, correlation (incl. your human capital), a recommended shape |
| `pulse` | Refresh the office: sweep sources, re-check staleness, run `doctor` |
| `brief` | A `pulse` plus the executive readout: what changed, what needs attention |

## The canon

cupel's judgment is anchored in accessible investing classics, aimed at smart people who are experts in other fields rather than finance professionals:

| Lens | Thinkers |
|---|---|
| Edge / what to buy | Peter Lynch (*One Up on Wall Street*), Christopher Mayer (*100 Baggers*) |
| Quality / moats | Pat Dorsey |
| Behavior / temperament | Morgan Housel (*The Psychology of Money*) |
| Humility / risk / cost | Bogle, William Bernstein |
| Don't overpay | Benjamin Graham |
| What's already priced in | Howard Marks |

Ideas are classified into Lynch's six categories (slow grower, stalwart, fast grower, cyclical, turnaround, asset play) — the category drives which numbers matter and what signals a sell.

## Develop

```
npm install
npm run build
npm test
```

## License

MIT
