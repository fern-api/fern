/**
 * Tests for the deduplication fix in loader.ts.
 *
 * Verifies that:
 * 1. Concurrent calls to loadMigrationModule only trigger a single npm install
 * 2. Failed installs reset the cached promise so subsequent calls can retry
 */
import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Track npm install calls
let npmInstallCallCount = 0;
let shouldFailNpmInstall = false;

// Mock loggingExeca to count npm install invocations
vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn(async (_logger: unknown, command: string, args: string[]) => {
        if (command === "npm" && args[0] === "install") {
            npmInstallCallCount++;
            if (shouldFailNpmInstall) {
                throw new Error("npm install failed: simulated network error");
            }
        }
        return { stdout: "", stderr: "", exitCode: 0 };
    })
}));

// Mock fs/promises
// The lock file mechanism uses open("wx") which returns a FileHandle with
// .writeFile() and .close() methods. We also mock stat to throw ENOENT so
// that ensureMigrationsInstalled always runs npm install.
const mockFileHandle = { writeFile: vi.fn(async () => undefined), close: vi.fn(async () => undefined) };
let mockStatShouldSucceed = false;
vi.mock("fs/promises", () => ({
    mkdir: vi.fn(async () => undefined),
    open: vi.fn(async () => mockFileHandle),
    unlink: vi.fn(async () => undefined),
    stat: vi.fn(async () => {
        if (!mockStatShouldSucceed) {
            const err = new Error("ENOENT") as NodeJS.ErrnoException;
            err.code = "ENOENT";
            throw err;
        }
        return { mtimeMs: Date.now() };
    }),
    readFile: vi.fn(async () =>
        JSON.stringify({
            name: "@fern-api/generator-migrations",
            main: "./dist/index.js"
        })
    )
}));

// Mock os.homedir
vi.mock("os", () => ({
    homedir: vi.fn(() => "/tmp/test-fern-home")
}));

// Mock the dynamic import of the migration entry point
// This simulates what happens when we import the installed package
const mockMigrationsMap = {
    "fernapi/fern-typescript-sdk": {
        migrations: [
            {
                version: "1.5.0",
                migrateGeneratorConfig: ({ config }: { config: unknown }) => config
            }
        ]
    },
    "fernapi/fern-python-sdk": {
        migrations: [
            {
                version: "2.0.0",
                migrateGeneratorConfig: ({ config }: { config: unknown }) => config
            }
        ]
    }
};

function createMockLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

describe("Migration loader deduplication", () => {
    beforeEach(async () => {
        npmInstallCallCount = 0;
        shouldFailNpmInstall = false;
        // Reset the module to clear the module-level migrationsInstallPromise
        vi.resetModules();
        // Re-apply mocks after module reset
        vi.doMock("@fern-api/logging-execa", () => ({
            loggingExeca: vi.fn(async (_logger: unknown, command: string, args: string[]) => {
                if (command === "npm" && args[0] === "install") {
                    npmInstallCallCount++;
                    if (shouldFailNpmInstall) {
                        throw new Error("npm install failed: simulated network error");
                    }
                }
                return { stdout: "", stderr: "", exitCode: 0 };
            })
        }));
        mockStatShouldSucceed = false;
        vi.doMock("fs/promises", () => ({
            mkdir: vi.fn(async () => undefined),
            open: vi.fn(async () => mockFileHandle),
            unlink: vi.fn(async () => undefined),
            stat: vi.fn(async () => {
                if (!mockStatShouldSucceed) {
                    const err = new Error("ENOENT") as NodeJS.ErrnoException;
                    err.code = "ENOENT";
                    throw err;
                }
                return { mtimeMs: Date.now() };
            }),
            readFile: vi.fn(async () =>
                JSON.stringify({
                    name: "@fern-api/generator-migrations",
                    main: "./dist/index.js"
                })
            )
        }));
        vi.doMock("os", () => ({
            homedir: vi.fn(() => "/tmp/test-fern-home")
        }));
    });

    it("should only run npm install once when called concurrently", async () => {
        // We need to mock the dynamic import that happens inside ensureMigrationsInstalled.
        // The function does: const { migrations } = await import(packageEntryPoint);
        // The install dir is the shared cache dir: ~/.fern/migration-cache/
        vi.doMock(
            `/tmp/test-fern-home/.fern/migration-cache/node_modules/@fern-api/generator-migrations/dist/index.js`,
            () => ({
                migrations: mockMigrationsMap
            })
        );

        const { loadMigrationModule } = await import("../loader.js");
        const mockLogger = createMockLogger();

        // Simulate 5 concurrent calls (like 5 workspaces in Promise.all)
        const results = await Promise.all([
            loadMigrationModule({ generatorName: "fernapi/fern-typescript-sdk", logger: mockLogger }),
            loadMigrationModule({ generatorName: "fernapi/fern-python-sdk", logger: mockLogger }),
            loadMigrationModule({ generatorName: "fernapi/fern-typescript-sdk", logger: mockLogger }),
            loadMigrationModule({ generatorName: "fernapi/fern-python-sdk", logger: mockLogger }),
            loadMigrationModule({ generatorName: "fernapi/fern-typescript-sdk", logger: mockLogger })
        ]);

        // KEY ASSERTION: npm install should have been called exactly ONCE
        expect(npmInstallCallCount).toBe(1);

        // All calls should resolve successfully
        expect(results[0]).toBeDefined(); // typescript-sdk
        expect(results[1]).toBeDefined(); // python-sdk
        expect(results[2]).toBeDefined(); // typescript-sdk (same as [0])
        expect(results[3]).toBeDefined(); // python-sdk (same as [1])
        expect(results[4]).toBeDefined(); // typescript-sdk (same as [0])

        // The migration modules should have the expected structure
        expect(results[0]?.migrations).toHaveLength(1);
        expect(results[0]?.migrations[0]?.version).toBe("1.5.0");
        expect(results[1]?.migrations).toHaveLength(1);
        expect(results[1]?.migrations[0]?.version).toBe("2.0.0");
    });

    it("should retry npm install after a transient failure", async () => {
        vi.doMock(
            `/tmp/test-fern-home/.fern/migration-cache/node_modules/@fern-api/generator-migrations/dist/index.js`,
            () => ({
                migrations: mockMigrationsMap
            })
        );

        const { loadMigrationModule } = await import("../loader.js");
        const mockLogger = createMockLogger();

        // First call: make npm install fail
        shouldFailNpmInstall = true;

        await expect(
            loadMigrationModule({ generatorName: "fernapi/fern-typescript-sdk", logger: mockLogger })
        ).rejects.toThrow();

        expect(npmInstallCallCount).toBe(1);

        // Second call: npm install should succeed now
        shouldFailNpmInstall = false;

        // Allow the .catch() handler to run (it resets the cached promise)
        await new Promise((resolve) => setTimeout(resolve, 10));

        const result = await loadMigrationModule({
            generatorName: "fernapi/fern-typescript-sdk",
            logger: mockLogger
        });

        // KEY ASSERTION: npm install should have been called TWICE total
        // (first failed, second succeeded after promise was reset)
        expect(npmInstallCallCount).toBe(2);
        expect(result).toBeDefined();
        expect(result?.migrations).toHaveLength(1);
    });

    it("should return undefined for unknown generators", async () => {
        vi.doMock(
            `/tmp/test-fern-home/.fern/migration-cache/node_modules/@fern-api/generator-migrations/dist/index.js`,
            () => ({
                migrations: mockMigrationsMap
            })
        );

        const { loadMigrationModule } = await import("../loader.js");
        const mockLogger = createMockLogger();

        const result = await loadMigrationModule({
            generatorName: "fernapi/fern-unknown-sdk",
            logger: mockLogger
        });

        expect(result).toBeUndefined();
        // npm install should still have been called once to load the package
        expect(npmInstallCallCount).toBe(1);
    });
});
