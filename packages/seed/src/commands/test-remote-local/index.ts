// Core execution
export { executeTestRemoteLocalCommand } from "./command.js";
// Configuration
export { getGithubConfig, getPackageOutputConfig, loadCustomConfig, writeGeneratorsYml } from "./configuration.js";
export type { GenerationMode, GeneratorName, GeneratorNickname, OutputMode, TestFixture } from "./constants.js";
// Version management
export { getLatestGeneratorVersions, getLocalGeneratorVersions } from "./dockerHubClient.js";
// Generation
export { getOutputDirectory, runGeneration } from "./generation.js";
// GitHub integration
export { copyGithubOutputToOutputDirectory } from "./githubIntegration.js";
// Test runner
export { runTestCase } from "./testExecution.js";
// Types
export type {
    GenerationResult,
    GenerationResultFailure,
    GenerationResultSuccess,
    RemoteLocalSeedConfig,
    RemoteVsLocalTestCase,
    TestCaseContext,
    TestCaseResult
} from "./types.js";

// Validation
export { isFernRepo, isLocalFernCliBuilt } from "./utils.js";
