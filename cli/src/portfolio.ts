import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  mandateSettings,
  OFFICE_MARKER,
  parseFrontmatter,
  summarizePortfolio,
  type PositionEntry,
} from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const tty = () => Boolean(process.stdout.isTTY);
const c = (t: string, code: string) => (tty() ? `${code}${t}${RESET}` : t);

function num(v: unknown): number | undefined {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v.replace(/[%,]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

// Read the position notes into parsed entries. A note whose role isn't
// explicitly "core" is treated as a satellite pick — the safe default keeps it
// subject to the concentration cap and the satellite target. `cost-basis` +
// `last-price` (when present) drive the gain % — recorded prices only, never live.
export function readPositions(root: string): PositionEntry[] {
  const dir = join(root, "positions");
  if (!existsSync(dir)) return [];
  const out: PositionEntry[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.toLowerCase().endsWith(".md")) continue;
    const { data } = parseFrontmatter(readFileSync(join(dir, name), "utf8"));
    const ticker = typeof data.ticker === "string" && data.ticker.trim() ? data.ticker.trim() : name.replace(/\.md$/i, "");
    const role = typeof data.role === "string" && data.role.trim().toLowerCase() === "core" ? "core" : "satellite";
    out.push({
      ticker,
      role,
      sizePct: num(data["size-pct"]),
      costBasis: num(data["cost-basis"]),
      lastPrice: num(data["last-price"]),
      currency: typeof data.currency === "string" && data.currency.trim() ? data.currency.trim() : undefined,
    });
  }
  return out;
}

function readCapital(root: string): { amount?: number; currency?: string } {
  try {
    const m = JSON.parse(readFileSync(join(root, OFFICE_MARKER), "utf8"));
    return {
      amount: typeof m["total-capital"] === "number" ? m["total-capital"] : undefined,
      currency: typeof m["capital-currency"] === "string" ? m["capital-currency"] : undefined,
    };
  } catch {
    return {};
  }
}

const gainTag = (g: number | undefined): string => {
  if (g === undefined) return "";
  const s = `${g >= 0 ? "+" : ""}${g}%`;
  return "  " + c(s.padStart(7), g >= 0 ? GREEN : RED);
};

export function cmdPortfolio(): number {
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }

  const mandatePath = join(root, "MANDATE.md");
  const { maxPositionPct, satelliteTargetPct } = mandateSettings(
    existsSync(mandatePath) ? readFileSync(mandatePath, "utf8") : null,
  );

  const s = summarizePortfolio(readPositions(root), { maxPositionPct, satelliteTargetPct });

  console.log(c("cupel portfolio", BOLD));
  if (s.count === 0) {
    console.log("  no positions yet.");
    return 0;
  }

  const row = (label: string, pct: number, tag = "") =>
    `  ${label.padEnd(8)} ${(String(pct) + "%").padStart(6)}${tag}`;

  if (s.core.length) {
    console.log(c("  core", DIM));
    for (const p of s.core) console.log(row(p.ticker, p.sizePct, gainTag(p.gainPct)));
  }
  if (s.satellite.length) {
    console.log(c("  satellite", DIM));
    for (const p of s.satellite) {
      const over = maxPositionPct !== undefined && p.sizePct > maxPositionPct;
      const tag = (over ? c(`  ⚠ over ${maxPositionPct}% cap`, RED) : "") + gainTag(p.gainPct);
      console.log(row(p.ticker, p.sizePct, tag));
    }
  }
  if (s.unknown.length) {
    console.log(c(`  (${s.unknown.join(", ")}: no size-pct set)`, DIM));
  }

  console.log("");
  console.log(c(row("core", s.corePct), DIM));
  const targetTxt = satelliteTargetPct !== undefined ? ` (target ${satelliteTargetPct}%)` : "";
  const satLine = row("satellite", s.satellitePct) + targetTxt;
  console.log(s.overTarget ? c(satLine + "  ⚠ over target", YELLOW) : c(satLine, GREEN));
  const cashTag = s.cashPct < 0 ? c("  ⚠ over-allocated (>100%)", RED) : "";
  console.log(c(row("cash", s.cashPct, cashTag), s.cashPct < 0 ? RESET : DIM));
  if (s.largest) {
    console.log(c(`  largest: ${s.largest.ticker} (${s.largest.sizePct}%)`, DIM));
  }

  // P&L from recorded prices (never live). Per-position gain shows inline above;
  // here's the blended read and, if a total-capital anchor is set, the money.
  if (s.priceReturnPct !== undefined) {
    const ret = `${s.priceReturnPct >= 0 ? "+" : ""}${s.priceReturnPct}%`;
    console.log(
      c(
        `  return   ${ret.padStart(6)}  ${c(`(priced: ${s.pricedPct}% of capital, recorded prices, local terms)`, DIM)}`,
        s.priceReturnPct >= 0 ? GREEN : RED,
      ),
    );
    const { amount, currency } = readCapital(root);
    if (amount !== undefined) {
      const cur = currency ? currency + " " : "";
      // size-pcts are current weights, so total-capital × size = current value;
      // back out cost to get the gain in money. Approximate (ignores FX).
      let pricedValue = 0;
      let pricedGain = 0;
      for (const h of [...s.core, ...s.satellite]) {
        if (h.gainPct === undefined) continue;
        const value = (amount * h.sizePct) / 100;
        const cost = value / (1 + h.gainPct / 100);
        pricedValue += value;
        pricedGain += value - cost;
      }
      const sign = pricedGain >= 0 ? "+" : "";
      console.log(
        c(`  capital  ${cur}${Math.round(amount).toLocaleString()}`, DIM) +
          c(
            `   ≈ ${sign}${cur}${Math.round(pricedGain).toLocaleString()} on the priced sleeve (${cur}${Math.round(pricedValue).toLocaleString()})`,
            pricedGain >= 0 ? GREEN : RED,
          ),
      );
    } else {
      console.log(c("  (set a total with `cupel capital <amount>` to see value in money)", DIM));
    }
  }
  return 0;
}
