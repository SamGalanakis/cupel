# ranking

How cupel scores and sorts ideas, so a watchlist of dozens stays usable and a
recommendation is honest about being a bet. The labels live in note frontmatter
(see the [office schema](office.md)); `cupel board` reads them into one ranked view.

## The four labels

- **`tier`** — the merit ranking, the headline call:
  - **A** — start-grade: a good business at a fair-or-better price, *and* one the user can genuinely evaluate. The thing you'd act on (sized to conviction).
  - **B** — real but flawed: good business but richly priced, or a quality/▸execution question — *watch for a better entry or more proof*, and record the entry-trigger.
  - **C** — research-only / park: outside the user's edge even if the business is fine, or a deliberate diversifier they can't deeply judge. Never buy on a story.
  - **PASS** — drop: broken, structurally impaired, pure momentum, non-investable, or redundant.
- **`conviction`** — `high | med | low`: how sure you are *given the evidence*, separate from tier. A cheap A can still be low-conviction; an expensive name can be high-conviction-but-wait.
- **`edge`** — `in-edge | anti-edge`: can the user evaluate the load-bearing claim from what they actually know? Anti-edge caps a name's tier — no edge is no advantage (Lynch).
- **`correlation`** — the dominant macro/personal correlation, **shown as information, never as an automatic demerit**. In the user's vault this is usually `ai-correlation: low | med | high`. A name that amplifies the user's existing concentration (above all their human capital — Bernstein) is flagged so they can weigh it; a great business that happens to amplify the bet is still a great business. Rank on merit; surface the correlation; let the user decide.

## Scoring, in order

1. **Edge** — can they judge it? (gate)
2. **Quality** — moat, returns on capital, durable growth (Dorsey, Mayer).
3. **Valuation / what's priced in** — fair-or-better, margin of safety (Graham, Marks). This is what separates a B from an A; it's also what keeps an optimistic scenario honest.
4. **Correlation / fit** — shown alongside, weighed by the user, not silently subtracted.

## Scenarios & timeframe — make the bet legible

Every assay should leave the user with a realistic sense of *what they're betting and over how long* — that's the point of doing the work. State it as a **range tied to assumptions**, never a point prediction dressed as fact (see the stance in [SKILL](../SKILL.md)):

- **Bear / base / bull**, each with a rough magnitude and horizon, each pinned to the assumption that drives it — e.g. *"base: ~12–15%/yr ≈ ~2x in 5y if Atlas holds mid-20s growth; bull: faster if vector wins net-new; bear: −40–50% if pgvector commoditizes it."*
- Anchor scenarios to **real, dated figures** (record `figures-as-of`) and to the thesis's **falsifier** — the bear case *is* the falsifier playing out.
- A price level is fine as one expression of a scenario; "it will hit $X by Q3" stated as certainty is not. Caveat once, substantively, then stop.

Record the block as `## Scenarios & timeframe` in the thesis, and the `horizon` in frontmatter.
