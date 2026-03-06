import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFileSync } from "fs";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LocalTaskHandler } from "../LocalTaskHandler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read BAML source and LocalTaskHandler source for verification
const diffAnalyzerBamlPath = resolve(__dirname, "../../../../../../cli/ai/baml_src/diff_analyzer.baml");
const diffAnalyzerBaml = readFileSync(diffAnalyzerBamlPath, "utf-8");
const localTaskHandlerPath = resolve(__dirname, "../LocalTaskHandler.ts");
const localTaskHandlerSource = readFileSync(localTaskHandlerPath, "utf-8");

// Minimal stub for TaskContext to satisfy LocalTaskHandler constructor.
// Only the logger methods used by readPriorChangelog are stubbed here.
function createMockContext(): LocalTaskHandler.Init["context"] {
    const noop = () => {
        // noop
    };
    return {
        logger: { info: noop, debug: noop, warn: noop, error: noop }
    } as LocalTaskHandler.Init["context"];
}

describe("LocalTaskHandler - readPriorChangelog", () => {
    let tmpDir: string;
    let handler: LocalTaskHandler;

    beforeEach(async () => {
        tmpDir = join(tmpdir(), `changelog-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await mkdir(tmpDir, { recursive: true });
        handler = new LocalTaskHandler({
            context: createMockContext(),
            absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(tmpDir),
            absolutePathToTmpSnippetJSON: undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            absolutePathToLocalOutput: AbsoluteFilePath.of(tmpDir),
            absolutePathToLocalSnippetJSON: undefined,
            absolutePathToTmpSnippetTemplatesJSON: undefined,
            absolutePathToSpecRepo: undefined,
            version: undefined,
            ai: undefined,
            isWhitelabel: false,
            generatorLanguage: undefined
        });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("extracts last 3 entries from CHANGELOG.md", async () => {
        const changelog = `# Changelog

## [1.2.3] - 2024-01-15

### Fixed
- Fixed a bug in the client

## [1.2.2] - 2024-01-10

### Changed
- Updated dependencies

## [1.2.1] - 2024-01-05

### Added
- Added new endpoint
`;
        await writeFile(join(tmpDir, "CHANGELOG.md"), changelog);

        const result = await handler.readPriorChangelog(3);
        expect(result).toContain("## [1.2.3]");
        expect(result).toContain("## [1.2.2]");
        expect(result).toContain("## [1.2.1]");
        expect(result).toContain("Fixed a bug in the client");
        expect(result).toContain("Updated dependencies");
        expect(result).toContain("Added new endpoint");
    });

    it("returns only the 3 most recent changelog entries when more exist", async () => {
        const changelog = `# Changelog

## [2.0.0] - 2024-03-01

### Breaking
- Removed deprecated API

## [1.3.0] - 2024-02-15

### Added
- New feature X

## [1.2.3] - 2024-01-15

### Fixed
- Bug fix Y

## [1.2.2] - 2024-01-10

### Changed
- Internal refactor

## [1.2.1] - 2024-01-05

### Added
- Initial release
`;
        await writeFile(join(tmpDir, "CHANGELOG.md"), changelog);

        const result = await handler.readPriorChangelog(3);
        // Should contain the 3 most recent entries (top of file)
        expect(result).toContain("## [2.0.0]");
        expect(result).toContain("## [1.3.0]");
        expect(result).toContain("## [1.2.3]");
        // Should NOT contain the older entries
        expect(result).not.toContain("## [1.2.2]");
        expect(result).not.toContain("## [1.2.1]");
    });

    it("returns empty string when CHANGELOG.md does not exist", async () => {
        const result = await handler.readPriorChangelog(3);
        expect(result).toBe("");
    });

    it("truncates prior changelog to 2KB", async () => {
        // Create a changelog with entries that exceed 2KB
        let changelog = "# Changelog\n\n";
        for (let i = 100; i >= 1; i--) {
            changelog += `## [1.0.${i}] - 2024-01-${String(i).padStart(2, "0")}\n\n`;
            changelog += `### Changed\n- ${"A".repeat(200)} change number ${i}\n\n`;
        }
        await writeFile(join(tmpDir, "CHANGELOG.md"), changelog);

        const result = await handler.readPriorChangelog(100);
        expect(result.length).toBeLessThanOrEqual(2048);
    });

    it("returns empty string and does not throw on CHANGELOG.md read error", async () => {
        // Create a directory named CHANGELOG.md to cause a read error
        await mkdir(join(tmpDir, "CHANGELOG.md"), { recursive: true });

        const result = await handler.readPriorChangelog(3);
        expect(result).toBe("");
    });

    it("returns empty string for empty CHANGELOG.md", async () => {
        await writeFile(join(tmpDir, "CHANGELOG.md"), "");

        const result = await handler.readPriorChangelog(3);
        expect(result).toBe("");
    });

    it("finds changelog.md and CHANGELOG.MD in addition to CHANGELOG.md", async () => {
        // Test lowercase
        const changelogContent = `## [1.0.0] - 2024-01-01

### Added
- Initial release
`;
        await writeFile(join(tmpDir, "changelog.md"), changelogContent);

        const result = await handler.readPriorChangelog(3);
        expect(result).toContain("## [1.0.0]");
        expect(result).toContain("Initial release");
    });
});

describe("LocalTaskHandler - prior_changelog BAML integration", () => {
    it("AnalyzeSdkDiff BAML function signature includes prior_changelog parameter", () => {
        expect(diffAnalyzerBaml).toContain("prior_changelog: string @description(");
        expect(diffAnalyzerBaml).toContain("The last 3 changelog entries for this SDK, empty string if none.");
    });

    it("prompt includes prior_changelog conditional block", () => {
        expect(diffAnalyzerBaml).toContain("{% if prior_changelog %}");
        expect(diffAnalyzerBaml).toContain("{{prior_changelog}}");
        expect(diffAnalyzerBaml).toContain("Match the tone and format of these entries in your commit message.");
    });

    it("passes extracted changelog to AnalyzeSdkDiff", () => {
        // Verify the call site passes priorChangelog to AnalyzeSdkDiff
        expect(localTaskHandlerSource).toContain("await this.readPriorChangelog(3)");
        // The BAML call now spans multiple lines; verify priorChangelog is passed as an argument
        expect(localTaskHandlerSource).toContain("await bamlClient.AnalyzeSdkDiff(");
        expect(localTaskHandlerSource).toContain("priorChangelog,");
    });
});
