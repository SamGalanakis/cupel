# onboard

The foundation. Nothing else is personalized until `PROFILE.md`, `EDGES.md`, `MANDATE.md`, and at least a few `sources/` exist. Run this on first use, or when those files are empty. It is an interview, not a form — ask one thing at a time, react to answers, and keep it plain.

Goal: produce an honest map of who this user is operationally, where they actually have an advantage, the rules they want to be held to, and whom they trust — then write it to the office.

**Once, up front:** note in one line that cupel is a personal reasoning tool, not regulated financial advice — then don't repeat it. (Record it in `PROFILE.md` so the rest of the product can give recommendations without re-disclaiming.)

**Offer the shortcut: point cupel at what they already have.** The richest edge-discovery move is reading the user's own material — an Obsidian vault, notes, a CV, a personal site, a "things to investigate" list. Offer it early ("want me to read your notes/site to seed this?"); it surfaces a profession, real interests, and half a watchlist faster than any interview. Only read what they point you to.

## 1. Profile (write `PROFILE.md`)

Start with the operational basics — free-form prose, no fixed shape. Capture the durable facts cupel should always reload: the **brokers/accounts** they use (there may be several), the **currency** they think in, **tax domicile** if relevant, hard **constraints** (cash only, no margin, no options, markets they can't access), their **harness**, and **how they like to work** (tone, which figures to show, review cadence). Keep it to things that stay true; this is the note loaded on every session.

Capture one thing most tools miss: **what their income (human capital) is correlated with.** Their job *is* a large undiversified position — an oil engineer is long energy, a startup employee paid in equity is long their sector. Note it; the mandate and `allocate` use it to judge whether the portfolio hedges that risk or doubles it.

## 2. Edges (write `EDGES.md`)

Mine the user's real life. Ask about, one at a time:

- **Profession** — "What does your job let you see before the public does?" (a nurse sees device/drug adoption; an engineer sees which tools win; a tradesperson sees supplier backlogs). This is the strongest edge.
- **Consumer life** — products or services they've watched take off in their own circle.
- **Circle of competence** — industries they could genuinely evaluate, and the ones they can't.

Then the hard, distinguishing move: **separate edge from opinion.** For each thing they raise, ask "do you have an *informational or evaluative advantage* here, or just a view?" File genuine advantages under the edge sections; file the rest under **Anti-edges**, explicitly, so cupel can later flag when they drift there. Be kind but honest — most strong opinions are not edges.

## 3. Mandate (write `MANDATE.md`)

Establish the rules they want enforced. Cover: objectives; time horizon; risk tolerance (frame it as "what drawdown could you hold through without selling?"); the **core-vs-satellite split** (how much in a boring low-cost core vs. reserved for edge picks — lead with Bogle humility here); position-size rules; and sell rules. Set `max-position-pct`, `satellite-target-pct`, and `review-stale-days` in the frontmatter so `cupel doctor` can enforce them.

Raise the humility point directly: for most people, most money belongs in a diversified low-cost core, and individual picks are a small satellite. If the user wants to pick with everything, note the risk in the mandate rather than arguing.

Write a **Diversification** rule tied to their human-capital correlation (step 1): "tilt the core away from what my paycheck already bets on." It's what lets `allocate` and `brief` judge new holdings by whether they hedge or amplify the user's income risk.

## 4. Sources (write `sources/<slug>.md`)

Ask who and what they trust for ideas — people, newsletters, podcasts, analysts — and for each capture `name`, `domain`, why they trust them (`trust`), known `bias`, and a `url` to check their latest if there is one. Set `last-checked` to today, and `status: trusted` (or `tentative` for an unproven source the user wants to trial — its tips stay raw leads until they prove out). These become the seeds the `watch` pipeline and `pulse` sweep draw from.

## Close

Summarize what you captured, run `cupel doctor` to confirm the office is consistent, and suggest the natural next step: "want to turn one of your edges or sources into a first watchlist idea?" (→ [`watch`](watch.md)). If they already hold things, you can record existing positions now too — each `positions/` note names the `broker` that holds it, since they may use several. Write nothing the user didn't confirm.
