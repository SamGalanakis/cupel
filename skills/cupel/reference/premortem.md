# premortem

Assume the investment already failed. It's three years from now and this was a clear mistake — explain why. The premortem surfaces the risks the user is underweighting *before* committing, by flipping the question from "how could this work?" to "how did this go wrong?"

## 1. Imagine the failure vividly

Have the user (and you) tell the story of the loss as if it already happened. Don't hedge it into "well, maybe." Commit to "it failed" and work backwards to the causes.

## 2. Sort the failure modes

- **Thesis was wrong** — the crux didn't hold (the moat eroded, the trend stalled, the growth was already priced in).
- **Right thesis, wrong price** — fine business, overpaid; no margin of safety (Graham).
- **Behavioral** — the user sabotaged it: panic-sold the dip, doubled down to "average down" on a broken thesis, sold a winner too early (Housel; Lynch's "pulling the flowers").
- **Risk/position** — too large for the mandate; correlated with everything else they own; couldn't survive the drawdown (Bernstein).
- **Unknowns** — what's outside the circle of competence that could blindside them.

## 3. Convert to guardrails

For each plausible failure, write the **falsifier or sell-trigger** that would catch it early, and add it to the `[[thesis]]`/`[[position]]` and the mandate's sell rules. The point isn't to kill the idea — it's to know in advance what would change your mind, so a future `pulse` can watch for it.

Record a `journal/` entry if a decision results. **No buy/sell call.** Run `cupel doctor`.
