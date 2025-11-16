import { Logger, LogLevel } from "@fern-api/logger";
import { loggingExeca, runExeca } from "@fern-api/logging-execa";
import { cp, mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import {
    FERN_CONFIG_JSON_CONTENT,
    FERN_CONFIG_JSON_FILENAME,
    FERN_TEST_REPO_NAME,
    GenerationMode,
    GeneratorName,
    GeneratorNameFromNickname,
    GeneratorNickname,
    LOCAL_GROUP_NAME,
    OutputMode,
    REMOTE_GROUP_NAME,
    TestFixture
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
    context: TestCaseContext;
}

export async function runTestCase(testCase: RemoteVsLocalTestCase): Promise<void> {
    const { generator, fixture, outputMode, context } = testCase;
    const { fernRepoDirectory, workingDirectory, logger } = context;

    logger.debug(`Test configuration: generator=${generator}, fixture=${fixture}, outputMode=${outputMode}`);
    logger.debug(`Working directory: ${workingDirectory}`);

    // Setup working directory (caller has already set this to include output mode)
    // Structure: seed-remote-local/{generator}/{fixture}/{outputFolder}/{outputMode}/
    logger.debug(`Clearing working directory: ${workingDirectory}`);
    await rm(workingDirectory, { recursive: true, force: true });
    await mkdir(workingDirectory, { recursive: true });

    const fernDirectory = path.join(workingDirectory, "fern");
    const definitionDirectory = path.join(fernDirectory, "definition");
    await mkdir(definitionDirectory, { recursive: true });

    // Write fern.config.json
    logger.debug(`Writing ${FERN_CONFIG_JSON_FILENAME}`);
    await writeFile(
        path.join(fernDirectory, FERN_CONFIG_JSON_FILENAME),
        JSON.stringify(FERN_CONFIG_JSON_CONTENT, null, 2)
    );

    // Copy fixture api definition
    const fixtureSource = path.join(fernRepoDirectory, "test-definitions", "fern", "apis", fixture, "definition");
    logger.debug(`Copying fixture definition from ${fixtureSource}`);
    await cp(fixtureSource, definitionDirectory, { recursive: true });

    // Get generator version
    const generatorVersion = await getLatestGeneratorVersion(GeneratorNameFromNickname[generator], logger);
    logger.debug(`Using generator version: ${generatorVersion}`);

    // Load custom config
    const customConfig = await loadCustomConfig(generator, fixture, logger);
    if (customConfig) {
        logger.debug(`Loaded custom config for ${generator}/${fixture}`);
    }

    const baseConfig = {
        name: GeneratorNameFromNickname[generator],
        version: generatorVersion,
        config: customConfig
    };

    const localConfig = {
        ...baseConfig,
        output: getPackageOutputConfig(testCase, "local"),
        ...(outputMode === "github"
            ? {
                  github: getGithubConfig(generator, "local")
              }
            : {})
    };

    const remoteConfig = {
        ...baseConfig,
        output: getPackageOutputConfig(testCase, "remote"),
        ...(outputMode === "github"
            ? {
                  github: getGithubConfig(generator, "remote")
              }
            : {})
    };

    logger.debug(`Writing generators.yml with local and remote groups`);
    await writeGeneratorsYml(fernDirectory, localConfig, remoteConfig);

    // Run generations
    logger.info("");
    logger.info("━━━ LOCAL GENERATION (Docker) ━━━");
    const localResult = await runGeneration(testCase, "local");

    logger.info("");
    logger.info("━━━ REMOTE GENERATION (Fiddle) ━━━");
    const remoteResult = await runGeneration(testCase, "remote");

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
        throw new Error(errors.join("\n"));
    }

    logger.info("");
    logger.info("✓ Both generations completed successfully");

    // Compare results
    logger.info("");
    logger.info("━━━ COMPARING OUTPUTS ━━━");
    await compareResults(testCase, localResult, remoteResult);
}

async function compareResults(
    testCase: RemoteVsLocalTestCase,
    localResult: GenerationResultSuccess,
    remoteResult: GenerationResultSuccess
): Promise<void> {
    const { context } = testCase;
    const { logger, workingDirectory } = context;

    logger.debug(`Running diff between:\n  Remote: ${remoteResult.outputFolder}\n  Local: ${localResult.outputFolder}`);

    const diffResult = await loggingExeca(
        logger,
        "diff",
        ["-r", remoteResult.outputFolder, localResult.outputFolder],
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
        logger.info("✓ Outputs match perfectly");
    } else if (diffResult.exitCode === 1) {
        // Files differ - this is what we're testing for!
        const diffOutput = diffResult.stdout.trim();
        const lineCount = diffOutput.split("\n").length;
        logger.warn(`⚠ Outputs differ (${lineCount} lines of differences)`);

        // Log a sample of the differences
        const sampleLines = diffOutput.split("\n").slice(0, 50).join("\n");
        logger.warn(`Sample differences:\n${sampleLines}${lineCount > 50 ? "\n... (truncated)" : ""}`);

        throw new Error(`Local and remote outputs differ. See logs for details.`);
    } else {
        // Actual diff error
        logger.error(`Diff command failed with exit code ${diffResult.exitCode}`);
        logger.error(`stderr: ${diffResult.stderr}`);
        throw new Error(`Diff command failed: ${diffResult.stderr}`);
    }
}

async function runGeneration(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): Promise<GenerationResult> {
    const { outputMode } = testCase;
    const { fernExecutable, workingDirectory, logger, githubToken, fernToken } = testCase.context;
    const group = generationMode === "local" ? LOCAL_GROUP_NAME : REMOTE_GROUP_NAME;
    const extraFlags = generationMode === "local" ? ["--local"] : [];

    // Use debug level to capture all output (needed for extracting branch info)
    // but we won't forward all logs to stdout - only our own structured logs
    const args = ["generate", "--group", group, "--log-level", LogLevel.Debug, ...extraFlags];

    logger.info(`▶ Running ${generationMode} generation...`);
    logger.debug(`  Command: ${fernExecutable} ${args.join(" ")}`);
    logger.debug(`  Working directory: ${workingDirectory}`);

    const startTime = Date.now();

    try {
        // Use execa directly instead of loggingExeca to avoid forwarding all subprocess logs
        const result = await runExeca(undefined, fernExecutable, args, {
            cwd: workingDirectory,
            env: {
                GITHUB_TOKEN: githubToken,
                FERN_TOKEN: fernToken
            },
            reject: false,
            all: true // Combine stdout and stderr for easier parsing
        });

        const duration = Date.now() - startTime;

        if (result.exitCode !== 0) {
            logger.error(`✗ ${generationMode} generation failed after ${duration}ms (exit code: ${result.exitCode})`);

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

        logger.info(`✓ ${generationMode} generation completed in ${duration}ms`);

        const outputDirectory = getOutputDirectory(testCase, generationMode);
        if (outputMode === "github") {
            logger.debug(`  Copying GitHub output to ${outputDirectory}`);
            // Pass the combined output (stdout + stderr) to extract branch info
            await copyGithubOutputToOutputDirectory(
                FERN_TEST_REPO_NAME,
                result.all || result.stdout,
                outputDirectory,
                logger
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
    logger: Logger
): Promise<void> {
    logger.debug(`Attempting to extract GitHub branch from logs`);
    const remoteBranch = getRemoteBranchFromLogs(logs);

    if (remoteBranch) {
        logger.debug(`Found branch in logs: ${remoteBranch}`);
    } else {
        logger.warn(`Branch not found in logs, falling back to most recent branch`);
        const fallbackBranch = await getMostRecentlyCreatedBranch(repository, logger);
        logger.debug(`Using fallback branch: ${fallbackBranch}`);
    }

    const branchToClone = remoteBranch ?? (await getMostRecentlyCreatedBranch(repository, logger));
    const tmpDir = await tmp.dir();

    logger.debug(`Cloning ${repository}@${branchToClone} to temporary directory`);
    await cloneRepository(repository, branchToClone, tmpDir.path, logger);

    logger.debug(`Copying cloned repository to ${outputDirectory}`);
    await cp(tmpDir.path, outputDirectory, { recursive: true });

    logger.info(`Successfully copied GitHub output from branch: ${branchToClone}`);
}

function getRemoteBranchFromLogs(logs: string): string | undefined {
    // Example log line: INFO  2025-11-15T23:49:44.180Z [api]: fernapi/fern-typescript-sdk Pushed branch: https://github.com/fern-api/lattice-sdk-javascript/tree/fern-bot/2025-11-15T23-49Z
    const branchRegex = /Pushed branch: https:\/\/github\.com\/[^\/]+\/[^\/]+\/tree\/([^\s]+)/;
    const match = logs.match(branchRegex);
    return match?.[1];
}

async function getMostRecentlyCreatedBranch(
    repository: string,
    logger: Logger
): Promise<string> {
    logger.debug(`Fetching most recent branch for ${repository}`);

    const result = await loggingExeca(logger, "gh", ["api", `repos/${repository}/branches`, "--jq", ".[0].name"], {
        reject: false
    });

    if (result.exitCode !== 0) {
        logger.error(`Failed to get most recent branch: ${result.stderr}`);
        throw new Error(`Failed to get most recent branch: ${result.stderr}`);
    }

    const branch = result.stdout.trim();
    logger.debug(`Most recent branch: ${branch}`);
    return branch;
}

async function cloneRepository(
    repository: string,
    branch: string,
    targetDirectory: string,
    logger: Logger
): Promise<void> {
    logger.debug(`Cloning ${repository}@${branch} to ${targetDirectory}`);

    const result = await loggingExeca(
        logger,
        "git",
        ["clone", "--branch", branch, "--depth", "1", `https://github.com/${repository}.git`, targetDirectory],
        { reject: false }
    );

    if (result.exitCode !== 0) {
        logger.error(`Failed to clone repository: ${result.stderr}`);
        throw new Error(`Failed to clone repository: ${result.stderr}`);
    }

    logger.debug(`Successfully cloned repository`);
}

function getOutputDirectory(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): string {
    const { generator } = testCase;
    const { workingDirectory } = testCase.context;

    // Structure: {workingDirectory}/sdks/{generationMode}/{generator}
    // Example: seed-remote-local/python-sdk/imdb/no-custom-config/local-file-system/sdks/local/python-sdk
    return path.join(workingDirectory, "sdks", generationMode + "Generation", generator);
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
    const schemaServer = "# yaml-language-server: $schema=https://schema.buildwithfern.dev/generators-yml.json";
    const content = schemaServer + "\n" + yaml.dump(structuredContent, { lineWidth: -1 });
    await writeFile(path.join(fernDirectory, "generators.yml"), content);
}

function loadCustomConfig(
    generator: GeneratorNickname,
    fixture: TestFixture,
    logger: Logger
): Promise<unknown | undefined> {
    logger.debug(`Looking for custom config for ${generator}/${fixture}`);

    // TODO: Implement pulling custom config for fixtures from somewhere
    if (generator === "go-sdk") {
        logger.debug(`Loaded custom Go module config`);
        return Promise.resolve({
            module: {
                path: "github.com/fern-api/test-remote-local-sdk"
            }
        });
    }

    logger.debug(`No custom config found, using defaults`);
    return Promise.resolve(undefined);
}

function getGithubConfig(generator: GeneratorNickname, generationMode: GenerationMode): unknown | undefined {
    if (generationMode === "remote") {
        return {
            repository: FERN_TEST_REPO_NAME,
            mode: "pull-request"
        };
    } else if (generationMode === "local") {
        return {
            uri: FERN_TEST_REPO_NAME,
            token: "${GITHUB_TOKEN}",
            mode: "pull-request"
        };
    } else {
        throw new Error(`Generation mode ${generationMode} not supported`);
    }
}

function getPackageOutputConfig(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): unknown | undefined {
    const { generator, outputMode } = testCase;
    const { workingDirectory } = testCase.context;

    if (outputMode === "github") {
        switch (generator) {
            case "ts-sdk":
                return {
                    location: "npm",
                    "package-name": "@fern-fern/test-remote-local-sdk"
                };
            case "java-sdk":
                return {
                    location: "maven",
                    coordinate: "com.fern-api:test-remote-local-sdk"
                };
            case "python-sdk":
                return {
                    location: "pypi",
                    "package-name": "test-remote-local-sdk"
                };
            case "go-sdk":
                return undefined;
            default:
                throw new Error(`Generator ${generator} not supported`);
        }
    } else if (outputMode === "local") {
        const absoluteOutputPath = getOutputDirectory(testCase, generationMode);
        const fernDirectory = path.join(workingDirectory, "fern");
        // Calculate relative path from generators.yml location (fern/generators.yml) to output directory
        const relativePath = path.relative(fernDirectory, absoluteOutputPath);

        return {
            location: "local-file-system",
            path: relativePath
        };
    } else {
        throw new Error(`Output mode ${outputMode} not supported`);
    }
}

async function getLatestGeneratorVersion(
    generator: GeneratorName,
    logger: Logger
): Promise<string> {
    logger.debug(`Getting latest version for ${generator} from Docker Hub`);

    try {
        // Extract repository name from generator (e.g., "fernapi/fern-typescript-sdk" -> "fern-typescript-sdk")
        const [namespace, repository] = generator.split("/");
        if (!namespace || !repository) {
            throw new Error(`Invalid generator name format: ${generator}`);
        }

        // Docker Hub API endpoint for repository tags
        const url = `https://hub.docker.com/v2/namespaces/${namespace}/repositories/${repository}/tags?page_size=100&ordering=-last_updated`;

        logger.debug(`Fetching tags from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Docker Hub API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            throw new Error(`No tags found for ${generator}`);
        }

        // Filter out non-semantic version tags (e.g., "latest", "main", etc.)
        // Look for tags that match semantic versioning pattern: X.Y.Z
        const semverRegex = /^\d+\.\d+\.\d+$/;
        const versionTags = data.results
            .map((tag: { name: string }) => tag.name)
            .filter((name: string) => semverRegex.test(name));

        if (versionTags.length === 0) {
            throw new Error(`No semantic version tags found for ${generator}`);
        }

        // The API returns tags ordered by last_updated, but we want the highest semantic version
        // Sort versions by semantic versioning rules
        const sortedVersions = versionTags.sort((a: string, b: string) => {
            const aParts = a.split(".").map(Number);
            const bParts = b.split(".").map(Number);

            for (let i = 0; i < 3; i++) {
                const aPart = aParts[i];
                const bPart = bParts[i];
                if (aPart && bPart) {
                    return bPart - aPart; // Descending order
                }
            }
            return 0;
        });

        const latestVersion = sortedVersions[0];
        logger.debug(`Found latest version: ${latestVersion}`);
        return latestVersion;
    } catch (error) {
        logger.error(`Failed to fetch version from Docker Hub: ${error instanceof Error ? error.message : String(error)}`);

        // Fallback to hardcoded versions if Docker Hub API fails
        logger.warn(`Falling back to hardcoded version`);
        const fallbackMap: Record<string, string> = {
            "fernapi/fern-typescript-sdk": "3.29.2",
            "fernapi/fern-java-sdk": "3.16.0",
            "fernapi/fern-go-sdk": "1.15.1",
            "fernapi/fern-python-sdk": "4.36.2"
        };

        const version = fallbackMap[generator];
        if (version == null) {
            logger.error(`Generator ${generator} not found in fallback version map`);
            throw new Error(`Generator ${generator} not found in fallback map and Docker Hub fetch failed`);
        }

        logger.debug(`Using fallback version: ${version}`);
        return version;
    }
}
