import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

// `cupel board` — the whole watchlist at a glance, ranked by tier. The companion
// (and the user) accumulate dozens of names; this is the deterministic "where do
// I stand across everything" view so nobody has to grep the vault. Pure reading
// and sorting — the judgment that set the tiers lives in the notes.

const TIER_RANK: Record<string, number> = { A: 0, B: 1, C: 2, PASS: 3 };
const TIERS = ["A", "B", "C", "PASS"];

const tty = () => Boolean(process.stdout.isTTY);
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const b = (s: string) => (tty() ? `${BOLD}${s}${RESET}` : s);
const dim = (s: string) => (tty() ? `${DIM}${s}${RESET}` : s);

interface Row {
  ticker: string;
  company: string;
  tier: string;
  edge: string;
  corr: string;
  status: string;
  reviewed: string;
  trigger: boolean;
}

function pad(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s.padEnd(n);
}

export function cmdBoard(args: string[]): number {
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }
  const dir = join(root, "watchlist");
  if (!existsSync(dir)) {
    console.log("No watchlist yet. Start one with /cupel watch <TICKER>.");
    return 0;
  }

  const rows: Row[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.toLowerCase().endsWith(".md")) continue;
    const { data } = parseFrontmatter(readFileSync(join(dir, name), "utf8"));
    const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string).trim() : "");
    rows.push({
      ticker: str("ticker") || name.replace(/\.md$/i, ""),
      company: str("company"),
      tier: (str("tier") || "—").toUpperCase(),
      edge: str("edge").replace(/-edge$/, ""), // "in-edge" -> "in"
      corr: str("ai-correlation") || str("correlation"),
      status: str("status"),
      reviewed: str("last-reviewed").slice(0, 10),
      trigger: Boolean(str("entry-trigger") || str("watch-for")),
    });
  }

  if (rows.length === 0) {
    console.log("Watchlist is empty.");
    return 0;
  }

  // Optional filter: `cupel board A` shows only one tier.
  const want = (args[0] || "").toUpperCase();
  const filtered = TIERS.includes(want) ? rows.filter((r) => r.tier === want) : rows;

  filtered.sort(
    (x, y) => (TIER_RANK[x.tier] ?? 4) - (TIER_RANK[y.tier] ?? 4) || x.ticker.localeCompare(y.ticker),
  );

  const counts = TIERS.map((t) => `${t} ${rows.filter((r) => r.tier === t).length}`).join(" · ");
  console.log(b(`cupel board — ${filtered.length} of ${rows.length} watchlist names  (${counts})`));
  console.log(dim("  tier  ticker    edge  corr  status       reviewed    company   (▸ = entry trigger set)"));

  let currentTier = "";
  for (const r of filtered) {
    if (r.tier !== currentTier) {
      currentTier = r.tier;
      console.log("");
    }
    const mark = r.trigger ? "▸" : " ";
    console.log(
      `  ${pad(r.tier, 5)} ${b(pad(r.ticker, 9))} ${pad(r.edge || "—", 5)} ${pad(r.corr || "—", 5)} ` +
        `${pad(r.status || "—", 12)} ${pad(r.reviewed || "—", 11)} ${mark} ${r.company}`,
    );
  }
  console.log("");
  console.log(dim("  detail: cupel show <ticker> · filter: cupel board <A|B|C|PASS>"));
  return 0;
}
