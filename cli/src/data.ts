import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { isOffice, officePath } from "./office.js";

function findOnPath(bin: string): string | null {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    const path = join(dir, bin);
    if (existsSync(path)) return path;
  }
  return null;
}

function fileMentions(path: string, needle: string): boolean {
  try {
    return readFileSync(path, "utf8").toLowerCase().includes(needle.toLowerCase());
  } catch {
    return false;
  }
}

function usage(): number {
  console.error("usage: cupel data doctor");
  return 2;
}

export function cmdData(args: string[]): number {
  if (args[0] !== "doctor") return usage();

  const root = officePath();
  const profilePath = join(root, "PROFILE.md");
  const hasOffice = isOffice(root);
  const profileMentionsOpenbb = hasOffice && fileMentions(profilePath, "OpenBB");
  const profileMentionsDegiro = hasOffice && fileMentions(profilePath, "DEGIRO");
  const openbb = findOnPath("openbb-mcp");
  const codexConfig = join(homedir(), ".codex", "config.toml");
  const claudeConfig = join(homedir(), ".config", "claude", "claude_desktop_config.json");
  const codexMentionsOpenbb = fileMentions(codexConfig, "openbb");
  const claudeMentionsOpenbb = fileMentions(claudeConfig, "openbb");

  console.log("cupel data doctor");
  console.log(`  office: ${hasOffice ? root : "missing (run cupel init)"}`);
  console.log(`  PROFILE market data: ${profileMentionsOpenbb ? "OpenBB mentioned" : "not recorded"}`);
  console.log(`  PROFILE broker setup: ${profileMentionsDegiro ? "DEGIRO mentioned" : "no DEGIRO mention"}`);
  console.log(`  openbb-mcp binary: ${openbb ?? "not found on PATH"}`);
  console.log(`  Codex config: ${codexMentionsOpenbb ? "mentions openbb" : "no openbb entry found"} (${codexConfig})`);
  console.log(`  Claude desktop config: ${claudeMentionsOpenbb ? "mentions openbb" : "no openbb entry found"} (${claudeConfig})`);

  if (!openbb || !profileMentionsOpenbb || (!codexMentionsOpenbb && !claudeMentionsOpenbb)) {
    console.log("");
    console.log("Recommended setup:");
    console.log("  uv tool install openbb-mcp-server --with openbb-equity --with openbb-yfinance --with openbb-currency --with openbb-etf --with openbb-index --with openbb-news");
    console.log("  add openbb-mcp --transport stdio to the harness MCP config, then restart the harness");
  }
  if (profileMentionsDegiro) {
    console.log("");
    console.log("DEGIRO setup:");
    console.log("  cupel import degiro --portfolio Portfolio.csv --transactions Transactions.csv");
    console.log("  optional live-read package: https://github.com/icastillejogomez/degiro-api");
    console.log("  install/configure it only after user confirmation; keep it read-only unless a fresh explicit broker action is requested");
  }
  return openbb ? 0 : 1;
}
