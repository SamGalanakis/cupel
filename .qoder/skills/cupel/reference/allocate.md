# allocate

Work at the **portfolio** level, not the single-name level: deploy new cash, rebalance, or answer "what do I actually do with this money?" Most of an edge-driven investor's real outcomes live here — in cash drag, concentration, and correlation — not in any one pick. `assay`/`crux`/`premortem` interrogate a single ticker; `allocate` looks at the whole board and **recommends a shape**.

## 0. Resume — get the real numbers

Run `cupel portfolio` for the deterministic split: core %, satellite %, **cash %** (the remainder), the largest holding, and any breach. Read `PROFILE.md` (holdings, broker, currency, constraints), `MANDATE.md` (core/satellite target, position cap, the diversification rule), and `EDGES.md`. Don't sum by hand — the CLI owns the arithmetic; you own the judgment.

## 1. See the true exposure (look through the funds)

A cap-weighted "global" core is not as diversified as it feels. Use web search to pull the core ETF's real country and top-holding weights, then translate into the user's currency so the exposure is concrete ("you already own €350 of NVIDIA *inside* your index fund"). Add the satellite picks. State the genuine concentration — by country, by sector, by single name — in money, not vibes. Cite "as of" dates; never invent weights.

## 2. The correlation that matters most — human capital

This is the step nothing else does, and it's usually the biggest finding. **The user's largest economic asset is their future earnings.** Ask (or recall from `PROFILE`/`EDGES`): what is their income correlated with? An AI engineer at an AI company, paid partly in equity, is *already* maximally long the AI-capex cycle before they buy a single share. A diversified core that's 24% mega-cap tech, plus an AI satellite, stacks the same bet three deep. Bernstein's rule: financial capital should **hedge** human capital, not amplify it. Name the correlation plainly and let it reframe the decision — often "what should I buy?" becomes "how do I stop being a triple-leveraged bet on my own industry?"

## 3. Frame the levers, then recommend a shape

Cash, like every other allocation, is a position — sitting on a large idle pile is an accidental market-timing bet (Bogle: time in the market). Lay out the honest levers and **rank them by how well they diversify *this user's* actual risk**, not generic risk (e.g. for a tech-correlated investor: value / small-cap / ex-US cut the real exposure; emerging markets feels diversifying but is itself chip-heavy). Then **commit to a recommended shape** — concrete sleeves with rough percentages and, if the user wants, specific low-cost funds available on their broker (pull tickers/TERs/ISINs; verify availability). This is a recommendation, made with conviction — see the stance: caveat once with the key risks and what would make it wrong, don't hedge every line.

Keep it humble and cheap: a boring core does the compounding; two diversifier sleeves are plenty (don't build a seven-fund machine the user won't rebalance). Respect the mandate's core/satellite split and the diversification rule.

## 4. Record — and don't place the trade

cupel never executes; the user places orders themselves. Write a dated `journal/` entry: the recommendation you made, what the user decided (record both if they differ), the reasoning, the resulting target shape, the **falsifier** (what would make this the wrong call), and a `review-on` for the next rebalance check. Once the user exports broker files, prefer the deterministic importer over hand-editing: `cupel import degiro --portfolio <Portfolio.csv> --transactions <Transactions.csv>`. It updates `positions/`, total capital, cash, and a sync journal from read-only exports. Capture any durable allocation principle (like a human-capital hedge rule) in `MANDATE.md`. Run `cupel doctor`.
