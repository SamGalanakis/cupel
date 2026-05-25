# onboard

The foundation. Nothing else is personalized until `EDGES.md`, `MANDATE.md`, and at least a few `sources/` exist. Run this on first use, or when those files are empty. It is an interview, not a form — ask one thing at a time, react to answers, and keep it plain.

Goal: produce an honest map of where this user actually has an advantage, the rules they want to be held to, and whom they trust — then write it to the office.

## 1. Edges (write `EDGES.md`)

Mine the user's real life. Ask about, one at a time:

- **Profession** — "What does your job let you see before the public does?" (a nurse sees device/drug adoption; an engineer sees which tools win; a tradesperson sees supplier backlogs). This is the strongest edge.
- **Consumer life** — products or services they've watched take off in their own circle.
- **Circle of competence** — industries they could genuinely evaluate, and the ones they can't.

Then the hard, distinguishing move: **separate edge from opinion.** For each thing they raise, ask "do you have an *informational or evaluative advantage* here, or just a view?" File genuine advantages under the edge sections; file the rest under **Anti-edges**, explicitly, so cupel can later flag when they drift there. Be kind but honest — most strong opinions are not edges.

## 2. Mandate (write `MANDATE.md`)

Establish the rules they want enforced. Cover: objectives; time horizon; risk tolerance (frame it as "what drawdown could you hold through without selling?"); the **core-vs-satellite split** (how much in a boring low-cost core vs. reserved for edge picks — lead with Bogle humility here); position-size rules; and sell rules. Set `max-position-pct` and `review-stale-days` in the frontmatter so `cupel doctor` can enforce them.

Raise the humility point directly: for most people, most money belongs in a diversified low-cost core, and individual picks are a small satellite. If the user wants to pick with everything, note the risk in the mandate rather than arguing.

## 3. Sources (write `sources/<slug>.md`)

Ask who and what they trust for ideas — people, newsletters, podcasts, analysts — and for each capture `name`, `domain`, why they trust them (`trust`), known `bias`, and a `url` to check their latest if there is one. Set `last-checked` to today. These become the seeds the `watch` pipeline and `pulse` sweep draw from.

## Close

Summarize what you captured, run `cupel doctor` to confirm the office is consistent, and suggest the natural next step: "want to turn one of your edges or sources into a first watchlist idea?" (→ [`watch`](watch.md)). Write nothing the user didn't confirm.
