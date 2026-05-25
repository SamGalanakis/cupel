import { describe, expect, it } from "vitest";
import { extractWikilinks, parseFrontmatter } from "../src/index.js";

describe("parseFrontmatter", () => {
  it("parses scalars and quoted values", () => {
    const { data, hasFrontmatter } = parseFrontmatter(
      ['---', 'ticker: AAPL', 'status: "watching"', '---', '', 'body here'].join("\n"),
    );
    expect(hasFrontmatter).toBe(true);
    expect(data.ticker).toBe("AAPL");
    expect(data.status).toBe("watching");
  });

  it("parses block lists", () => {
    const { data } = parseFrontmatter(
      ['---', 'sell-triggers:', '  - thesis breaks', '  - debt spikes', '---', 'x'].join("\n"),
    );
    expect(data["sell-triggers"]).toEqual(["thesis breaks", "debt spikes"]);
  });

  it("reports no frontmatter when absent", () => {
    const { hasFrontmatter, body } = parseFrontmatter("just prose");
    expect(hasFrontmatter).toBe(false);
    expect(body).toBe("just prose");
  });

  it("extracts wikilink targets, stripping anchors and aliases", () => {
    const links = extractWikilinks("see [[NVDA-thesis]] and [[EDGES#Professional|my edge]]");
    expect(links).toEqual(["NVDA-thesis", "EDGES"]);
  });
});
