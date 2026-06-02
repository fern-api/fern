import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Unit tests for the ENOTEMPTY fix in LocalTaskHandler.
 *
 * These tests use vi.mock to intercept fs/promises.rm (required for ESM) and
 * verify that the .git removal call passes the correct retry options.
 * Integration tests that use real filesystem operations live in
 * LocalTaskHandler.gitCleanup.test.ts.
 */

// Track rm calls via vi.hoisted so the state is available inside vi.mock factories
const { rmCalls } = vi.hoisted(() => ({
    rmCalls: [] as Array<{ path: string; options: Record<string, unknown> | undefined }>
}));

// Mock fs/promises: wrap the real implementation but record rm() calls
vi.mock("fs/promises", async () => {
    const actual = await vi.importActual<typeof import("fs/promises")>("fs/promises");
    return {
        ...actual,
        rm: async (path: string, options?: Record<string, unknown>) => {
            rmCalls.push({ path: String(path), options });
            return actual.rm(path, options as Parameters<typeof actual.rm>[1]);
        }
    };
});

// Mock @fern-api/logging-execa: wrap real implementation but record calls
const { execaCalls } = vi.hoisted(() => ({
    execaCalls: [] as Array<{ cmd: string; args: string[] }>
}));

vi.mock("@fern-api/logging-execa", async () => {
    const actual = await vi.importActual<typeof import("@fern-api/logging-execa")>("@fern-api/logging-execa");
    return {
        ...actual,
        loggingExeca: async (...args: Parameters<typeof actual.loggingExeca>) => {
            const cmd = args[1] as string;
            const cmdArgs = args[2] as string[];
            execaCalls.push({ cmd, args: cmdArgs });
            return actual.loggingExeca(...args);
        }
    };
});

import { mkdir, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

describe("LocalTaskHandler - .git cleanup unit tests", { timeout: 30000 }, () => {
    let localOutputDir: string;
    let tmpOutputDir: string;

    beforeEach(async () => {
        // Clear tracked calls between tests
        rmCalls.length = 0;
        execaCalls.length = 0;

        const base = join(tmpdir(), `git-cleanup-unit-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        localOutputDir = join(base, "output");
        tmpOutputDir = join(base, "generated");
        await mkdir(localOutputDir, { recursive: true });
        await mkdir(tmpOutputDir, { recursive: true });
    });

    async function createLocalTaskHandler(): Promise<
        InstanceType<typeof import("../LocalTaskHandler.js").LocalTaskHandler>
    > {
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

    it("calls rm(.git) with maxRetries: 3, retryDelay: 100, force: true, recursive: true", async () => {
        await writeFile(join(localOutputDir, ".fernignore"), "keep.txt\n");
        await writeFile(join(localOutputDir, "keep.txt"), "kept\n");
        await writeFile(join(tmpOutputDir, "gen.py"), "# gen\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // Find the rm call that targets a .git path
        const gitRmCall = rmCalls.find((call) => call.path.endsWith(".git"));

        expect(gitRmCall).toBeDefined();
        const opts = gitRmCall?.options;
        expect(opts).toBeDefined();
        expect(opts?.recursive).toBe(true);
        expect(opts?.force).toBe(true);
        expect(opts?.maxRetries).toBe(3);
        expect(opts?.retryDelay).toBe(100);
    });

    it("invokes git config gc.auto 0 between git init and git add", async () => {
        await writeFile(join(localOutputDir, ".fernignore"), "keep.txt\n");
        await writeFile(join(localOutputDir, "keep.txt"), "kept\n");
        await writeFile(join(tmpOutputDir, "gen.py"), "# gen\n");

        const handler = await createLocalTaskHandler();
        await handler.copyGeneratedFiles();

        // Filter to git commands only
        const gitCalls = execaCalls.filter((c) => c.cmd === "git").map((c) => c.args);

        const initIdx = gitCalls.findIndex((args) => args.some((a) => a === "init"));
        const gcAutoIdx = gitCalls.findIndex(
            (args) => args.includes("config") && args.includes("gc.auto") && args.includes("0")
        );
        const firstAddIdx = gitCalls.findIndex((args) => args.some((a) => a === "add") && args.some((a) => a === "."));

        // All three must be present
        expect(initIdx).toBeGreaterThan(-1);
        expect(gcAutoIdx).toBeGreaterThan(-1);
        expect(firstAddIdx).toBeGreaterThan(-1);

        // Order: init → gc.auto 0 → add
        expect(gcAutoIdx).toBeGreaterThan(initIdx);
        expect(gcAutoIdx).toBeLessThan(firstAddIdx);
    });
});
