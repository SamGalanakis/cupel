# brief

The executive readout: a [`pulse`](pulse.md) followed by a plain-language status report. This is the human ritual — "where do I stand, and what needs my attention?" Run it on whatever cadence suits the user (weekly is a sensible default).

## Steps

1. **Run a full `pulse` first** (sweep due sources, refresh positions, run `cupel doctor`, stamp). The brief is built on fresh state.
2. **Then report**, in this order, concisely:

- **Headline** — one or two lines: is anything actually urgent, or is this a quiet week? Don't manufacture action.
- **What changed** — new seeds from your sources, news touching your holdings, any `doctor` findings (mandate breaches, stale reviews, broken links, stale figures to re-verify).
- **Portfolio at a glance** — run `cupel portfolio` for the deterministic numbers: core vs. satellite, each position's size, satellite allocation vs. the target, the **cash remainder**, any satellite over the `max-position-pct` cap, and — where a position records `cost-basis`+`last-price` — its **gain %** and the blended **price return** (set `cupel capital` once and it shows value/gain in money). Don't sum percentages by hand. Then *interpret* what the numbers don't say — **correlation** (several holdings riding the same trend, and crucially whether the portfolio amplifies the user's *income/human-capital* risk per the mandate's diversification rule), a large idle-cash drag, whether an over-cap satellite should be trimmed, whether satellite is creeping past the mandate. The arithmetic is the CLI's; the judgment is yours — and if the read calls for a move (deploy cash, trim, diversify), recommend it, with the risks attached.
- **Reviews due** — `journal`/thesis entries past their review date. For each, **re-tell the two-minute story** for its [category](categories.md): which "act" are you in now, and has the category's specific **sell signal** triggered (a fast grower decelerating, a cyclical's inventories building, a turnaround completed)? Restate the **falsifiers** and ask whether any has broken. Judge the *reasoning*, not the price (a good decision can have a bad outcome). If a winner is simply up, that is **not** a reason to sell — don't pull the flowers (Lynch/Mayer); the trigger is the story changing. P&L comes from each position's recorded `last-price` (refresh a stale one before leaning on it).
- **Watchlist movement** — run `cupel board` for the watchlist ranked by tier; flag names whose **entry-trigger** has fired (a "WATCH" idea that's now actionable), ideas worth promoting to a thesis, or names to quietly retire.
- **Next moves** — the one to three most useful things to do. Where there's a defensible call (deploy the idle cash into diversifiers, trim an over-cap satellite, assay a promoted watchlist name), **recommend it** with the key risk noted; where it genuinely needs more homework, frame it as the investigation to run. What you don't do is issue a bare price-driven "sell now" with no reasoning.

## Stance

`brief` is where humility shows: if the honest answer is "nothing needs doing, stay the course," say that. Resist the pull to find action every week — for a long-term, edge-driven investor, doing nothing is usually correct. End by stamping (the pulse already did) and noting when the next brief is due.
