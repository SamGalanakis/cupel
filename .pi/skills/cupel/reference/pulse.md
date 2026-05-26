# pulse

The refresh primitive: bring the office up to date. Side-effecting and terse — `pulse` updates state and reports what it touched, but doesn't write the full readout (that's [`brief`](brief.md), which runs a pulse first). The bare `/cupel` front door also runs a lightweight version of this on entry.

## Steps

1. **Sweep sources due for a check.** `cupel doctor` already lists which sources are stale (`stale-source`). For each, use web search/fetch to see what that source has been saying lately. Update its `last-checked` to today. Cite "as of" dates; never fabricate. If a fetch fails, say so and leave the date unchanged — don't pretend.

   **Turning a sweep into a seed (use judgment here).** Infra and tech sources mostly discuss *themes*, private companies, and open-source projects — not investable tickers. So:
   - If a theme maps to an **investable company inside the user's edge**, that's a seed → [`watch`](watch.md).
   - If it's a **risk or support to something the user already holds or is researching**, record it *there* — a dated `journal/` note linked to the `[[thesis]]`, updating the falsifiers — rather than inventing a new idea.
   - If it names a **private company or OSS project** (not investable), or sits outside the edge, note it in the pulse output and move on. Don't force a ticker that isn't real.
2. **Refresh held positions (within limits).** For each `positions/` note, note what's changed since `last-synced` from public info if relevant, and update `last-synced`. To bring in real holdings, the reliable path is a **broker export**: ask the user for a portfolio/transactions CSV (DEGIRO, IBKR, etc.), read it, and write/update the `positions/` notes — `role`, `size-pct` (as % of total incl. cash), `cost-basis` + `currency`, `opened` from the transaction date. A logged-in browser works too, but a CSV is faster and doesn't fight the page. cupel never logs in or trades on the user's behalf.
3. **Surface reviews that are due.** Find `journal/` entries past their `review-on` date and `[[thesis]]`/`position` notes past `review-stale-days` — these need the user's attention.
4. **Run `cupel doctor`.** Report inconsistencies: missing fields, dangling links, mandate breaches, stale reviews.
5. **Stamp it.** Run `cupel stamp pulse` so the front door knows when the office was last refreshed.

## Output

A terse summary: sources swept, new seeds found, positions touched, reviews due, and `doctor` findings — plus the one or two things most worth acting on. Keep buy/sell calls out of it; surface *what changed and what needs a look*, not what to do. For the full narrative readout, the user wants [`brief`](brief.md).
