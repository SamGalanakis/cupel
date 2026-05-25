#!/usr/bin/env node
// Assembles a Claude Cowork plugin package and zips it for upload.
//
// Usage:
//   node scripts/build-cowork-zip.mjs            # build + emit dist/cupel-cowork.zip
//   node scripts/build-cowork-zip.mjs --skip-build
//
// Cowork (and Claude Code) plugins share one format: a top-level folder with a
// `.claude-plugin/plugin.json` manifest and a `skills/<name>/` tree. Cowork
// users install it via Customize : Plugins : Install : upload zip.
//
// cupel's CLI has zero runtime dependencies (it imports only node: builtins),
// so we bundle the compiled `cli/dist` + `engine/dist` straight into the zip and
// expose it through `bin/cupel`. Cowork adds a plugin's bin/ to PATH, so the
// skill's `Bash(cupel *)` calls (e.g. `cupel where`, `cupel init`) run offline.

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, chmodSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skipBuild = process.argv.slice(2).includes('--skip-build');

function step(msg) { console.log(`\n→ ${msg}`); }
function ok(msg) { console.log(`✓ ${msg}`); }
function fail(msg) { console.error(`✗ ${msg}`); process.exit(1); }

const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const { version } = pkg;

const outDir = path.join(repoRoot, 'dist');
const stageRoot = path.join(outDir, 'cowork');   // working dir, gitignored
const pluginDir = path.join(stageRoot, 'cupel'); // the folder that gets zipped
const zipPath = path.join(outDir, 'cupel-cowork.zip');

// 1. Build (the CLI + engine must be compiled before we can copy dist/).
if (!skipBuild) {
  step('Building cli/dist + engine/dist');
  execSync('npm run build', { cwd: repoRoot, stdio: 'inherit' });
  ok('built');
}
for (const rel of ['cli/dist/index.js', 'engine/dist/index.js']) {
  if (!existsSync(path.join(repoRoot, rel))) {
    fail(`Missing ${rel}. Run "npm run build" first (or drop --skip-build).`);
  }
}

// 2. Stage a clean plugin tree.
step('Staging plugin tree');
rmSync(stageRoot, { recursive: true, force: true });
mkdirSync(path.join(pluginDir, '.claude-plugin'), { recursive: true });
mkdirSync(path.join(pluginDir, 'bin'), { recursive: true });

// Copy only the runtime JS from dist (skip .d.ts and .js.map to keep it small).
// cli/ and engine/ stay siblings so cli's `../../engine/dist` import resolves.
const jsOnly = (src) => !src.endsWith('.d.ts') && !src.endsWith('.js.map');
cpSync(path.join(repoRoot, 'cli/dist'), path.join(pluginDir, 'cli/dist'), { recursive: true, filter: jsOnly });
cpSync(path.join(repoRoot, 'engine/dist'), path.join(pluginDir, 'engine/dist'), { recursive: true, filter: jsOnly });

// The skill ships verbatim. The committed skills/cupel tree is the exact form
// every harness (here, Cowork) reads.
cpSync(path.join(repoRoot, 'skills/cupel'), path.join(pluginDir, 'skills/cupel'), { recursive: true });

// package.json so the bundled CLI can read its own version at runtime.
writeFileSync(
  path.join(pluginDir, 'package.json'),
  JSON.stringify({ name: pkg.name, version, type: 'module', bin: pkg.bin }, null, 2) + '\n',
);

// 3. bin/cupel wrapper — runs the bundled CLI with whatever node Cowork provides.
const wrapper = `#!/usr/bin/env sh
# Bundled cupel CLI launcher (zero npm deps; needs only node on PATH).
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec node "$DIR/../cli/dist/index.js" "$@"
`;
const wrapperPath = path.join(pluginDir, 'bin/cupel');
writeFileSync(wrapperPath, wrapper);
chmodSync(wrapperPath, 0o755);

// 4. Manifest. Cowork tracks updates off plugin.json `version`; version.json is
// kept too since the format Cowork itself generates uses it.
const manifest = {
  name: 'cupel',
  description: pkg.description,
  version,
  author: { name: pkg.author },
  homepage: pkg.homepage,
  repository: pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, ''),
  license: pkg.license,
  keywords: pkg.keywords,
};
writeFileSync(
  path.join(pluginDir, '.claude-plugin/plugin.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
writeFileSync(path.join(pluginDir, 'version.json'), JSON.stringify({ version }, null, 2) + '\n');

writeFileSync(path.join(pluginDir, 'README.md'), `# cupel — Claude Cowork plugin

Your investing research companion. Bundles the cupel CLI (no install needed).

## Install in Cowork
Customize → Plugins → Install → upload \`cupel-cowork.zip\`.

Then in chat: \`/cupel\`. Run \`cupel init\` once to create your office (the
folder where cupel keeps your edges, watchlist, theses, positions, and decision
journal). Requires only \`node\` in the sandbox.

Built from https://github.com/SamGalanakis/cupel — v${version}.
`);
ok('staged');

// 5. Zip it (system zip preserves the bin/ exec bit).
step('Zipping');
rmSync(zipPath, { force: true });
execSync(`zip -rq "${zipPath}" cupel`, { cwd: stageRoot, stdio: 'inherit' });
const size = (execSync(`du -h "${zipPath}"`, { encoding: 'utf8' }).split('\t')[0] || '').trim();
ok(`wrote ${path.relative(repoRoot, zipPath)} (${size})`);
