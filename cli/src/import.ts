import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  aggregateDegiroTransactions,
  OFFICE_MARKER,
  parseDegiroPortfolioCsv,
  parseDegiroTransactionsCsv,
  parseFrontmatter,
  round2,
  type DegiroPortfolioRow,
  type DegiroTransactionAggregate,
  type FrontmatterValue,
} from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

type Frontmatter = Record<string, FrontmatterValue>;

interface InstrumentCandidate {
  ticker: string;
  company?: string;
  isin?: string;
  role?: string;
  path: string;
}

const POSITION_FIELD_ORDER = [
  "ticker",
  "company",
  "role",
  "size-pct",
  "quantity",
  "isin",
  "cost-basis",
  "currency",
  "opened",
  "broker",
  "source",
  "last-synced",
  "last-reviewed",
  "last-price",
  "price-as-of",
  "market-value-eur",
  "total-cost-eur",
  "fees-eur",
  "sell-triggers",
];

function usage(): number {
  console.error("usage: cupel import degiro --portfolio Portfolio.csv --transactions Transactions.csv");
  return 2;
}

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function stampPart(): string {
  return new Date().toISOString().slice(11, 16).replace(":", "");
}

function cleanProductName(product: string): string {
  return product
    .replace(/^ADR ON\s+/i, "")
    .replace(/\s+CLASS\s+[A-Z]$/i, "")
    .replace(/\s+ETF$/i, "")
    .trim();
}

function normalizeName(s: string): string[] {
  const stop = new Set([
    "ADR",
    "ON",
    "THE",
    "INC",
    "LTD",
    "LIMITED",
    "PLC",
    "CORP",
    "CORPORATION",
    "COMPANY",
    "CLASS",
    "GLOBAL",
    "HOLDINGS",
    "GROUP",
    "ETF",
    "UCITS",
    "USD",
    "EUR",
    "ACC",
    "A",
    "B",
    "C",
  ]);
  return s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !stop.has(t));
}

function scoreCandidate(row: DegiroPortfolioRow, c: InstrumentCandidate): number {
  if (row.isin && c.isin && row.isin === c.isin) return 100;

  const productTokens = normalizeName(row.product);
  const companyTokens = normalizeName(c.company ?? "");
  const product = productTokens.join(" ");
  const company = companyTokens.join(" ");
  let score = 0;
  if (c.path.startsWith("positions/")) score += 15;

  if (c.ticker.length >= 3 && productTokens.includes(c.ticker.toUpperCase())) score += 35;
  if (company && product.includes(company)) score += 55;
  if (company && company.includes(product)) score += 55;
  for (const token of companyTokens) {
    if (productTokens.includes(token)) score += 12;
  }
  return score;
}

function readCandidates(root: string): InstrumentCandidate[] {
  const dirs = ["positions", "watchlist", "theses"];
  const out: InstrumentCandidate[] = [];
  for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs)) {
      if (!name.toLowerCase().endsWith(".md")) continue;
      const rel = `${dir}/${name}`;
      const { data } = parseFrontmatter(readFileSync(join(root, rel), "utf8"));
      const ticker =
        typeof data.ticker === "string" && data.ticker.trim()
          ? data.ticker.trim()
          : name.replace(/-thesis\.md$/i, "").replace(/\.md$/i, "");
      out.push({
        ticker,
        company: typeof data.company === "string" ? data.company : undefined,
        isin: typeof data.isin === "string" ? data.isin : undefined,
        role: typeof data.role === "string" ? data.role : undefined,
        path: rel,
      });
    }
  }
  return out;
}

function resolveTicker(row: DegiroPortfolioRow, candidates: InstrumentCandidate[]): InstrumentCandidate | null {
  const ranked = candidates
    .map((c) => ({ candidate: c, score: scoreCandidate(row, c) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0] && ranked[0].score >= 25 ? ranked[0].candidate : null;
}

function scalar(v: string): string {
  if (/^-?\d+(\.\d+)?$/.test(v)) return v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^[A-Za-z0-9_.\/-]+$/.test(v)) return v;
  return JSON.stringify(v);
}

function renderFrontmatter(data: Frontmatter, body: string): string {
  const keys = [
    ...POSITION_FIELD_ORDER.filter((k) => data[k] !== undefined),
    ...Object.keys(data)
      .filter((k) => !POSITION_FIELD_ORDER.includes(k))
      .sort(),
  ];
  const lines = ["---"];
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${scalar(item)}`);
    } else {
      lines.push(`${key}: ${scalar(value)}`);
    }
  }
  lines.push("---", "", body.trimStart());
  return lines.join("\n").replace(/\n*$/, "\n");
}

function readMarker(root: string): Record<string, string | number | undefined> {
  try {
    return JSON.parse(readFileSync(join(root, OFFICE_MARKER), "utf8"));
  } catch {
    return {};
  }
}

function writeMarker(root: string, marker: Record<string, string | number | undefined>): void {
  writeFileSync(join(root, OFFICE_MARKER), JSON.stringify(marker, null, 2) + "\n");
}

function positionBody(
  ticker: string,
  row: DegiroPortfolioRow,
  tx: DegiroTransactionAggregate | undefined,
  syncDate: string,
): string {
  const fill =
    tx?.averagePrice !== undefined
      ? `Broker transactions show **${tx.quantity} sh @ ${tx.currency ?? row.currency} ${tx.averagePrice}** from ${tx.firstDate}; total cost **EUR ${tx.totalCostEur}** including about **EUR ${tx.totalFeesEur}** in FX/transaction fees.`
      : "No matching transaction fill was present in the imported transaction CSV; preserve or verify the cost basis before relying on P&L.";
  return `# ${ticker} - held

Imported from DEGIRO on ${syncDate}. Product: **${row.product}** (${row.isin ?? "no ISIN"}).
${fill}

Portfolio mark on ${syncDate}: **${row.currency} ${row.closing ?? "n/a"}**, value **EUR ${row.valueEur}**.

Links: [[${ticker}-thesis]].
`;
}

function updatePosition(
  root: string,
  row: DegiroPortfolioRow,
  candidate: InstrumentCandidate,
  tx: DegiroTransactionAggregate | undefined,
  totalValueEur: number,
  syncDate: string,
): string {
  const ticker = candidate.ticker;
  const path = join(root, "positions", `${ticker.replace(/\./g, "-")}.md`);
  const exists = existsSync(path);
  const parsed = exists ? parseFrontmatter(readFileSync(path, "utf8")) : { data: {}, body: "", hasFrontmatter: false };
  const data: Frontmatter = { ...parsed.data };

  const openingDate =
    typeof data.opened === "string" && data.opened.trim()
      ? data.opened
      : tx?.firstDate ?? syncDate;
  const costBasis =
    tx?.averagePrice !== undefined
      ? String(tx.averagePrice)
      : typeof data["cost-basis"] === "string" && data["cost-basis"].trim()
        ? data["cost-basis"]
        : row.closing !== undefined
          ? String(row.closing)
          : "0";

  data.ticker = ticker;
  data.company = typeof data.company === "string" && data.company.trim() ? data.company : (candidate.company ?? cleanProductName(row.product));
  data.role = typeof data.role === "string" && data.role.trim() ? data.role : (candidate.role ?? "satellite");
  data["size-pct"] = String(round2((row.valueEur / totalValueEur) * 100));
  if (row.amount !== undefined) data.quantity = String(row.amount);
  if (row.isin) data.isin = row.isin;
  data["cost-basis"] = costBasis;
  data.currency = row.currency;
  data.opened = openingDate;
  data.broker = "DEGIRO";
  data.source = "broker";
  data["last-synced"] = syncDate;
  data["last-reviewed"] = typeof data["last-reviewed"] === "string" && data["last-reviewed"].trim() ? data["last-reviewed"] : syncDate;
  if (row.closing !== undefined) data["last-price"] = String(row.closing);
  data["price-as-of"] = syncDate;
  data["market-value-eur"] = String(row.valueEur);
  if (tx) {
    data["total-cost-eur"] = String(tx.totalCostEur);
    data["fees-eur"] = String(tx.totalFeesEur);
  }
  delete data.status;
  delete data["order-qty"];
  delete data["order-limit"];
  delete data["order-duration"];

  const wasPending = typeof parsed.data.status === "string" && parsed.data.status.toLowerCase() === "pending";
  const body = !exists || wasPending || /PENDING ORDER/i.test(parsed.body)
    ? positionBody(ticker, row, tx, syncDate)
    : parsed.body;

  writeFileSync(path, renderFrontmatter(data, body));
  return ticker;
}

function promoteWatchlist(root: string, ticker: string, syncDate: string): void {
  const path = join(root, "watchlist", `${ticker.replace(/\./g, "-")}.md`);
  if (!existsSync(path)) return;
  const parsed = parseFrontmatter(readFileSync(path, "utf8"));
  const data: Frontmatter = { ...parsed.data, status: "promoted", "last-reviewed": syncDate };
  delete data["entry-trigger"];
  writeFileSync(path, renderFrontmatter(data, parsed.body));
}

function writeJournal(
  root: string,
  syncDate: string,
  portfolioPath: string,
  transactionsPath: string,
  synced: Array<{ row: DegiroPortfolioRow; ticker: string }>,
  totalValueEur: number,
  cashEur: number,
): string {
  const path = join(root, "journal", `${syncDate}-degiro-sync-${stampPart()}.md`);
  const positionRows = synced
    .map(({ row, ticker }) => `| [[${ticker}]] | ${row.amount ?? ""} | ${row.currency} ${row.closing ?? "n/a"} | EUR ${row.valueEur} |`)
    .join("\n");
  const body = `---
date: ${syncDate}
kind: review
tags: [broker-sync, degiro, import]
---

# DEGIRO import

Synced broker exports:

- Portfolio: \`${basename(portfolioPath)}\`
- Transactions: \`${basename(transactionsPath)}\`

Account total: **EUR ${totalValueEur}**.
Cash: **EUR ${cashEur}**.

| Ticker | Quantity | Mark | Value |
|---|---:|---:|---:|
${positionRows}

The import is read-only. It updates office records from broker exports and does
not place or cancel orders.
`;
  writeFileSync(path, body);
  return path;
}

function runDegiro(args: string[]): number {
  const portfolioPath = flag(args, "--portfolio");
  const transactionsPath = flag(args, "--transactions");
  if (!portfolioPath || !transactionsPath) return usage();

  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }

  const portfolio = parseDegiroPortfolioCsv(readFileSync(portfolioPath, "utf8"));
  const transactions = parseDegiroTransactionsCsv(readFileSync(transactionsPath, "utf8"));
  const txByIsin = aggregateDegiroTransactions(transactions);
  const totalValueEur = round2(portfolio.reduce((s, r) => s + r.valueEur, 0));
  const cashEur = round2(portfolio.filter((r) => r.isCash).reduce((s, r) => s + r.valueEur, 0));
  const syncDate = today();
  const candidates = readCandidates(root);

  mkdirSync(join(root, "positions"), { recursive: true });
  mkdirSync(join(root, "journal"), { recursive: true });

  const synced: Array<{ row: DegiroPortfolioRow; ticker: string }> = [];
  const unresolved: string[] = [];
  for (const row of portfolio.filter((r) => !r.isCash)) {
    const candidate = resolveTicker(row, candidates);
    if (!candidate) {
      unresolved.push(`${row.product}${row.isin ? ` (${row.isin})` : ""}`);
      continue;
    }
    const ticker = updatePosition(root, row, candidate, row.isin ? txByIsin.get(row.isin) : undefined, totalValueEur, syncDate);
    promoteWatchlist(root, ticker, syncDate);
    synced.push({ row, ticker });
  }

  const marker = readMarker(root);
  marker["total-capital"] = totalValueEur;
  marker["capital-currency"] = "EUR";
  marker["cash-eur"] = cashEur;
  marker["last-broker-sync"] = new Date().toISOString();
  marker["broker"] = "DEGIRO";
  writeMarker(root, marker);

  const journal = writeJournal(root, syncDate, portfolioPath, transactionsPath, synced, totalValueEur, cashEur);

  console.log(`DEGIRO import synced ${synced.length} positions, EUR ${totalValueEur} capital, EUR ${cashEur} cash.`);
  console.log(`journal: ${journal}`);
  if (unresolved.length) {
    console.error("");
    console.error("Unresolved instruments; add a watchlist/position with ticker/company or an isin field, then rerun:");
    for (const u of unresolved) console.error(`  - ${u}`);
    return 1;
  }
  return 0;
}

export function cmdImport(args: string[]): number {
  const [kind, ...rest] = args;
  if (kind === "degiro") return runDegiro(rest);
  return usage();
}
