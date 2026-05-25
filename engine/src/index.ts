import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Single source of truth for the version: the package manifest. engine/dist
// lives at engine/dist/index.js, so the manifest is two levels up.
const here = dirname(fileURLToPath(import.meta.url));
export const VERSION: string = JSON.parse(
  readFileSync(join(here, "../../package.json"), "utf8"),
).version;

export { OFFICE_MARKER, OFFICE_DIRS, OFFICE_FILES } from "./office.js";
export type { OfficeDir, OfficeFile } from "./office.js";
