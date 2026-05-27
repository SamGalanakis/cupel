import { describe, expect, it } from "vitest";
// The mirroring logic is plain ESM in scripts/ (no build step); import it directly.
import { providerCopies, checkAll, hashTree } from "../../scripts/sync-skill-copies.mjs";

// The committed harness copies (.claude/skills/cupel, .cursor/skills/cupel, …)
// must stay byte-for-byte identical to canonical skills/cupel — they are what
// skills.sh and the agents discover, and at 0.3.0/0.4.0 they silently went
// stale. This test fails the moment they drift; the fix is `npm run sync:skills`.
describe("committed harness skill copies", () => {
  it("discovers the committed provider copies", () => {
    expect(providerCopies().length).toBeGreaterThan(0);
  });

  it("are byte-for-byte identical to skills/cupel", () => {
    const drifted = checkAll();
    expect(
      drifted,
      drifted.length
        ? `These copies drifted from skills/cupel — run \`npm run sync:skills\`:\n${drifted.join("\n")}`
        : "",
    ).toEqual([]);
  });

  it("hashes each copy to the same digest as canonical", () => {
    const copies = providerCopies();
    const digests = new Set(copies.map((c) => hashTree(c)));
    expect(digests.size).toBe(1);
  });
});
