import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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

  const marker = join(root, OFFICE_MARKER);
  if (!existsSync(marker)) {
    writeFileSync(
      marker,
      JSON.stringify({ created: new Date().toISOString(), version: VERSION }, null, 2) + "\n",
    );
    created.push(OFFICE_MARKER);
  }

  console.log(`cupel office: ${root}`);
  if (created.length) console.log(`  created: ${created.join(", ")}`);
  if (skipped.length) console.log(`  kept:    ${skipped.join(", ")}`);
  console.log("");
  console.log("Next: open your harness and run `/cupel` to start onboarding.");
  if (process.env.CUPEL_HOME) {
    console.log(`(CUPEL_HOME is set, so the office lives at ${root}.)`);
  } else {
    console.log("Tip: keep ~/cupel under git so your decision journal is versioned.");
  }
  return 0;
}

export function cmdWhere(): number {
  const root = officePath();
  console.log(root);
  if (!isOffice(root)) {
    console.error(`(no office found here yet — run \`cupel init\`)`);
    return 1;
  }
  return 0;
}
