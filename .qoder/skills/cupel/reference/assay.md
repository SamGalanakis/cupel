# assay

Test whether one idea is worth owning: a good business, at a fair price, inside the user's edge. This is the discipline gate that turns a watchlist entry into a thesis (or a documented pass), and it is the heart of Lynch's workflow. Named for the fire-assay step the product is named after — burn off the dross, see what's really there.

**You handle the admin; the user makes the judgments.** Resume the context, look up the numbers, draft the story, file the notes — and pause only for the calls that genuinely need the user (which category, is the story right, buy/pass/size).

## 0. Resume — "where were we"

Run `cupel show <TICKER>` first. It prints every existing note for this ticker (watchlist, thesis, position, past journal entries). If there's prior work, pick up from it ("last time you flagged the debt; let's check if it's improved") rather than starting cold. Read `EDGES.md` and `MANDATE.md` so you know whose money and which rules.

## 1. Edge check (gate)

Is this inside the user's edge, or an anti-edge? A familiar product is a *lead*, not a buy (Lynch). If it's outside their circle of competence, say so and ask whether to proceed.

## 2. Category first

Decide which of the [six categories](categories.md) this is — slow grower, stalwart, fast grower, cyclical, turnaround, asset play. Ask the user if it's ambiguous. The category dictates the story you draft and the numbers that matter; don't analyze a cyclical like a fast grower. Tag the note.

## 3. The famous numbers (fetch these, don't make the user hunt)

Pull the current figures from the market-data MCP recorded in `PROFILE.md` (e.g. `mcp__openbb__equity_price_quote` / `equity_fundamental_*` — see [data](data.md)); use web search only for qualitative facts (filings, news) or when no data MCP is set. Cite the "as of" date and **never invent a number** — if you can't get one, say so. Gather:

- **Earnings & the bottom line** — recent and trend; pretax profit margin.
- **P/E, and PEG** — the P/E relative to the growth rate. A P/E well below the growth rate is the classic Lynch bargain; well above is the warning.
- **Growth rate** — and, for a fast grower, whether it's sustainable and how saturated the market is.
- **Percent of sales** — if the reason to own it is one product, does that product actually move the needle?
- **Cash position** and **debt** — net cash per share; debt-to-equity; can it survive a bad year (vital for turnarounds/cyclicals)?
- **Inventories** — building (bad, esp. cyclicals) or lean?
- **Book value & hidden assets** — real estate, brands, subsidiaries, cash; for asset plays, what are they worth vs. the price?
- **Dividend** — for slow growers: history, payout ratio, coverage.
- **Where to buy, and the link** — the exchange and currency, whether it's actually tradable on the user's broker (flag if not), and a `url` to the company/IR page so the user can go straight there. Capture these once here, not on every review.

Weight them by category (see the table in [categories](categories.md)). Record the numbers in the thesis with a `figures-as-of` date so the next review can compare — and so `cupel doctor` can flag them when they go stale (a price can move 40% in weeks).

## 4. The two-minute drill (the gate)

Draft the **category-tailored** two-minute story for the user to react to: why this is interesting, what has to happen for it to work, and the pitfalls in its path — plain enough that a non-expert gets it. If you can't tell it simply, that's the finding. Then check **price / what's priced in** (Graham margin of safety; Marks — is the good news already in the price?) and **risk/sizing** against the mandate. Sketch the **upside and timeframe** here too — a plain bear / base / bull with rough magnitude and horizon ("~2x over 3–5y if the crux holds; ~−50% if it breaks"), each tied to its assumption and given as a range. That's a reasoned scenario, not fortune-telling — it's allowed and it's the point (see the stance and [ranking](ranking.md)); a point price target stated as fact is not.

## 5. Verdict — and file it

Synthesize into "what your thesis has going for it / what it's missing / the one load-bearing assumption." Then give your **reasoned verdict** — if the user wants a recommendation (start a position? pass? size it how, against the mandate?), make the call and own it — with a caveated sense of the upside and timeframe, the key risks, and the falsifier attached (see the stance: caveat once, don't hedge every line). What you don't do is state a point price target as fact, or place the trade. Then handle the notes:

- If it survives, write/update `theses/<TICKER>-thesis.md` ([office schema](office.md)): category + which "act," the two-minute story, the famous numbers with dates, valuation & what's priced in, a **`## Scenarios & timeframe`** block (bear/base/bull with magnitude + horizon), risks, explicit **falsifiers**, and the category's **sell signal**. Set the merit labels in frontmatter — `tier`, `conviction`, `edge`, `correlation`/`ai-correlation`, `horizon`, `figures-as-of`, and a `url` ([ranking](ranking.md)). Link `[[source]]` and `[[EDGES]]`; update the watchlist `status` (→ `researching`).
- Whatever the user decides (buy, pass, keep watching), auto-write a dated `journal/` entry: your recommendation and their decision, the reasoning, the falsifiers, `review-on` a few months out.

Run `cupel doctor`. Offer [`crux`](crux.md) (test the one claim it rests on) or [`premortem`](premortem.md) (how it fails) as follow-ups.
