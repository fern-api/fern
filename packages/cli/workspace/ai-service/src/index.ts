/**
 * @file AI Service Package
 *
 * BAML-powered AI service for analyzing git diffs and determining semantic version bumps.
 * This package provides a TypeScript wrapper around BAML-generated AI functions that
 * support multiple providers: OpenAI, Anthropic, and AWS Bedrock.
 *
 * @example
 * ```typescript
 * import { BamlAiService, AiServiceConfig } from "@fern-api/ai-service";
 *
 * const config: AiServiceConfig = {
 *   provider: "anthropic",
 *   model: "claude-3-5-sonnet-20241022",
 *   settings: {
 *     maxDiffSize: 50000,
 *     timeout: 30000
 *   }
 * };
 *
 * const aiService = BamlAiService.create(config, context);
 * await aiService.validateConfiguration();
 *
 * const result = await aiService.analyzeCommitDiff(gitDiff);
 * console.log(`Recommended bump: ${result.versionBump}`);
 * console.log(`Commit message: ${result.commitMessage}`);
 * ```
 */

// Re-export BAML-generated types for convenience
export type {
    AiServiceSettings as BamlAiServiceSettings,
    AnalyzeCommitDiffRequest,
    AnalyzeCommitDiffResponse
} from "../baml_client/baml_client";
// Re-export the BAML client for advanced usage
export { b as BamlClient } from "../baml_client/baml_client";
// Configuration interfaces
export type {
    AiServiceConfig,
    AiServiceSettings
} from "./BamlAiService";
// Main service class
// Result and error classes
export {
    AiAnalysisError,
    BamlAiService,
    DiffTooLargeError,
    SemanticVersionResult,
    VersionBump
} from "./BamlAiService";
