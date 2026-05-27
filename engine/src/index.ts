import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Single source of truth for the version: the package manifest. engine/dist
// lives at engine/dist/index.js, so the manifest is two levels up.
const here = dirname(fileURLToPath(import.meta.url));
export const VERSION: string = JSON.parse(
  readFileSync(join(here, "../../package.json"), "utf8"),
).version;

export {
  OFFICE_MARKER,
  OFFICE_DIRS,
  OFFICE_FILES,
  REQUIRED_FIELDS,
  RECOMMENDED_FIELDS,
  noteTypeForPath,
} from "./office.js";
export type { OfficeDir, OfficeFile, NoteType } from "./office.js";

export { parseFrontmatter, extractWikilinks } from "./frontmatter.js";
export type { ParsedFrontmatter, FrontmatterValue } from "./frontmatter.js";

export { lintNote, mandateSettings, slugify } from "./lint.js";
export type { Finding, LintContext, OfficeNote, Severity } from "./lint.js";

export { summarizePortfolio } from "./portfolio.js";
export type { PositionEntry, PortfolioSummary } from "./portfolio.js";
