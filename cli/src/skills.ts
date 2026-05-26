import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, "../..");
const SKILL_SRC = join(PKG_ROOT, "skills", "cupel");
const PKG_JSON = join(PKG_ROOT, "package.json");

const PROVIDER_DIRS = [
  ".claude",
  ".cursor",
  ".gemini",
  ".agents",
  ".opencode",
  ".kiro",
  ".pi",
  ".qoder",
  ".trae",
  ".github",
];

const SKILL_FOLDER = "cupel";

// Sub-skill names cupel installed in the past but no longer ships. Add an entry
// here when renaming or merging a sub-skill. Each entry is the FOLDER NAME under
// `.<provider>/skills/`. The sweep verifies the folder is cupel-owned (its
// SKILL.md mentions "cupel") before deleting, so user-owned skills with the same
// name are safe.
const DEPRECATED_SUB_SKILLS: string[] = [];

function findProjectRoot(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 12; depth++) {
    if (existsSync(join(dir, ".git")) || existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function findExistingProviders(root: string): string[] {
  return PROVIDER_DIRS.filter((d) => existsSync(join(root, d)));
}

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      writeFileSync(d, readFileSync(s));
    }
  }
}

function pkgVersion(): string {
  try {
    return JSON.parse(readFileSync(PKG_JSON, "utf8")).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function installedVersion(skillRoot: string): string | null {
  const md = join(skillRoot, "SKILL.md");
  if (!existsSync(md)) return null;
  const content = readFileSync(md, "utf8");
  return content.match(/^version:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;
}

// Walk a directory and yield every file's relative + absolute path, sorted so
// the hash is deterministic across runs and platforms.
function* walkFiles(root: string, prefix = ""): Generator<{ rel: string; abs: string }> {
  const entries = readdirSync(root, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of entries) {
    const abs = join(root, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      yield* walkFiles(abs, rel);
    } else if (entry.isFile()) {
      yield { rel, abs };
    }
  }
}

// Content hash for a skill directory. The skill ships verbatim, so a fresh
// install is a byte-for-byte copy and its hash matches the source's.
function hashSkillDir(dir: string): string {
  if (!existsSync(dir)) return "";
  const overall = createHash("sha256");
  for (const { rel, abs } of walkFiles(dir)) {
    overall.update(rel);
    overall.update("\0");
    overall.update(readFileSync(abs));
    overall.update("\0");
  }
  return overall.digest("hex").slice(0, 12);
}

// True iff the directory looks like a cupel-owned skill: its SKILL.md
// frontmatter names it `cupel`. Guards against deleting unrelated user skills
// whose folder name collides with a deprecated entry.
function isCupelSkill(skillDir: string): boolean {
  const md = join(skillDir, "SKILL.md");
  if (!existsSync(md)) return false;
  try {
    const content = readFileSync(md, "utf8");
    return /^name:\s*cupel\b/m.test(content) || /\bcupel\b/i.test(content.slice(0, 800));
  } catch {
    return false;
  }
}

function ensureSkillSrc(): void {
  if (!existsSync(SKILL_SRC) || !existsSync(join(SKILL_SRC, "SKILL.md"))) {
    console.error(`Skill source not found at ${SKILL_SRC}.`);
    console.error("If you cloned the repo, run `npm install && npm run build` first.");
    process.exit(1);
  }
}

interface SkillArgs {
  providers: string[] | null;
  all: boolean;
  force: boolean;
}

function parseSkillArgs(args: string[]): SkillArgs {
  const out: SkillArgs = { providers: null, all: false, force: false };
  for (const a of args) {
    if (a === "--all") out.all = true;
    else if (a === "--force" || a === "-f") out.force = true;
    else if (a.startsWith("--provider=")) {
      const p = a.slice("--provider=".length);
      out.providers = (out.providers ?? []).concat(p.startsWith(".") ? p : `.${p}`);
    }
  }
  return out;
}

type SkillStatus =
  | { kind: "missing" }
  | { kind: "clean"; version: string }
  | { kind: "outdated"; version: string }
  | { kind: "modified"; version: string };

function skillStatus(installPath: string, srcHash: string, pkgVer: string): SkillStatus {
  if (!existsSync(join(installPath, "SKILL.md"))) return { kind: "missing" };
  const ver = installedVersion(installPath) ?? "?";
  if (ver !== pkgVer) return { kind: "outdated", version: ver };
  const installedHash = hashSkillDir(installPath);
  if (installedHash !== srcHash) return { kind: "modified", version: ver };
  return { kind: "clean", version: ver };
}

function formatStatus(provider: string, st: SkillStatus, pkgVer: string): string {
  const path = `${provider}/skills/${SKILL_FOLDER}`;
  switch (st.kind) {
    case "missing":
      return `  ${path}  not installed`;
    case "clean":
      return `  ${path}  v${st.version}  ✓ clean`;
    case "outdated":
      return `  ${path}  v${st.version} → v${pkgVer}  ↑ run \`cupel skills update\``;
    case "modified":
      return `  ${path}  v${st.version}  ✎ locally modified (use --force to overwrite)`;
  }
}

function sweepDeprecatedSubSkills(root: string): string[] {
  const deleted: string[] = [];
  if (DEPRECATED_SUB_SKILLS.length === 0) return deleted;
  for (const provider of PROVIDER_DIRS) {
    const skillsDir = join(root, provider, "skills");
    if (!existsSync(skillsDir)) continue;
    for (const name of DEPRECATED_SUB_SKILLS) {
      const target = join(skillsDir, name);
      let st;
      try {
        st = lstatSync(target);
      } catch {
        continue;
      }
      if (st.isSymbolicLink()) {
        const alive = existsSync(target);
        const safeToRemove = alive ? isCupelSkill(target) : true;
        if (safeToRemove) {
          unlinkSync(target);
          deleted.push(target);
        }
        continue;
      }
      if (st.isDirectory() && isCupelSkill(target)) {
        rmSync(target, { recursive: true, force: true });
        deleted.push(target);
      }
    }
  }
  return deleted;
}

export function cmdInstall(args: string[]): number {
  ensureSkillSrc();
  const root = findProjectRoot();
  const opts = parseSkillArgs(args);
  const srcHash = hashSkillDir(SKILL_SRC);
  const pkgVer = pkgVersion();

  let targets: string[] = opts.providers ?? findExistingProviders(root);
  if (opts.all) targets = PROVIDER_DIRS;
  if (targets.length === 0) {
    console.log("No AI harness directories detected in this project.");
    console.log("Installing to .claude/ by default. Pass --provider=.cursor (etc.) to choose.");
    targets = [".claude"];
  }

  let blocked = 0;
  for (const provider of targets) {
    const dest = join(root, provider, "skills", SKILL_FOLDER);
    const st = skillStatus(dest, srcHash, pkgVer);

    if (st.kind === "clean") {
      console.log(`up-to-date     ${provider}/skills/${SKILL_FOLDER}  (v${pkgVer})`);
      continue;
    }

    if (st.kind === "modified" && !opts.force) {
      console.log(
        `skipped        ${provider}/skills/${SKILL_FOLDER}  (v${st.version}): locally modified, pass --force to overwrite`,
      );
      blocked++;
      continue;
    }

    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    copyDir(SKILL_SRC, dest);
    console.log(`installed →    ${provider}/skills/${SKILL_FOLDER}  (v${pkgVer})`);
  }

  const swept = sweepDeprecatedSubSkills(root);
  for (const path of swept) {
    console.log(`removed (deprecated) → ${relative(root, path)}`);
  }

  return blocked > 0 ? 3 : 0;
}

export function cmdUpdate(args: string[]): number {
  const root = findProjectRoot();
  const opts = parseSkillArgs(args);
  const installed = findExistingProviders(root).filter((d) =>
    existsSync(join(root, d, "skills", SKILL_FOLDER)),
  );
  if (installed.length === 0 && !opts.providers && !opts.all) {
    console.log("Nothing to update. Run `cupel skills install` first.");
    return 0;
  }
  return cmdInstall(args);
}

export function cmdCheck(): number {
  const root = findProjectRoot();
  const srcHash = hashSkillDir(SKILL_SRC);
  const pkgVer = pkgVersion();
  const installed = findExistingProviders(root).filter((d) =>
    existsSync(join(root, d, "skills", SKILL_FOLDER, "SKILL.md")),
  );
  if (installed.length === 0) {
    console.log("cupel skill is not installed in this project.");
    console.log("Run `cupel skills install` to install.");
    return 0;
  }
  for (const provider of installed) {
    const dest = join(root, provider, "skills", SKILL_FOLDER);
    console.log(formatStatus(provider, skillStatus(dest, srcHash, pkgVer), pkgVer));
  }
  const swept = previewDeprecatedSweep(root);
  if (swept.length > 0) {
    console.log("");
    console.log("Deprecated installs detected. Run `cupel skills cleanup`:");
    for (const path of swept) console.log(`  ${relative(root, path)}`);
  }
  return 0;
}

function previewDeprecatedSweep(root: string): string[] {
  const candidates: string[] = [];
  if (DEPRECATED_SUB_SKILLS.length === 0) return candidates;
  for (const provider of PROVIDER_DIRS) {
    const skillsDir = join(root, provider, "skills");
    if (!existsSync(skillsDir)) continue;
    for (const name of DEPRECATED_SUB_SKILLS) {
      const target = join(skillsDir, name);
      try {
        const st = lstatSync(target);
        if (st.isSymbolicLink() && (!existsSync(target) || isCupelSkill(target))) {
          candidates.push(target);
        } else if (st.isDirectory() && isCupelSkill(target)) {
          candidates.push(target);
        }
      } catch {
        // not present
      }
    }
  }
  return candidates;
}

export function cmdCleanup(): number {
  const root = findProjectRoot();
  const swept = sweepDeprecatedSubSkills(root);
  if (swept.length === 0) {
    console.log("No deprecated cupel skill installs found.");
    return 0;
  }
  console.log(`Removed ${swept.length} deprecated install${swept.length === 1 ? "" : "s"}:`);
  for (const path of swept) console.log(`  ${relative(root, path)}`);
  return 0;
}

export function cmdSkillsHelp(): number {
  console.log(`cupel skills: manage the skill in your AI harness

  cupel skills install [--provider=.cursor ...] [--all] [--force]
        Install skills/cupel into each detected provider directory's skills/
        --provider=.NAME    install only into this provider (repeatable)
        --all               install into every supported provider
        --force, -f         overwrite even if the installed copy was edited locally

  cupel skills update [flags]
        Re-install the latest copy of the skill (use after \`npm update -g\`).

  cupel skills check
        Show installed versions + content-hash status side-by-side with the
        package. Marks each install clean / outdated / locally modified.

  cupel skills cleanup
        Remove cupel skill folders shipped under a deprecated name. Verifies
        each candidate is cupel-owned before deleting.

  cupel skills help
        Show this message

Supported providers: ${PROVIDER_DIRS.join(", ")}

  npm install -g @samgalanakis/cupel
  cd your-project && cupel skills install
`);
  return 0;
}

export async function runSkills(args: string[]): Promise<number> {
  const sub = args[0] ?? "help";
  switch (sub) {
    case "install":
      return cmdInstall(args.slice(1));
    case "update":
      return cmdUpdate(args.slice(1));
    case "check":
      return cmdCheck();
    case "cleanup":
      return cmdCleanup();
    case "help":
    case "-h":
    case "--help":
      return cmdSkillsHelp();
    default:
      console.error(`unknown skills subcommand: ${sub}`);
      cmdSkillsHelp();
      return 2;
  }
}
