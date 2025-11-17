import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { cp, mkdir, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { getGithubConfig, getPackageOutputConfig, loadCustomConfig, writeGeneratorsYml } from "./configuration";
import {
    DEFINITION_DIRECTORY_NAME,
    DIFF_COMMAND,
    DIFF_RECURSIVE_FLAG,
    ERROR_DIFF_COMMAND_FAILED,
    ERROR_NO_GENERATOR_VERSION,
    ERROR_OUTPUTS_DIFFER,
    FERN_DIRECTORY_NAME,
    GeneratorNameFromNickname,
    LOG_HEADER_COMPARING_OUTPUTS,
    LOG_HEADER_LOCAL_GENERATION,
    LOG_HEADER_REMOTE_GENERATION,
    LOG_SECTION_SEPARATOR,
    MSG_BOTH_GENERATIONS_SUCCESSFUL,
    MSG_OUTPUTS_DIFFER,
    MSG_OUTPUTS_MATCH,
    TEST_DEFINITIONS_RELATIVE_PATH
} from "./constants";
import { runGeneration } from "./generation";
import type { GenerationResult, GenerationResultSuccess, RemoteVsLocalTestCase, TestCaseResult } from "./types";

export async function runTestCase(testCase: RemoteVsLocalTestCase): Promise<TestCaseResult> {
    const { generator, fixture, outputMode, localGeneratorVersions, remoteGeneratorVersions, context } = testCase;
    const { fernRepoDirectory, workingDirectory, logger } = context;

    logger.debug(`Test configuration: generator=${generator}, fixture=${fixture}, outputMode=${outputMode}`);
    logger.debug(`Working directory: ${workingDirectory}`);

    // Setup working directory (caller has already set this to include output mode)
    // Structure: seed-remote-local/{generator}/{fixture}/{outputFolder}/{outputMode}/
    logger.debug(`Clearing working directory: ${workingDirectory}`);
    await rm(workingDirectory, { recursive: true, force: true });
    await mkdir(workingDirectory, { recursive: true });

    const fernDirectory = path.join(workingDirectory, FERN_DIRECTORY_NAME);
    const definitionDirectory = path.join(fernDirectory, DEFINITION_DIRECTORY_NAME);
    await mkdir(definitionDirectory, { recursive: true });

    // Write fern.config.json
    logger.debug(`Writing fern.config.json`);
    await writeFile(
        path.join(fernDirectory, "fern.config.json"),
        JSON.stringify({ organization: "fern", version: "*" }, null, 2)
    );

    // Copy fixture api definition
    const fixtureSource = path.join(
        fernRepoDirectory,
        TEST_DEFINITIONS_RELATIVE_PATH,
        FERN_DIRECTORY_NAME,
        "apis",
        fixture,
        DEFINITION_DIRECTORY_NAME
    );
    logger.debug(`Copying fixture definition from ${fixtureSource}`);
    await cp(fixtureSource, definitionDirectory, { recursive: true });

    // Get generator versions from pre-fetched maps
    const generatorName = GeneratorNameFromNickname[generator];
    const localGeneratorVersion = localGeneratorVersions[generatorName];
    const remoteGeneratorVersion = remoteGeneratorVersions[generatorName];

    if (!localGeneratorVersion) {
        throw new Error(`${ERROR_NO_GENERATOR_VERSION} ${generatorName} (local)`);
    }
    if (!remoteGeneratorVersion) {
        throw new Error(`${ERROR_NO_GENERATOR_VERSION} ${generatorName} (remote)`);
    }

    logger.debug(`Using local generator version: ${localGeneratorVersion}`);
    logger.debug(`Using remote generator version: ${remoteGeneratorVersion}`);

    // Load custom config
    const customConfig = await loadCustomConfig(generator, fixture, testCase.outputFolder, fernRepoDirectory, logger);
    logger.debug(`Loaded custom config: ${JSON.stringify(customConfig)}`);
    if (customConfig) {
        logger.debug(`Loaded custom config for ${generator}/${fixture}/${testCase.outputFolder || "no-custom-config"}`);
    }

    const baseConfig = {
        name: GeneratorNameFromNickname[generator],
        config: customConfig
    };

    const localConfig = {
        ...baseConfig,
        version: localGeneratorVersion,
        output: getPackageOutputConfig(testCase, "local"),
        ...(outputMode === "github"
            ? {
                  github: getGithubConfig(generator, "local")
              }
            : {})
    };

    const remoteConfig = {
        ...baseConfig,
        version: remoteGeneratorVersion,
        output: getPackageOutputConfig(testCase, "remote"),
        ...(outputMode === "github"
            ? {
                  github: getGithubConfig(generator, "remote")
              }
            : {})
    };

    logger.debug(`Writing generators.yml with local and remote groups`);
    await writeGeneratorsYml(fernDirectory, localConfig, remoteConfig);

    let localResult: GenerationResult | null = null;
    let remoteResult: GenerationResult | null = null;

    try {
        // Run generations
        logger.info("");
        logger.info(`${LOG_SECTION_SEPARATOR} ${LOG_HEADER_LOCAL_GENERATION} ${LOG_SECTION_SEPARATOR}`);
        localResult = await runGeneration(testCase, "local");

        logger.info("");
        logger.info(`${LOG_SECTION_SEPARATOR} ${LOG_HEADER_REMOTE_GENERATION} ${LOG_SECTION_SEPARATOR}`);
        remoteResult = await runGeneration(testCase, "remote");

        // Check for generation failures
        if (!localResult.success || !remoteResult.success) {
            const errors: string[] = [];
            if (!localResult.success) {
                errors.push(`Local generation failed: ${localResult.error}`);
                logger.error(`✗ Local generation error: ${localResult.error}`);
            }
            if (!remoteResult.success) {
                errors.push(`Remote generation failed: ${remoteResult.error}`);
                logger.error(`✗ Remote generation error: ${remoteResult.error}`);
            }
            return { success: false, error: errors.join("\n") };
        }

        logger.info("");
        logger.info(MSG_BOTH_GENERATIONS_SUCCESSFUL);

        // Compare results
        logger.info("");
        logger.info(`${LOG_SECTION_SEPARATOR} ${LOG_HEADER_COMPARING_OUTPUTS} ${LOG_SECTION_SEPARATOR}`);
        const compareResult = await compareResults(testCase, localResult, remoteResult);

        if (!compareResult.success) {
            return { success: false, error: compareResult.error };
        }

        return { success: true };
    } finally {
        // Clean up .git folders from outputs to prevent git submodule warnings
        // This runs regardless of success/failure
        if (localResult?.success) {
            logger.debug("Cleaning up .git folders from local output");
            await cleanupGitFolders(localResult.outputFolder, logger);
        }
        if (remoteResult?.success) {
            logger.debug("Cleaning up .git folders from remote output");
            await cleanupGitFolders(remoteResult.outputFolder, logger);
        }
    }
}

async function compareResults(
    testCase: RemoteVsLocalTestCase,
    localResult: GenerationResultSuccess,
    remoteResult: GenerationResultSuccess
): Promise<TestCaseResult> {
    const { context } = testCase;
    const { logger, workingDirectory } = context;

    logger.debug(`Running diff between:\n  Remote: ${remoteResult.outputFolder}\n  Local: ${localResult.outputFolder}`);

    const diffResult = await loggingExeca(
        logger,
        DIFF_COMMAND,
        [
            DIFF_RECURSIVE_FLAG,
            "--exclude=.git",
            "--exclude=node_modules",
            "--exclude=.DS_Store",
            remoteResult.outputFolder,
            localResult.outputFolder
        ],
        {
            cwd: workingDirectory,
            reject: false // Don't reject on non-zero exit (diff returns 1 when files differ)
        }
    );

    // diff exit codes:
    // 0 = files match
    // 1 = files differ (expected case, not an error)
    // 2+ = actual error (e.g., file not found, permission denied)
    if (diffResult.exitCode === 0) {
        logger.info(MSG_OUTPUTS_MATCH);
        return { success: true };
    } else if (diffResult.exitCode === 1) {
        // Files differ - this is what we're testing for!
        const diffOutput = diffResult.stdout.trim();
        const lineCount = diffOutput.split("\n").length;
        logger.warn(`${MSG_OUTPUTS_DIFFER} (${lineCount} lines of differences)`);

        // Log a sample of the differences
        const sampleLines = diffOutput.split("\n").slice(0, 50).join("\n");
        logger.warn(`Sample differences:\n${sampleLines}${lineCount > 50 ? "\n... (truncated)" : ""}`);

        return { success: false, error: ERROR_OUTPUTS_DIFFER };
    } else {
        // Actual diff error
        logger.error(`${ERROR_DIFF_COMMAND_FAILED} with exit code ${diffResult.exitCode}`);
        logger.error(`stderr: ${diffResult.stderr}`);
        return { success: false, error: `${ERROR_DIFF_COMMAND_FAILED}: ${diffResult.stderr}` };
    }
}

/**
 * Recursively removes all .git folders from the specified directory
 * This prevents git submodule warnings when committing test outputs
 */
async function cleanupGitFolders(outputFolder: string, logger: Logger): Promise<void> {
    try {
        const { readdir } = await import("fs/promises");
        const gitFolders: string[] = [];

        logger.debug(`Searching for .git folders in: ${outputFolder}`);

        // Recursively find all .git directories
        async function findGitFolders(dir: string): Promise<void> {
            try {
                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name === ".git") {
                            gitFolders.push(fullPath);
                            logger.debug(`  Found .git folder: ${fullPath}`);
                        } else {
                            // Recurse into subdirectories
                            await findGitFolders(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read (e.g., permission issues)
                logger.debug(`  Skipping directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // Check if the directory exists first
        try {
            await stat(outputFolder);
        } catch (error) {
            logger.debug(`Output folder does not exist, skipping cleanup: ${outputFolder}`);
            return;
        }

        await findGitFolders(outputFolder);

        if (gitFolders.length > 0) {
            logger.debug(`Removing ${gitFolders.length} .git folder(s)...`);
            for (const gitFolder of gitFolders) {
                logger.debug(`  Removing: ${gitFolder}`);
                await rm(gitFolder, { recursive: true, force: true });
            }
            logger.debug(`Successfully removed all .git folders`);
        } else {
            logger.debug(`No .git folders found in: ${outputFolder}`);
        }
    } catch (error) {
        // Non-fatal - log warning but don't fail the test
        logger.warn(`Failed to clean up .git folders: ${error instanceof Error ? error.message : String(error)}`);
    }
}
