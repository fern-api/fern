import { beforeEach, describe, expect, it, vi } from "vitest";

import { CliContext } from "../../../cli-context/CliContext";
import { writeTranslationForProject } from "../writeTranslationForProject";
import { FIXTURES, setupTestProjectFromFixture, verifyTranslationStructure } from "./test-utils";

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

    it("should create .translations folder with correct structure", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");

        try {
            // Execute the write-translation command
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Verify the correct translation structure was created
            const fixture = FIXTURES["basic-project"];
            const expectedLanguages = fixture?.expectedLanguages ?? [];
            await verifyTranslationStructure(fernDir, expectedLanguages);

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

            // Verify the correct translation structure was created (none in this case)
            const fixture = FIXTURES["no-languages-project"];
            const expectedLanguages = fixture?.expectedLanguages ?? [];
            await verifyTranslationStructure(fernDir, expectedLanguages);

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

    it("should create .translations folder with individual language directories", async () => {
        const { tempDir, fernDir, project } = await setupTestProjectFromFixture("basic-project");
        const fs = await import("fs/promises");
        const path = await import("path");

        try {
            // Verify .translations folder doesn't exist initially
            const translationsPath = path.join(fernDir, ".translations");
            let translationsExists = false;
            try {
                await fs.stat(translationsPath);
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

            // Verify .translations folder was created
            const stat = await fs.stat(translationsPath);
            expect(stat.isDirectory()).toBe(true);

            // Verify individual language directories were created
            const fixture = FIXTURES["basic-project"];
            const expectedLanguages = fixture?.expectedLanguages ?? [];
            for (const language of expectedLanguages) {
                const langPath = path.join(translationsPath, language);
                const langStat = await fs.stat(langPath);
                expect(langStat.isDirectory()).toBe(true);
            }

            // Verify no unexpected directories were created (filter out .hashes file)
            const actualEntries = await fs.readdir(translationsPath);
            const actualLanguages = actualEntries.filter((entry) => entry !== ".hashes");
            expect(actualLanguages.sort()).toEqual(expectedLanguages.sort());
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

            // Reset mock to capture second run output
            vi.clearAllMocks();

            // Second run - should be idempotent (no changes)
            await writeTranslationForProject({
                project,
                cliContext: mockCliContext
            });

            // Verify that the logger output indicates no files were processed on second run
            const mockInfo = mockCliContext.logger.info as ReturnType<typeof vi.fn>;
            const infoMessages = mockInfo.mock.calls.map((call: unknown[]) => call[0]);

            // Check that each language shows 0 processed files
            const fixture = FIXTURES["basic-project"];
            const expectedLanguages = fixture?.expectedLanguages ?? [];

            // Check target languages (non-source languages)
            for (const language of expectedLanguages) {
                const languageSummaryMessage = infoMessages.find(
                    (msg: unknown) =>
                        typeof msg === "string" &&
                        msg.includes(`${language} translation summary:`) &&
                        msg.includes("0 processed")
                );
                expect(languageSummaryMessage).toBeDefined();
                expect(languageSummaryMessage).toMatch(/\d+ skipped/); // Should have some skipped files
            }

            // Check source language (en) shows hash tracking message
            const sourceLanguageSummaryMessage = infoMessages.find(
                (msg: unknown) =>
                    typeof msg === "string" &&
                    msg.includes("en (source) hash tracking summary:") &&
                    msg.includes("0 processed")
            );
            expect(sourceLanguageSummaryMessage).toBeDefined();
            expect(sourceLanguageSummaryMessage).toMatch(/\d+ skipped/); // Should have some skipped files

            // Check overall summary shows 0 files processed
            const overallSummaryMessage = infoMessages.find(
                (msg: unknown) =>
                    typeof msg === "string" && msg.includes("Overall summary:") && msg.includes("0 files processed")
            );
            expect(overallSummaryMessage).toBeDefined();
            expect(overallSummaryMessage).toMatch(/\d+ files skipped/); // Should have some skipped files
        } finally {
            try {
                await tempDir.cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
    });
});
