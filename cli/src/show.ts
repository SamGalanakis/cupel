import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, slugify } from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

// `cupel show <ticker>` — the "where were we" command. Gathers every note in
// the office that concerns a ticker (watchlist, position, theses, journal
// entries) and prints them, so the companion can resume context in one step
// instead of globbing the vault by hand.
//
// Matching is by *slug*, not exact filename, so a dotted ticker resolves to its
// hyphen file the same way wikilinks do: `cupel show SOP.PA` finds SOP-PA.md and
// SOP-PA-thesis.md. (Before this, dotted European tickers silently returned
// nothing — and the front door tells the model to run `show` first.)
export function cmdShow(args: string[]): number {
  const display = (args[0] ?? "").toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
  if (!display) {
    console.error("usage: cupel show <ticker>");
    return 2;
  }
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }
  const slug = slugify(display);

  const mdNames = (dir: string): string[] => {
    const abs = join(root, dir);
    return existsSync(abs) ? readdirSync(abs).filter((n) => n.toLowerCase().endsWith(".md")) : [];
  };

  const hits: string[] = [];
  // watchlist + positions: the note whose slug matches the ticker.
  for (const dir of ["watchlist", "positions"]) {
    for (const name of mdNames(dir)) {
      if (slugify(name) === slug) hits.push(`${dir}/${name}`);
    }
  }
  // theses: <TICKER>-thesis.md, slug-matched.
  for (const name of mdNames("theses")) {
    if (slugify(name) === `${slug}-thesis`) hits.push(`theses/${name}`);
  }
  // journal: entries whose frontmatter ticker matches by slug (most recent first).
  const journalHits: string[] = [];
  for (const name of mdNames("journal")) {
    const { data } = parseFrontmatter(readFileSync(join(root, "journal", name), "utf8"));
    if (typeof data.ticker === "string" && slugify(data.ticker) === slug) {
      journalHits.push(`journal/${name}`);
    }
  }
  journalHits.sort().reverse(); // dated filenames — newest first
  hits.push(...journalHits);

  if (hits.length === 0) {
    console.log(`No notes for ${display} yet. Start one with /cupel watch ${display}.`);
    return 0;
  }

  console.log(`# Office notes for ${display}\n`);
  for (const rel of hits) {
    console.log(`\n===== ${rel} =====`);
    console.log(readFileSync(join(root, rel), "utf8").trimEnd());
  }
  return 0;
}
