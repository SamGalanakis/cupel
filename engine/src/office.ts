// The canonical layout and schema of a cupel "office" — the single
// Obsidian-compatible vault where the companion accumulates everything it
// learns. Kept as pure data so the CLI scaffolder and the office-linter share
// one source of truth.

export const OFFICE_MARKER = ".cupel-office.json";

// Each subdirectory holds one note type. The linter infers a note's type from
// the directory it lives in.
export const OFFICE_DIRS = ["sources", "watchlist", "themes", "positions", "theses", "journal"] as const;
export type OfficeDir = (typeof OFFICE_DIRS)[number];

export type NoteType =
  | "source"
  | "watchlist"
  | "theme"
  | "position"
  | "thesis"
  | "journal"
  | "edges"
  | "mandate"
  | "profile"
  | "readme"
  | "unknown";

// Map a directory name to the note type its files carry.
const DIR_TO_TYPE: Record<string, NoteType> = {
  sources: "source",
  watchlist: "watchlist",
  themes: "theme",
  positions: "position",
  theses: "thesis",
  journal: "journal",
};

// Frontmatter keys the linter requires per note type. Bodies are free prose.
// `role` distinguishes a diversified core holding from an edge-driven satellite
// pick — the per-position cap and the satellite target apply to satellites only.
// `size-pct` is the holding as a percent of TOTAL investable capital (incl.
// cash), so core + satellite + cash sum to ~100 and cash is simply the remainder.
export const REQUIRED_FIELDS: Partial<Record<NoteType, string[]>> = {
  source: ["name", "last-checked"],
  watchlist: ["ticker", "status", "provenance", "last-reviewed"],
  theme: ["name", "last-reviewed"],
  position: ["ticker", "role", "size-pct", "cost-basis", "source", "last-synced", "last-reviewed"],
  thesis: ["ticker", "last-reviewed"],
  journal: ["date", "kind"],
};

// Optional-but-recommended frontmatter the companion fills in during assay/scout
// so the office is sortable and actionable. The linter does NOT require these
// (older notes stay green), but `cupel board` reads them and `doctor` checks the
// freshness/consistency ones. Documented here as the single source of truth.
//   tier         A | B | C | PASS   — the merit ranking (quality × valuation × judgeability)
//   conviction   high | med | low
//   edge         in-edge | anti-edge
//   correlation  the dominant macro/personal correlation, shown as info not a discount
//                (the user's vault uses `ai-correlation: low|med|high`)
//   url          a link to go straight to the company / source
//   horizon      the intended holding horizon (e.g. "3-5y")
//   figures-as-of  date the price/financials were last pulled (drives the staleness flag)
//   exchange / currency / tradable  where and in what currency it trades
//   entry-trigger  (watchlist) the condition that would make it actionable; `watch-for` is an alias
export const RECOMMENDED_FIELDS: Partial<Record<NoteType, string[]>> = {
  watchlist: ["company", "tier", "conviction", "edge", "correlation", "url", "exchange", "currency", "tradable", "entry-trigger"],
  thesis: ["company", "tier", "conviction", "edge", "correlation", "url", "horizon", "figures-as-of"],
  position: ["company", "url", "last-price", "price-as-of"],
};

// Resolve a note's type from its vault-relative path (e.g. "positions/AAPL.md").
export function noteTypeForPath(relPath: string): NoteType {
  const norm = relPath.replace(/\\/g, "/");
  const top = norm.split("/")[0];
  if (DIR_TO_TYPE[top]) return DIR_TO_TYPE[top];
  const base = norm.split("/").pop() ?? "";
  if (base === "EDGES.md") return "edges";
  if (base === "MANDATE.md") return "mandate";
  if (base === "PROFILE.md") return "profile";
  if (base === "README.md") return "readme";
  return "unknown";
}

export interface OfficeFile {
  path: string;
  content: string;
}

const README = `# Your cupel office

This Obsidian-compatible vault is your investing brain. cupel — the research
companion in your AI harness — reads and writes here. Everything it learns about
your edges, your ideas, and your decisions accumulates in this one place.

- PROFILE.md   who you are operationally: brokers, currency, constraints, how you work
- EDGES.md     your circle of competence: what you see before Wall Street does
- MANDATE.md   your investment policy: goals, horizon, risk, sizing & sell rules
- sources/     people and sources you trust, each with context and a last-checked date
- watchlist/   ideas you're tracking, with provenance back to a source or hunch
- themes/      trends from your edge mapped to the public names that actually express them
- positions/   what you hold (core ETFs and satellite picks), each with a role and size; cash is the remainder
- theses/      full write-ups, one per idea
- journal/     a dated decision log — every buy, sell, and pass, with the reasoning

Notes use YAML frontmatter for structure and \`[[wikilinks]]\` for provenance
(a thesis links its \`[[source]]\` and \`[[EDGES]]\`; a position links its
\`[[thesis]]\`). Open the folder in Obsidian to browse the graph, or just read
the markdown. Run \`cupel doctor\` to check the vault stays consistent.

Talk to it from any harness: \`/cupel\`. cupel sharpens your thinking and gives
caveated calls — the likely scenarios and the risks named — but it never places
trades. Run \`cupel board\` for the ranked watchlist at a glance.
`;

const EDGES = `---
type: edges
last-reviewed:
---

# Edges

> Your circle of competence: what you see before Wall Street does. Run \`/cupel\`
> and it will help you fill this in. (Lynch: invest in what you already know.)

## Professional edge

_What does your work let you see early?_

## Consumer edge

_Products and services you've watched take off in your own life._

## Circle of competence

_Industries you can genuinely evaluate._

## Anti-edges

_Areas where you have opinions but no real advantage — for cupel to flag when
you stray into them._
`;

const MANDATE = `---
type: mandate
max-position-pct:
satellite-target-pct:
review-stale-days: 90
last-reviewed:
---

# Mandate

> Your investment policy. cupel reads this every session and holds you to it.
> Run \`/cupel\` and it will help you fill this in.

## Objectives

## Time horizon

## Risk tolerance

## Core vs. edge satellite

_How much sits in a boring low-cost core, and how much is reserved for
edge-driven picks. Set \`satellite-target-pct\` above; cupel measures it against
your satellite positions only (the core never counts)._

## Diversification

_What is your income (human capital) correlated with — and does your portfolio
hedge that or amplify it? A standing rule here lets cupel judge new holdings by
whether they reduce or increase that correlation._

## Position-size rules

_Set \`max-position-pct\` above; cupel flags any single SATELLITE position over it
(a diversified core holding can legitimately exceed it). \`role: core\` exempts a
holding from the cap and the satellite total._

## Sell rules
`;

const PROFILE = `# Profile

> Free-form. The top-level facts cupel should always have in context — who you
> are operationally and how you like to work. No fixed shape; just keep it
> current. Run \`/cupel\` and it will help fill this in.

Worth including:

- **Brokers / accounts** you use (you may have several), and roughly what sits where.
- **Base currency** you think in, and your tax domicile if it matters.
- **Constraints** — e.g. cash only, no margin, no options, can't buy US OTC names.
- **Your harness** and any tools or data sources cupel should know about.
- **Market data** — how cupel should fetch prices/fundamentals: a market-data MCP (OpenBB recommended — it covers global + European exchanges). cupel suggests this on first run if it's unset, and never scrapes quotes.
- **How you like to work** — figures in EUR, be blunt, review monthly, and so on.
- **Durable notes** cupel learns over time that should always be remembered.
`;

export const OFFICE_FILES: OfficeFile[] = [
  { path: "README.md", content: README },
  { path: "PROFILE.md", content: PROFILE },
  { path: "EDGES.md", content: EDGES },
  { path: "MANDATE.md", content: MANDATE },
];
