// The office-linter: pure, deterministic checks that keep the vault internally
// consistent. The LLM does the judgment; this guarantees the filing cabinet
// stays honest. No fs here — the CLI walks the vault and feeds notes in.

import { extractWikilinks, parseFrontmatter, type FrontmatterValue } from "./frontmatter.js";
import { noteTypeForPath, REQUIRED_FIELDS, type NoteType } from "./office.js";

export type Severity = "error" | "warning" | "info";

export interface Finding {
  path: string;
  severity: Severity;
  rule: string;
  message: string;
}

export interface LintContext {
  // Lowercased basenames (no extension) of every note in the vault.
  knownNotes: Set<string>;
  // From MANDATE.md frontmatter; undefined means "no rule set, skip the check".
  maxPositionPct?: number;
  reviewStaleDays: number;
  sourceStaleDays: number;
  // How old a recorded `figures-as-of`/`price-as-of` date may get before the
  // numbers are flagged for re-verification. Undefined skips the check.
  figuresStaleDays?: number;
  // Reference "now" so results are deterministic in tests.
  today: Date;
}

export interface OfficeNote {
  path: string; // vault-relative, e.g. "positions/AAPL.md"
  text: string;
}

function asNumber(v: FrontmatterValue | undefined): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v.replace(/[%,]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function daysSince(dateStr: FrontmatterValue | undefined, today: Date): number | null {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(dateStr.trim())) return null;
  const then = new Date(dateStr.trim().slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(then.getTime())) return null;
  const ms = today.getTime() - then.getTime();
  return Math.floor(ms / 86_400_000);
}

// Slugify a note name or wikilink target so display-name links resolve the way
// humans (and Obsidian, with aliases) expect: "[[Pragmatic Infra Letter]]" and
// "pragmatic-infra-letter.md" compare equal. Case, spaces, underscores, and
// punctuation are normalized away. Dots become hyphens so a dotted ticker links
// cleanly: "[[SOP.PA]]" resolves to "SOP-PA.md".
export function slugify(s: string): string {
  return s
    .replace(/\.md$/i, "")
    .split("/")
    .pop()!
    .toLowerCase()
    .trim()
    .replace(/[\s_.]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Lint a single note. Returns zero or more findings.
export function lintNote(note: OfficeNote, ctx: LintContext): Finding[] {
  const findings: Finding[] = [];
  const type: NoteType = noteTypeForPath(note.path);
  const { data, hasFrontmatter, error } = parseFrontmatter(note.text);

  const add = (severity: Severity, rule: string, message: string) =>
    findings.push({ path: note.path, severity, rule, message });

  // 1. Frontmatter parse integrity.
  if (error) add("error", "frontmatter-parse", error);

  const schemaType = REQUIRED_FIELDS[type] ? type : null;
  if (schemaType) {
    if (!hasFrontmatter) {
      add("error", "frontmatter-missing", `${type} note has no frontmatter`);
    } else {
      for (const field of REQUIRED_FIELDS[schemaType]!) {
        const v = data[field];
        if (v === undefined || (typeof v === "string" && v.trim() === "")) {
          add("warning", "field-missing", `missing required field: ${field}`);
        }
      }
    }
  }

  // 2. Dangling wikilinks (target has no matching note). Skip README — it's
  // boilerplate documentation whose [[examples]] are illustrative, not links.
  if (type !== "readme") {
    for (const target of extractWikilinks(note.text)) {
      if (!ctx.knownNotes.has(slugify(target))) {
        add("warning", "dangling-link", `[[${target}]] points to no note in the vault`);
      }
    }
  }

  // 3. Mandate consistency: SATELLITE position size vs. the policy cap. A
  // diversified core holding (role: core) is exempt — a whole-world ETF can
  // legitimately be any size; the cap is a concentration guard on edge picks.
  if (type === "position" && ctx.maxPositionPct !== undefined) {
    const role = typeof data["role"] === "string" ? data["role"].trim().toLowerCase() : "satellite";
    const size = asNumber(data["size-pct"]);
    if (role !== "core" && size !== undefined && size > ctx.maxPositionPct) {
      add(
        "warning",
        "mandate-position-size",
        `satellite position is ${size}% but MANDATE caps positions at ${ctx.maxPositionPct}%`,
      );
    }
  }

  // 4. Staleness.
  if (type === "position" || type === "thesis" || type === "watchlist" || type === "theme") {
    const d = daysSince(data["last-reviewed"], ctx.today);
    if (d !== null && d > ctx.reviewStaleDays) {
      add("info", "stale-review", `last reviewed ${d} days ago (over ${ctx.reviewStaleDays})`);
    }
  }
  if (type === "source") {
    const d = daysSince(data["last-checked"], ctx.today);
    if (d !== null && d > ctx.sourceStaleDays) {
      add("info", "stale-source", `last checked ${d} days ago (over ${ctx.sourceStaleDays})`);
    }
  }
  // A journal entry whose review-on date has arrived (or passed) is due for the
  // user's attention. Pure date comparison — what to conclude is the model's job.
  if (type === "journal") {
    const due = daysSince(data["review-on"], ctx.today);
    if (due !== null && due >= 0) {
      const on = typeof data["review-on"] === "string" ? data["review-on"].slice(0, 10) : "";
      add("info", "review-due", `flagged for review (review-on ${on})`);
    }
  }

  // 5. Figures go stale fast — a price can move 40% in weeks. If a thesis or
  // watchlist note records when its numbers were pulled (`figures-as-of`, or a
  // position-style `price-as-of`), flag a refresh before anyone acts on them.
  if ((type === "thesis" || type === "watchlist") && ctx.figuresStaleDays !== undefined) {
    const f = daysSince(data["figures-as-of"] ?? data["price-as-of"], ctx.today);
    if (f !== null && f > ctx.figuresStaleDays) {
      add("info", "stale-figures", `figures as of ${f} days ago — re-verify price/numbers before acting`);
    }
  }

  // 6. Ticker ↔ filename consistency. A watchlist/position note belongs at
  // <TICKER>.md and a thesis at <TICKER>-thesis.md (a dotted ticker uses hyphens,
  // e.g. SOP.PA → SOP-PA.md) so [[TICKER]] wikilinks resolve. A mismatch is
  // usually a typo or a dotted ticker filed under the wrong name.
  if (type === "watchlist" || type === "position" || type === "thesis") {
    const ticker = typeof data["ticker"] === "string" ? data["ticker"].trim() : "";
    if (ticker) {
      const fileSlug = slugify(note.path);
      const expected = type === "thesis" ? `${slugify(ticker)}-thesis` : slugify(ticker);
      if (fileSlug !== expected) {
        add(
          "warning",
          "ticker-filename-mismatch",
          `ticker ${ticker} expects ${expected}.md but the note is ${fileSlug}.md — [[${ticker}]] links may dangle`,
        );
      }
    }
  }

  return findings;
}

// Read MANDATE.md frontmatter into the knobs the linter honors.
export function mandateSettings(mandateText: string | null): {
  maxPositionPct?: number;
  satelliteTargetPct?: number;
  reviewStaleDays: number;
} {
  const DEFAULT_REVIEW_STALE = 90;
  if (!mandateText) return { reviewStaleDays: DEFAULT_REVIEW_STALE };
  const { data } = parseFrontmatter(mandateText);
  return {
    maxPositionPct: asNumber(data["max-position-pct"]),
    satelliteTargetPct: asNumber(data["satellite-target-pct"]),
    reviewStaleDays: asNumber(data["review-stale-days"]) ?? DEFAULT_REVIEW_STALE,
  };
}
