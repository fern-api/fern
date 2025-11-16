import { Logger, LogLevel } from "@fern-api/logger";
import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import { Octokit } from "@octokit/rest";
import { cp, mkdir, readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import {
    APIS_DIRECTORY_NAME,
    DEFINITION_DIRECTORY_NAME,
    DIFF_COMMAND,
    DIFF_RECURSIVE_FLAG,
    DOCKER_HUB_API_BASE_URL,
    DOCKER_HUB_TAGS_ORDERING,
    DOCKER_HUB_TAGS_PAGE_SIZE,
    ENV_VAR_FERN_TOKEN,
    ENV_VAR_GITHUB_TOKEN,
    ERROR_DIFF_COMMAND_FAILED,
    ERROR_DOCKER_HUB_API_FAILED,
    ERROR_FAILED_TO_CLONE,
    ERROR_FAILED_TO_FETCH_VERSION,
    ERROR_FAILED_TO_GET_BRANCH,
    ERROR_INVALID_GENERATOR_NAME,
    ERROR_NO_GENERATOR_VERSION,
    ERROR_NO_SEMVER_TAGS,
    ERROR_NO_TAGS_FOUND,
    ERROR_OUTPUTS_DIFFER,
    FERN_CONFIG_JSON_CONTENT,
    FERN_CONFIG_JSON_FILENAME,
    FERN_DIRECTORY_NAME,
    FERN_GENERATE_COMMAND,
    FERN_TEST_REPO_NAME,
    FLAG_GROUP,
    FLAG_LOCAL,
    FLAG_LOG_LEVEL,
    GENERATION_MODE_SUFFIX,
    GENERATORS_YML_FILENAME,
    GENERATORS_YML_SCHEMA_COMMENT,
    GENERATORS_YML_SCHEMA_URL,
    GenerationMode,
    GeneratorName,
    GeneratorNameFromNickname,
    GeneratorNickname,
    GH_API_SUBCOMMAND,
    GH_BRANCHES_JQ_QUERY,
    GH_COMMAND,
    GH_JQ_FLAG,
    GIT_BRANCH_FLAG,
    GIT_CLONE_COMMAND,
    GIT_DEPTH_FLAG,
    GIT_DEPTH_VALUE,
    GITHUB_BASE_URL,
    GITHUB_BRANCH_URL_REGEX,
    GITHUB_OUTPUT_MODE_PULL_REQUEST,
    GITHUB_TOKEN_ENV_VAR_REFERENCE,
    GO_SDK_MODULE_PATH,
    JAVA_SDK_MAVEN_COORDINATE,
    LOCAL_BUILD_VERSION,
    LOCAL_GROUP_NAME,
    LOG_HEADER_COMPARING_OUTPUTS,
    LOG_HEADER_LOCAL_GENERATION,
    LOG_HEADER_REMOTE_GENERATION,
    LOG_SECTION_SEPARATOR,
    MSG_BOTH_GENERATIONS_SUCCESSFUL,
    MSG_BRANCH_NOT_FOUND_FALLBACK,
    MSG_GENERATION_COMPLETED_PREFIX,
    MSG_GENERATION_FAILED_PREFIX,
    MSG_GENERATION_RUNNING_PREFIX,
    MSG_OUTPUTS_DIFFER,
    MSG_OUTPUTS_MATCH,
    MSG_SUCCESSFULLY_COPIED_GITHUB,
    OutputMode,
    PACKAGE_LOCATION_LOCAL_FILE_SYSTEM,
    PACKAGE_LOCATION_MAVEN,
    PACKAGE_LOCATION_NPM,
    PACKAGE_LOCATION_PYPI,
    PYTHON_SDK_PACKAGE_NAME,
    REMOTE_GROUP_NAME,
    SDKS_DIRECTORY_NAME,
    SEED_REMOTE_LOCAL_OUTPUT_DIR,
    SEMVER_REGEX,
    TEST_DEFINITIONS_RELATIVE_PATH,
    TestFixture,
    TS_SDK_PACKAGE_NAME
} from "./constants";

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

// Structure of seed-remote-local seed.yml files
interface RemoteLocalSeedConfig {
    fixtures?: {
        [fixtureName: string]: Array<{
            outputFolder: string;
            customConfig?: unknown;
        }>;
    };
}

export interface TestCaseResult {
    success: boolean;
    error?: string;
}

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
    logger.debug(`Writing ${FERN_CONFIG_JSON_FILENAME}`);
    await writeFile(
        path.join(fernDirectory, FERN_CONFIG_JSON_FILENAME),
        JSON.stringify(FERN_CONFIG_JSON_CONTENT, null, 2)
    );

    // Copy fixture api definition
    const fixtureSource = path.join(
        fernRepoDirectory,
        TEST_DEFINITIONS_RELATIVE_PATH,
        FERN_DIRECTORY_NAME,
        APIS_DIRECTORY_NAME,
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
        const { readdir, stat } = await import("fs/promises");
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

async function runGeneration(
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

async function copyGithubOutputToOutputDirectory(
    repository: string,
    logs: string,
    outputDirectory: string,
    logger: Logger,
    githubToken?: string
): Promise<void> {
    logger.debug(`Attempting to extract GitHub branch from logs`);
    logger.debug(`Logs length: ${logs.length} characters`);

    // Log a sample of the logs to see what we're working with
    const logLines = logs.split("\n");
    const relevantLines = logLines.filter(
        (line) => line.includes("Pushed branch") || line.includes("github.com") || line.includes("fern-bot")
    );
    if (relevantLines.length > 0) {
        logger.debug(`Found ${relevantLines.length} potentially relevant log lines:`);
        relevantLines.slice(0, 5).forEach((line) => {
            logger.debug(`  ${line}`);
        });
    } else {
        logger.debug(`No lines containing 'Pushed branch', 'github.com', or 'fern-bot' found in logs`);
    }

    const remoteBranch = getRemoteBranchFromLogs(logs);

    if (remoteBranch) {
        logger.info(`✓ Found branch in logs: ${remoteBranch}`);
    } else {
        logger.warn(MSG_BRANCH_NOT_FOUND_FALLBACK);
        const fallbackBranch = await getMostRecentlyCreatedBranch(repository, logger, githubToken);
        logger.warn(`Using fallback branch: ${fallbackBranch} (this may be incorrect if multiple tests are running)`);
    }

    const branchToClone = remoteBranch ?? (await getMostRecentlyCreatedBranch(repository, logger, githubToken));
    const tmpDir = await tmp.dir();

    logger.debug(`Cloning ${repository}@${branchToClone} to temporary directory`);
    await cloneRepository(repository, branchToClone, tmpDir.path, logger, githubToken);

    logger.debug(`Copying cloned repository to ${outputDirectory}`);
    await cp(tmpDir.path, outputDirectory, { recursive: true });

    logger.info(`${MSG_SUCCESSFULLY_COPIED_GITHUB}${branchToClone}`);
}

function getRemoteBranchFromLogs(logs: string): string | undefined {
    // Example log line: INFO  2025-11-15T23:49:44.180Z [api]: fernapi/fern-typescript-sdk Pushed branch: https://github.com/fern-api/lattice-sdk-javascript/tree/fern-bot/2025-11-15T23-49Z
    // Try multiple patterns to be more robust

    // Pattern 1: Full GitHub URL with branch
    const urlMatch = logs.match(GITHUB_BRANCH_URL_REGEX);
    if (urlMatch?.[1]) {
        return urlMatch[1];
    }

    // Pattern 2: Look for "branch: <branch-name>" pattern
    const branchMatch = logs.match(/branch:\s+(\S+)/i);
    if (branchMatch?.[1] && !branchMatch[1].startsWith("http")) {
        return branchMatch[1];
    }

    // Pattern 3: Look for fern-bot/<timestamp> pattern directly
    const fernBotMatch = logs.match(/fern-bot\/[\d-]+T[\d-]+Z/);
    if (fernBotMatch?.[0]) {
        return fernBotMatch[0];
    }

    return undefined;
}

async function getMostRecentlyCreatedBranch(repository: string, logger: Logger, githubToken?: string): Promise<string> {
    logger.debug(`Fetching most recent branch for ${repository}`);

    // Create Octokit instance
    const octokit = new Octokit({
        auth: githubToken
    });

    // Parse repository owner and repo name
    const [owner, repo] = repository.split("/");
    if (!owner || !repo) {
        throw new Error(`Invalid repository format: ${repository}`);
    }

    try {
        // Fetch all branches
        const { data: branches } = await octokit.rest.repos.listBranches({
            owner,
            repo,
            per_page: 100
        });

        logger.debug(`Found ${branches.length} branches, fetching commit dates...`);

        if (branches.length === 0) {
            throw new Error(`${ERROR_FAILED_TO_GET_BRANCH}: No branches found`);
        }

        interface BranchWithDate {
            name: string;
            commitDate: string;
        }

        // Process branches in batches of 5 to avoid too many concurrent requests
        const batchSize = 5;
        const branchesWithDates: BranchWithDate[] = [];

        for (let i = 0; i < branches.length; i += batchSize) {
            const batch = branches.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (branch) => {
                    try {
                        // Get commit details to extract the commit date
                        const { data: commit } = await octokit.rest.repos.getCommit({
                            owner,
                            repo,
                            ref: branch.commit.sha
                        });

                        const commitDate = commit.commit.committer?.date || "1970-01-01T00:00:00Z";
                        logger.debug(`Branch ${branch.name}: commit date ${commitDate}`);

                        return {
                            name: branch.name,
                            commitDate
                        };
                    } catch (error) {
                        logger.warn(`Error fetching commit date for ${branch.name}: ${error}`);
                        return {
                            name: branch.name,
                            commitDate: "1970-01-01T00:00:00Z"
                        };
                    }
                })
            );
            branchesWithDates.push(...batchResults);
        }

        // Sort by commit date descending (most recent first)
        branchesWithDates.sort((a, b) => {
            return new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime();
        });

        const mostRecentBranch = branchesWithDates[0];
        if (!mostRecentBranch) {
            throw new Error(`${ERROR_FAILED_TO_GET_BRANCH}: No branches found`);
        }

        logger.debug(`Most recent branch by commit date: ${mostRecentBranch.name} (${mostRecentBranch.commitDate})`);
        return mostRecentBranch.name;
    } catch (error) {
        logger.error(`Failed to fetch branches: ${error instanceof Error ? error.message : String(error)}`);
        throw new Error(`${ERROR_FAILED_TO_GET_BRANCH}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function cloneRepository(
    repository: string,
    branch: string,
    targetDirectory: string,
    logger: Logger,
    githubToken?: string
): Promise<void> {
    logger.debug(`Cloning ${repository}@${branch} to ${targetDirectory}`);

    // Use authenticated URL if token is provided (for private repos)
    const cloneUrl = githubToken
        ? `${GITHUB_BASE_URL.replace("https://", `https://${githubToken}@`)}/${repository}.git`
        : `${GITHUB_BASE_URL}/${repository}.git`;

    // Log the clone URL (redacting token for security)
    const logUrl = githubToken ? `${GITHUB_BASE_URL}/${repository}.git (with auth token)` : cloneUrl;
    logger.debug(`Clone URL: ${logUrl}`);
    logger.debug(
        `Clone command: git ${GIT_CLONE_COMMAND} ${GIT_BRANCH_FLAG} ${branch} ${GIT_DEPTH_FLAG} ${GIT_DEPTH_VALUE} [url] ${targetDirectory}`
    );

    const result = await loggingExeca(
        logger,
        "git",
        [GIT_CLONE_COMMAND, GIT_BRANCH_FLAG, branch, GIT_DEPTH_FLAG, GIT_DEPTH_VALUE, cloneUrl, targetDirectory],
        { reject: false }
    );

    if (result.exitCode !== 0) {
        const errorOutput = result.stderr || result.stdout || "No error output captured";
        logger.error(`${ERROR_FAILED_TO_CLONE} (exit code ${result.exitCode})`);
        logger.error(`  Repository: ${repository}`);
        logger.error(`  Branch: ${branch}`);
        logger.error(`  Target: ${targetDirectory}`);
        logger.error(`  Error output: ${errorOutput}`);
        throw new Error(`${ERROR_FAILED_TO_CLONE}: ${errorOutput}`);
    }

    logger.debug(`Successfully cloned repository`);
}

function getOutputDirectory(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): string {
    const { generator } = testCase;
    const { workingDirectory } = testCase.context;

    // Structure: {workingDirectory}/sdks/{generationMode}/{generator}
    // Example: seed-remote-local/python-sdk/imdb/no-custom-config/local-file-system/sdks/local/python-sdk
    return path.join(workingDirectory, SDKS_DIRECTORY_NAME, generationMode + GENERATION_MODE_SUFFIX);
}

async function writeGeneratorsYml(fernDirectory: string, localConfig: unknown, remoteConfig: unknown): Promise<void> {
    const structuredContent = {
        groups: {
            [REMOTE_GROUP_NAME]: {
                generators: [remoteConfig]
            },
            [LOCAL_GROUP_NAME]: {
                generators: [localConfig]
            }
        }
    };
    const schemaServer = `${GENERATORS_YML_SCHEMA_COMMENT}${GENERATORS_YML_SCHEMA_URL}`;
    const content = schemaServer + "\n" + yaml.dump(structuredContent, { lineWidth: -1 });
    await writeFile(path.join(fernDirectory, GENERATORS_YML_FILENAME), content);
}

async function loadCustomConfig(
    generator: GeneratorNickname,
    fixture: TestFixture,
    outputFolder: string | undefined,
    fernRepoDirectory: string,
    logger: Logger
): Promise<unknown | undefined> {
    logger.debug(`Looking for custom config for ${generator}/${fixture}/${outputFolder || "no-custom-config"}`);

    // Load seed.yml from seed-remote-local/{generator}/seed.yml
    const seedYmlPath = path.join(fernRepoDirectory, SEED_REMOTE_LOCAL_OUTPUT_DIR, generator, "seed.yml");

    try {
        const seedYmlContent = await readFile(seedYmlPath, "utf-8");
        const seedConfig = yaml.load(seedYmlContent) as RemoteLocalSeedConfig;

        // Look for fixture-specific config
        const fixtureConfigs = seedConfig.fixtures?.[fixture];
        if (!fixtureConfigs || fixtureConfigs.length === 0) {
            logger.debug(`No fixture config found in seed.yml for ${fixture}, using defaults`);
            return undefined;
        }

        // Find the config matching the outputFolder
        const matchingConfig = fixtureConfigs.find(
            (config) => config.outputFolder === (outputFolder || "no-custom-config")
        );

        if (!matchingConfig) {
            logger.debug(
                `No matching outputFolder config found for ${outputFolder || "no-custom-config"}, using defaults`
            );
            return undefined;
        }

        if (matchingConfig.customConfig !== undefined && matchingConfig.customConfig !== null) {
            logger.debug(`Loaded custom config from seed.yml: ${JSON.stringify(matchingConfig.customConfig)}`);
            return matchingConfig.customConfig;
        }

        logger.debug(`Custom config is null/undefined, using defaults`);
        return undefined;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            logger.debug(`No seed.yml found at ${seedYmlPath}, using defaults`);
            return undefined;
        }
        logger.warn(`Error loading seed.yml: ${error instanceof Error ? error.message : String(error)}`);
        return undefined;
    }
}

function getGithubConfig(generator: GeneratorNickname, generationMode: GenerationMode): unknown | undefined {
    if (generationMode === "remote") {
        return {
            repository: FERN_TEST_REPO_NAME,
            mode: GITHUB_OUTPUT_MODE_PULL_REQUEST
        };
    } else if (generationMode === "local") {
        return {
            uri: FERN_TEST_REPO_NAME,
            token: GITHUB_TOKEN_ENV_VAR_REFERENCE,
            mode: GITHUB_OUTPUT_MODE_PULL_REQUEST
        };
    } else {
        throw new Error(`Generation mode ${generationMode} not supported`);
    }
}

function getPackageOutputConfig(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): unknown | undefined {
    const { generator, outputMode } = testCase;
    const { workingDirectory } = testCase.context;

    if (outputMode === "github") {
        switch (generator) {
            case "ts-sdk":
                return {
                    location: PACKAGE_LOCATION_NPM,
                    "package-name": TS_SDK_PACKAGE_NAME
                };
            case "java-sdk":
                return {
                    location: PACKAGE_LOCATION_MAVEN,
                    coordinate: JAVA_SDK_MAVEN_COORDINATE
                };
            case "python-sdk":
                return {
                    location: PACKAGE_LOCATION_PYPI,
                    "package-name": PYTHON_SDK_PACKAGE_NAME
                };
            case "go-sdk":
                return undefined;
            default:
                throw new Error(`Generator ${generator} not supported`);
        }
    } else if (outputMode === "local") {
        const absoluteOutputPath = getOutputDirectory(testCase, generationMode);
        const fernDirectory = path.join(workingDirectory, FERN_DIRECTORY_NAME);
        // Calculate relative path from generators.yml location (fern/generators.yml) to output directory
        const relativePath = path.relative(fernDirectory, absoluteOutputPath);

        return {
            location: PACKAGE_LOCATION_LOCAL_FILE_SYSTEM,
            path: relativePath
        };
    } else {
        throw new Error(`Output mode ${outputMode} not supported`);
    }
}

/**
 * Fetches the latest versions for all specified generators from Docker Hub.
 * This should be called once at the beginning of a test run to avoid redundant API calls.
 */
export async function getLatestGeneratorVersions(
    generators: readonly GeneratorNickname[],
    logger: Logger
): Promise<Record<GeneratorName, string>> {
    const generatorNames = generators.map((nickname) => GeneratorNameFromNickname[nickname]);
    const uniqueGeneratorNames = Array.from(new Set(generatorNames));

    logger.debug(`Fetching versions for ${uniqueGeneratorNames.length} generator(s)`);

    const versions: Record<GeneratorName, string> = {} as Record<GeneratorName, string>;

    // Fetch all versions in parallel
    await Promise.all(
        uniqueGeneratorNames.map(async (generator) => {
            const version = await getLatestGeneratorVersion(generator, logger);
            versions[generator] = version;
            // Log immediately after fetching each version
            logger.info(`  Fetched ${generator}: ${version}`);
        })
    );

    return versions;
}

async function getLatestGeneratorVersion(generator: GeneratorName, logger: Logger): Promise<string> {
    logger.debug(`Getting latest version for ${generator} from Docker Hub`);

    try {
        // Extract repository name from generator (e.g., "fernapi/fern-typescript-sdk" -> "fern-typescript-sdk")
        const [namespace, repository] = generator.split("/");
        if (!namespace || !repository) {
            throw new Error(`${ERROR_INVALID_GENERATOR_NAME}: ${generator}`);
        }

        // Docker Hub API v2 endpoint for repository tags
        // Note: We need to fetch multiple pages to ensure we get all versions
        // The API returns paginated results, and ordering by last_updated may not give us the highest version first
        let allVersionTags: string[] = [];
        let nextUrl: string | null =
            `${DOCKER_HUB_API_BASE_URL}/repositories/${namespace}/${repository}/tags?page_size=${DOCKER_HUB_TAGS_PAGE_SIZE}&ordering=${DOCKER_HUB_TAGS_ORDERING}`;
        let pageCount = 0;
        const maxPages = 10; // Limit to prevent infinite loops

        while (nextUrl && pageCount < maxPages) {
            logger.debug(`Fetching page ${pageCount + 1} from: ${nextUrl}`);
            const response = await fetch(nextUrl);

            if (!response.ok) {
                throw new Error(`${ERROR_DOCKER_HUB_API_FAILED} ${response.status}: ${response.statusText}`);
            }

            const data = (await response.json()) as {
                results?: Array<{ name: string; last_updated?: string }>;
                next?: string | null;
            };

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error(`${ERROR_NO_TAGS_FOUND} ${generator}`);
            }

            logger.debug(`Fetched ${data.results.length} tags from page ${pageCount + 1}`);

            // Filter and collect semantic version tags
            const pageVersionTags = data.results.map((tag) => tag.name).filter((name) => SEMVER_REGEX.test(name));

            allVersionTags = allVersionTags.concat(pageVersionTags);
            logger.debug(`Found ${pageVersionTags.length} semantic version tags on page ${pageCount + 1}`);

            // Move to next page if available
            nextUrl = data.next ?? null;
            pageCount++;

            // If we've already found a good number of versions, we can stop early
            // Most repos won't have more than a few hundred versions
            if (allVersionTags.length >= 500) {
                logger.debug(`Found ${allVersionTags.length} versions, stopping pagination`);
                break;
            }
        }

        if (allVersionTags.length === 0) {
            throw new Error(`${ERROR_NO_SEMVER_TAGS} ${generator}`);
        }

        logger.debug(`Total semantic version tags found: ${allVersionTags.length}`);

        // Sort versions by semantic versioning rules (descending order)
        const sortedVersions = allVersionTags.sort((a: string, b: string) => {
            const aParts = a.split(".").map(Number);
            const bParts = b.split(".").map(Number);

            for (let i = 0; i < 3; i++) {
                const aPart = aParts[i] ?? 0;
                const bPart = bParts[i] ?? 0;
                if (aPart !== bPart) {
                    return bPart - aPart; // Descending order
                }
            }
            return 0;
        });

        const latestVersion = sortedVersions[0];
        if (!latestVersion) {
            throw new Error(`${ERROR_NO_SEMVER_TAGS} ${generator}`);
        }
        logger.debug(`Found latest version: ${latestVersion} (from ${sortedVersions.length} total versions)`);
        return latestVersion;
    } catch (error) {
        logger.error(
            `Failed to fetch version from Docker Hub: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new Error(
            `${ERROR_FAILED_TO_FETCH_VERSION} ${generator} from Docker Hub: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Returns LOCAL_BUILD_VERSION for all generators (used when generators are built locally)
 */
export async function getLocalGeneratorVersions(
    generators: readonly GeneratorNickname[],
    logger: Logger
): Promise<Record<GeneratorName, string>> {
    const generatorNames = generators.map((nickname) => GeneratorNameFromNickname[nickname]);
    const uniqueGeneratorNames = Array.from(new Set(generatorNames));

    logger.debug(`Using local version ${LOCAL_BUILD_VERSION} for ${uniqueGeneratorNames.length} generator(s)`);

    const versions: Record<GeneratorName, string> = {} as Record<GeneratorName, string>;

    for (const generator of uniqueGeneratorNames) {
        versions[generator] = LOCAL_BUILD_VERSION;
        logger.info(`  Using ${generator}: ${LOCAL_BUILD_VERSION} (locally built)`);
    }

    return versions;
}
