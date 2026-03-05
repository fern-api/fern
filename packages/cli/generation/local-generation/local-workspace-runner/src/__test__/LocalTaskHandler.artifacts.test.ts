import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AutoVersioningArtifacts, LlmResult } from "../LocalTaskHandler.js";
import { LocalTaskHandler } from "../LocalTaskHandler.js";

// Track S3 calls via module-level state that the mock classes reference
let capturedSendCalls: Array<{ input: Record<string, unknown> }> = [];
let shouldSendReject = false;

vi.mock("@aws-sdk/client-s3", () => {
    class MockPutObjectCommand {
        public readonly input: Record<string, unknown>;
        constructor(input: Record<string, unknown>) {
            this.input = input;
        }
    }

    class MockS3Client {
        async send(command: MockPutObjectCommand): Promise<Record<string, unknown>> {
            capturedSendCalls.push({ input: command.input });
            if (shouldSendReject) {
                throw new Error("S3 connection refused");
            }
            return {};
        }
    }

    return {
        S3Client: MockS3Client,
        PutObjectCommand: MockPutObjectCommand
    };
});

function createMockLogger() {
    return {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        log: vi.fn()
    };
}

function createTaskHandler(
    mockLogger: ReturnType<typeof createMockLogger>,
    generatorName = "fernapi/fern-typescript-node-sdk"
): LocalTaskHandler {
    return new LocalTaskHandler({
        context: { logger: mockLogger } as never,
        absolutePathToTmpOutputDirectory: AbsoluteFilePath.of("/tmp/output"),
        absolutePathToTmpSnippetJSON: undefined,
        absolutePathToLocalSnippetTemplateJSON: undefined,
        absolutePathToLocalOutput: AbsoluteFilePath.of("/tmp/local-output"),
        absolutePathToLocalSnippetJSON: undefined,
        absolutePathToTmpSnippetTemplatesJSON: undefined,
        version: undefined,
        ai: undefined,
        isWhitelabel: false,
        generatorName
    });
}

describe("LocalTaskHandler Artifacts", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        capturedSendCalls = [];
        shouldSendReject = false;
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("uploads raw-diff, cleaned-diff, and llm-result on successful AI analysis", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "diff --git a/file.ts b/file.ts\n-old\n+new",
            cleanedDiff: "+new",
            llmResult: {
                timestamp: "2026-01-01T00:00:00.000Z",
                success: true,
                versionBump: "MINOR",
                isNoChange: false,
                commitMessage: "feat: add new endpoint"
            }
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(3);

        expect(capturedSendCalls[0]?.input.Bucket).toBe("my-artifacts-bucket");
        expect(capturedSendCalls[0]?.input.Key).toContain("raw-diff.txt");
        expect(capturedSendCalls[0]?.input.Body).toBe(artifacts.rawDiff);
        expect(capturedSendCalls[0]?.input.ContentType).toBe("text/plain");

        expect(capturedSendCalls[1]?.input.Bucket).toBe("my-artifacts-bucket");
        expect(capturedSendCalls[1]?.input.Key).toContain("cleaned-diff.txt");
        expect(capturedSendCalls[1]?.input.Body).toBe(artifacts.cleanedDiff);
        expect(capturedSendCalls[1]?.input.ContentType).toBe("text/plain");

        expect(capturedSendCalls[2]?.input.Bucket).toBe("my-artifacts-bucket");
        expect(capturedSendCalls[2]?.input.Key).toContain("llm-result.json");
        expect(capturedSendCalls[2]?.input.Body).toBe(JSON.stringify(artifacts.llmResult, undefined, 2));
        expect(capturedSendCalls[2]?.input.ContentType).toBe("application/json");

        expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining("[AutoVersioning] Artifacts stored:"));
    });

    it("uploads llm-result with success=false when AI call throws", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const failureLlmResult: LlmResult = {
            timestamp: "2026-01-01T00:00:00.000Z",
            success: false,
            error: "AI service unavailable"
        };

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "some diff content",
            cleanedDiff: "cleaned content",
            llmResult: failureLlmResult
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(3);
        const llmResultBody = capturedSendCalls[2]?.input.Body as string;
        const parsed = JSON.parse(llmResultBody);
        expect(parsed.success).toBe(false);
        expect(parsed.error).toBe("AI service unavailable");
    });

    it("skips S3 upload when AUTOVERSIONING_ARTIFACTS_BUCKET is not set", async () => {
        delete process.env.AUTOVERSIONING_ARTIFACTS_BUCKET;

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "some diff",
            cleanedDiff: "cleaned",
            llmResult: {
                timestamp: "2026-01-01T00:00:00.000Z",
                success: true,
                versionBump: "PATCH",
                isNoChange: false,
                commitMessage: "fix: something"
            }
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(0);
    });

    it("does not throw when S3 upload fails", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";
        shouldSendReject = true;

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "diff content",
            cleanedDiff: "cleaned",
            llmResult: {
                timestamp: "2026-01-01T00:00:00.000Z",
                success: true,
                versionBump: "MINOR",
                isNoChange: false,
                commitMessage: "feat: new feature"
            }
        };

        await expect(handler.uploadAutoVersioningArtifacts(artifacts)).resolves.toBeUndefined();

        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining("[AutoVersioning] Failed to upload artifacts to S3")
        );
    });

    it("llm-result.json success schema includes timestamp, versionBump, commitMessage", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const successLlmResult: LlmResult = {
            timestamp: "2026-03-05T12:00:00.000Z",
            success: true,
            versionBump: "MAJOR",
            isNoChange: false,
            commitMessage: "break: remove deprecated API"
        };

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "diff",
            cleanedDiff: "cleaned",
            llmResult: successLlmResult
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(3);
        const llmResultBody = capturedSendCalls[2]?.input.Body as string;
        const parsed = JSON.parse(llmResultBody);

        expect(parsed).toHaveProperty("timestamp", "2026-03-05T12:00:00.000Z");
        expect(parsed).toHaveProperty("success", true);
        expect(parsed).toHaveProperty("versionBump", "MAJOR");
        expect(parsed).toHaveProperty("commitMessage", "break: remove deprecated API");
        expect(parsed).toHaveProperty("isNoChange", false);
    });

    it("llm-result.json failure schema includes timestamp and error message", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger);

        const failureLlmResult: LlmResult = {
            timestamp: "2026-03-05T12:00:00.000Z",
            success: false,
            error: "Model timeout after 30s"
        };

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "diff",
            cleanedDiff: "cleaned",
            llmResult: failureLlmResult
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(3);
        const llmResultBody = capturedSendCalls[2]?.input.Body as string;
        const parsed = JSON.parse(llmResultBody);

        expect(parsed).toHaveProperty("timestamp", "2026-03-05T12:00:00.000Z");
        expect(parsed).toHaveProperty("success", false);
        expect(parsed).toHaveProperty("error", "Model timeout after 30s");
        expect(parsed).not.toHaveProperty("versionBump");
        expect(parsed).not.toHaveProperty("commitMessage");
    });

    it("uses generator name and timestamp in S3 key prefix", async () => {
        process.env.AUTOVERSIONING_ARTIFACTS_BUCKET = "my-artifacts-bucket";

        const mockLogger = createMockLogger();
        const handler = createTaskHandler(mockLogger, "fernapi/fern-python-sdk");

        const artifacts: AutoVersioningArtifacts = {
            rawDiff: "diff",
            cleanedDiff: "cleaned",
            llmResult: {
                timestamp: "2026-01-01T00:00:00.000Z",
                success: true,
                versionBump: "PATCH",
                isNoChange: false,
                commitMessage: "fix: something"
            }
        };

        await handler.uploadAutoVersioningArtifacts(artifacts);

        expect(capturedSendCalls).toHaveLength(3);

        for (let i = 0; i < 3; i++) {
            const key = capturedSendCalls[i]?.input.Key as string;
            expect(key).toMatch(/^fernapi-fern-python-sdk\//);
            expect(key).toMatch(/\/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(key).toMatch(/\/autoversioning\/(raw-diff\.txt|cleaned-diff\.txt|llm-result\.json)$/);
        }
    });
});
