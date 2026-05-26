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

## 3. Convert to guardrails — fit them to where the idea stands

The point isn't to kill the idea; it's to know in advance what would change your mind, so a future `pulse`/`brief` can watch for it. *How* you record that depends on whether it's held:

- **Held** (there's a `positions/` note) → write the **falsifiers and sell-triggers** onto the `[[position]]`/`[[thesis]]` and the mandate's sell rules.
- **Being considered, or already passed** (watchlist/thesis only, no position) → there's nothing to set a sell-trigger on. Instead record **entry conditions** ("what would have to be true, and at what price, to start a position") and **pre-buy watch-items** on the `[[thesis]]`, so a later review surfaces when — and only when — the idea becomes actionable.

Either way, record a dated `journal/` entry. The premortem's output is the guardrails, not a forecast — but if it changes your read on whether the position is too big or too correlated to hold comfortably, say so plainly and recommend the adjustment (trim, cap, hedge), with the risks noted. You don't predict the price or place the trade. Run `cupel doctor`.
