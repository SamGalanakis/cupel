import { describe, expect, it } from "vitest";
import { lintNote, mandateSettings, type LintContext } from "../src/index.js";

function ctx(overrides: Partial<LintContext> = {}): LintContext {
  return {
    knownNotes: new Set(["nvda-thesis", "dave", "edges"]),
    maxPositionPct: 10,
    reviewStaleDays: 90,
    sourceStaleDays: 30,
    today: new Date("2026-05-25T00:00:00Z"),
    ...overrides,
  };
}

describe("lintNote", () => {
  it("passes a complete position note", () => {
    const text = [
      "---",
      "ticker: NVDA",
      "size-pct: 6",
      "cost-basis: 100",
      "source: manual",
      "last-synced: 2026-05-20",
      "last-reviewed: 2026-05-20",
      "---",
      "Held since 2024. Thesis: [[NVDA-thesis]].",
    ].join("\n");
    expect(lintNote({ path: "positions/NVDA.md", text }, ctx())).toEqual([]);
  });

  it("flags missing required fields", () => {
    const text = ["---", "ticker: NVDA", "---", "body"].join("\n");
    const rules = lintNote({ path: "positions/NVDA.md", text }, ctx()).map((f) => f.rule);
    expect(rules).toContain("field-missing");
  });

  it("flags a dangling wikilink", () => {
    const text = ["---", "ticker: NVDA", "status: watching", "provenance: hunch", "last-reviewed: 2026-05-20", "---", "see [[ghost-note]]"].join("\n");
    const f = lintNote({ path: "watchlist/NVDA.md", text }, ctx());
    expect(f.some((x) => x.rule === "dangling-link")).toBe(true);
  });

  it("flags a position above the mandate cap", () => {
    const text = [
      "---",
      "ticker: NVDA",
      "size-pct: 25",
      "cost-basis: 100",
      "source: manual",
      "last-synced: 2026-05-20",
      "last-reviewed: 2026-05-20",
      "---",
      "big",
    ].join("\n");
    const f = lintNote({ path: "positions/NVDA.md", text }, ctx());
    expect(f.some((x) => x.rule === "mandate-position-size")).toBe(true);
  });

  it("flags a stale review", () => {
    const text = [
      "---",
      "ticker: NVDA",
      "size-pct: 5",
      "cost-basis: 100",
      "source: manual",
      "last-synced: 2026-05-20",
      "last-reviewed: 2025-01-01",
      "---",
      "old",
    ].join("\n");
    const f = lintNote({ path: "positions/NVDA.md", text }, ctx());
    expect(f.some((x) => x.rule === "stale-review")).toBe(true);
  });
});

describe("mandateSettings", () => {
  it("reads the position cap and review window from frontmatter", () => {
    const m = mandateSettings(["---", "max-position-pct: 8", "review-stale-days: 60", "---", "x"].join("\n"));
    expect(m.maxPositionPct).toBe(8);
    expect(m.reviewStaleDays).toBe(60);
  });

  it("defaults the review window when unset", () => {
    expect(mandateSettings(null).reviewStaleDays).toBe(90);
  });
});
