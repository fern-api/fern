import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));

const localTaskHandlerPath = resolve(__dirname, "../LocalTaskHandler.ts");
const localTaskHandlerSource = readFileSync(localTaskHandlerPath, "utf-8");

/**
 * Tests for the version bump override feature.
 *
 * The `parseVersionBumpOverride` method extracts a `version-bump: MAJOR|MINOR|PATCH`
 * directive from the spec repo commit message, allowing API authors to force a
 * specific version bump level when the AI recommendation is wrong.
 *
 * Since `parseVersionBumpOverride` is a private method, we test the regex behavior
 * directly and verify source-level integration via static analysis of the source code.
 */

// Extract the regex pattern from the source to test it independently
const OVERRIDE_REGEX = /^version-bump:\s*(MAJOR|MINOR|PATCH)\s*$/im;

describe("parseVersionBumpOverride regex behavior", () => {
    it("matches 'version-bump: MAJOR' on its own line", () => {
        const match = "version-bump: MAJOR".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("MAJOR");
    });

    it("matches 'version-bump: MINOR' on its own line", () => {
        const match = "version-bump: MINOR".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("MINOR");
    });

    it("matches 'version-bump: PATCH' on its own line", () => {
        const match = "version-bump: PATCH".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("PATCH");
    });

    it("is case-insensitive for the directive name", () => {
        const match = "Version-Bump: MAJOR".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("MAJOR");
    });

    it("matches when directive is in multi-line commit message body", () => {
        const message = "Add new payment endpoint\n\nversion-bump: MAJOR\n\nThis is a breaking change";
        const match = message.match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("MAJOR");
    });

    it("matches with extra whitespace around the value", () => {
        const match = "version-bump:   MINOR  ".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe("MINOR");
    });

    it("does not match invalid bump levels", () => {
        const match = "version-bump: BREAKING".match(OVERRIDE_REGEX);
        expect(match).toBeNull();
    });

    it("does not match partial directives", () => {
        const match = "my-version-bump: MAJOR".match(OVERRIDE_REGEX);
        expect(match).toBeNull();
    });

    it("does not match when directive is embedded mid-line", () => {
        const match = "some text version-bump: MAJOR more text".match(OVERRIDE_REGEX);
        expect(match).toBeNull();
    });

    it("returns null for null/empty input", () => {
        expect("".match(OVERRIDE_REGEX)).toBeNull();
    });

    it("matches lowercase bump values (regex is case-insensitive, code normalizes with toUpperCase)", () => {
        const match = "version-bump: major".match(OVERRIDE_REGEX);
        expect(match).not.toBeNull();
        // The actual code calls .toUpperCase() on match[1] to normalize
        expect(match?.[1]?.toUpperCase()).toBe("MAJOR");
    });
});

describe("version bump override source integration", () => {
    it("parseVersionBumpOverride uses the correct regex pattern", () => {
        expect(localTaskHandlerSource).toContain(
            "specCommitMessage.match(/^version-bump:\\s*(MAJOR|MINOR|PATCH)\\s*$/im)"
        );
    });

    it("calls parseVersionBumpOverride with specCommitMessage", () => {
        expect(localTaskHandlerSource).toContain("this.parseVersionBumpOverride(specCommitMessage)");
    });

    it("respects bumpOverride in the large-diff fallback path", () => {
        expect(localTaskHandlerSource).toContain("Diff too large for analysis but applying version bump override");
    });

    it("respects bumpOverride in the AI-failure fallback path", () => {
        expect(localTaskHandlerSource).toContain("AI analysis failed but applying version bump override");
    });

    it("respects bumpOverride in the NO_CHANGE path", () => {
        expect(localTaskHandlerSource).toContain("AI detected no semantic changes but applying version bump override");
    });

    it("applies bumpOverride over AI recommendation on success path", () => {
        expect(localTaskHandlerSource).toContain("const finalBump = bumpOverride ?? analysis.versionBump");
    });

    it("writes observability artifacts in all fallback paths", () => {
        // Count occurrences of writeAutoVersioningArtifacts calls
        const matches = localTaskHandlerSource.match(/writeAutoVersioningArtifacts\(/g);
        // Should be called in: large-diff fallback, AI-failure fallback, NO_CHANGE+override, and success path
        expect(matches).not.toBeNull();
        expect(matches?.length).toBeGreaterThanOrEqual(4);
    });
});
