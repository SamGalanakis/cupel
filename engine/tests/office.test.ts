import { describe, expect, it } from "vitest";
import {
  noteTypeForPath,
  OFFICE_DIRS,
  OFFICE_FILES,
  OFFICE_MARKER,
  REQUIRED_FIELDS,
  VERSION,
} from "../src/index.js";

describe("office spec", () => {
  it("declares the core subdirectories", () => {
    expect(OFFICE_DIRS).toContain("sources");
    expect(OFFICE_DIRS).toContain("watchlist");
    expect(OFFICE_DIRS).toContain("journal");
  });

  it("seeds EDGES/MANDATE/README with non-empty content", () => {
    const names = OFFICE_FILES.map((f) => f.path);
    expect(names).toEqual(expect.arrayContaining(["README.md", "EDGES.md", "MANDATE.md"]));
    for (const f of OFFICE_FILES) expect(f.content.trim().length).toBeGreaterThan(0);
  });

  it("maps paths to note types by directory", () => {
    expect(noteTypeForPath("positions/AAPL.md")).toBe("position");
    expect(noteTypeForPath("sources/dave.md")).toBe("source");
    expect(noteTypeForPath("watchlist/NVDA.md")).toBe("watchlist");
    expect(noteTypeForPath("EDGES.md")).toBe("edges");
    expect(noteTypeForPath("notes/random.md")).toBe("unknown");
  });

  it("requires a ticker on positions and watchlist entries", () => {
    expect(REQUIRED_FIELDS.position).toContain("ticker");
    expect(REQUIRED_FIELDS.watchlist).toContain("provenance");
  });

  it("has a cupel-scoped marker and a semver version", () => {
    expect(OFFICE_MARKER).toMatch(/cupel/);
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
