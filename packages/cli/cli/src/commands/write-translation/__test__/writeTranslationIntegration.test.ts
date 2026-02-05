import { cp, mkdir, readdir, readFile } from "fs/promises";
import { join } from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { CliContext } from "../../../cli-context/CliContext";
import { writeTranslationForProject } from "../writeTranslationForProject";
import { setupTestProjectFromFixture } from "./test-utils";

describe("writeTranslationForProject - Integration Tests", () => {
    let outputBaseDir: string;
    let mockCliContext: CliContext;

    beforeAll(async () => {
        // Create snapshots directory in the test folder for stable test snapshots
        const path = await import("path");
        const fs = await import("fs/promises");

        // Save in the __snapshots__ directory next to this test file (stable name for PR comparisons)
        const testDir = __dirname;
        outputBaseDir = path.join(testDir, "__snapshots__", "integration-test-output");

        // Clean and recreate the snapshot directory to ensure fresh output
        try {
            await fs.rm(outputBaseDir, { recursive: true, force: true });
            console.log(`🧹 Cleaned previous snapshot output`);
        } catch {
            // Directory didn't exist, that's fine
        }

        await fs.mkdir(outputBaseDir, { recursive: true });
        console.log(`📁 Created snapshot directory: ${outputBaseDir}`);
        console.log(`🎯 Integration test output will be saved to stable snapshots for PR comparisons`);
        console.log(`📂 Relative path: src/commands/write-translation/__test__/__snapshots__/integration-test-output`);
    });

    async function saveTestOutput(testName: string, fernDir: string) {
        const testOutputDir = join(outputBaseDir, testName);
        console.log(`📂 Creating test output directory: ${testName}`);
        await mkdir(testOutputDir, { recursive: true });

        const translationsDir = join(fernDir, "translations");
        try {
            console.log(`📁 Copying translations directory for ${testName}...`);
            await cp(translationsDir, join(testOutputDir, "translations"), { recursive: true });
            console.log(`✅ Translations copied successfully for ${testName}`);

            // Show what was created
            const fs = await import("fs/promises");
            const entries = await fs.readdir(join(testOutputDir, "translations"));
            console.log(`🌍 Languages created: ${entries.filter((e) => e !== "hashes").join(", ")}`);
        } catch (error) {
            console.log(`ℹ️  No translations directory created for ${testName}`);
        }

        try {
            const docsYml = join(fernDir, "docs.yml");
            await cp(docsYml, join(testOutputDir, "docs.yml.original"));
        } catch {
            // does not exist
        }
    }

    function createMockCliContext() {
        const logger = {
            debug: (msg: unknown) => console.log(`[DEBUG] ${msg}`),
            info: (msg: unknown) => console.log(`[INFO] ${msg}`),
            warn: (msg: unknown) => console.log(`[WARN] ${msg}`),
            error: (msg: unknown) => console.log(`[ERROR] ${msg}`)
        };

        return {
            logger,
            instrumentPostHogEvent: async () => {
                // empty block
            },
            runTaskForWorkspace: async (workspace: unknown, fn: (context: unknown) => Promise<void>) => {
                return fn({ logger });
            }
        } as unknown as CliContext;
    }

    it("should run write-translation --stub on basic-project fixture", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            console.log(`Running write-translation for basic-project`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            await saveTestOutput("basic-project", fernDir);

            const translationsDir = join(fernDir, "translations");
            const entries = await readdir(translationsDir);
            expect(entries.length).toBeGreaterThan(0);

            expect(entries).toContain("hashes");
            expect(entries).toContain("de");
            expect(entries).toContain("es");
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it("should run write-translation --stub on path-url-project fixture", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("path-url-project");

        try {
            console.log(`Running write-translation for path-url-project`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            await saveTestOutput("path-url-project", fernDir);

            const translationsDir = join(fernDir, "translations");
            const entries = await readdir(translationsDir);
            expect(entries.length).toBeGreaterThan(0);

            const deLangDir = join(translationsDir, "de", "fern");
            const deDocsYml = join(deLangDir, "docs.yml");
            const deDocsContent = await readFile(deDocsYml, "utf-8");
            expect(deDocsContent).toContain("de");
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it("should handle no-languages-project fixture gracefully", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("no-languages-project");

        try {
            console.log(`Running write-translation for no-languages-project`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            await saveTestOutput("no-languages-project", fernDir);
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it("should produce consistent output across multiple runs", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            console.log(`Running idempotency test on basic-project`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            const translationsDir = join(fernDir, "translations");
            const firstRunFiles = await readdir(translationsDir, { recursive: true } as {
                encoding?: BufferEncoding | null;
                recursive: true;
            });

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            const secondRunFiles = await readdir(translationsDir, { recursive: true } as {
                encoding?: BufferEncoding | null;
                recursive: true;
            });

            expect(firstRunFiles.sort()).toEqual(secondRunFiles.sort());

            await saveTestOutput("basic-project-idempotency", fernDir);
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it("should create language-specific docs.yml with modified URLs", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            console.log(`Testing docs.yml URL modification`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            const translationsDir = join(fernDir, "translations");

            const deDocsYml = join(translationsDir, "de", "fern", "docs.yml");
            const deDocsContent = await readFile(deDocsYml, "utf-8");
            expect(deDocsContent).toContain("language: de");

            const esDocsYml = join(translationsDir, "es", "fern", "docs.yml");
            const esDocsContent = await readFile(esDocsYml, "utf-8");
            expect(esDocsContent).toContain("language: es");

            await saveTestOutput("docs-yml-modification", fernDir);
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });

    it("should process markdown files and preserve directory structure", async () => {
        mockCliContext = createMockCliContext();
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            console.log(`Testing markdown file processing and directory structure`);

            await writeTranslationForProject({
                project,
                cliContext: mockCliContext,
                stub: true
            });

            const translationsDir = join(fernDir, "translations");
            const deFernDir = join(translationsDir, "de", "fern");
            const deFiles = await readdir(deFernDir, { recursive: true } as {
                encoding?: BufferEncoding | null;
                recursive: true;
            });

            const dePages = deFiles.filter((f) => f.includes("pages"));
            expect(dePages.length).toBeGreaterThan(0);

            const gettingStartedPath = join(deFernDir, "pages", "getting-started.mdx");
            const gettingStartedContent = await readFile(gettingStartedPath, "utf-8");
            expect(gettingStartedContent.length).toBeGreaterThan(0);

            await saveTestOutput("markdown-processing", fernDir);
        } finally {
            try {
                // Keep the temp directory for a bit longer for debugging
                // await rm(tempDir.path, { recursive: true, force: true });
                console.log(`Temp test directory (will be cleaned up eventually): ${tempDir.path}`);
            } catch {
                // ignore cleanup errors
            }
        }
    });
});
