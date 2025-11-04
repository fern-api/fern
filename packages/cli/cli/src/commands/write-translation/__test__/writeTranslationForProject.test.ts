import { readdir, readFile, stat } from "fs/promises";
import yaml from "js-yaml";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext";
import { writeTranslationForProject } from "../writeTranslationForProject";
import { setupTestProjectFromFixture } from "./test-utils";

interface FileStructure {
    type: "file";
    content: string | unknown;
}

interface DirectoryStructure {
    type: "directory";
    contents: Record<string, FileStructure>;
}

interface TranslationOutput {
    translationsExists: boolean;
    structure?: Record<string, FileStructure | DirectoryStructure>;
    docConfigs?: Record<string, unknown>;
}

describe("writeTranslationForProject", () => {
    let mockCliContext: CliContext;

    beforeEach(async () => {
        // Create mock CLI context
        mockCliContext = {
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            },
            instrumentPostHogEvent: vi.fn(),
            runTaskForWorkspace: vi.fn().mockImplementation(async (workspace, fn) => {
                // Call the function with a mock context
                return fn({
                    logger: mockCliContext.logger
                });
            })
        } as unknown as CliContext;
    });

    /**
     * Helper function to capture the complete output structure for snapshot testing
     */
    async function captureTranslationOutput(fernDir: string): Promise<TranslationOutput> {
        const translationsPath = join(fernDir, "translations");

        try {
            const translationsStat = await stat(translationsPath);
            if (!translationsStat.isDirectory()) {
                return { translationsExists: false };
            }
        } catch {
            return { translationsExists: false };
        }

        const output: TranslationOutput = {
            translationsExists: true,
            structure: {},
            docConfigs: {}
        };

        // Capture directory structure
        const entries = await readdir(translationsPath);
        for (const entry of entries) {
            const entryPath = join(translationsPath, entry);
            const entryStat = await stat(entryPath);

            if (entry === "hashes" && output.structure) {
                output.structure[entry] = {
                    type: "file",
                    content: await readFile(entryPath, "utf-8")
                };
            } else if (entryStat.isDirectory() && output.structure) {
                output.structure[entry] = {
                    type: "directory",
                    contents: {}
                };

                // Read language directory contents
                const langFiles = await readdir(entryPath);
                for (const langFile of langFiles) {
                    const langFilePath = join(entryPath, langFile);
                    const langFileStat = await stat(langFilePath);

                    if (langFileStat.isFile()) {
                        const content = await readFile(langFilePath, "utf-8");
                        (output.structure[entry] as DirectoryStructure).contents[langFile] = {
                            type: "file",
                            content:
                                langFile.endsWith(".yml") || langFile.endsWith(".yaml") ? yaml.load(content) : content
                        };

                        // Store parsed docs configs separately for easier testing
                        if (langFile === "docs.yml" && output.docConfigs) {
                            output.docConfigs[entry] = yaml.load(content);
                        }
                    }
                }
            }
        }

        return output;
    }

    it("should create translations folder with correct structure", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture the complete output structure
            const output = await captureTranslationOutput(fernDir);
            expect(output).toMatchSnapshot();

            // Verify logger was called with appropriate messages
            expect(mockCliContext.logger.info).toHaveBeenCalled();
        } finally {
            // Cleanup - suppress errors as they're just from temp directory cleanup
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    it("should handle project with no languages configured", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("no-languages-project");

        try {
            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture the complete output structure
            const output = await captureTranslationOutput(fernDir);
            expect(output).toMatchSnapshot();

            // Verify logger was called with appropriate warning/error message
            expect(mockCliContext.logger.error).toHaveBeenCalled();
        } finally {
            // Cleanup - suppress errors as they're just from temp directory cleanup
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    it("should create translations folder with individual language directories", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            // Verify translations folder doesn't exist initially
            const translationsPath = join(fernDir, "translations");
            let translationsExists = false;
            try {
                await stat(translationsPath);
                translationsExists = true;
            } catch {
                // Expected - folder shouldn't exist yet
            }
            expect(translationsExists).toBe(false);

            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture the complete output structure
            const output = await captureTranslationOutput(fernDir);
            expect(output).toMatchSnapshot();
        } finally {
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    it("should be idempotent - no changes when running again without modifications", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            // First run - should create translations
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture first run output
            const firstRunOutput = await captureTranslationOutput(fernDir);

            // Reset mock to capture second run output
            vi.clearAllMocks();

            // Second run - should be idempotent (no changes)
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture second run output
            const secondRunOutput = await captureTranslationOutput(fernDir);

            // Both outputs should be identical
            expect(secondRunOutput).toEqual(firstRunOutput);

            // Capture the logger messages for the second run
            const mockInfo = mockCliContext.logger.info as ReturnType<typeof vi.fn>;
            const infoMessages = mockInfo.mock.calls.map((call: unknown[]) => call[0]);

            // Filter out dynamic content like temporary directory paths
            const normalizedMessages = infoMessages.map((msg) => {
                if (typeof msg === "string") {
                    // Replace temp directory paths using a more comprehensive regex
                    // Covers various temp directory patterns like:
                    // - /private/var/folders/XX/XXXX/T/tmp-NNNNN-XXXX
                    // - /tmp/tmp-NNNNN-XXXX
                    // - /var/folders/XX/XXXX/T/tmp-NNNNN-XXXX
                    return (
                        msg
                            .replace(
                                /\/private\/var\/folders\/[a-z0-9_]+\/[a-z0-9_]+\/T\/tmp-\d+-[a-zA-Z0-9_]+/g,
                                "<temp-dir>"
                            )
                            .replace(/\/var\/folders\/[a-z0-9_]+\/[a-z0-9_]+\/T\/tmp-\d+-[a-zA-Z0-9_]+/g, "<temp-dir>")
                            .replace(/\/tmp\/tmp-\d+-[a-zA-Z0-9_]+/g, "<temp-dir>")
                            // Handle cases where previous replacements left /private<temp-dir>
                            .replace(/\/private<temp-dir>/g, "<temp-dir>")
                            .replace(/tmp-\d+-[a-zA-Z0-9_]+/g, "<temp-dir>")
                    );
                }
                return msg;
            });

            // Snapshot the logger output to verify idempotency messages
            expect(normalizedMessages).toMatchSnapshot();
        } finally {
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    it("should create language-specific docs.yml configs with modified URLs", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            // Verify docs.yml exists in fixture
            const docsYmlPath = join(fernDir, "docs.yml");
            const docsExists = await readFile(docsYmlPath, "utf-8")
                .then(() => true)
                .catch(() => false);
            expect(docsExists).toBe(true);

            // Read original docs.yml to verify it has instances
            const originalDocsContent = await readFile(docsYmlPath, "utf-8");
            const originalDocsConfig = yaml.load(originalDocsContent) as { instances?: unknown[] };
            expect(originalDocsConfig.instances).toBeDefined();
            expect(Array.isArray(originalDocsConfig.instances)).toBe(true);
            expect(originalDocsConfig.instances?.length).toBeGreaterThan(0);

            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture the complete output structure including docs configs
            const output = await captureTranslationOutput(fernDir);
            expect(output).toMatchSnapshot();

            // Verify appropriate logging messages were shown
            expect(mockCliContext.logger.info).toHaveBeenCalledWith(
                expect.stringContaining("Language-specific docs configurations created with modified instance URLs:")
            );
        } finally {
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });

    it("should correctly modify URLs with existing paths", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("path-url-project");

        try {
            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Capture the complete output structure including docs configs
            const output = await captureTranslationOutput(fernDir);
            expect(output).toMatchSnapshot();
        } finally {
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });
});
