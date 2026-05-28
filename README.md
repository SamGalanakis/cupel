# cupel

**cupel** turns the LLM in your AI harness into a personal investing analyst: a research companion that learns *your* edges and stress-tests your ideas against the investing canon.

**[→ cupel.money](https://cupel.money)**

Your edge is what you already know from your work and daily life — that's Peter Lynch's premise. cupel captures it in one Obsidian-compatible folder, your *office*, and turns it into researched ideas: a watchlist, theses, positions, and a dated decision journal. It gives reasoned, mandate-grounded calls (bear/base/bull scenarios with rough magnitude, horizon, and the risks named) but refuses false precision and bare tips, never invents a number, and never places trades. The decisions stay yours.

## Quickstart

```
npm install -g @samgalanakis/cupel   # install
cupel init                           # create your office at ~/cupel
cupel skills install                 # add the skill to your AI harness
```

Then talk to `/cupel` inside your harness:

1. **`/cupel`**: first run, it interviews you and writes your `PROFILE`, `EDGES`, `MANDATE`, and a few trusted `sources/`.
2. **`/cupel I keep seeing <product> everywhere at work`**: hand it an edge-driven idea; it researches the company, runs the discipline gate, and files a thesis with explicit falsifiers.
3. **`/cupel brief`**: a status check — what changed, what's over your mandate, what's due for review.

Set `CUPEL_HOME` (in your shell profile) to put the office somewhere other than `~/cupel`. No npm package? Use `npx skills add SamGalanakis/cupel`, the [Claude Code plugin](https://github.com/SamGalanakis/cupel), or the Cowork zip on any [release](https://github.com/SamGalanakis/cupel/releases/latest).

## What `/cupel` can do

Talk to `/cupel` and it figures out what you need, or go direct:

| Command | Job |
|---|---|
| `onboard` | Interview you; write your edges, mandate, and trusted sources |
| `watch` | Turn a seed (a source's idea or your hunch) into a provenance-tracked watchlist entry |
| `scout` | Branch outward from every seed in your office, research the adjacencies, and return ranked opportunities |
| `assay` | Test one idea: a good business at a fair price, inside your edge? |
| `crux` | Find the single load-bearing claim a thesis rests on, and test it |
| `premortem` | Assume it failed in three years; surface the risks you're underweighting |
| `allocate` | Deploy cash or rebalance: exposure, correlation, a recommended shape |
| `pulse` | Refresh the office: sweep sources, re-check staleness, run `doctor` |
| `brief` | A `pulse` plus the executive readout: what changed, what needs attention |

## The office

Everything lives in one Obsidian-compatible folder of plain markdown:

```
~/cupel/
  PROFILE.md    who you are operationally: brokers, currency, constraints
  EDGES.md      your circle of competence: what you see before Wall Street does
  MANDATE.md    your investment policy: goals, horizon, risk, sizing & sell rules
  sources/      people and sources you trust
  watchlist/    ideas you're tracking, with provenance back to a source or hunch
  themes/       edge trends mapped to the public names that express them
  positions/    what you hold, each with a role and size
  theses/       full write-ups, one per idea
  journal/      a dated decision log: every buy, sell, and pass, with the reasoning
```

Notes link to each other with `[[wikilinks]]`, so the Obsidian graph becomes your idea lineage: source → edge → watchlist → thesis → position. `cupel doctor` keeps it honest, checking frontmatter, dangling links, mandate breaches, and stale figures. More at [cupel.money/office](https://cupel.money/office.html).

## The canon

cupel's judgment is anchored in accessible investing classics — Lynch, Mayer, Dorsey, Housel, Bogle, Bernstein, Graham, Marks — aimed at smart people who are experts in other fields, not finance professionals. See [cupel.money/canon](https://cupel.money/canon.html).

## Develop

```
npm install
npm run build
npm test
```

## License

MIT
