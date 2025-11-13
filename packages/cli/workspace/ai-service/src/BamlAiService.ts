/**
 * BAML AI Service for semantic version analysis
 *
 * This service wraps the generated BAML client to provide a convenient interface
 * for analyzing git diffs and determining semantic version bumps.
 * Matches the interface from fiddle's SemanticVersionService.
 */

import { TaskContext } from "@fern-api/task-context";
import { AnalyzeCommitDiffRequest, AnalyzeCommitDiffResponse, b, VersionBump } from "../baml_client/baml_client";

/**
 * Configuration for AI service providers and settings
 */
export interface AiServiceConfig {
    provider: "openai" | "anthropic" | "bedrock";
    model: string;
    settings?: AiServiceSettings;
}

export interface AiServiceSettings {
    maxDiffSize?: number;
    timeout?: number;
}

/**
 * Result container for semantic version analysis - matches fiddle's SemanticVersionResult
 */
export class SemanticVersionResult {
    public readonly versionBump: VersionBump;
    public readonly commitMessage: string;

    constructor(versionBump: VersionBump, commitMessage: string) {
        this.versionBump = versionBump;
        this.commitMessage = commitMessage;
    }

    public isNoChange(): boolean {
        return this.versionBump === VersionBump.NO_CHANGE;
    }
}

/**
 * Error thrown when AI analysis fails
 */
export class AiAnalysisError extends Error {
    constructor(
        message: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = "AiAnalysisError";
    }
}

/**
 * Error thrown when diff is too large for AI analysis
 */
export class DiffTooLargeError extends AiAnalysisError {
    constructor(diffSize: number, maxSize: number) {
        super(`Diff too large for AI analysis: ${diffSize} bytes (max: ${maxSize})`);
        this.name = "DiffTooLargeError";
    }
}

/**
 * BAML-powered AI service for analyzing commit diffs and determining semantic version bumps.
 * Provides a convenient wrapper around the generated BAML client.
 */
export class BamlAiService {
    private readonly config: AiServiceConfig;
    private readonly context?: TaskContext;

    constructor(config: AiServiceConfig, context?: TaskContext) {
        this.config = config;
        this.context = context;
    }

    /**
     * Analyzes a git diff and returns the semantic version bump recommendation and commit message.
     * Matches the interface from fiddle's SemanticVersionService.
     *
     * @param diff The git diff string to analyze
     * @returns SemanticVersionResult containing the version bump and commit message, or throws error if analysis failed
     */
    public async analyzeCommitDiff(diff: string): Promise<SemanticVersionResult> {
        try {
            this.context?.logger.info(
                `Analyzing commit diff for semantic versioning (diff size: ${diff.length} bytes, provider: ${this.config.provider}, model: ${this.config.model})`
            );

            // Check diff size limits
            const maxDiffSize = this.config.settings?.maxDiffSize ?? 100000; // 100KB default
            if (diff.length > maxDiffSize) {
                throw new DiffTooLargeError(diff.length, maxDiffSize);
            }

            const request: AnalyzeCommitDiffRequest = { diff };
            let response: AnalyzeCommitDiffResponse;

            // Select the appropriate BAML function based on provider
            switch (this.config.provider) {
                case "openai":
                    response = await b.AnalyzeCommitDiffOpenAI(request);
                    break;
                case "anthropic":
                    response = await b.AnalyzeCommitDiffAnthropic(request);
                    break;
                case "bedrock":
                    response = await b.AnalyzeCommitDiffBedrock(request);
                    break;
                default:
                    // Fallback to default function (OpenAI)
                    response = await b.AnalyzeCommitDiff(request);
                    break;
            }

            this.context?.logger.info(
                `AI analysis complete. Version bump: ${response.versionBump}, Message: ${response.message}`
            );

            return new SemanticVersionResult(response.versionBump, response.message);
        } catch (error) {
            // Handle specific error cases
            if (error instanceof DiffTooLargeError) {
                this.context?.logger.info(
                    `Diff too large for AI analysis (size: ${diff.length} bytes, maxSize: ${this.config.settings?.maxDiffSize ?? 100000} bytes)`
                );
                throw error;
            }

            // Check if it's a 413 (Request Entity Too Large) error
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("413")) {
                this.context?.logger.info(
                    `Diff too large for AI analysis (413 status code). Size: ${diff.length} bytes`
                );
                throw new DiffTooLargeError(diff.length, this.config.settings?.maxDiffSize ?? 100000);
            }

            this.context?.logger.error(
                "Failed to analyze commit diff with AI",
                (error as Error)?.message || String(error)
            );
            throw new AiAnalysisError("Failed to analyze commit diff", error as Error);
        }
    }

    /**
     * Creates a new BamlAiService instance with the specified configuration.
     */
    public static create(config: AiServiceConfig, context?: TaskContext): BamlAiService {
        return new BamlAiService(config, context);
    }

    /**
     * Validates the AI service configuration and environment variables.
     */
    public async validateConfiguration(): Promise<void> {
        const requiredEnvVars: Record<string, string> = {
            openai: "OPENAI_API_KEY",
            anthropic: "ANTHROPIC_API_KEY",
            bedrock: "AWS_ACCESS_KEY_ID"
        };

        const requiredVar = requiredEnvVars[this.config.provider];
        if (requiredVar && !process.env[requiredVar]) {
            throw new AiAnalysisError(
                `Missing required environment variable: ${requiredVar} for provider: ${this.config.provider}`
            );
        }

        // Additional validation for AWS Bedrock
        if (this.config.provider === "bedrock") {
            if (!process.env.AWS_SECRET_ACCESS_KEY) {
                throw new AiAnalysisError(
                    "Missing required environment variable: AWS_SECRET_ACCESS_KEY for bedrock provider"
                );
            }
        }

        this.context?.logger.debug(
            `AI service configuration validated (provider: ${this.config.provider}, model: ${this.config.model})`
        );
    }
}

// Re-export VersionBump for convenience
export { VersionBump } from "../baml_client/baml_client";
