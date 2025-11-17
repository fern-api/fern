import { LogLevel } from "@fern-api/logger";
import { runExeca } from "@fern-api/logging-execa";
import path from "path";
import {
    ENV_VAR_FERN_TOKEN,
    ENV_VAR_GITHUB_TOKEN,
    FERN_GENERATE_COMMAND,
    FERN_TEST_REPO_NAME,
    FLAG_GROUP,
    FLAG_LOCAL,
    FLAG_LOG_LEVEL,
    GenerationMode,
    LOCAL_GROUP_NAME,
    MSG_GENERATION_COMPLETED_PREFIX,
    MSG_GENERATION_FAILED_PREFIX,
    MSG_GENERATION_RUNNING_PREFIX,
    REMOTE_GROUP_NAME,
    SDKS_DIRECTORY_NAME
} from "./constants";
import { copyGithubOutputToOutputDirectory } from "./githubIntegration";
import type { GenerationResult, RemoteVsLocalTestCase } from "./types";

export async function runGeneration(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): Promise<GenerationResult> {
    const { outputMode } = testCase;
    const { fernExecutable, workingDirectory, logger, githubToken, fernToken } = testCase.context;
    const group = generationMode === "local" ? LOCAL_GROUP_NAME : REMOTE_GROUP_NAME;
    const extraFlags = generationMode === "local" ? [FLAG_LOCAL] : [];

    // Use debug level to capture all output (needed for extracting branch info)
    // but we won't forward all logs to stdout - only our own structured logs
    const args = [FERN_GENERATE_COMMAND, FLAG_GROUP, group, FLAG_LOG_LEVEL, LogLevel.Debug, ...extraFlags];

    logger.info(`${MSG_GENERATION_RUNNING_PREFIX} ${generationMode} generation...`);
    logger.debug(`  Command: ${fernExecutable} ${args.join(" ")}`);
    logger.debug(`  Working directory: ${workingDirectory}`);

    const startTime = Date.now();

    try {
        // Use execa directly instead of loggingExeca to avoid forwarding all subprocess logs
        const result = await runExeca(undefined, fernExecutable, args, {
            cwd: workingDirectory,
            env: {
                [ENV_VAR_GITHUB_TOKEN]: githubToken,
                [ENV_VAR_FERN_TOKEN]: fernToken
            },
            reject: false,
            all: true // Combine stdout and stderr for easier parsing
        });

        const duration = Date.now() - startTime;

        if (result.exitCode !== 0) {
            logger.error(
                `${MSG_GENERATION_FAILED_PREFIX} ${generationMode} generation failed after ${duration}ms (exit code: ${result.exitCode})`
            );

            // Show error output from the subprocess
            if (result.stderr) {
                logger.error(`  Error output:`);
                result.stderr.split("\n").forEach((line: string) => {
                    if (line.trim()) {
                        logger.error(`    ${line}`);
                    }
                });
            }

            return { success: false, error: result.stderr || "Unknown error" };
        }

        logger.info(`${MSG_GENERATION_COMPLETED_PREFIX} ${generationMode} generation completed in ${duration}ms`);

        const outputDirectory = getOutputDirectory(testCase, generationMode);
        if (outputMode === "github") {
            logger.debug(`  Copying GitHub output to ${outputDirectory}`);
            // Pass the combined output (stdout + stderr) to extract branch info
            await copyGithubOutputToOutputDirectory(
                FERN_TEST_REPO_NAME,
                result.all || result.stdout,
                outputDirectory,
                logger,
                githubToken
            );
        }

        return { success: true, outputFolder: outputDirectory };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`✗ ${generationMode} generation failed after ${duration}ms`);
        logger.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export function getOutputDirectory(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): string {
    const { generator } = testCase;
    const { workingDirectory } = testCase.context;

    // Structure: {workingDirectory}/sdks/{generationMode}/{generator}
    // Example: seed-remote-local/python-sdk/imdb/no-custom-config/local-file-system/sdks/local/python-sdk
    return path.join(workingDirectory, SDKS_DIRECTORY_NAME, generationMode + "Generation");
}
