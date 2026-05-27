# scout

The divergent counterpart to [`watch`](watch.md). `watch` takes one seed you hand it and expands *inward* (its value chain, its variants); `scout` starts from your whole field — [[EDGES]], holdings, watchlist, themes, and the recurring obsessions in `sources/` — and ranges *outward* to surface territory you are **not** already looking at. It is reconnaissance: it brings back leads, never buys. The buying discipline still lives in [`assay`](assay.md).

cupel is not a blind screener, and `scout` must not become one. The guard is that every candidate is reached by *explicit reasoning* from something the user already knows, is stamped with that provenance, and then pruned hard.

## 1. Map the field and the frontier

Read [[EDGES]], `positions/`, `watchlist/`, `themes/`, and what `sources/` keep circling. State in a line what's *already* covered — so scout spends its effort on the gaps, not on re-surfacing names the office already holds.

## 2. Push outward along explicit vectors

Diverge deliberately — pick the vectors that fit, and name which one each lead came from:

- **Further rungs** — one step beyond where `watch` stops: the supplier's supplier, the customer's customer.
- **Analogues** — "the X of Y": the same winning pattern in another sector, geography, or era.
- **Arms-dealers** — who gets paid no matter which competitor wins a fight the user already follows.
- **Contrarian / unloved** — good businesses the market currently hates (Marks: the best prices come wrapped in bad narratives).
- **Small & long-runway** — Mayer: the big winners are small, high-quality, with a long road. Bias below the radar, not the mega-caps everyone already models.
- **Deliberately uncorrelated** — directions that *diversify away* from the user's biggest concentration, **including their human capital** (Bernstein). For someone whose income rides one cycle, this is often the highest-value vector of all.

Use web search for the lay of the land and current facts; cite "as of" dates; never invent figures.

## 3. Range past the edge — but label it (bolder mode)

scout may surface ideas in adjacent territory the user does **not** yet have an edge in — that's where genuinely new opportunity hides. But say so plainly: tag each such lead **anti-edge — research-only**, and treat it as a prompt to *build* an edge (read, learn, watch over time), never as something to buy on a story. Keep in-edge and anti-edge leads in separate buckets; never blur them. Lynch's rule still holds — no edge is no advantage, and only homework can earn one.

## 4. Prune hard (where scout earns its keep)

A scout that returns thirty names is a screener and has failed. Cut to a **handful** of real leads. Drop anything that is: not investable (private/OSS — unless it graduates to a `theme`), a mega-cap the user can add no insight to, hype with no business, or a vector that led nowhere. Be honest when a sweep turns up *nothing worth keeping* — that's a valid and frequent result, far better than manufacturing an idea to look productive.

## 5. Record and hand off

For each keeper: a `watchlist/<TICKER>.md` (`status: watching`, `provenance` naming the vector and the office note it grew from — e.g. `"scouted from [[EDGES]] via arms-dealer vector"`; mark anti-edge leads as such), or a `themes/<slug>.md` when there's no clean public name yet ([office](office.md) schema). Don't write a thesis — that's [`assay`](assay.md). End by offering to assay the most promising in-edge lead. Run `cupel doctor`.
