# pulse

The refresh primitive: bring the office up to date. Side-effecting and terse — `pulse` updates state and reports what it touched, but doesn't write the full readout (that's [`brief`](brief.md), which runs a pulse first). The bare `/cupel` front door also runs a lightweight version of this on entry.

## Steps

1. **Sweep sources due for a check.** Read `sources/`; for each whose `last-checked` is older than its cadence (default ~30 days), use web search/fetch to see what that source has been saying lately. Capture anything that intersects the user's edges as a *seed* (note it for [`watch`](watch.md)); update `last-checked` to today. Cite "as of" dates; never fabricate. If fetching a source fails, say so and leave its date unchanged — don't pretend.
2. **Refresh held positions (within limits).** For each `positions/` note, note what's changed since `last-synced` from public info if relevant, and update `last-synced`. (Real holdings/price sync is a later broker-MCP feature; for now this is light and honest about staleness.)
3. **Surface reviews that are due.** Find `journal/` entries past their `review-on` date and `[[thesis]]`/`position` notes past `review-stale-days` — these need the user's attention.
4. **Run `cupel doctor`.** Report inconsistencies: missing fields, dangling links, mandate breaches, stale reviews.
5. **Stamp it.** Run `cupel stamp pulse` so the front door knows when the office was last refreshed.

## Output

A terse summary: sources swept, new seeds found, positions touched, reviews due, and `doctor` findings — plus the one or two things most worth acting on. Keep buy/sell calls out of it; surface *what changed and what needs a look*, not what to do. For the full narrative readout, the user wants [`brief`](brief.md).
