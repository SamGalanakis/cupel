import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { OFFICE_DIRS, OFFICE_FILES, OFFICE_MARKER, VERSION } from "../../engine/dist/index.js";

// Where the office lives. CUPEL_HOME overrides; otherwise ~/cupel.
export function officePath(): string {
  const env = process.env.CUPEL_HOME;
  if (env && env.trim()) {
    return isAbsolute(env) ? env : resolve(process.cwd(), env);
  }
  return join(homedir(), "cupel");
}

export function isOffice(dir: string): boolean {
  return existsSync(join(dir, OFFICE_MARKER));
}

interface Marker {
  created?: string;
  version?: string;
  // last-pulse / last-brief (ISO strings), total-capital (number), capital-currency, ...
  [event: string]: string | number | undefined;
}

function readMarker(root: string): Marker {
  try {
    return JSON.parse(readFileSync(join(root, OFFICE_MARKER), "utf8"));
  } catch {
    return {};
  }
}

function writeMarker(root: string, marker: Marker): void {
  writeFileSync(join(root, OFFICE_MARKER), JSON.stringify(marker, null, 2) + "\n");
}

// Scaffold the office. Idempotent: never overwrites a file that already exists,
// so re-running after you've started filling things in is safe.
export function cmdInit(): number {
  const root = officePath();
  const created: string[] = [];
  const skipped: string[] = [];

  mkdirSync(root, { recursive: true });

  for (const dir of OFFICE_DIRS) {
    const d = join(root, dir);
    if (existsSync(d)) {
      skipped.push(`${dir}/`);
    } else {
      mkdirSync(d, { recursive: true });
      writeFileSync(join(d, ".gitkeep"), "");
      created.push(`${dir}/`);
    }
  }

  for (const file of OFFICE_FILES) {
    const f = join(root, file.path);
    if (existsSync(f)) {
      skipped.push(file.path);
    } else {
      writeFileSync(f, file.content);
      created.push(file.path);
    }
  }

  if (!isOffice(root)) {
    writeMarker(root, { created: new Date().toISOString(), version: VERSION });
    created.push(OFFICE_MARKER);
  }

  console.log(`cupel office: ${root}`);
  if (created.length) console.log(`  created: ${created.join(", ")}`);
  if (skipped.length) console.log(`  kept:    ${skipped.join(", ")}`);
  console.log("");
  console.log("Next: open your harness and run `/cupel` to start onboarding.");
  console.log(
    process.env.CUPEL_HOME
      ? `(CUPEL_HOME is set, so the office lives at ${root}.)`
      : "Tip: keep ~/cupel under git so your decision journal is versioned.",
  );
  return 0;
}

export function cmdWhere(): number {
  const root = officePath();
  console.log(root);
  if (!isOffice(root)) {
    console.error("(no office found here yet — run `cupel init`)");
    return 1;
  }
  return 0;
}

// Record that an event happened "now" in the office marker, e.g.
// `cupel stamp pulse` sets last-pulse. Used by the skill at the end of a
// pulse/brief so the front door can report how long it's been.
export function cmdStamp(args: string[]): number {
  const event = args[0];
  if (!event || !/^[a-z][a-z0-9-]*$/.test(event)) {
    console.error("usage: cupel stamp <event>   (e.g. cupel stamp pulse)");
    return 2;
  }
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }
  const marker = readMarker(root);
  marker[`last-${event}`] = new Date().toISOString();
  writeMarker(root, marker);
  console.log(`stamped last-${event} = ${marker[`last-${event}`]}`);
  return 0;
}

// Set or show the total investable capital — the anchor that lets `cupel
// portfolio` translate allocation percentages into money (value and gain). It's
// a single figure the user maintains; cupel never fetches account balances.
//   cupel capital              → print the current figure
//   cupel capital 28000 EUR    → set it (currency optional)
export function cmdCapital(args: string[]): number {
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }
  const marker = readMarker(root);
  if (args[0] === undefined) {
    const cur = typeof marker["capital-currency"] === "string" ? marker["capital-currency"] + " " : "";
    const amt = marker["total-capital"];
    console.log(
      typeof amt === "number"
        ? `total-capital = ${cur}${amt.toLocaleString()}`
        : "no total-capital set — try: cupel capital 28000 EUR",
    );
    return 0;
  }
  const amount = Number(args[0].replace(/[,_]/g, ""));
  if (!Number.isFinite(amount) || amount < 0) {
    console.error("usage: cupel capital <amount> [currency]   (e.g. cupel capital 28000 EUR)");
    return 2;
  }
  marker["total-capital"] = amount;
  if (args[1] && args[1].trim()) marker["capital-currency"] = args[1].trim().toUpperCase();
  writeMarker(root, marker);
  const cur = typeof marker["capital-currency"] === "string" ? marker["capital-currency"] + " " : "";
  console.log(`total-capital = ${cur}${amount.toLocaleString()}`);
  return 0;
}
