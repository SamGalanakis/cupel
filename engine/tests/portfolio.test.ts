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

  it("computes per-holding gain and a size-weighted price return from recorded prices", () => {
    const priced: PositionEntry[] = [
      { ticker: "VWCE", role: "core", sizePct: 50, costBasis: 100, lastPrice: 110, currency: "EUR" }, // +10%
      { ticker: "AMD", role: "satellite", sizePct: 10, costBasis: 160, lastPrice: 200 }, // +25%
      { ticker: "X", role: "satellite", sizePct: 10 }, // unpriced — contributes nothing
    ];
    const s = summarizePortfolio(priced, {});
    expect(s.core[0].gainPct).toBe(10);
    expect(s.satellite.find((h) => h.ticker === "AMD")?.gainPct).toBe(25);
    expect(s.pricedPct).toBe(60);
    expect(s.priceReturnPct).toBe(12.5); // (50*10 + 10*25) / 60
  });

  it("leaves price return undefined when nothing has a recorded price", () => {
    const s = summarizePortfolio(entries, {});
    expect(s.priceReturnPct).toBeUndefined();
    expect(s.pricedPct).toBe(0);
    expect(s.satellite[0]).toEqual({ ticker: "AMD", sizePct: 12 }); // no gain key when unpriced
  });
});
