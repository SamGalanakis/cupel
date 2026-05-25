// The canonical layout and schema of a cupel "office" — the single
// Obsidian-compatible vault where the companion accumulates everything it
// learns. Kept as pure data so the CLI scaffolder and the office-linter share
// one source of truth.

export const OFFICE_MARKER = ".cupel-office.json";

// Each subdirectory holds one note type. The linter infers a note's type from
// the directory it lives in.
export const OFFICE_DIRS = ["sources", "watchlist", "positions", "theses", "journal"] as const;
export type OfficeDir = (typeof OFFICE_DIRS)[number];

export type NoteType =
  | "source"
  | "watchlist"
  | "position"
  | "thesis"
  | "journal"
  | "edges"
  | "mandate"
  | "readme"
  | "unknown";

// Map a directory name to the note type its files carry.
const DIR_TO_TYPE: Record<string, NoteType> = {
  sources: "source",
  watchlist: "watchlist",
  positions: "position",
  theses: "thesis",
  journal: "journal",
};

// Frontmatter keys the linter requires per note type. Bodies are free prose.
export const REQUIRED_FIELDS: Partial<Record<NoteType, string[]>> = {
  source: ["name", "last-checked"],
  watchlist: ["ticker", "status", "provenance", "last-reviewed"],
  position: ["ticker", "size-pct", "cost-basis", "source", "last-synced", "last-reviewed"],
  thesis: ["ticker", "last-reviewed"],
  journal: ["date", "kind"],
};

// Resolve a note's type from its vault-relative path (e.g. "positions/AAPL.md").
export function noteTypeForPath(relPath: string): NoteType {
  const norm = relPath.replace(/\\/g, "/");
  const top = norm.split("/")[0];
  if (DIR_TO_TYPE[top]) return DIR_TO_TYPE[top];
  const base = norm.split("/").pop() ?? "";
  if (base === "EDGES.md") return "edges";
  if (base === "MANDATE.md") return "mandate";
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

- EDGES.md     your circle of competence: what you see before Wall Street does
- MANDATE.md   your investment policy: goals, horizon, risk, sizing & sell rules
- sources/     people and sources you trust, each with context and a last-checked date
- watchlist/   ideas you're tracking, with provenance back to a source or hunch
- positions/   what you actually hold: cost basis, size, sell triggers
- theses/      full write-ups, one per idea
- journal/     a dated decision log — every buy, sell, and pass, with the reasoning

Notes use YAML frontmatter for structure and \`[[wikilinks]]\` for provenance
(a thesis links its \`[[source]]\` and \`[[EDGES]]\`; a position links its
\`[[thesis]]\`). Open the folder in Obsidian to browse the graph, or just read
the markdown. Run \`cupel doctor\` to check the vault stays consistent.

Talk to it from any harness: \`/cupel\`. Discipline only — cupel sharpens your
own thinking; it never predicts prices or places trades.
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
edge-driven picks._

## Position-size rules

_Set \`max-position-pct\` in the frontmatter above so cupel can flag breaches._

## Sell rules
`;

export const OFFICE_FILES: OfficeFile[] = [
  { path: "README.md", content: README },
  { path: "EDGES.md", content: EDGES },
  { path: "MANDATE.md", content: MANDATE },
];
