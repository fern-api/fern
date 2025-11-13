/**
 * Tests for BamlAiService
 *
 * These tests verify the service configuration, error handling, and basic functionality.
 * Note: These are unit tests that don't make actual AI calls to avoid API costs and flakiness.
 */

import { TaskContext } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AiAnalysisError, AiServiceConfig, BamlAiService, DiffTooLargeError, VersionBump } from "../BamlAiService";

// Mock the BAML client
vi.mock("../../baml_client/baml_client", () => ({
    b: {
        AnalyzeCommitDiff: vi.fn(),
        AnalyzeCommitDiffOpenAI: vi.fn(),
        AnalyzeCommitDiffAnthropic: vi.fn(),
        AnalyzeCommitDiffBedrock: vi.fn()
    },
    VersionBump: {
        MAJOR: "MAJOR",
        MINOR: "MINOR",
        PATCH: "PATCH",
        NO_CHANGE: "NO_CHANGE"
    }
}));

import { b } from "../../baml_client/baml_client";

describe("BamlAiService", () => {
    let mockTaskContext: TaskContext;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Mock TaskContext
        mockTaskContext = {
            logger: {
                info: vi.fn(),
                error: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn()
            }
        } as any;

        // Save original environment
        originalEnv = { ...process.env };

        // Reset all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore environment
        process.env = originalEnv;
    });

    describe("constructor", () => {
        test("creates service with valid config", () => {
            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o",
                settings: {
                    maxDiffSize: 50000,
                    timeout: 30000
                }
            };

            const service = new BamlAiService(config, mockTaskContext);
            expect(service).toBeInstanceOf(BamlAiService);
        });

        test("creates service without optional context", () => {
            const config: AiServiceConfig = {
                provider: "anthropic",
                model: "claude-3-5-sonnet-20241022"
            };

            const service = new BamlAiService(config);
            expect(service).toBeInstanceOf(BamlAiService);
        });
    });

    describe("validateConfiguration", () => {
        test("validates OpenAI configuration with API key", async () => {
            process.env.OPENAI_API_KEY = "test-key";

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);
            await expect(service.validateConfiguration()).resolves.toBeUndefined();

            expect(mockTaskContext.logger.debug).toHaveBeenCalledWith(
                "AI service configuration validated (provider: openai, model: gpt-4o)"
            );
        });

        test("throws error for missing OpenAI API key", async () => {
            delete process.env.OPENAI_API_KEY;

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);
            await expect(service.validateConfiguration()).rejects.toThrow(
                "Missing required environment variable: OPENAI_API_KEY for provider: openai"
            );
        });

        test("validates Anthropic configuration with API key", async () => {
            process.env.ANTHROPIC_API_KEY = "test-key";

            const config: AiServiceConfig = {
                provider: "anthropic",
                model: "claude-3-5-sonnet-20241022"
            };

            const service = new BamlAiService(config, mockTaskContext);
            await expect(service.validateConfiguration()).resolves.toBeUndefined();
        });

        test("validates Bedrock configuration with AWS credentials", async () => {
            process.env.AWS_ACCESS_KEY_ID = "test-access-key";
            process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";

            const config: AiServiceConfig = {
                provider: "bedrock",
                model: "anthropic.claude-3-5-sonnet-20241022-v2:0"
            };

            const service = new BamlAiService(config, mockTaskContext);
            await expect(service.validateConfiguration()).resolves.toBeUndefined();
        });

        test("throws error for missing AWS secret key", async () => {
            process.env.AWS_ACCESS_KEY_ID = "test-access-key";
            delete process.env.AWS_SECRET_ACCESS_KEY;

            const config: AiServiceConfig = {
                provider: "bedrock",
                model: "anthropic.claude-3-5-sonnet-20241022-v2:0"
            };

            const service = new BamlAiService(config, mockTaskContext);
            await expect(service.validateConfiguration()).rejects.toThrow(
                "Missing required environment variable: AWS_SECRET_ACCESS_KEY for bedrock provider"
            );
        });
    });

    describe("analyzeCommitDiff", () => {
        const mockDiff = `diff --git a/package.json b/package.json
index abc123..def456 100644
--- a/package.json
+++ b/package.json
@@ -1,7 +1,7 @@
 {
   "name": "test-package",
-  "version": "1.2.3",
+  "version": "1.3.0",
   "description": "Test package"
 }`;

        test("analyzes diff with OpenAI provider", async () => {
            const mockResponse = {
                versionBump: VersionBump.MINOR,
                message: "Add new feature"
            };

            vi.mocked(b.AnalyzeCommitDiffOpenAI).mockResolvedValueOnce(mockResponse);

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);
            const result = await service.analyzeCommitDiff(mockDiff);

            expect(result.versionBump).toBe(VersionBump.MINOR);
            expect(result.commitMessage).toBe("Add new feature");
            expect(result.isNoChange()).toBe(false);

            expect(b.AnalyzeCommitDiffOpenAI).toHaveBeenCalledWith({
                diff: mockDiff
            });

            expect(mockTaskContext.logger.info).toHaveBeenCalledWith(
                `Analyzing commit diff for semantic versioning (diff size: ${mockDiff.length} bytes, provider: openai, model: gpt-4o)`
            );
        });

        test("analyzes diff with Anthropic provider", async () => {
            const mockResponse = {
                versionBump: VersionBump.PATCH,
                message: "Fix bug in parser"
            };

            vi.mocked(b.AnalyzeCommitDiffAnthropic).mockResolvedValueOnce(mockResponse);

            const config: AiServiceConfig = {
                provider: "anthropic",
                model: "claude-3-5-sonnet-20241022"
            };

            const service = new BamlAiService(config, mockTaskContext);
            const result = await service.analyzeCommitDiff(mockDiff);

            expect(result.versionBump).toBe(VersionBump.PATCH);
            expect(result.commitMessage).toBe("Fix bug in parser");

            expect(b.AnalyzeCommitDiffAnthropic).toHaveBeenCalledWith({
                diff: mockDiff
            });
        });

        test("analyzes diff with Bedrock provider", async () => {
            const mockResponse = {
                versionBump: VersionBump.MAJOR,
                message: "Breaking API change"
            };

            vi.mocked(b.AnalyzeCommitDiffBedrock).mockResolvedValueOnce(mockResponse);

            const config: AiServiceConfig = {
                provider: "bedrock",
                model: "anthropic.claude-3-5-sonnet-20241022-v2:0"
            };

            const service = new BamlAiService(config, mockTaskContext);
            const result = await service.analyzeCommitDiff(mockDiff);

            expect(result.versionBump).toBe(VersionBump.MAJOR);
            expect(result.commitMessage).toBe("Breaking API change");

            expect(b.AnalyzeCommitDiffBedrock).toHaveBeenCalledWith({
                diff: mockDiff
            });
        });

        test("handles NO_CHANGE result correctly", async () => {
            const mockResponse = {
                versionBump: VersionBump.NO_CHANGE,
                message: "No functional changes"
            };

            vi.mocked(b.AnalyzeCommitDiffOpenAI).mockResolvedValueOnce(mockResponse);

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);
            const result = await service.analyzeCommitDiff(mockDiff);

            expect(result.versionBump).toBe(VersionBump.NO_CHANGE);
            expect(result.isNoChange()).toBe(true);
        });

        test("throws error for diff too large", async () => {
            const largeDiff = "x".repeat(150000); // 150KB diff

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o",
                settings: {
                    maxDiffSize: 100000 // 100KB limit
                }
            };

            const service = new BamlAiService(config, mockTaskContext);

            await expect(service.analyzeCommitDiff(largeDiff)).rejects.toThrow(
                "Diff too large for AI analysis: 150000 bytes (max: 100000)"
            );

            expect(mockTaskContext.logger.info).toHaveBeenCalledWith(
                "Diff too large for AI analysis (size: 150000 bytes, maxSize: 100000 bytes)"
            );
        });

        test("handles 413 error from AI service", async () => {
            const error413 = new Error("Request failed with status 413: Request Entity Too Large");
            vi.mocked(b.AnalyzeCommitDiffOpenAI).mockRejectedValueOnce(error413);

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);

            await expect(service.analyzeCommitDiff(mockDiff)).rejects.toThrow(DiffTooLargeError);

            expect(mockTaskContext.logger.info).toHaveBeenCalledWith(
                `Diff too large for AI analysis (413 status code). Size: ${mockDiff.length} bytes`
            );
        });

        test("handles generic AI service error", async () => {
            const genericError = new Error("Network timeout");
            vi.mocked(b.AnalyzeCommitDiffOpenAI).mockRejectedValueOnce(genericError);

            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = new BamlAiService(config, mockTaskContext);

            const promise = service.analyzeCommitDiff(mockDiff);

            await expect(promise).rejects.toThrow(AiAnalysisError);
            await expect(promise).rejects.toThrow("Failed to analyze commit diff");

            expect(mockTaskContext.logger.error).toHaveBeenCalledWith(
                "Failed to analyze commit diff with AI",
                "Network timeout"
            );
        });

        test("uses default function for unknown provider", async () => {
            const mockResponse = {
                versionBump: VersionBump.PATCH,
                message: "Default analysis"
            };

            vi.mocked(b.AnalyzeCommitDiff).mockResolvedValueOnce(mockResponse);

            const config = {
                provider: "invalid-provider" as any,
                model: "some-model"
            } as AiServiceConfig;

            const service = new BamlAiService(config, mockTaskContext);
            const result = await service.analyzeCommitDiff(mockDiff);

            expect(result.versionBump).toBe(VersionBump.PATCH);
            expect(b.AnalyzeCommitDiff).toHaveBeenCalledWith({
                diff: mockDiff
            });
        });
    });

    describe("static factory method", () => {
        test("creates service instance", () => {
            const config: AiServiceConfig = {
                provider: "openai",
                model: "gpt-4o"
            };

            const service = BamlAiService.create(config, mockTaskContext);
            expect(service).toBeInstanceOf(BamlAiService);
        });
    });
});
