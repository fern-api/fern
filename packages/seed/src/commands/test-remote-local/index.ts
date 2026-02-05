// Core execution
export { executeTestRemoteLocalCommand } from "./command";
// Configuration
export { getGithubConfig, getPackageOutputConfig, loadCustomConfig, writeGeneratorsYml } from "./configuration";
export type { GenerationMode, GeneratorName, GeneratorNickname, OutputMode, TestFixture } from "./constants";
// Version management
export { getLatestGeneratorVersions, getLocalGeneratorVersions } from "./dockerHubClient";
// Generation
export { getOutputDirectory, runGeneration } from "./generation";
// GitHub integration
export { copyGithubOutputToOutputDirectory } from "./githubIntegration";
// Test runner
export { runTestCase } from "./testExecution";
// Types
export type {
    GenerationResult,
    GenerationResultFailure,
    GenerationResultSuccess,
    RemoteLocalSeedConfig,
    RemoteVsLocalTestCase,
    TestCaseContext,
    TestCaseResult
} from "./types";

// Validation
export { isFernRepo, isLocalFernCliBuilt } from "./utils";
