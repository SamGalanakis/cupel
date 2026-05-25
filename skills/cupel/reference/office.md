# Office schema

The office is an Obsidian-compatible vault. Every note is plain markdown with a small YAML frontmatter block, `[[wikilinks]]` for provenance, and `#tags` for classification. Keep frontmatter minimal and put the thinking in the body. After any write, run `cupel doctor` and fix what it flags.

Find the office with `cupel where`. Never write outside it.

## Note types and required frontmatter

`cupel doctor` enforces these required fields (it infers the type from the directory).

### `sources/<slug>.md` — a person or source the user trusts
```
---
name: Dave Chen (semiconductors)
domain: semis, foundries
trust: former fab engineer; calls supply gluts early
bias: structurally bullish on hardware
url: https://example.com/feed        # optional: where to check their latest
last-checked: 2026-05-20
---
What this source is good for, their track record, how to read them.
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
```
---
ticker: NVDA
company: NVIDIA
size-pct: 6              # % of the portfolio; doctor flags breaches of MANDATE max-position-pct
cost-basis: 110.40
opened: 2025-02-11
source: manual          # manual | broker   (broker = synced later via MCP)
last-synced: 2026-05-20
last-reviewed: 2026-05-20
sell-triggers:
  - thesis breaks (loses pricing power)
  - position exceeds mandate cap
---
Held since 2025. Thesis: [[NVDA-thesis]].
```

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
- **Dates are `YYYY-MM-DD`.** Keep `last-reviewed` / `last-checked` / `last-synced` current; the linter measures staleness from them.
- `EDGES.md` and `MANDATE.md` are singleton notes; `MANDATE.md` frontmatter holds `max-position-pct` and `review-stale-days`, which the linter honors.
