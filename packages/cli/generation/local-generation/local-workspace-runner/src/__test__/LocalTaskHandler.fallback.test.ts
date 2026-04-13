import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for the auto-versioning fallback chain in LocalTaskHandler.
 *
 * When the magic version placeholder is not found in the diff (e.g., Swift SDKs
 * that use git tags via SPM), or when it IS found but no previous version line
 * exists (e.g., Version.swift is brand-new in an existing SDK), the handler
 * falls back through:
 *   1. .fern/metadata.json (from git HEAD) → 2. git tags → 3. initial version (0.0.1)
 *
 * These tests verify:
 * - Each fallback level is tried in order
 * - Failures at each level are handled gracefully (no crashes)
 * - normalizeVersionPrefix correctly matches the magic version's convention
 * - The "new SDK repository" path returns 0.0.1 with correct branding
 */

// Use vi.hoisted so mock fns are available in vi.mock factories (which are hoisted)
const { mockAnalyzeSdkDiff, mockWithOptions, mockChunkDiff, mockLoggingExeca, mockExtractPreviousVersion } = vi.hoisted(
    () => {
        const mockAnalyzeSdkDiff = vi.fn();
        const mockWithOptions = vi.fn().mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
        const mockChunkDiff = vi.fn().mockReturnValue(["cleaned diff content"]);
        const mockLoggingExeca = vi.fn();
        const mockExtractPreviousVersion = vi.fn();
        return { mockAnalyzeSdkDiff, mockWithOptions, mockChunkDiff, mockLoggingExeca, mockExtractPreviousVersion };
    }
);

// Mock @boundaryml/baml
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

// Mock @fern-api/logging-execa — this is critical for testing getVersionFromLocalMetadata
// and getLatestVersionFromGitTags since both call loggingExeca
vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: mockLoggingExeca
}));

// Mock fs/promises - readFile returns a diff where magic version IS present but
// there's no matching minus line (simulates Version.swift being a new file in existing SDK)
vi.mock("fs/promises", async () => {
    const actual = await vi.importActual("fs/promises");
    return {
        ...actual,
        readFile: vi
            .fn()
            .mockResolvedValue(
                "diff --git a/Sources/Version.swift b/Sources/Version.swift\n" +
                    "new file mode 100644\n" +
                    "--- /dev/null\n" +
                    "+++ b/Sources/Version.swift\n" +
                    "@@ -0,0 +1 @@\n" +
                    '+public let sdkVersion = "0.0.0-fern-placeholder"\n'
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

// Mock the AutoVersioningService — extractPreviousVersion is configurable per test
vi.mock("../AutoVersioningService.js", () => ({
    AutoVersioningService: class MockAutoVersioningService {
        extractPreviousVersion(...args: unknown[]) {
            return mockExtractPreviousVersion(...args);
        }
        cleanDiffForAI() {
            return "cleaned diff content";
        }
        chunkDiff(...args: unknown[]) {
            return mockChunkDiff(...args);
        }
        replaceMagicVersion() {
            return Promise.resolve(undefined);
        }
        getLatestVersionFromGitTags() {
            // This will be overridden per-test via mockLoggingExeca behavior,
            // but since this is the mock, we need to make it call loggingExeca
            // through the real code path. Instead, we'll mock this directly.
            return Promise.resolve(undefined);
        }
    },
    AutoVersioningException: class AutoVersioningException extends Error {
        public readonly magicVersionAbsent: boolean;
        constructor(message: string, options?: { cause?: Error; magicVersionAbsent?: boolean }) {
            super(message);
            this.name = "AutoVersioningException";
            this.magicVersionAbsent = options?.magicVersionAbsent ?? false;
            if (options?.cause) {
                this.cause = options.cause;
            }
        }
    },
    countFilesInDiff: (diff: string) => {
        return (diff.match(/diff --git/g) ?? []).length;
    },
    formatSizeKB: (charLength: number) => {
        return (charLength / 1024).toFixed(1);
    }
}));

// Mock AutoVersioningCache
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
vi.mock("../VersionUtils.js", async () => {
    const actual = await vi.importActual("../VersionUtils.js");
    return {
        ...actual,
        isAutoVersion: vi.fn().mockReturnValue(true)
    };
});

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

describe("LocalTaskHandler - Fallback Chain (magic version absent)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
        mockChunkDiff.mockReturnValue(["cleaned diff content"]);
        // Default: loggingExeca returns empty stdout for any git command
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 0 });
    });

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
            version: "0.0.0-fern-placeholder",
            ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
            isWhitelabel: false,
            generatorLanguage: "swift",
            absolutePathToSpecRepo: undefined,
            ...overrides
        });
    }

    it("falls back to .fern/metadata.json when magic version absent from diff", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        // extractPreviousVersion throws — magic version not in diff (Swift case)
        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // git show HEAD:.fern/metadata.json returns a valid metadata file
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: JSON.stringify({ sdkVersion: "1.5.0" }),
                    exitCode: 0
                });
            }
            // diff file generation
            if (cmd === "git" && args[0] === "diff") {
                return Promise.resolve({ stdout: "", exitCode: 0 });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        // AI analysis for the cleaned diff
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "fix: update SDK",
            changelog_entry: ""
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Should have used 1.5.0 as previous version → PATCH → 1.5.1
        expect(result?.version).toBe("1.5.1");
    });

    it("falls through to initial version when both metadata.json and git tags fail", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        // extractPreviousVersion throws — magic version not in diff
        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // git show HEAD:.fern/metadata.json fails (file doesn't exist)
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: "",
                    exitCode: 128 // git show returns 128 for missing files
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        // getLatestVersionFromGitTags is mocked to return undefined (no tags)

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        // Should treat as new SDK repository
        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
        expect(result?.commitMessage).toContain("Initial SDK generation");
    });

    it("preserves v prefix for Go-style magic versions in initial version", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // Both fallbacks fail
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 128 });

        const handler = await createTaskHandler({ version: "v0.0.0-fern-placeholder" });
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("v0.0.1");
    });

    it("does not crash when metadata.json contains invalid JSON", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // git show returns garbage
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: "not valid json {{{",
                    exitCode: 0
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        // Should not crash — falls through to initial version
        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
    });

    it("does not crash when metadata.json has no sdkVersion field", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // git show returns valid JSON but without sdkVersion
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: JSON.stringify({ someOtherField: "value" }),
                    exitCode: 0
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        // Should not crash — falls through to initial version
        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
    });

    it("does not crash when git show throws an error", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // git show throws
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.reject(new Error("git show failed unexpectedly"));
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        // Should not crash — falls through to initial version
        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
    });

    it("re-throws non-AutoVersioningException errors from extractPreviousVersion", async () => {
        // A random error (not AutoVersioningException) should NOT be caught by the fallback
        mockExtractPreviousVersion.mockImplementation(() => {
            throw new TypeError("Cannot read properties of undefined");
        });

        const handler = await createTaskHandler();

        // The outer catch re-throws non-AutoVersioningException errors after logging
        await expect(callHandleAutoVersioning(handler)).rejects.toThrow("Automatic versioning failed");
        expect(mockLogger.error).toHaveBeenCalledWith(
            expect.stringContaining("Failed to perform automatic versioning")
        );
    });

    it("falls back to initial version for AutoVersioningException with magicVersionAbsent=false", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        // AutoVersioningException but NOT the magic-version-absent case
        // This re-throws from inner catch, then the outer catch handles it
        // as an AutoVersioningException → falls back to initial version
        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Some other extraction error", { magicVersionAbsent: false });
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        // The outer catch handles AutoVersioningException by falling back to initial version
        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining("AUTO versioning could not extract previous version")
        );
    });

    it("adds Fern branding to initial SDK commit for non-whitelabel", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 128 });

        const handler = await createTaskHandler({ isWhitelabel: false });
        const result = await callHandleAutoVersioning(handler);

        expect(result?.commitMessage).toContain("Generated with Fern");
    });

    it("omits Fern branding for whitelabel initial SDK commit", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 128 });

        const handler = await createTaskHandler({ isWhitelabel: true });
        const result = await callHandleAutoVersioning(handler);

        expect(result?.commitMessage).not.toContain("Generated with Fern");
        expect(result?.commitMessage).toBe("Initial SDK generation");
    });
});

describe("LocalTaskHandler - Fallback Chain (magic version present, no previous version)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
        mockChunkDiff.mockReturnValue(["cleaned diff content"]);
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 0 });
    });

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
            version: "0.0.0-fern-placeholder",
            ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
            isWhitelabel: false,
            generatorLanguage: "swift",
            absolutePathToSpecRepo: undefined,
            ...overrides
        });
    }

    it("tries metadata.json when extractPreviousVersion returns undefined (new file scenario)", async () => {
        // extractPreviousVersion returns undefined — magic version IS in diff but no minus line
        // (e.g., Version.swift is a brand-new file in an existing SDK)
        mockExtractPreviousVersion.mockReturnValue(undefined);

        // .fern/metadata.json has the real previous version
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: JSON.stringify({ sdkVersion: "2.3.0" }),
                    exitCode: 0
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: add new endpoint",
            changelog_entry: "New endpoint added."
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Should have used 2.3.0 as previous version → MINOR → 2.4.0
        expect(result?.version).toBe("2.4.0");
    });

    it("falls to initial version when extractPreviousVersion returns undefined and both fallbacks fail", async () => {
        mockExtractPreviousVersion.mockReturnValue(undefined);

        // Both metadata.json and git tags fail
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 128 });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        expect(result?.version).toBe("0.0.1");
        expect(result?.commitMessage).toContain("Initial SDK generation");
    });
});

describe("LocalTaskHandler - normalizeVersionPrefix", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff
        });
        mockChunkDiff.mockReturnValue(["cleaned diff content"]);
        mockLoggingExeca.mockResolvedValue({ stdout: "", exitCode: 0 });
    });

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
            version: "0.0.0-fern-placeholder",
            ai: { provider: "anthropic", model: "claude-sonnet-4-5-20250929" },
            isWhitelabel: false,
            generatorLanguage: "swift",
            absolutePathToSpecRepo: undefined,
            ...overrides
        });
    }

    it("strips v prefix from metadata version when magic version has no prefix", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // metadata.json returns a v-prefixed version
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: JSON.stringify({ sdkVersion: "v3.0.0" }),
                    exitCode: 0
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "fix: update",
            changelog_entry: ""
        });

        // magic version is "0.0.0-fern-placeholder" (no v prefix)
        const handler = await createTaskHandler({ version: "0.0.0-fern-placeholder" });
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // v prefix should be stripped → 3.0.0 → PATCH → 3.0.1
        expect(result?.version).toBe("3.0.1");
    });

    it("adds v prefix when magic version has v prefix but metadata version does not", async () => {
        const { AutoVersioningException } = await import("../AutoVersioningService.js");

        mockExtractPreviousVersion.mockImplementation(() => {
            throw new AutoVersioningException("Magic version not found", { magicVersionAbsent: true });
        });

        // metadata.json returns bare version
        mockLoggingExeca.mockImplementation((_logger: unknown, cmd: string, args: string[]) => {
            if (cmd === "git" && args[0] === "show" && args[1] === "HEAD:.fern/metadata.json") {
                return Promise.resolve({
                    stdout: JSON.stringify({ sdkVersion: "3.0.0" }),
                    exitCode: 0
                });
            }
            return Promise.resolve({ stdout: "", exitCode: 0 });
        });

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "fix: update",
            changelog_entry: ""
        });

        // magic version is "v0.0.0-fern-placeholder" (has v prefix, like Go)
        const handler = await createTaskHandler({ version: "v0.0.0-fern-placeholder" });
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // v prefix should be added → v3.0.0 → PATCH → v3.0.1
        expect(result?.version).toBe("v3.0.1");
    });
});
