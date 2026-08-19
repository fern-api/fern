import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for .fernignore handling in LocalTaskHandler.copyGeneratedFiles().
 *
 * These tests verify that when a .fernignore file is present in the output directory,
 * files listed in .fernignore are preserved after copying generated files — the same
 * behavior used by both `fern generate` and `pnpm seed run`.
 *
 * The tests use real filesystem operations and git commands to exercise the actual
 * .fernignore resolution logic (throwaway git repo approach).
 */

describe("LocalTaskHandler - .fernignore handling", { timeout: 30000 }, () => {
    let localOutputDir: string;
    let tmpOutputDir: string;

    beforeEach(async () => {
        const base = join(tmpdir(), `fernignore-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localOutputDir = join(base, "output");
        tmpOutputDir = join(base, "generated");
        await mkdir(localOutputDir, { recursive: true });
        await mkdir(tmpOutputDir, { recursive: true });
    });

    afterEach(async () => {
        // Clean up both directories
        const base = join(localOutputDir, "..");
        await rm(base, { recursive: true, force: true }).catch(() => {
            // Best-effort cleanup of temp directories
        });
    });

    async function createLocalTaskHandler({ skipFernignore }: { skipFernignore?: boolean } = {}) {
        // Dynamic import to avoid hoisting issues with mocks from other test files
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
            skipFernignore
        });
    }

    it("preserves files listed in .fernignore when output directory is not a git repo", async () => {
        // Set up existing output directory with .fernignore and custom files
        await writeFile(join(localOutputDir, ".fernignore"), "custom_test.py\ncustom_dir/my_file.txt\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# my custom test\nassert True\n");
        await mkdir(join(localOutputDir, "custom_dir"), { recursive: true });
        await writeFile(join(localOutputDir, "custom_dir", "my_file.txt"), "my custom content\n");
        await writeFile(join(localOutputDir, "generated_client.py"), "# old generated client\n");

        // Set up generated output (new files from the generator)
        await writeFile(join(tmpOutputDir, "generated_client.py"), "# NEW generated client\n");
        await writeFile(join(tmpOutputDir, "new_generated_file.py"), "# new file from generator\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# Generated README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // Verify preserved files still have original content
        const customTestContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(customTestContent).toBe("# my custom test\nassert True\n");

        const customDirContent = await readFile(join(localOutputDir, "custom_dir", "my_file.txt"), "utf-8");
        expect(customDirContent).toBe("my custom content\n");

        // Verify .fernignore itself is preserved
        const fernignoreContent = await readFile(join(localOutputDir, ".fernignore"), "utf-8");
        expect(fernignoreContent).toBe("custom_test.py\ncustom_dir/my_file.txt\n");

        // Verify generated files were written
        const generatedClientContent = await readFile(join(localOutputDir, "generated_client.py"), "utf-8");
        expect(generatedClientContent).toBe("# NEW generated client\n");

        const newFileContent = await readFile(join(localOutputDir, "new_generated_file.py"), "utf-8");
        expect(newFileContent).toBe("# new file from generator\n");
    });

    it("preserves files when generator output also produces a file with a fernignored name", async () => {
        // Set up: .fernignore protects custom_test.py, but the generator ALSO produces custom_test.py
        await writeFile(join(localOutputDir, ".fernignore"), "custom_test.py\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# ORIGINAL custom content\n");
        await writeFile(join(localOutputDir, "client.py"), "# old client\n");

        // Generator produces a custom_test.py too (should be ignored in favor of user's version)
        await writeFile(
            join(tmpOutputDir, "custom_test.py"),
            "# GENERATED custom_test.py (should NOT replace user's)\n"
        );
        await writeFile(join(tmpOutputDir, "client.py"), "# new client\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // User's custom_test.py should be preserved, NOT overwritten by generator's version
        const customTestContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(customTestContent).toBe("# ORIGINAL custom content\n");

        // Generated client.py should be updated
        const clientContent = await readFile(join(localOutputDir, "client.py"), "utf-8");
        expect(clientContent).toBe("# new client\n");
    });

    it("deletes files not in .fernignore that are no longer generated", async () => {
        // Set up: output has old_file.py which is NOT in .fernignore and NOT regenerated
        await writeFile(join(localOutputDir, ".fernignore"), "custom_test.py\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# my custom test\n");
        await writeFile(join(localOutputDir, "old_file.py"), "# this should be deleted\n");

        // Generator only produces client.py (not old_file.py)
        await writeFile(join(tmpOutputDir, "client.py"), "# new client\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // custom_test.py should be preserved
        const customTestContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(customTestContent).toBe("# my custom test\n");

        // old_file.py should be gone (not in .fernignore, not regenerated)
        const files = await readdir(localOutputDir);
        expect(files).not.toContain("old_file.py");

        // client.py should exist
        expect(files).toContain("client.py");
    });

    it("works with glob patterns in .fernignore", async () => {
        // Set up: .fernignore uses a glob pattern
        await writeFile(join(localOutputDir, ".fernignore"), "tests/**\n");
        await mkdir(join(localOutputDir, "tests"), { recursive: true });
        await writeFile(join(localOutputDir, "tests", "test_one.py"), "# test one\n");
        await writeFile(join(localOutputDir, "tests", "test_two.py"), "# test two\n");
        await mkdir(join(localOutputDir, "src"), { recursive: true });
        await writeFile(join(localOutputDir, "src", "client.py"), "# old\n");

        // Generator produces new src/ files but no tests/
        await mkdir(join(tmpOutputDir, "src"), { recursive: true });
        await writeFile(join(tmpOutputDir, "src", "client.py"), "# new client\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // tests/ should be preserved by glob pattern
        const testOneContent = await readFile(join(localOutputDir, "tests", "test_one.py"), "utf-8");
        expect(testOneContent).toBe("# test one\n");

        const testTwoContent = await readFile(join(localOutputDir, "tests", "test_two.py"), "utf-8");
        expect(testTwoContent).toBe("# test two\n");

        // src/client.py should be updated
        const clientContent = await readFile(join(localOutputDir, "src", "client.py"), "utf-8");
        expect(clientContent).toBe("# new client\n");
    });

    it("handles .fernignore with comments and blank lines", async () => {
        await writeFile(
            join(localOutputDir, ".fernignore"),
            "# This is a comment\ncustom_test.py\n\n# Another comment\ncustom_config.json\n"
        );
        await writeFile(join(localOutputDir, "custom_test.py"), "# custom test\n");
        await writeFile(join(localOutputDir, "custom_config.json"), '{"custom": true}\n');
        await writeFile(join(localOutputDir, "old_generated.py"), "# old\n");

        await writeFile(join(tmpOutputDir, "new_generated.py"), "# new\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // Both custom files should be preserved
        const testContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(testContent).toBe("# custom test\n");

        const configContent = await readFile(join(localOutputDir, "custom_config.json"), "utf-8");
        expect(configContent).toBe('{"custom": true}\n');

        // Old generated file should be gone, new one should be there
        const files = await readdir(localOutputDir);
        expect(files).not.toContain("old_generated.py");
        expect(files).toContain("new_generated.py");
    });

    it("without .fernignore, all old files are replaced", async () => {
        // No .fernignore — all existing files should be deleted
        await writeFile(join(localOutputDir, "old_file.py"), "# old\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# custom\n");

        await writeFile(join(tmpOutputDir, "new_file.py"), "# new\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        const files = await readdir(localOutputDir);
        expect(files).toContain("new_file.py");
        expect(files).not.toContain("old_file.py");
        expect(files).not.toContain("custom_test.py");
    });

    it("with skipFernignore, .fernignore is skipped and all files are overwritten", async () => {
        // Set up: .fernignore protects custom_test.py, but skipFernignore should bypass it
        await writeFile(join(localOutputDir, ".fernignore"), "custom_test.py\ncustom_config.json\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# ORIGINAL custom content\n");
        await writeFile(join(localOutputDir, "custom_config.json"), '{"custom": true}\n');
        await writeFile(join(localOutputDir, "old_generated.py"), "# old generated\n");

        // Generator produces new files (including one with a fernignored name)
        await writeFile(join(tmpOutputDir, "custom_test.py"), "# GENERATED custom_test.py\n");
        await writeFile(join(tmpOutputDir, "new_file.py"), "# new\n");

        const handler = await createLocalTaskHandler({ skipFernignore: true });
        await handler.copyGeneratedFiles();

        // custom_test.py should be OVERWRITTEN (not preserved) because skipFernignore is true
        const customTestContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(customTestContent).toBe("# GENERATED custom_test.py\n");

        // new_file.py should exist
        const files = await readdir(localOutputDir);
        expect(files).toContain("new_file.py");
        expect(files).toContain("custom_test.py");

        // old files not in generated output should be gone
        expect(files).not.toContain("old_generated.py");
        expect(files).not.toContain("custom_config.json");
    });

    it("with skipFernignore=false, .fernignore is still respected", async () => {
        // Set up: .fernignore protects custom_test.py, skipFernignore=false (default behavior)
        await writeFile(join(localOutputDir, ".fernignore"), "custom_test.py\n");
        await writeFile(join(localOutputDir, "custom_test.py"), "# ORIGINAL custom content\n");

        // Generator produces a new version of custom_test.py
        await writeFile(join(tmpOutputDir, "custom_test.py"), "# GENERATED version\n");
        await writeFile(join(tmpOutputDir, "client.py"), "# new client\n");
        await writeFile(join(tmpOutputDir, "README.md"), "# README\n");

        const handler = await createLocalTaskHandler({ skipFernignore: false });
        await handler.copyGeneratedFiles();

        // custom_test.py should be PRESERVED (not overwritten)
        const customTestContent = await readFile(join(localOutputDir, "custom_test.py"), "utf-8");
        expect(customTestContent).toBe("# ORIGINAL custom content\n");
    });
});
