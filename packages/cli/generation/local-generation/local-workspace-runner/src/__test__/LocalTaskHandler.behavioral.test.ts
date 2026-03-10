import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for unified behavioral analysis in LocalTaskHandler.
 *
 * The merged AnalyzeSdkDiff prompt handles both surface-level and behavioral
 * change detection in a single AI call. These tests verify:
 * - Behavioral changes (retry counts, HTTP handling, serialization) are classified as MINOR
 * - Non-behavioral internal changes are classified as PATCH
 * - Surface-level changes (new/removed APIs) still work as MAJOR/MINOR
 * - Changelog entries are properly generated for MINOR/MAJOR
 * - Changelog entries are empty for PATCH
 */

// Use vi.hoisted so mock fns are available in vi.mock factories (which are hoisted)
const { mockAnalyzeSdkDiff, mockWithOptions } = vi.hoisted(() => {
    const mockAnalyzeSdkDiff = vi.fn();
    const mockWithOptions = vi.fn().mockReturnValue({
        AnalyzeSdkDiff: mockAnalyzeSdkDiff
    });
    return { mockAnalyzeSdkDiff, mockWithOptions };
});

// Mock @boundaryml/baml (must be before @fern-api/cli-ai mock since it depends on it)
vi.mock("@boundaryml/baml", () => {
    const noop = () => {
        /* noop */
    };
    return {
        ClientRegistry: class ClientRegistry {},
        BamlRuntime: {
            fromFiles: () => ({
                callFunction: vi.fn(),
                streamFunction: vi.fn()
            })
        },
        BamlCtxManager: class BamlCtxManager {
            cloneContext() {
                return {};
            }
            allowResets() {
                return false;
            }
            reset() {
                /* noop */
            }
            traceFnAsync() {
                return noop;
            }
            traceFnSync() {
                return noop;
            }
            upsertTags() {
                /* noop */
            }
            flush() {
                /* noop */
            }
            onLogEvent() {
                /* noop */
            }
        },
        toBamlError: (e: unknown) => e,
        BamlStream: class BamlStream {},
        BamlAbortError: class BamlAbortError extends Error {},
        BamlClientHttpError: class BamlClientHttpError extends Error {},
        BamlValidationError: class BamlValidationError extends Error {},
        BamlClientFinishReasonError: class BamlClientFinishReasonError extends Error {},
        Collector: class Collector {},
        getLogLevel: () => "ERROR",
        setLogLevel: noop,
        ThrowIfVersionMismatch: noop
    };
});

// Mock the @fern-api/cli-ai module
vi.mock("@fern-api/cli-ai", async () => {
    const actual = await vi.importActual("@fern-api/cli-ai");
    return {
        ...actual,
        b: {
            withOptions: mockWithOptions
        },
        configureBamlClient: vi.fn().mockReturnValue({})
    };
});

// Mock @fern-api/logging-execa
vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn().mockResolvedValue({ stdout: "" })
}));

// Mock fs/promises - readFile must return content containing the magic version
// so extractPreviousVersion can find a version pair
vi.mock("fs/promises", async () => {
    const actual = await vi.importActual("fs/promises");
    return {
        ...actual,
        readFile: vi
            .fn()
            .mockResolvedValue(
                "diff --git a/src/client.ts b/src/client.ts\n" +
                    "--- a/src/client.ts\n" +
                    "+++ b/src/client.ts\n" +
                    '-  "version": "1.0.0"\n' +
                    '+  "version": "505.503.4455"\n' +
                    "+  const MAX_RETRIES = 5;\n"
            ),
        rm: vi.fn().mockResolvedValue(undefined),
        readdir: vi.fn().mockResolvedValue([]),
        cp: vi.fn().mockResolvedValue(undefined),
        mkdir: vi.fn().mockResolvedValue(undefined)
    };
});

// Mock os.tmpdir
vi.mock("os", () => ({
    tmpdir: () => "/tmp"
}));

// Mock @fern-api/fs-utils
vi.mock("@fern-api/fs-utils", () => ({
    AbsoluteFilePath: {
        of: (p: string) => p
    },
    doesPathExist: vi.fn().mockResolvedValue(true),
    join: (...args: string[]) => args.join("/"),
    RelativeFilePath: {
        of: (p: string) => p
    }
}));

// Mock @fern-api/configuration
vi.mock("@fern-api/configuration", () => ({
    FERNIGNORE_FILENAME: ".fernignore",
    generatorsYml: {},
    getFernIgnorePaths: vi.fn().mockResolvedValue([])
}));

// Mock decompress
vi.mock("decompress", () => ({
    default: vi.fn()
}));

// Mock tmp-promise
vi.mock("tmp-promise", () => ({
    default: {
        dir: vi.fn().mockResolvedValue({ path: "/tmp/test" })
    }
}));

// Mock semver
vi.mock("semver", () => ({
    default: {
        clean: (v: string) => v.replace(/^v/, ""),
        inc: (v: string, type: string) => {
            const parts = v.split(".").map(Number);
            if (type === "major") {
                return `${(parts[0] ?? 0) + 1}.0.0`;
            }
            if (type === "minor") {
                return `${parts[0] ?? 0}.${(parts[1] ?? 0) + 1}.0`;
            }
            return `${parts[0] ?? 0}.${parts[1] ?? 0}.${(parts[2] ?? 0) + 1}`;
        }
    }
}));

// Mock the AutoVersioningService
vi.mock("../AutoVersioningService.js", () => ({
    AutoVersioningService: class MockAutoVersioningService {
        extractPreviousVersion() {
            return "1.0.0";
        }
        cleanDiffForAI() {
            return "cleaned diff content";
        }
        replaceMagicVersion() {
            return Promise.resolve(undefined);
        }
    },
    AutoVersioningException: class AutoVersioningException extends Error {
        constructor(message: string) {
            super(message);
            this.name = "AutoVersioningException";
        }
    },
    DIFF_SIZE_LIMIT: 100_000,
    countFilesInDiff: (diff: string) => {
        return (diff.match(/diff --git/g) ?? []).length;
    },
    formatSizeKB: (charLength: number) => {
        return (charLength / 1024).toFixed(1);
    }
}));

// Mock AutoVersioningCache — provide real-ish implementation for cache tests
vi.mock("../AutoVersioningCache.js", () => ({
    AutoVersioningCache: class MockAutoVersioningCache {
        private cache = new Map<string, Promise<unknown>>();

        key(
            cleanedDiff: string,
            language: string,
            previousVersion: string,
            priorChangelog: string = "",
            specCommitMessage: string = ""
        ) {
            return `${language}:${previousVersion}:${priorChangelog.slice(0, 4)}:${specCommitMessage.slice(0, 4)}:${cleanedDiff.slice(0, 8)}`;
        }

        getOrCompute(key: string, compute: () => Promise<unknown>) {
            const existing = this.cache.get(key);
            if (existing !== undefined) {
                return { promise: existing, isHit: true };
            }
            const promise = compute().catch((error: unknown) => {
                this.cache.delete(key);
                throw error;
            });
            this.cache.set(key, promise);
            return { promise, isHit: false };
        }
    }
}));

// Mock VersionUtils
vi.mock("../VersionUtils.js", () => ({
    isAutoVersion: vi.fn().mockReturnValue(true)
}));

// Import after mocks are set up
import { VersionBump } from "@fern-api/cli-ai";

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

const mockContext = {
    logger: mockLogger
};

async function callHandleAutoVersioning(
    // biome-ignore lint/suspicious/noExplicitAny: accessing private method for testing
    handler: any
): Promise<{ version: string; commitMessage: string; changelogEntry?: string } | null> {
    return handler.handleAutoVersioning();
}

describe("LocalTaskHandler - Unified Behavioral Analysis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
    });

    // Helper to import LocalTaskHandler fresh for each test
    async function createTaskHandler(overrides: Record<string, unknown> = {}) {
        const { LocalTaskHandler } = await import("../LocalTaskHandler.js");
        return new LocalTaskHandler({
            // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
            context: mockContext as any,
            // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
            absolutePathToTmpOutputDirectory: "/tmp/output" as any,
            absolutePathToTmpSnippetJSON: undefined,
            absolutePathToLocalSnippetTemplateJSON: undefined,
            // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
            absolutePathToLocalOutput: "/tmp/local-output" as any,
            absolutePathToLocalSnippetJSON: undefined,
            absolutePathToTmpSnippetTemplatesJSON: undefined,
            version: "505.503.4455",
            ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
            isWhitelabel: false,
            generatorLanguage: "typescript",
            absolutePathToSpecRepo: undefined,
            ...overrides
        });
    }

    it("classifies behavioral retry count change as MINOR with changelog", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: increase default retry count from 3 to 5",
            changelog_entry: "The default retry count has been increased from 3 to 5."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
        expect(result).not.toBeNull();
        expect(result?.version).toBe("1.1.0");
        expect(result?.commitMessage).toContain("feat: increase default retry count from 3 to 5");
        expect(result?.changelogEntry).toBe("The default retry count has been increased from 3 to 5.");
    });

    it("classifies HTTP 404 handling change as MINOR with changelog", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: throw NotFoundError on 404 instead of returning null",
            changelog_entry:
                "HTTP 404 responses now throw a NotFoundError instead of returning null. Update error handling accordingly."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("1.1.0");
        expect(result?.commitMessage).toContain("feat: throw NotFoundError on 404");
        expect(result?.changelogEntry).toContain("NotFoundError");
    });

    it("classifies date serialization format change as MINOR with changelog", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: change date serialization from ISO 8601 to Unix timestamp",
            changelog_entry: "Date serialization has changed from ISO 8601 to Unix timestamp format."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("1.1.0");
        expect(result?.changelogEntry).toContain("Date serialization");
    });

    it("classifies import-only reorganization as PATCH with empty changelog", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "refactor: reorganize imports",
            changelog_entry: ""
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("1.0.1");
        expect(result?.changelogEntry).toBeUndefined();
    });

    it("classifies removed exported function as MAJOR with changelog", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MAJOR,
            message: "break: remove deprecated getUser endpoint",
            changelog_entry: "The `getUser` method has been removed. Use `fetchUser(id)` instead."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("2.0.0");
        expect(result?.changelogEntry).toContain("getUser");
    });

    it("classifies new endpoint addition as MINOR", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: add new endpoint for user management",
            changelog_entry: "New `createUser()` method available on `UsersClient`."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
        expect(result).not.toBeNull();
        expect(result?.commitMessage).toContain("feat: add new endpoint for user management");
    });

    it("applies Fern branding to commit message", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: increase default retry count from 3 to 5",
            changelog_entry: "The default retry count has been increased."
        });

        const handler = await createTaskHandler({ isWhitelabel: false });
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.commitMessage).toContain("Generated with Fern");
    });

    it("omits Fern branding for whitelabel", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: increase default retry count from 3 to 5",
            changelog_entry: "The default retry count has been increased."
        });

        const handler = await createTaskHandler({ isWhitelabel: true });
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.commitMessage).not.toContain("Generated with Fern");
    });

    it("only makes a single AI call for behavioral changes", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: change HTTP 404 handling",
            changelog_entry: "HTTP 404 now throws instead of returning null."
        });

        const handler = await createTaskHandler();
        await callHandleAutoVersioning(handler);

        // Verify only ONE AI call was made (unified prompt, no separate Tier 3)
        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
    });
});

describe("LocalTaskHandler - Unified Analysis with Cache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
    });

    async function createCachedTaskHandler(overrides: Record<string, unknown> = {}) {
        const { LocalTaskHandler } = await import("../LocalTaskHandler.js");
        const { AutoVersioningCache } = await import("../AutoVersioningCache.js");
        const cache = new AutoVersioningCache();
        return {
            handler: new LocalTaskHandler({
                // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
                context: mockContext as any,
                // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
                absolutePathToTmpOutputDirectory: "/tmp/output" as any,
                absolutePathToTmpSnippetJSON: undefined,
                absolutePathToLocalSnippetTemplateJSON: undefined,
                // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
                absolutePathToLocalOutput: "/tmp/local-output" as any,
                absolutePathToLocalSnippetJSON: undefined,
                absolutePathToTmpSnippetTemplatesJSON: undefined,
                version: "505.503.4455",
                ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
                isWhitelabel: false,
                generatorLanguage: "typescript",
                absolutePathToSpecRepo: undefined,
                autoVersioningCache: cache,
                ...overrides
            }),
            cache
        };
    }

    async function createSharedCacheHandlers() {
        const { LocalTaskHandler } = await import("../LocalTaskHandler.js");
        const { AutoVersioningCache } = await import("../AutoVersioningCache.js");
        const sharedCache = new AutoVersioningCache();

        const makeHandler = () =>
            new LocalTaskHandler({
                // biome-ignore lint/suspicious/noExplicitAny: mock context for testing
                context: mockContext as any,
                // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
                absolutePathToTmpOutputDirectory: "/tmp/output" as any,
                absolutePathToTmpSnippetJSON: undefined,
                absolutePathToLocalSnippetTemplateJSON: undefined,
                // biome-ignore lint/suspicious/noExplicitAny: mock path for testing
                absolutePathToLocalOutput: "/tmp/local-output" as any,
                absolutePathToLocalSnippetJSON: undefined,
                absolutePathToTmpSnippetTemplatesJSON: undefined,
                version: "505.503.4455",
                ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
                isWhitelabel: false,
                generatorLanguage: "typescript",
                absolutePathToSpecRepo: undefined,
                autoVersioningCache: sharedCache
            });

        return { handler1: makeHandler(), handler2: makeHandler(), sharedCache };
    }

    it("deduplicates concurrent AI calls via cache", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: increase default timeout",
            changelog_entry: "Default timeout has been increased."
        });

        const { handler1, handler2 } = await createSharedCacheHandlers();

        // Run concurrently — both should get the same result
        const [result1, result2] = await Promise.all([
            callHandleAutoVersioning(handler1),
            callHandleAutoVersioning(handler2)
        ]);

        // Both should have the MINOR result
        expect(result1?.version).toBe("1.1.0");
        expect(result2?.version).toBe("1.1.0");

        // AI should only be called ONCE (second call reuses the cached promise)
        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
    });

    it("logs cache hit on second call", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: internal refactoring",
            changelog_entry: ""
        });

        const { handler1, handler2 } = await createSharedCacheHandlers();

        // First call populates cache
        await callHandleAutoVersioning(handler1);
        // Second call should hit cache
        await callHandleAutoVersioning(handler2);

        // Check that cache hit was logged
        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("Cache hit"));
    });
});
