# scout

The widest-aperture command, and the most involved. Where [`watch`](watch.md) takes **one** seed and goes *deep*, `scout` goes **broad**: it branches outward from *every* node in the office — each [[EDGES]] facet, every `sources/` person, each holding, every `theme` — researches the adjacencies for real, and returns **many ranked opportunities**, not a tidy few. What keeps it from being a blind screener isn't narrowness — it's **provenance** (every candidate traces to a specific seed and a named vector) plus a **ranking rubric** applied honestly, pruning only genuine junk.

This is a fan-out job — run it at scale (see *Working at scale* in [SKILL](../SKILL.md)): **dispatch parallel subagents**, each owning a slice of the seeds, so coverage is exhaustive rather than a thematic sample. A scout that reasons top-down from "the AI theme" instead of branching from each seed by name has not scouted — it has guessed, and guessing is the one thing this command must not do.

## 1. Enumerate the field — every node, by name

List them; don't sample: each section of [[EDGES]]; **every** `sources/` entry; every `positions/` holding; every `watchlist/` and `themes/` note. That's the seed set. Note what's *already covered* too, so the scout can mark a branch that merely loops back — a real finding (a tightly-clustered roster), but not a new lead.

## 2. Fan out — a subagent per batch of seeds

Split the seed set into batches and dispatch a **subagent per batch, in parallel**. Each subagent, for its assigned seeds:

- branches along the vectors in §3;
- does **real research** — web search for current names, rough size, and what's actually happening; cite "as of" dates; **never conjecture a company into existence or invent a figure**;
- returns a compact, structured list — one row per candidate: `ticker · company · seed + vector it came from · one-line why · rough size/valuation · in-edge | anti-edge`.

Breadth is each subagent's job: surface *everything plausible*, don't pre-prune. The main thread prunes and ranks centrally so the bar stays consistent across batches.

## 3. The branching vectors

For each seed, push along whichever fit (name the vector on every lead):

- **Further rungs** — the supplier's supplier, the customer's customer (one step past where `watch` stops).
- **Analogues** — "the X of Y": the same pattern in another sector, geography, or era.
- **Arms-dealers** — who's paid no matter which competitor wins.
- **Contrarian / unloved** — good businesses the market currently hates (Marks: the best prices wear the worst narratives).
- **Small & long-runway** — Mayer: bias below the radar, not the mega-caps everyone already models.
- **Deliberately uncorrelated** — directions that diversify from the user's biggest concentration, **including their human capital** (Bernstein). For a concentrated income, the highest-value vector of all.

## 4. Merge, dedupe, score, rank

Pool every subagent's candidates into one list; dedupe. **Score each** (H/M/L on each axis):

- **Edge fit** — can the user genuinely evaluate it? (in-edge ≫ anti-edge)
- **Investability** — public and accessible on their broker (not private/OSS).
- **Quality & runway** — good business with room to grow (Dorsey moat, Mayer runway).
- **Valuation / priced-in** — is the good news already in the price (Marks)?
- **Diversification fit** — bonus when it leans *away* from the user's dominant correlation.

Rank by the blend and **present the full ranked table — many names, best first** — each with its provenance and edge label. Quantity is the point of scout; the ranking is what makes the quantity usable. Don't collapse it to three; surface the long list and let the ranking do the work.

## 5. Bolder mode — range past the edge, clearly tagged

scout may surface ideas the user has no edge in yet — that's where genuinely new territory hides — but tag each **anti-edge — research-only** and keep it in a separate tier, never blended with in-edge leads. Treat an anti-edge lead as a prompt to *build* an edge (read, learn, watch), never to buy on a story. Lynch's rule holds: no edge is no advantage; only homework earns one.

## 6. Record and hand off

Record the **top in-edge candidates** as `watchlist/<TICKER>.md` (`status: watching`, `provenance` naming the seed + vector — e.g. `"scouted from [[dhh]] via contrarian vector"`) or a `themes/<slug>.md` where there's no clean public name yet ([office](office.md) schema). Keep the long tail in the scout output so nothing's lost. Don't write theses — that's [`assay`](assay.md). End by offering to assay the #1 in-edge lead. Run `cupel doctor`.

## When a sweep is honestly thin

If even an exhaustive branch keeps looping back to covered ground, say so plainly — a tightly-clustered roster is a finding (real diversification lives in the core, not the satellite), not a reason to manufacture filler. Breadth means *checking* widely, never *pretending* widely.
