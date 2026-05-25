// The canonical layout of a cupel "office" — the single folder where the
// companion accumulates everything it learns. Kept here as pure data so the
// CLI scaffolder and any future tooling share one source of truth.
//
// Provisional: onboarding design may refine which files seed the office. When
// it does, change them here, in one place.

export const OFFICE_MARKER = ".cupel-office.json";

export const OFFICE_DIRS = ["watchlist", "positions", "theses", "journal"] as const;
export type OfficeDir = (typeof OFFICE_DIRS)[number];

export interface OfficeFile {
  path: string;
  content: string;
}

const README = `# Your cupel office

This folder is your investing brain. cupel — the research companion in your AI
harness — reads and writes here. Everything it learns about your edges, your
ideas, and your decisions accumulates in this one place.

- EDGES.md    what you know that the market doesn't yet — your circle of competence
- MANDATE.md  your investment policy: goals, horizon, risk, position-size & sell rules
- watchlist/  ideas you're tracking, and why they're on your radar
- positions/  what you actually hold: cost basis, thesis, sell triggers
- theses/     full write-ups, one per idea
- journal/    a dated decision log — every buy, sell, and pass, with the reasoning

Talk to it from any harness: \`/cupel\`. Detection and discipline only — cupel
sharpens your own thinking; it does not predict prices or place trades.
`;

const EDGES = `# Edges

> Your circle of competence: what you see before Wall Street does. Run \`/cupel\`
> onboarding to fill this in. (Peter Lynch: invest in what you already know.)

## Professional edge

_What does your job let you see early?_

## Consumer edge

_Products and services you've watched take off in your own life._

## Circle of competence

_Industries you can actually evaluate._

## Anti-edges

_Areas where you have opinions but no real advantage — for cupel to flag when
you stray into them._
`;

const MANDATE = `# Mandate

> Your investment policy. cupel reads this every session and holds you to it.
> Run \`/cupel\` onboarding to fill this in.

## Objectives

## Time horizon

## Risk tolerance

## Core vs. edge satellite

_How much is boring/indexed, and how much is reserved for edge-driven picks._

## Position-size rules

## Sell rules
`;

export const OFFICE_FILES: OfficeFile[] = [
  { path: "README.md", content: README },
  { path: "EDGES.md", content: EDGES },
  { path: "MANDATE.md", content: MANDATE },
];
