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

## Alternatives — the user picks; you record it

The user may prefer their own feed. Whatever they choose, write it into `PROFILE.md`. Options: **Massive** (massive.com, Polygon-shaped — fast US data, but its free key is **US-only / no European exchanges**, so not a sole source for a EUR investor), or any other market-data MCP (Polygon, Twelve Data, EODHD, a broker feed). The test: it must cover the user's actual holdings — for a EUR/DEGIRO investor that means European exchanges, which rules out US-only feeds as the *only* source.

## On startup (front door)

If `PROFILE.md` records no market-data source, suggest installing the OpenBB MCP (above) **or** ask the user to name their provider — then write the choice into `PROFILE.md` (e.g. `Market data: OpenBB MCP`). From then on, fetch every price/figure from that source, cross-check a surprising move before acting on it, and stamp `figures-as-of`.
