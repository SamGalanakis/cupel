// DEGIRO CSV import helpers. These stay pure: parse the broker exports into
// typed rows and derive the account math. The CLI owns filesystem writes.

export interface DegiroPortfolioRow {
  product: string;
  isin?: string;
  amount?: number;
  closing?: number;
  currency: string;
  localValue: number;
  valueEur: number;
  isCash: boolean;
}

export interface DegiroTransactionRow {
  date: string; // YYYY-MM-DD
  time: string;
  product: string;
  isin: string;
  referenceExchange?: string;
  venue?: string;
  quantity: number;
  price: number;
  currency: string;
  localValue: number;
  valueEur: number;
  exchangeRate?: number;
  autoFxFeeEur?: number;
  transactionFeesEur?: number;
  totalEur: number;
  orderId?: string;
}

export interface DegiroTransactionAggregate {
  isin: string;
  product: string;
  quantity: number;
  averagePrice?: number;
  currency?: string;
  totalCostEur: number;
  totalFeesEur: number;
  firstDate?: string;
  fills: DegiroTransactionRow[];
}

export interface DegiroAccountSummary {
  totalValueEur: number;
  cashEur: number;
  positionsValueEur: number;
  positions: DegiroPortfolioRow[];
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function num(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const s = v.trim();
  if (!s) return undefined;
  const normalized = s.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

function requiredNum(v: string | undefined, label: string): number {
  const n = num(v);
  if (n === undefined) throw new Error(`could not parse ${label}: ${v ?? "<empty>"}`);
  return n;
}

function isoDate(d: string): string {
  const m = d.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return d.trim();
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function parseDegiroPortfolioCsv(text: string): DegiroPortfolioRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  return rows.slice(1).map((r) => {
    const product = (r[0] ?? "").trim();
    const currency = (r[4] ?? "").trim();
    const isCash = product.toUpperCase().includes("CASH");
    return {
      product,
      isin: (r[1] ?? "").trim() || undefined,
      amount: num(r[2]),
      closing: num(r[3]),
      currency,
      localValue: requiredNum(r[5], `${product} local value`),
      valueEur: requiredNum(r[6], `${product} EUR value`),
      isCash,
    };
  });
}

export function parseDegiroTransactionsCsv(text: string): DegiroTransactionRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  return rows.slice(1).map((r) => ({
    date: isoDate(r[0] ?? ""),
    time: (r[1] ?? "").trim(),
    product: (r[2] ?? "").trim(),
    isin: (r[3] ?? "").trim(),
    referenceExchange: (r[4] ?? "").trim() || undefined,
    venue: (r[5] ?? "").trim() || undefined,
    quantity: requiredNum(r[6], "transaction quantity"),
    price: requiredNum(r[7], "transaction price"),
    currency: (r[8] ?? "").trim(),
    localValue: requiredNum(r[9], "transaction local value"),
    valueEur: requiredNum(r[11], "transaction EUR value"),
    exchangeRate: num(r[12]),
    autoFxFeeEur: num(r[13]),
    transactionFeesEur: num(r[14]),
    totalEur: requiredNum(r[15], "transaction total EUR"),
    orderId: (r[17] ?? r[16] ?? "").trim() || undefined,
  }));
}

export function summarizeDegiroAccount(rows: DegiroPortfolioRow[]): DegiroAccountSummary {
  const totalValueEur = round2(rows.reduce((s, r) => s + r.valueEur, 0));
  const cashEur = round2(rows.filter((r) => r.isCash).reduce((s, r) => s + r.valueEur, 0));
  const positions = rows.filter((r) => !r.isCash);
  return {
    totalValueEur,
    cashEur,
    positionsValueEur: round2(totalValueEur - cashEur),
    positions,
  };
}

export function aggregateDegiroTransactions(rows: DegiroTransactionRow[]): Map<string, DegiroTransactionAggregate> {
  const byIsin = new Map<string, DegiroTransactionAggregate>();
  for (const tx of rows) {
    if (!tx.isin) continue;
    let a = byIsin.get(tx.isin);
    if (!a) {
      a = {
        isin: tx.isin,
        product: tx.product,
        quantity: 0,
        totalCostEur: 0,
        totalFeesEur: 0,
        fills: [],
      };
      byIsin.set(tx.isin, a);
    }
    a.quantity += tx.quantity;
    if (tx.totalEur < 0) a.totalCostEur += -tx.totalEur;
    else a.totalCostEur -= tx.totalEur;
    a.totalFeesEur += Math.abs(tx.autoFxFeeEur ?? 0) + Math.abs(tx.transactionFeesEur ?? 0);
    a.currency ??= tx.currency;
    a.firstDate = a.firstDate && a.firstDate < tx.date ? a.firstDate : tx.date;
    a.fills.push(tx);
  }

  for (const a of byIsin.values()) {
    const buys = a.fills.filter((f) => f.quantity > 0);
    const qty = buys.reduce((s, f) => s + f.quantity, 0);
    if (qty > 0) {
      a.averagePrice = round4(buys.reduce((s, f) => s + f.quantity * f.price, 0) / qty);
    }
    a.quantity = round4(a.quantity);
    a.totalCostEur = round2(a.totalCostEur);
    a.totalFeesEur = round2(a.totalFeesEur);
  }
  return byIsin;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

