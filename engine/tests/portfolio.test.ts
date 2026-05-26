import { describe, expect, it } from "vitest";
import { summarizePortfolio, type PositionEntry } from "../src/index.js";

describe("summarizePortfolio", () => {
  // A realistic shape: a big diversified core, a couple of edge picks, the rest cash.
  const entries: PositionEntry[] = [
    { ticker: "VWCE", role: "core", sizePct: 41 },
    { ticker: "AMD", role: "satellite", sizePct: 12 },
    { ticker: "NET", role: "satellite", sizePct: 6 },
  ];

  it("splits core from satellite and derives cash as the remainder", () => {
    const s = summarizePortfolio(entries, {});
    expect(s.corePct).toBe(41);
    expect(s.satellitePct).toBe(18);
    expect(s.investedPct).toBe(59);
    expect(s.cashPct).toBe(41);
    expect(s.count).toBe(3);
  });

  it("sorts each sleeve largest first and reports the largest overall", () => {
    const s = summarizePortfolio(entries, {});
    expect(s.satellite[0]).toEqual({ ticker: "AMD", sizePct: 12 });
    expect(s.largest).toEqual({ ticker: "VWCE", sizePct: 41 });
  });

  it("caps satellites only — a large core holding is never a breach", () => {
    const s = summarizePortfolio(entries, { maxPositionPct: 30 });
    expect(s.breaches.map((b) => b.ticker)).toEqual([]); // VWCE 41% core is exempt
    const s2 = summarizePortfolio(entries, { maxPositionPct: 10 });
    expect(s2.breaches.map((b) => b.ticker)).toEqual(["AMD"]); // satellite over cap
  });

  it("measures the satellite target against satellites only, not the core", () => {
    expect(summarizePortfolio(entries, { satelliteTargetPct: 15 }).overTarget).toBe(true);
    expect(summarizePortfolio(entries, { satelliteTargetPct: 30 }).overTarget).toBe(false);
  });

  it("flags over-allocation (sizes summing past 100) as negative cash", () => {
    const over: PositionEntry[] = [
      { ticker: "A", role: "core", sizePct: 70 },
      { ticker: "B", role: "satellite", sizePct: 45 },
    ];
    expect(summarizePortfolio(over, {}).cashPct).toBe(-15);
  });

  it("lists positions missing a size rather than guessing", () => {
    const s = summarizePortfolio([{ ticker: "FOO", role: "satellite" }, ...entries], {});
    expect(s.unknown).toEqual(["FOO"]);
    expect(s.satellitePct).toBe(18);
  });
});
