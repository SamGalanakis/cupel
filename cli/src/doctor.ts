import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  lintNote,
  mandateSettings,
  OFFICE_MARKER,
  parseFrontmatter,
  slugify,
  summarizePortfolio,
  type Finding,
  type LintContext,
  type Severity,
} from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";
import { readPositions } from "./portfolio.js";

const SOURCE_STALE_DAYS = 30;
const PULSE_STALE_DAYS = 14;
// A recorded price/figures date older than this gets a "re-verify before acting"
// nudge — markets move fast enough that a six-week-old snapshot can mislead.
const FIGURES_STALE_DAYS = 45;

function* walkMarkdown(root: string, prefix = ""): Generator<string> {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdown(abs, rel);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      yield rel;
    }
  }
}

const COLOR: Record<Severity, string> = { error: "\x1b[31m", warning: "\x1b[33m", info: "\x1b[36m" };
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const tty = () => Boolean(process.stdout.isTTY);
const c = (text: string, code: string) => (tty() ? `${code}${text}${RESET}` : text);

function daysSinceIso(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

export function cmdDoctor(): number {
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }

  const notes = [...walkMarkdown(root)].map((rel) => ({
    rel,
    text: readFileSync(join(root, rel), "utf8"),
  }));

  // Every note resolves by its slugified basename and by any frontmatter alias,
  // so display-name links like [[Pragmatic Infra Letter]] find the slug file.
  const knownNotes = new Set<string>();
  for (const n of notes) {
    knownNotes.add(slugify(n.rel));
    const aliases = parseFrontmatter(n.text).data.aliases;
    if (typeof aliases === "string" && aliases.trim()) knownNotes.add(slugify(aliases));
    else if (Array.isArray(aliases)) for (const a of aliases) knownNotes.add(slugify(a));
  }

  const mandatePath = join(root, "MANDATE.md");
  const { maxPositionPct, satelliteTargetPct, reviewStaleDays } = mandateSettings(
    existsSync(mandatePath) ? readFileSync(mandatePath, "utf8") : null,
  );

  const ctx: LintContext = {
    knownNotes,
    maxPositionPct,
    reviewStaleDays,
    sourceStaleDays: SOURCE_STALE_DAYS,
    figuresStaleDays: FIGURES_STALE_DAYS,
    today: new Date(),
  };

  const findings: Finding[] = [];
  for (const n of notes) {
    findings.push(...lintNote({ path: n.rel, text: n.text }, ctx));
  }

  // Office-level: how long since the last pulse?
  let pulseNote: string | null = null;
  try {
    const marker = JSON.parse(readFileSync(join(root, OFFICE_MARKER), "utf8"));
    const d = daysSinceIso(marker["last-pulse"]);
    if (d === null) pulseNote = "no pulse recorded yet — try /cupel pulse";
    else if (d > PULSE_STALE_DAYS) pulseNote = `last pulse was ${d} days ago — try /cupel pulse`;
  } catch {
    /* marker unreadable; init would have created it */
  }

  // Office-level: satellite allocation vs. the declared target, and how much
  // sits in cash (the remainder once core + satellite are counted). Pure
  // arithmetic over the sizes you set; per-position cap breaches are flagged per
  // note above. What to do about it is the model's call, not the code's.
  const portfolio = summarizePortfolio(readPositions(root), { maxPositionPct, satelliteTargetPct });
  const allocNote = portfolio.overTarget
    ? `satellite ${portfolio.satellitePct}% over ${satelliteTargetPct}% target`
    : null;
  // Surface a large idle-cash remainder or an over-allocation (sizes summing
  // past 100% means stale size-pcts) — both are easy to miss in prose.
  const cashNote =
    portfolio.count === 0
      ? null
      : portfolio.cashPct < 0
        ? `positions sum to ${portfolio.investedPct}% (>100%) — size-pcts need a refresh`
        : portfolio.cashPct >= 25
          ? `${portfolio.cashPct}% sits in cash (core ${portfolio.corePct}% / satellite ${portfolio.satellitePct}%)`
          : null;

  // Report.
  const totals: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
  const byPath = new Map<string, Finding[]>();
  for (const f of findings) {
    totals[f.severity]++;
    const list = byPath.get(f.path);
    if (list) list.push(f);
    else byPath.set(f.path, [f]);
  }

  console.log(c(`cupel doctor — ${root}`, BOLD));
  if (pulseNote) console.log(`  ${c("PULSE".padEnd(7), COLOR.info)} ${pulseNote}`);
  if (allocNote) console.log(`  ${c("ALLOC".padEnd(7), COLOR.warning)} ${allocNote}`);
  if (cashNote) console.log(`  ${c("CASH".padEnd(7), COLOR.info)} ${cashNote}`);

  if (findings.length === 0) {
    console.log(`  ${c("office is consistent", "\x1b[32m")}`);
  } else {
    for (const [path, fs] of [...byPath.entries()].sort()) {
      console.log(`\n  ${c(path, BOLD)}`);
      for (const f of fs) {
        console.log(`    ${c(f.severity.toUpperCase().padEnd(7), COLOR[f.severity])} ${c(f.rule, DIM)}  ${f.message}`);
      }
    }
    console.log("");
    const parts = (["error", "warning", "info"] as Severity[])
      .filter((k) => totals[k] > 0)
      .map((k) => c(`${totals[k]} ${k}${totals[k] === 1 ? "" : "s"}`, COLOR[k]));
    console.log(parts.join(" · "));
  }

  return totals.error > 0 ? 1 : 0;
}
