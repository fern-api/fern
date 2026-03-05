import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration tests for Tier 3 behavioral analysis in LocalTaskHandler.
 *
 * These tests mock the BAML client to verify:
 * - Tier 3 is only called when Tier 2 returns PATCH
 * - Tier 3 MINOR escalates the overall result
 * - Tier 3 failure is non-fatal (falls back to PATCH)
 * - Commit message priority is correct
 */

// Use vi.hoisted so mock fns are available in vi.mock factories (which are hoisted)
const { mockAnalyzeSdkDiff, mockAnalyzeBehavioralChanges, mockWithOptions } = vi.hoisted(() => {
    const mockAnalyzeSdkDiff = vi.fn();
    const mockAnalyzeBehavioralChanges = vi.fn();
    const mockWithOptions = vi.fn().mockReturnValue({
        AnalyzeSdkDiff: mockAnalyzeSdkDiff,
        AnalyzeBehavioralChanges: mockAnalyzeBehavioralChanges
    });
    return { mockAnalyzeSdkDiff, mockAnalyzeBehavioralChanges, mockWithOptions };
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

// Mock VersionUtils
vi.mock("../VersionUtils.js", () => ({
    isAutoVersion: vi.fn().mockReturnValue(true)
}));

// Import after mocks are set up
import { BehavioralBump, VersionBump } from "@fern-api/cli-ai";

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

// biome-ignore lint/suspicious/noExplicitAny: accessing private method for testing
async function callHandleAutoVersioning(handler: any): Promise<{ version: string; commitMessage: string } | null> {
    return handler.handleAutoVersioning();
}

describe("LocalTaskHandler - Tier 3 Behavioral Analysis", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockWithOptions.mockReturnValue({
            AnalyzeSdkDiff: mockAnalyzeSdkDiff,
            AnalyzeBehavioralChanges: mockAnalyzeBehavioralChanges
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
            ...overrides
        });
    }

    it("skips Tier 3 when Tier 2 already returns MINOR", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MINOR,
            message: "feat: add new endpoint for user management"
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
        expect(mockAnalyzeBehavioralChanges).not.toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result?.commitMessage).toContain("feat: add new endpoint for user management");
    });

    it("calls Tier 3 when Tier 2 returns PATCH", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: internal refactoring"
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        });

        const handler = await createTaskHandler();
        await callHandleAutoVersioning(handler);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
        expect(mockAnalyzeBehavioralChanges).toHaveBeenCalledOnce();
    });

    it("escalates to MINOR when Tier 3 finds behavioral change", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: internal refactoring"
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: ["Changed default retry count from 3 to 5"],
            message: "feat: increase default retry count from 3 to 5"
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Version should be incremented as MINOR (1.0.0 -> 1.1.0)
        expect(result?.version).toBe("1.1.0");
        expect(result?.commitMessage).toContain("feat: increase default retry count from 3 to 5");
    });

    it("falls back to PATCH when Tier 3 AI call throws", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: internal refactoring"
        });
        mockAnalyzeBehavioralChanges.mockRejectedValue(new Error("AI service unavailable"));

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Version should be incremented as PATCH (1.0.0 -> 1.0.1)
        expect(result?.version).toBe("1.0.1");
        // Should log the warning
        expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Tier 3 behavioral analysis failed"));
    });

    it("uses Tier 3 commit message when it escalates from PATCH to MINOR", async () => {
        const tier3Message = "feat: change HTTP 404 handling from null return to thrown error";

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: code style cleanup"
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: ["HTTP 404 now throws instead of returning null"],
            message: tier3Message
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Should use Tier 3 message (not Tier 2), with Fern branding
        expect(result?.commitMessage).toContain(tier3Message);
        expect(result?.commitMessage).toContain("Generated with Fern");
    });

    it("passes generator language to Tier 3", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: refactoring"
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        });

        const handler = await createTaskHandler({ generatorLanguage: "python" });
        await callHandleAutoVersioning(handler);

        expect(mockAnalyzeBehavioralChanges).toHaveBeenCalledWith(expect.any(String), "python");
    });

    it("uses 'unknown' when generatorLanguage is undefined", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: "chore: refactoring"
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        });

        const handler = await createTaskHandler({ generatorLanguage: undefined });
        await callHandleAutoVersioning(handler);

        expect(mockAnalyzeBehavioralChanges).toHaveBeenCalledWith(expect.any(String), "unknown");
    });

    it("falls back to Tier 2 message when Tier 3 returns MINOR with empty message", async () => {
        const tier2Message = "chore: internal code cleanup";

        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.PATCH,
            message: tier2Message
        });
        mockAnalyzeBehavioralChanges.mockResolvedValue({
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: ["Changed retry behavior"],
            message: "" // empty message from AI
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(result).not.toBeNull();
        // Should escalate to MINOR
        expect(result?.version).toBe("1.1.0");
        // Should fall back to Tier 2 message since Tier 3 message is empty
        expect(result?.commitMessage).toContain(tier2Message);
    });

    it("does not call Tier 3 when Tier 2 returns MAJOR", async () => {
        mockAnalyzeSdkDiff.mockResolvedValue({
            version_bump: VersionBump.MAJOR,
            message: "break: remove deprecated endpoint"
        });

        const handler = await createTaskHandler();
        const result = await callHandleAutoVersioning(handler);

        expect(mockAnalyzeSdkDiff).toHaveBeenCalledOnce();
        expect(mockAnalyzeBehavioralChanges).not.toHaveBeenCalled();
        expect(result).not.toBeNull();
    });
});
