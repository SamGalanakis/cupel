import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mandateSettings, parseFrontmatter, summarizePortfolio, type PositionEntry } from "../../engine/dist/index.js";
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

// Read the position notes into parsed entries.
export function readPositions(root: string): PositionEntry[] {
  const dir = join(root, "positions");
  if (!existsSync(dir)) return [];
  const out: PositionEntry[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.toLowerCase().endsWith(".md")) continue;
    const { data } = parseFrontmatter(readFileSync(join(dir, name), "utf8"));
    const ticker = typeof data.ticker === "string" && data.ticker.trim() ? data.ticker.trim() : name.replace(/\.md$/i, "");
    out.push({ ticker, sizePct: num(data["size-pct"]) });
  }
  return out;
}

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

  for (const p of s.bySize) {
    const over = maxPositionPct !== undefined && p.sizePct > maxPositionPct;
    const tag = over ? c(`  ⚠ over ${maxPositionPct}% cap`, RED) : "";
    console.log(`  ${p.ticker.padEnd(6)} ${String(p.sizePct).padStart(5)}%${tag}`);
  }
  if (s.unknown.length) {
    console.log(c(`  (${s.unknown.join(", ")}: no size-pct set)`, DIM));
  }

  console.log("");
  const targetTxt = satelliteTargetPct !== undefined ? ` of ${satelliteTargetPct}% satellite target` : "";
  const totalLine = `  total satellite: ${s.totalPct}%${targetTxt}`;
  console.log(s.overTarget ? c(totalLine + "  ⚠ over target", YELLOW) : c(totalLine, GREEN));
  if (s.bySize.length) {
    const top = s.bySize[0];
    console.log(c(`  largest: ${top.ticker} (${top.sizePct}%)`, DIM));
  }
  return 0;
}
