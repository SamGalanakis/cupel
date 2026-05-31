# data — market prices & fundamentals

cupel never fabricates a number and **never trusts a scraped quote it can't corroborate** — a web-search pass once returned a phantom "−16% move" that never happened. So prices, fundamentals, FX, and snapshots come from a **market-data MCP**, and *which one* is recorded in `PROFILE.md` so every session reloads it. Always record `figures-as-of` (`cupel doctor` flags stale figures before you act on them).

## Recommended: the OpenBB MCP (global coverage)

One MCP over many providers; the free **yfinance** backend already covers US **and European** exchanges (Xetra, Borsa Italiana, Euronext) plus FX, ETFs, indices, and fundamentals — so it prices the whole watchlist, EUR-native names included. No API key needed for the yfinance backend.

Install (Python via `uv`):

```
uv tool install openbb-mcp-server \
  --with openbb-equity --with openbb-yfinance --with openbb-currency \
  --with openbb-etf --with openbb-index --with openbb-news
claude mcp add openbb -s user -- openbb-mcp --transport stdio
```

Then **restart the harness** (MCP tools load at startup). Key tools: `mcp__openbb__equity_price_quote` (multi-symbol, comma-separated), `equity_price_historical`, `equity_fundamental_{metrics,income,balance,cash,dividends}`, `equity_estimates_consensus`, `currency_price_historical`. Use `last_price` / `prev_close` — **bid/ask are unreliable after hours**.

Check the local setup with:

```
cupel data doctor
```

It reports whether `PROFILE.md` records OpenBB, whether `openbb-mcp` is on
`PATH`, and whether common harness config files mention the MCP. If it says the
MCP is missing from the harness config, add it and restart the harness.

## Fresh enough? — the intraday-staleness trap

`figures-as-of` and `cupel doctor` track staleness in **days** (`review-stale-days`). That granularity is right for fundamentals — a balance sheet doesn't move intraday — but it's a trap for **prices**. A `last-price` you (or a broker export) recorded *this morning* still carries today's date, so doctor calls the office "consistent" even after the name has moved 10–15% by the afternoon. "Same-day" is not "live."

So **before you state a gain, a return, a valuation, a trigger's status, or any scenario math, re-pull the quote for the names in play this session** — don't reuse a recorded mark, a broker fill, a previous close, or `cupel board`'s recorded figures as the current price. "Names in play" is not just what you happen to be discussing — for `pulse`/`brief` it is a fixed set: **every held position *and* every watchlist name carrying an `entry-trigger`** (their fired/not-fired status is a decision input, so it must come from a live price). The cost is one `equity_price_quote` call (it takes a comma-separated batch, so the whole set comes back at once); the failure it prevents is reporting a P&L — or a "no trigger fired" — that's materially wrong and being caught out on it. Refresh, write the new `last-price`/`price-as-of` (or `figures-as-of`), *then* report.

One caveat the reprice itself can't resolve: a **fundamental or event** trigger ("ARR stays above X%", "after the next print", "an investor day") is *not* settled by a price — a quote can confirm a **price/valuation** trigger (a de-rate to ~$X, a multiple) outright, but for the others you must also check whether the catalyst has landed (an earnings print, a guide) via news. Repricing is still mandatory there: it reveals *direction* (a melt-up carries a name away from its entry; a de-rate pulls it toward one) and prevents you from reporting a stale "nothing moved."

## Alternatives — the user picks; you record it

The user may prefer their own feed. Whatever they choose, write it into `PROFILE.md`. Options: **Massive** (massive.com, Polygon-shaped — fast US data, but its free key is **US-only / no European exchanges**, so not a sole source for a EUR investor), or any other market-data MCP (Polygon, Twelve Data, EODHD, a broker feed). The test: it must cover the user's actual holdings — for a EUR/DEGIRO investor that means European exchanges, which rules out US-only feeds as the *only* source.

## Optional: DEGIRO account connector

For DEGIRO users, the default sync path is still the read-only CSV importer:

```
cupel import degiro --portfolio Portfolio.csv --transactions Transactions.csv
```

If the user wants live account reads, offer to install the unofficial
[`degiro-api`](https://github.com/icastillejogomez/degiro-api) package as a
future connector dependency. Make the tradeoff plain: it supports portfolio and
transaction reads, but it also exposes order endpoints, so cupel must treat it as
read-only unless the user gives a fresh explicit instruction for a specific
broker action. Installing the package is not permission to place, execute,
modify, cancel, or otherwise initiate broker transactions.

## On startup (front door)

If `PROFILE.md` records no market-data source, suggest installing the OpenBB MCP (above) **or** ask the user to name their provider — then write the choice into `PROFILE.md` (e.g. `Market data: OpenBB MCP`). From then on, fetch every price/figure from that source, cross-check a surprising move before acting on it, and stamp `figures-as-of`.
