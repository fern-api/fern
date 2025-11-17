import type { Logger } from "@fern-api/logger";
import type { GenerationMode, GeneratorName, GeneratorNickname, OutputMode, TestFixture } from "./constants";

export type GenerationResult = GenerationResultSuccess | GenerationResultFailure;

export interface GenerationResultSuccess {
    success: true;
    outputFolder: string;
}

export interface GenerationResultFailure {
    success: false;
    error: string;
}

export interface TestCaseContext {
    fernExecutable: string;
    fernRepoDirectory: string;
    workingDirectory: string;
    logger: Logger;
    githubToken: string;
    fernToken: string;
}

export interface RemoteVsLocalTestCase {
    generator: GeneratorNickname;
    fixture: TestFixture;
    outputMode: OutputMode;
    outputFolder?: string;
    localGeneratorVersions: Record<GeneratorName, string>;
    remoteGeneratorVersions: Record<GeneratorName, string>;
    context: TestCaseContext;
}

export interface TestCaseResult {
    success: boolean;
    error?: string;
}

// Structure of seed-remote-local seed.yml files
export interface RemoteLocalSeedConfig {
    fixtures?: {
        [fixtureName: string]: Array<{
            outputFolder: string;
            customConfig?: unknown;
        }>;
    };
}
