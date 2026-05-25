// Deterministic portfolio arithmetic. The companion should never sum position
// sizes by hand across markdown — that's exactly the admin cupel exists to
// handle. The CLI reads the position notes and hands the parsed entries here.

export interface PositionEntry {
  ticker: string;
  sizePct?: number; // undefined when the note is missing size-pct
}

export interface PortfolioSummary {
  totalPct: number; // sum of known position sizes
  count: number; // number of position notes
  bySize: { ticker: string; sizePct: number }[]; // largest first
  breaches: { ticker: string; sizePct: number }[]; // over maxPositionPct
  unknown: string[]; // positions missing a size
  maxPositionPct?: number;
  satelliteTargetPct?: number;
  overTarget: boolean; // total exceeds the satellite target
}

export function summarizePortfolio(
  entries: PositionEntry[],
  opts: { maxPositionPct?: number; satelliteTargetPct?: number } = {},
): PortfolioSummary {
  const known = entries.filter(
    (e): e is { ticker: string; sizePct: number } => typeof e.sizePct === "number",
  );
  const unknown = entries.filter((e) => typeof e.sizePct !== "number").map((e) => e.ticker);

  const totalPct = Math.round(known.reduce((s, e) => s + e.sizePct, 0) * 100) / 100;
  const bySize = [...known]
    .map((e) => ({ ticker: e.ticker, sizePct: e.sizePct }))
    .sort((a, b) => b.sizePct - a.sizePct);
  const breaches =
    opts.maxPositionPct === undefined
      ? []
      : bySize.filter((e) => e.sizePct > opts.maxPositionPct!);
  const overTarget =
    opts.satelliteTargetPct !== undefined && totalPct > opts.satelliteTargetPct;

  return {
    totalPct,
    count: entries.length,
    bySize,
    breaches,
    unknown,
    maxPositionPct: opts.maxPositionPct,
    satelliteTargetPct: opts.satelliteTargetPct,
    overTarget,
  };
}
