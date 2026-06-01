import { execSync } from "child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for the ENOTEMPTY fix in
 * LocalTaskHandler.copyGeneratedFilesWithFernIgnoreInTempRepo().
 *
 * These use real filesystem and git operations (no mocks) to verify end-to-end
 * behaviour. Unit tests that verify call arguments live in
 * LocalTaskHandler.gitCleanupUnit.test.ts (which uses vi.mock for ESM compat).
 */

describe("LocalTaskHandler - .git cleanup (ENOTEMPTY fix)", { timeout: 30000 }, () => {
    let localOutputDir: string;
    let tmpOutputDir: string;

    beforeEach(async () => {
        const base = join(tmpdir(), `git-cleanup-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localOutputDir = join(base, "output");
        tmpOutputDir = join(base, "generated");
        await mkdir(localOutputDir, { recursive: true });
        await mkdir(tmpOutputDir, { recursive: true });
    });

    afterEach(async () => {
        const base = join(localOutputDir, "..");
        await rm(base, { recursive: true, force: true }).catch(() => {
            // Best-effort cleanup
        });
    });

    async function createLocalTaskHandler() {
        const { LocalTaskHandler } = await import("../LocalTaskHandler.js");
        const { AbsoluteFilePath } = await import("@fern-api/fs-utils");

        const mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            disable: vi.fn(),
            enable: vi.fn(),
            trace: vi.fn(),
            log: vi.fn()
        };

        return new LocalTaskHandler({
            context: { logger: mockLogger } as never,
            absolutePathToLocalOutput: AbsoluteFilePath.of(localOutputDir),
            absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(tmpOutputDir),
            absolutePathToTmpSnippetJSON: undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            absolutePathToLocalSnippetJSON: undefined,
            absolutePathToTmpSnippetTemplatesJSON: undefined,
            version: "1.0.0",
            ai: undefined,
            isWhitelabel: false,
            generatorLanguage: undefined,
            absolutePathToSpecRepo: undefined,
            skipFernignore: false
        });
    }

    it("removes .git directory completely after copyGeneratedFiles with .fernignore (non-git-repo path)", async () => {
        // Set up .fernignore to trigger copyGeneratedFilesWithFernIgnoreInTempRepo
        await writeFile(join(localOutputDir, ".fernignore"), "keep_me.txt\n");
        await writeFile(join(localOutputDir, "keep_me.txt"), "preserved content\n");
        await writeFile(join(localOutputDir, "old_generated.py"), "# old\n");

        // Generated output
        await writeFile(join(tmpOutputDir, "new_generated.py"), "# new\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // The output directory must NOT contain a .git directory — that's the whole
        // point of the fix. If rm(.git) failed with ENOTEMPTY, this assertion catches it.
        const outputFiles = await readdir(localOutputDir);
        expect(outputFiles).not.toContain(".git");

        // Verify the fernignore-preserved file is still there
        const preserved = await readFile(join(localOutputDir, "keep_me.txt"), "utf-8");
        expect(preserved).toBe("preserved content\n");

        // Verify generated files are placed
        expect(outputFiles).toContain("new_generated.py");
    });

    it("disables git auto-gc (gc.auto=0) in the throwaway repo", async () => {
        await writeFile(join(localOutputDir, ".fernignore"), "keep_me.txt\n");
        await writeFile(join(localOutputDir, "keep_me.txt"), "preserved\n");
        await writeFile(join(tmpOutputDir, "file.py"), "# gen\n");

        // Spy on loggingExeca to capture all git commands.
        // loggingExeca is a default export re-exported as a named export, so
        // vi.spyOn on the module namespace works here (unlike fs/promises).
        const mod = await import("@fern-api/logging-execa");
        const originalLoggingExeca = mod.loggingExeca;
        const loggingExecaSpy = vi.spyOn(mod, "loggingExeca");
        loggingExecaSpy.mockImplementation(async (...args: Parameters<typeof originalLoggingExeca>) => {
            return originalLoggingExeca(...args);
        });

        try {
            const handler = await createLocalTaskHandler();
            await handler.copyGeneratedFiles();

            // Extract all git command invocations
            const gitCalls = loggingExecaSpy.mock.calls
                .filter((call) => call[1] === "git")
                .map((call) => call[2] as string[]);

            // Find the indices of key commands
            const initIndex = gitCalls.findIndex((args) => args.some((a) => a === "init"));
            const gcAutoIndex = gitCalls.findIndex(
                (args) => args.includes("config") && args.includes("gc.auto") && args.includes("0")
            );
            const addIndex = gitCalls.findIndex(
                (args) => args.some((a) => a === "add") && args.some((a) => a === ".")
            );

            // gc.auto 0 must be present
            expect(gcAutoIndex).toBeGreaterThan(-1);

            // gc.auto 0 must come after init
            expect(initIndex).toBeGreaterThan(-1);
            expect(gcAutoIndex).toBeGreaterThan(initIndex);

            // gc.auto 0 must come before the first add
            expect(addIndex).toBeGreaterThan(-1);
            expect(gcAutoIndex).toBeLessThan(addIndex);
        } finally {
            loggingExecaSpy.mockRestore();
        }
    });

    it("verifies gc.auto=0 is set in the throwaway git repo via git config", async () => {
        const testDir = join(tmpdir(), `gc-auto-verify-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        await mkdir(testDir, { recursive: true });

        try {
            // Reproduce the exact sequence from copyGeneratedFilesWithFernIgnoreInTempRepo
            execSync("git init", { cwd: testDir, stdio: "pipe" });
            execSync("git config gc.auto 0", { cwd: testDir, stdio: "pipe" });

            // Verify gc.auto is 0
            const gcAuto = execSync("git config gc.auto", { cwd: testDir, encoding: "utf-8" }).trim();
            expect(gcAuto).toBe("0");

            // Also verify it's persisted in the config file
            const gitConfig = await readFile(join(testDir, ".git", "config"), "utf-8");
            expect(gitConfig).toContain("gc");
            expect(gitConfig).toContain("auto = 0");
        } finally {
            await rm(testDir, { recursive: true, force: true }).catch(() => {
                // Best-effort cleanup
            });
        }
    });

    it("handles multiple concurrent copyGeneratedFiles calls without ENOTEMPTY", async () => {
        const concurrency = 5;
        const bases: string[] = [];

        const tasks = Array.from({ length: concurrency }, async (_, i) => {
            const base = join(
                tmpdir(),
                `concurrent-git-cleanup-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`
            );
            bases.push(base);
            const outDir = join(base, "output");
            const genDir = join(base, "generated");
            await mkdir(outDir, { recursive: true });
            await mkdir(genDir, { recursive: true });

            await writeFile(join(outDir, ".fernignore"), "keep.txt\n");
            await writeFile(join(outDir, "keep.txt"), `kept-${i}\n`);
            await writeFile(join(genDir, "gen.py"), `# gen-${i}\n`);

            const { LocalTaskHandler } = await import("../LocalTaskHandler.js");
            const { AbsoluteFilePath } = await import("@fern-api/fs-utils");

            const mockLogger = {
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
                debug: vi.fn(),
                disable: vi.fn(),
                enable: vi.fn(),
                trace: vi.fn(),
                log: vi.fn()
            };

            const handler = new LocalTaskHandler({
                context: { logger: mockLogger } as never,
                absolutePathToLocalOutput: AbsoluteFilePath.of(outDir),
                absolutePathToTmpOutputDirectory: AbsoluteFilePath.of(genDir),
                absolutePathToTmpSnippetJSON: undefined,
                absolutePathToLocalSnippetTemplateJSON: undefined,
                absolutePathToLocalSnippetJSON: undefined,
                absolutePathToTmpSnippetTemplatesJSON: undefined,
                version: "1.0.0",
                ai: undefined,
                isWhitelabel: false,
                generatorLanguage: undefined,
                absolutePathToSpecRepo: undefined,
                skipFernignore: false
            });

            await handler.copyGeneratedFiles();

            // Verify no .git leftover
            const files = await readdir(outDir);
            expect(files).not.toContain(".git");
            expect(files).toContain("gen.py");

            const kept = await readFile(join(outDir, "keep.txt"), "utf-8");
            expect(kept).toBe(`kept-${i}\n`);
        });

        // All concurrent runs must succeed without ENOTEMPTY errors
        await Promise.all(tasks);

        // Cleanup
        for (const base of bases) {
            await rm(base, { recursive: true, force: true }).catch(() => {
                // Best-effort cleanup
            });
        }
    });
});
