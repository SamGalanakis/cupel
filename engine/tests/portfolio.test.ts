import { describe, expect, it } from "vitest";
import { summarizePortfolio } from "../src/index.js";

describe("summarizePortfolio", () => {
  const entries = [
    { ticker: "NET", sizePct: 6 },
    { ticker: "MDB", sizePct: 5 },
    { ticker: "CRWD", sizePct: 12 },
    { ticker: "ESTC", sizePct: 3 },
  ];

  it("sums sizes and sorts largest first", () => {
    const s = summarizePortfolio(entries, {});
    expect(s.totalPct).toBe(26);
    expect(s.count).toBe(4);
    expect(s.bySize[0]).toEqual({ ticker: "CRWD", sizePct: 12 });
  });

  it("flags positions over the cap", () => {
    const s = summarizePortfolio(entries, { maxPositionPct: 8 });
    expect(s.breaches.map((b) => b.ticker)).toEqual(["CRWD"]);
  });

  it("flags total over the satellite target", () => {
    expect(summarizePortfolio(entries, { satelliteTargetPct: 20 }).overTarget).toBe(true);
    expect(summarizePortfolio(entries, { satelliteTargetPct: 30 }).overTarget).toBe(false);
  });

  it("lists positions missing a size rather than guessing", () => {
    const s = summarizePortfolio([{ ticker: "FOO" }, { ticker: "NET", sizePct: 6 }], {});
    expect(s.unknown).toEqual(["FOO"]);
    expect(s.totalPct).toBe(6);
  });

  it("does not flag when no target is set", () => {
    expect(summarizePortfolio(entries, { maxPositionPct: 8 }).overTarget).toBe(false);
  });
});
