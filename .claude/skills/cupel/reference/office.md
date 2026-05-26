# Office schema

The office is an Obsidian-compatible vault. Every note is plain markdown with a small YAML frontmatter block, `[[wikilinks]]` for provenance, and `#tags` for classification. Keep frontmatter minimal and put the thinking in the body. After any write, run `cupel doctor` and fix what it flags.

Find the office with `cupel where`. Never write outside it.

## Note types and required frontmatter

`cupel doctor` enforces these required fields (it infers the type from the directory).

### `sources/<slug>.md` — a person or source the user trusts
```
---
name: Dave Chen (semiconductors)
status: trusted          # trusted | tentative  (tentative = on probation; graduate it once its leads prove out)
domain: semis, foundries
trust: former fab engineer; calls supply gluts early
bias: structurally bullish on hardware
url: https://example.com/feed        # optional: where to check their latest
last-checked: 2026-05-20
---
What this source is good for, how to read them, and a running track record:
note when one of their leads survived an assay or paid off, so trust is earned,
not assumed. A `tentative` source's tips are raw leads, not reasons to act.
```

### `themes/<slug>.md` — a trend from your edge, mapped to public names
```
---
name: On-device LLM inference
status: active           # active | playing-out | retired
last-reviewed: 2026-05-20
---
#theme
The trend in one or two plain sentences, and why it sits in your [[EDGES]].
Most edge trends surface as *private* companies or OSS — this note's job is the
bridge: the public names (and their tickers) that actually express the theme, the
"picks-and-shovels" beneficiaries, and which you could plausibly evaluate. Link
the sources raising it and any watchlist entries it spawned.
```

### `watchlist/<TICKER>.md` — an idea you're tracking
```
---
ticker: NVDA
company: NVIDIA
status: watching          # watching | researching | passed | promoted
provenance: "[[Dave Chen]]"   # the seed: a [[source]], [[EDGES]], or a hunch
last-reviewed: 2026-05-20
---
#fast-grower
Why it's on the radar, what would have to be true, the open questions.
Link the writeup once it exists: [[NVDA-thesis]].
```

### `theses/<TICKER>-thesis.md` — the full write-up
```
---
ticker: NVDA
company: NVIDIA
last-reviewed: 2026-05-20
---
The story in two minutes. The load-bearing claim. Valuation and what's
priced in. Risks. Falsifiers. Links: [[Dave Chen]], [[EDGES]].
```

### `positions/<TICKER>.md` — something actually held
Record **everything you hold** here — diversified core ETFs *and* edge picks —
each tagged with its `role`. Cash isn't a note: it's the remainder once the
sizes are counted, so `cupel portfolio` shows it for free.
```
---
ticker: NVDA
company: NVIDIA
role: satellite         # core | satellite — core = diversified base; satellite = edge pick
size-pct: 6             # % of TOTAL investable capital (incl. cash). doctor flags a SATELLITE over MANDATE max-position-pct; core is exempt
cost-basis: 110.40
currency: USD           # currency of cost-basis / last-price (your trades may differ from base currency)
opened: 2025-02-11
last-price: 152.30      # optional — last known price + date, so reviews show P&L without re-asking. NOT a forecast.
price-as-of: 2026-05-20
broker: DeGiro          # optional — which account holds it (you may use several)
source: manual          # manual | broker   (broker = synced later via MCP)
last-synced: 2026-05-20
last-reviewed: 2026-05-20
sell-triggers:
  - thesis breaks (loses pricing power)
  - position exceeds mandate cap
---
Held since 2025. Thesis: [[NVDA-thesis]].
```
A broad index ETF that's the bedrock of the portfolio is `role: core` — it never
counts toward the satellite target and is exempt from the per-position cap (a
whole-world fund can sensibly be 40%+). Only edge picks are `role: satellite`.

### `journal/<YYYY-MM-DD>-<slug>.md` — a decision
```
---
date: 2026-05-20
kind: buy               # buy | sell | trim | add | pass | review
ticker: NVDA
review-on: 2026-08-20   # when pulse should resurface this
---
What was decided and why, in plain words. Falsifiers: what would prove this
wrong. Links: [[NVDA-thesis]]. (On review, judge the reasoning, not just the price.)
```

## Conventions

- **Provenance is mandatory** on watchlist entries — every idea traces to a `[[source]]`, an edge, or a stated hunch. No orphan ideas.
- **Wikilinks** build the graph: thesis → its `[[source]]` and `[[EDGES]]`; position → its `[[thesis]]`; journal → the `[[thesis]]`/`[[position]]` it concerns. `cupel doctor` flags dangling links. Links match by slug, so `[[Pragmatic Infra Letter]]` resolves to `pragmatic-infra-letter.md` (case, spaces, and hyphens are ignored). For a note whose natural title differs from its filename, add an `aliases:` frontmatter field with the display name so the link resolves in Obsidian too:
  ```
  ---
  name: Pragmatic Infra Letter
  aliases: [Pragmatic Infra Letter]
  last-checked: 2026-05-20
  ---
  ```
- **Tags** classify: Lynch's six categories (`#slow-grower`, `#stalwart`, `#fast-grower`, `#cyclical`, `#turnaround`, `#asset-play`) and status (`#held`, `#passed`).
- **`size-pct` is always a percent of total investable capital, including cash.** So core + satellite + cash ≈ 100, and `cupel portfolio` derives cash as the remainder. Keep the sizes roughly current; they drift slowly (they're allocation, not price). If they sum past 100, `doctor` flags it.
- **`role` drives the mandate math.** `cupel portfolio` reports core and satellite separately; the satellite target and the per-position cap apply to satellites only. Never file a diversified core ETF without `role: core` — that was the trap that made a whole-world fund look like a single-stock breach.
- **Dates are `YYYY-MM-DD`.** Keep `last-reviewed` / `last-checked` / `last-synced` current; the linter measures staleness from them.
- `PROFILE.md`, `EDGES.md`, and `MANDATE.md` are singleton top-level notes the companion always reads. `PROFILE.md` is free-form (brokers, currency, constraints, preferences — no fixed shape). `MANDATE.md` frontmatter holds `max-position-pct`, `satellite-target-pct`, and `review-stale-days`, which the linter honors.
