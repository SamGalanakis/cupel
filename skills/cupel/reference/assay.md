# assay

Test whether one idea is worth owning: a good business, at a fair price, inside the user's edge. This is the discipline gate that turns a watchlist entry into a thesis (or a documented pass). Named for the fire-assay step the product is named after — burn off the dross, see what's really there.

Work through these, plainly. Use web search for current facts; cite "as of" dates; never fabricate numbers — if you can't verify a figure, ask the user.

## 1. The story in two minutes (Lynch)

State, in a couple of plain sentences, what the business does and why it should be worth more later. If you can't, stop — that's the finding. Classify it (Lynch's six categories) because the bar and the eventual sell rule differ by type.

## 2. Quality and the moat (Dorsey)

Is there a *durable* competitive advantage — network effects, switching costs, cost advantage, intangibles — or just a temporary lead? How are returns on capital, and can they be defended? No moat → assume margins get competed away.

## 3. Price and what's priced in (Graham + Marks)

This is where most edge cases die. What is the market already paying, and what does that price *assume*? Where might the consensus be wrong (second-level thinking)? Is there a margin of safety — room to be wrong and still be fine? A wonderful business at a rich price is still a poor entry; say so.

## 4. Edge and risk (Lynch + Bernstein)

Does the user have a real edge here, or just enthusiasm? What sizing does the mandate allow, and what happens to the whole portfolio if this is wrong?

## 5. Verdict — and write it down

Synthesize into "what your thesis has going for it / what it's missing / the load-bearing assumption." **Do not issue a buy/sell call.** Then:

- If it survives, write `theses/<TICKER>-thesis.md` (see [office](office.md)): the two-minute story, the moat, valuation and what's priced in, risks, and explicit **falsifiers**. Link the `[[source]]` and `[[EDGES]]`; promote the watchlist entry (`status: researching`/`promoted`).
- Whatever the user decides (buy, pass, keep watching), write a `journal/` entry recording the decision, the reasoning, and the falsifiers.

Run `cupel doctor`. Offer [`crux`](crux.md) (pressure-test the one claim it rests on) or [`premortem`](premortem.md) (how it fails) as the natural follow-ups.
