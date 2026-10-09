import { describe, expect, it } from "vitest";
import { buildChangelogFileContents, resolveChangelogUrl } from "../pipeline/steps/GithubStep.js";

// Regression coverage for the broken "See full changelog" link in generated PR bodies.
// The link pointed at `blob/<sha>/changelog.md`, but the file was never committed in the
// self-hosted (non-replay) path, so the link 404'd. The link must only be emitted when
// changelog.md is actually tracked in the committed tree, and GithubStep reconstructs the
// file (see buildChangelogFileContents) so it lands in the pushed commit.

describe("resolveChangelogUrl", () => {
    const base = {
        remote: "github.com",
        owner: "acme",
        repo: "acme-sdk",
        headSha: "a".repeat(40)
    };

    it("emits the link when a changelog entry exists and the file is committed", () => {
        expect(
            resolveChangelogUrl({
                ...base,
                changelogEntry: "### 2.0.0\n- something",
                changelogCommitted: true
            })
        ).toBe(`https://github.com/acme/acme-sdk/blob/${"a".repeat(40)}/changelog.md`);
    });

    it("omits the link when changelog.md is NOT committed (would 404)", () => {
        expect(
            resolveChangelogUrl({
                ...base,
                changelogEntry: "### 2.0.0\n- something",
                changelogCommitted: false
            })
        ).toBeUndefined();
    });

    it("omits the link when there is no changelog entry", () => {
        expect(
            resolveChangelogUrl({
                ...base,
                changelogEntry: undefined,
                changelogCommitted: true
            })
        ).toBeUndefined();
    });

    it("omits the link when the changelog entry is blank", () => {
        expect(
            resolveChangelogUrl({
                ...base,
                changelogEntry: "   \n  ",
                changelogCommitted: true
            })
        ).toBeUndefined();
    });
});

describe("buildChangelogFileContents", () => {
    it("produces a versioned changelog block that matches the prependChangelogEntry format", () => {
        const contents = buildChangelogFileContents("- Added a new endpoint", "1.4.0");
        expect(contents.startsWith("# Changelog\n\n")).toBe(true);
        expect(contents).toMatch(/## \[1\.4\.0\] - \d{4}-\d{2}-\d{2}\n/);
        expect(contents).toContain("- Added a new endpoint");
        expect(contents.endsWith("\n\n")).toBe(true);
    });

    it("falls back to a dateless header when no version is known", () => {
        const contents = buildChangelogFileContents("- Regenerated SDK", undefined);
        expect(contents.startsWith("# Changelog\n\n")).toBe(true);
        expect(contents).toMatch(/## \d{4}-\d{2}-\d{2}\n/);
        expect(contents).not.toContain("[");
    });

    it("trims surrounding whitespace from the entry", () => {
        const contents = buildChangelogFileContents("\n\n- Trimmed entry\n\n", "2.0.0");
        expect(contents).toContain("- Trimmed entry\n\n");
        expect(contents).not.toContain("\n\n\n- Trimmed entry");
    });
});
