#!/usr/bin/env node
// Mirror the canonical skill (skills/cupel/) into every committed harness copy
// (.claude/skills/cupel, .cursor/skills/cupel, …). Those copies are committed so
// skills.sh and each agent can discover the skill; this keeps them byte-for-byte
// identical to the source so they can never drift out of sync (which is exactly
// what happened at 0.3.0/0.4.0, leaving the copies missing `scout`).
//
// Usage:
//   node scripts/sync-skill-copies.mjs            # re-mirror every committed copy
//   node scripts/sync-skill-copies.mjs --check    # exit 1 if any copy drifted
//
// `npm run sync:skills` wraps the first form; the release script and the
// skill-copies test both call into this module so there is one source of truth.

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SKILL_FOLDER = "cupel";
const CANONICAL = path.join(repoRoot, "skills", SKILL_FOLDER);

// The committed harness copies define themselves: any top-level dotted directory
// that already holds `skills/cupel/SKILL.md`. Deriving the set from the repo —
// rather than a second hardcoded provider list — means it can never disagree
// with the list `cupel skills install` maintains.
export function providerCopies() {
  return readdirSync(repoRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("."))
    .map((e) => path.join(repoRoot, e.name, "skills", SKILL_FOLDER))
    .filter((dir) => existsSync(path.join(dir, "SKILL.md")));
}

function* walkFiles(root, prefix = "") {
  const entries = readdirSync(root, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of entries) {
    const abs = path.join(root, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) yield* walkFiles(abs, rel);
    else if (entry.isFile()) yield { rel, abs };
  }
}

// Content hash of a skill tree: relative path + bytes of every file, sorted, so
// it is deterministic across runs and platforms. Matches the scheme the
// `cupel skills` CLI uses to decide whether an install is up to date.
export function hashTree(dir) {
  if (!existsSync(dir)) return "";
  const h = createHash("sha256");
  for (const { rel, abs } of walkFiles(dir)) {
    h.update(rel);
    h.update("\0");
    h.update(readFileSync(abs));
    h.update("\0");
  }
  return h.digest("hex").slice(0, 12);
}

function mirror(dest) {
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  for (const { rel, abs } of walkFiles(CANONICAL)) {
    const out = path.join(dest, rel);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, readFileSync(abs));
  }
}

// Re-mirror every committed copy that differs from canonical. Returns the
// repo-relative paths that were rewritten.
export function syncAll() {
  const want = hashTree(CANONICAL);
  const synced = [];
  for (const dest of providerCopies()) {
    if (hashTree(dest) !== want) {
      mirror(dest);
      synced.push(path.relative(repoRoot, dest));
    }
  }
  return synced;
}

// Repo-relative paths of every committed copy that has drifted from canonical.
export function checkAll() {
  const want = hashTree(CANONICAL);
  return providerCopies()
    .filter((dest) => hashTree(dest) !== want)
    .map((dest) => path.relative(repoRoot, dest));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.slice(2).includes("--check")) {
    const drifted = checkAll();
    if (drifted.length) {
      console.error("✗ harness skill copies drifted from skills/cupel:");
      for (const d of drifted) console.error(`  ${d}`);
      console.error("Run `npm run sync:skills` to re-mirror.");
      process.exit(1);
    }
    console.log("✓ all harness skill copies match skills/cupel");
  } else {
    const synced = syncAll();
    if (synced.length === 0) {
      console.log("✓ harness skill copies already match skills/cupel");
    } else {
      console.log(`✓ re-mirrored ${synced.length} cop${synced.length === 1 ? "y" : "ies"} from skills/cupel:`);
      for (const d of synced) console.log(`  ${d}`);
    }
  }
}
