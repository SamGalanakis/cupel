// A tiny, zero-dependency parser for the YAML frontmatter subset cupel uses in
// its Obsidian-compatible notes: top-level `key: value` scalars and simple
// block lists (`key:` then `- item` lines). That's all the office schema needs;
// anything fancier is out of scope on purpose.

export type FrontmatterValue = string | string[];

export interface ParsedFrontmatter {
  data: Record<string, FrontmatterValue>;
  body: string;
  hasFrontmatter: boolean;
  error?: string;
}

function unquote(s: string): string {
  return s.replace(/^["']|["']$/g, "");
}

export function parseFrontmatter(text: string): ParsedFrontmatter {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text, hasFrontmatter: false };

  const [, raw, body] = m;
  const data: Record<string, FrontmatterValue> = {};
  let currentKey: string | null = null;
  let list: string[] | null = null;
  let error: string | undefined;

  const commitList = () => {
    if (currentKey && list) data[currentKey] = list;
    list = null;
  };

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && currentKey) {
      (list ??= []).push(unquote(item[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      commitList();
      currentKey = kv[1];
      const val = kv[2].trim();
      data[currentKey] = val === "" ? "" : unquote(val);
      continue;
    }

    error = `unparseable frontmatter line: ${line.trim()}`;
  }
  commitList();

  return { data, body, hasFrontmatter: true, error };
}

// Extract every wikilink target from note body + frontmatter values. Strips
// the section anchor (`#sec`) and alias (`|text`), returning the note name only.
export function extractWikilinks(text: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const target = m[1].split("|")[0].split("#")[0].trim();
    if (target) out.push(target);
  }
  return out;
}
