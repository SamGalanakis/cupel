// Deterministic portfolio arithmetic. The companion should never sum position
// sizes by hand across markdown — that's exactly the admin cupel exists to
// handle. The CLI reads the position notes and hands the parsed entries here.
//
// Every holding carries a `role` (core | satellite) and a `size-pct` measured
// against TOTAL investable capital (including cash). So core + satellite + cash
// sum to ~100, and CASH is simply the remainder — no separate cash note needed.
// The mandate's per-position cap and satellite target apply to satellites only.

export type PositionRole = "core" | "satellite";

export interface PositionEntry {
  ticker: string;
  role: PositionRole; // a note missing/!=core is treated as satellite (safe default)
  sizePct?: number; // undefined when the note is missing size-pct
}

interface Holding {
  ticker: string;
  sizePct: number;
}

export interface PortfolioSummary {
  count: number; // number of position notes
  core: Holding[]; // core holdings, largest first
  satellite: Holding[]; // satellite holdings, largest first
  corePct: number; // sum of known core sizes
  satellitePct: number; // sum of known satellite sizes
  investedPct: number; // core + satellite
  cashPct: number; // 100 - invested (negative => over-allocated, a data error)
  largest?: Holding; // largest single holding across core + satellite
  breaches: Holding[]; // satellite holdings over maxPositionPct
  unknown: string[]; // positions missing a size
  maxPositionPct?: number;
  satelliteTargetPct?: number;
  overTarget: boolean; // satellite total exceeds the satellite target
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function summarizePortfolio(
  entries: PositionEntry[],
  opts: { maxPositionPct?: number; satelliteTargetPct?: number } = {},
): PortfolioSummary {
  const known = entries.filter(
    (e): e is PositionEntry & { sizePct: number } => typeof e.sizePct === "number",
  );
  const unknown = entries.filter((e) => typeof e.sizePct !== "number").map((e) => e.ticker);

  const bySize = (es: typeof known) =>
    es.map((e) => ({ ticker: e.ticker, sizePct: e.sizePct })).sort((a, b) => b.sizePct - a.sizePct);

  const core = bySize(known.filter((e) => e.role === "core"));
  const satellite = bySize(known.filter((e) => e.role !== "core"));

  const corePct = round2(core.reduce((s, e) => s + e.sizePct, 0));
  const satellitePct = round2(satellite.reduce((s, e) => s + e.sizePct, 0));
  const investedPct = round2(corePct + satellitePct);
  const cashPct = round2(100 - investedPct);

  const largest = [...core, ...satellite].sort((a, b) => b.sizePct - a.sizePct)[0];
  const breaches =
    opts.maxPositionPct === undefined ? [] : satellite.filter((e) => e.sizePct > opts.maxPositionPct!);
  const overTarget =
    opts.satelliteTargetPct !== undefined && satellitePct > opts.satelliteTargetPct;

  return {
    count: entries.length,
    core,
    satellite,
    corePct,
    satellitePct,
    investedPct,
    cashPct,
    largest,
    breaches,
    unknown,
    maxPositionPct: opts.maxPositionPct,
    satelliteTargetPct: opts.satelliteTargetPct,
    overTarget,
  };
}
