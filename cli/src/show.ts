import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

// `cupel show <ticker>` — the "where were we" command. Gathers every note in
// the office that concerns a ticker (watchlist, position, theses, journal
// entries) and prints them, so the companion can resume context in one step
// instead of globbing the vault by hand.
export function cmdShow(args: string[]): number {
  const ticker = (args[0] ?? "").toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
  if (!ticker) {
    console.error("usage: cupel show <ticker>");
    return 2;
  }
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }

  const hits: string[] = [];
  const tryFile = (rel: string) => {
    if (existsSync(join(root, rel))) hits.push(rel);
  };
  tryFile(`watchlist/${ticker}.md`);
  tryFile(`positions/${ticker}.md`);

  // Theses: any file in theses/ whose name starts with the ticker.
  const thesesDir = join(root, "theses");
  if (existsSync(thesesDir)) {
    for (const name of readdirSync(thesesDir)) {
      if (name.toLowerCase().endsWith(".md") && name.toUpperCase().startsWith(ticker)) {
        hits.push(`theses/${name}`);
      }
    }
  }

  // Journal: entries whose frontmatter ticker matches.
  const journalDir = join(root, "journal");
  const journalHits: string[] = [];
  if (existsSync(journalDir)) {
    for (const name of readdirSync(journalDir)) {
      if (!name.toLowerCase().endsWith(".md")) continue;
      const text = readFileSync(join(journalDir, name), "utf8");
      const { data } = parseFrontmatter(text);
      if (typeof data.ticker === "string" && data.ticker.toUpperCase() === ticker) {
        journalHits.push(`journal/${name}`);
      }
    }
  }
  journalHits.sort().reverse(); // most recent first (dated filenames)
  hits.push(...journalHits);

  if (hits.length === 0) {
    console.log(`No notes for ${ticker} yet. Start one with /cupel watch ${ticker}.`);
    return 0;
  }

  console.log(`# Office notes for ${ticker}\n`);
  for (const rel of hits) {
    console.log(`\n===== ${rel} =====`);
    console.log(readFileSync(join(root, rel), "utf8").trimEnd());
  }
  return 0;
}
