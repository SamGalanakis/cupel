# watch

Turn a *seed* into a provenance-tracked watchlist entry through systematic expansion. A seed is the user's own hunch or something a trusted source raised. cupel never finds ideas blindly — it expands from seeds the user chose, and stamps where every idea came from.

## 1. Name the seed and its provenance

Pin down what started this: a `[[source]]`, a section of `[[EDGES]]`, or an explicit hunch ("I keep seeing this product at work"). If it's a tip from a source, note the source's known bias. Provenance is mandatory — it's the anti-hype guardrail and what makes the journal meaningful later.

## 2. Edge check (gate)

Before any work: does this sit inside the user's edge, or is it an anti-edge? If it's outside their circle of competence, say so and ask whether to proceed anyway (and record that). Lynch's rule: a familiar product is a *lead*, not a buy.

## 3. Systematic expansion (the core move)

Map the neighborhood around the seed the way an analyst would, then surface the candidates the user could actually evaluate:

- **Value chain** — suppliers, customers, and competitors of the seed. Often the best "picks-and-shovels" play is upstream of the obvious name.
- **Variants of the thesis** — if the seed is a trend, who are the several ways to express it, and which has the most durable moat (Dorsey)?
- **Second-order beneficiaries** — who quietly wins if the seed's story is right?

Use web search to get the lay of the land and current facts; cite "as of" dates; never invent figures. Keep the expansion to names the user can plausibly understand — prune the rest.

## 4. Triage and record

Pick the one or few candidates worth tracking. For each, create `watchlist/<TICKER>.md` with the schema in [office](office.md): `status: watching`, `provenance` linking the seed, a Lynch category `#tag`, and a body capturing why it's on the radar, **what would have to be true**, and the open questions. Link the source.

**When the seed has no directly investable name** — it's a private company, an open-source project, or a broad trend (common when the user's edge is in tech/infra) — don't force a fake ticker. Record a `themes/<slug>.md` note instead: the trend, why it's in the user's [[EDGES]], and the *public* names that actually express it (the picks-and-shovels supplier, the listed customer, the closest pure-play). The theme is the durable bridge from "I can see this winning" to "here's what I could own"; promising public proxies then graduate to `watchlist/`.

Don't write a thesis yet — that's what [`assay`](assay.md)/[`crux`](crux.md) are for. End by offering to assay the most promising one. Run `cupel doctor`.
