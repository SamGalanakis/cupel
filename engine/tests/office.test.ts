import { describe, expect, it } from "vitest";
import { OFFICE_DIRS, OFFICE_FILES, OFFICE_MARKER, VERSION } from "../src/index.js";

describe("office spec", () => {
  it("declares the core subdirectories", () => {
    expect(OFFICE_DIRS).toContain("watchlist");
    expect(OFFICE_DIRS).toContain("journal");
  });

  it("seeds EDGES.md and MANDATE.md with non-empty content", () => {
    const names = OFFICE_FILES.map((f) => f.path);
    expect(names).toContain("EDGES.md");
    expect(names).toContain("MANDATE.md");
    expect(names).toContain("README.md");
    for (const f of OFFICE_FILES) {
      expect(f.content.trim().length).toBeGreaterThan(0);
    }
  });

  it("has a cupel-scoped marker and a semver version", () => {
    expect(OFFICE_MARKER).toMatch(/cupel/);
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
