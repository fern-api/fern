import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LocalTaskHandler } from "../LocalTaskHandler.js";

// Minimal stub for TaskContext to satisfy LocalTaskHandler constructor.
function createMockContext(): LocalTaskHandler.Init["context"] {
    const noop = () => {
        // noop
    };
    return {
        logger: { info: noop, debug: noop, warn: noop, error: noop }
    } as LocalTaskHandler.Init["context"];
}

const PRIOR_CHANGELOG = `# Changelog

## [1.0.0] - 2024-01-01
- Initial release

`;

describe("LocalTaskHandler - explicit version changelog", () => {
    let outputDir: string;
    let tmpOutputDir: string;

    function createHandler(version: string | undefined): LocalTaskHandler {
        return new LocalTaskHandler({
            context: createMockContext(),
            absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(tmpOutputDir),
            absolutePathToTmpSnippetJSON: undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            absolutePathToLocalOutput: AbsoluteFilePath.of(outputDir),
            absolutePathToLocalSnippetJSON: undefined,
            absolutePathToTmpSnippetTemplatesJSON: undefined,
            absolutePathToSpecRepo: undefined,
            version,
            ai: undefined,
            isWhitelabel: false,
            generatorLanguage: undefined
        });
    }

    beforeEach(async () => {
        const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        outputDir = join(tmpdir(), `explicit-changelog-out-${suffix}`);
        tmpOutputDir = join(tmpdir(), `explicit-changelog-tmp-${suffix}`);
        await mkdir(outputDir, { recursive: true });
        await mkdir(tmpOutputDir, { recursive: true });
        await writeFile(join(tmpOutputDir, "client.ts"), "export const client = {};\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# SDK\n");
    });

    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
        await rm(tmpOutputDir, { recursive: true, force: true });
    });

    it("preserves existing changelog entries and prepends a version-only entry in a git repo", async () => {
        await mkdir(join(outputDir, ".git"), { recursive: true });
        await writeFile(join(outputDir, "changelog.md"), PRIOR_CHANGELOG);

        await createHandler("2.0.0").copyGeneratedFiles();

        const changelog = await readFile(join(outputDir, "changelog.md"), "utf-8");
        expect(changelog).toContain("## [2.0.0]");
        expect(changelog).toContain("## [1.0.0] - 2024-01-01");
        expect(changelog).toContain("- Initial release");
        expect(changelog.indexOf("## [2.0.0]")).toBeLessThan(changelog.indexOf("## [1.0.0]"));
    });

    it("creates changelog.md with a version-only entry in a git repo without one", async () => {
        await mkdir(join(outputDir, ".git"), { recursive: true });

        await createHandler("0.1.0").copyGeneratedFiles();

        const changelog = await readFile(join(outputDir, "changelog.md"), "utf-8");
        expect(changelog).toContain("# Changelog");
        expect(changelog).toContain("## [0.1.0]");
    });

    it("does not duplicate an entry when regenerating with the same version", async () => {
        await mkdir(join(outputDir, ".git"), { recursive: true });
        await writeFile(join(outputDir, "changelog.md"), PRIOR_CHANGELOG);

        await createHandler("1.0.0").copyGeneratedFiles();

        const changelog = await readFile(join(outputDir, "changelog.md"), "utf-8");
        expect(changelog.match(/## \[1\.0\.0\]/g)).toHaveLength(1);
    });

    it("does not create changelog.md in a non-git output without a prior changelog", async () => {
        await createHandler("0.1.0").copyGeneratedFiles();

        const files = await readdir(outputDir);
        expect(files.map((f) => f.toLowerCase())).not.toContain("changelog.md");
    });

    it("restores a wiped changelog even when no version is passed", async () => {
        await mkdir(join(outputDir, ".git"), { recursive: true });
        await writeFile(join(outputDir, "CHANGELOG.md"), PRIOR_CHANGELOG);

        await createHandler(undefined).copyGeneratedFiles();

        const changelog = await readFile(join(outputDir, "CHANGELOG.md"), "utf-8");
        expect(changelog).toBe(PRIOR_CHANGELOG);
    });
});
