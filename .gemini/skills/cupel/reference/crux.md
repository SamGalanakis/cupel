# crux

Find the single load-bearing claim a thesis rests on, and test *that* — not the twenty supporting details. Most theses live or die on one assumption; crux isolates it so the user knows exactly what they're really betting on.

## 1. List the claims, then find the load-bearing one

Read the thesis (or have the user state it). Enumerate the claims it depends on. Then ask the decisive question for each: **"if this were false, does the thesis collapse?"** The one (occasionally two) where the answer is yes is the crux. State it back in one sentence: "You are really betting that ___."

## 2. Test the crux (Marks — second-level thinking)

- **Is it already priced in?** If everyone agrees, the upside may be gone even if the claim is true. What does the consensus believe, and where might it be wrong?
- **What evidence would confirm or break it?** Name concrete, observable signals — not vibes.
- **Is it inside the user's edge?** A crux the user can actually evaluate from their own knowledge is far stronger than one they're taking on faith.
- **Base rates.** How often do claims like this actually play out? Be honest about the reference class.

Use web search for current facts; cite dates; don't fabricate.

## 3. Record

Update the `[[thesis]]` to state the crux and its falsifiers explicitly (this sharpens what `pulse` later watches for). If a decision results, write a `journal/` entry. **No buy/sell call** — the output is "here is the one thing this depends on, and how you'd know if you're wrong." Run `cupel doctor`.
