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

function normalizeLink(target: string): string {
  return target.replace(/\.md$/i, "").split("/").pop()!.toLowerCase();
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
      if (!ctx.knownNotes.has(normalizeLink(target))) {
        add("warning", "dangling-link", `[[${target}]] points to no note in the vault`);
      }
    }
  }

  // 3. Mandate consistency: position size vs. the policy cap.
  if (type === "position" && ctx.maxPositionPct !== undefined) {
    const size = asNumber(data["size-pct"]);
    if (size !== undefined && size > ctx.maxPositionPct) {
      add(
        "warning",
        "mandate-position-size",
        `position is ${size}% but MANDATE caps positions at ${ctx.maxPositionPct}%`,
      );
    }
  }

  // 4. Staleness.
  if (type === "position" || type === "thesis" || type === "watchlist") {
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

  return findings;
}

// Read MANDATE.md frontmatter into the knobs the linter honors.
export function mandateSettings(mandateText: string | null): {
  maxPositionPct?: number;
  reviewStaleDays: number;
} {
  const DEFAULT_REVIEW_STALE = 90;
  if (!mandateText) return { reviewStaleDays: DEFAULT_REVIEW_STALE };
  const { data } = parseFrontmatter(mandateText);
  return {
    maxPositionPct: asNumber(data["max-position-pct"]),
    reviewStaleDays: asNumber(data["review-stale-days"]) ?? DEFAULT_REVIEW_STALE,
  };
}
