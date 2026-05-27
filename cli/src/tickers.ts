import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "../../engine/dist/index.js";
import { isOffice, officePath } from "./office.js";

// `cupel tickers` — every ticker the office already knows (watchlist, positions,
// theses), deduped and sorted, space-separated for easy pasting. Its job is to
// make `scout` dedupe automatic: hand this list to the scout so it never
// re-surfaces a name already covered, instead of maintaining the exclude list by
// hand. The count goes to stderr so stdout stays a clean, pipeable list.
export function cmdTickers(): number {
  const root = officePath();
  if (!isOffice(root)) {
    console.error(`No cupel office at ${root}. Run \`cupel init\` first.`);
    return 1;
  }

  const set = new Set<string>();
  const addFrom = (subdir: string, stripThesis = false) => {
    const dir = join(root, subdir);
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      if (!name.toLowerCase().endsWith(".md")) continue;
      const { data } = parseFrontmatter(readFileSync(join(dir, name), "utf8"));
      let t = typeof data.ticker === "string" && data.ticker.trim() ? data.ticker.trim() : name.replace(/\.md$/i, "");
      if (stripThesis) t = t.replace(/-thesis$/i, "");
      if (t) set.add(t.toUpperCase());
    }
  };
  addFrom("watchlist");
  addFrom("positions");
  addFrom("theses", true);

  const list = [...set].sort();
  if (list.length === 0) {
    console.error("no tickers in the office yet");
    return 0;
  }
  console.log(list.join(" "));
  console.error(`${list.length} tickers`);
  return 0;
}
