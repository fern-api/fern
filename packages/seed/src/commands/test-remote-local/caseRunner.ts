import { LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { cp, mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import tmp from "tmp-promise";
import { TaskContext } from "@fern-api/task-context";
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
    taskContext: TaskContext;
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
    const { generator, fixture, outputMode, outputFolder, context } = testCase;
    const { fernExecutable, fernRepoDirectory, workingDirectory, taskContext, githubToken, fernToken } = context;
    const logger = taskContext.logger;

    logger.debug(`Test configuration: generator=${generator}, fixture=${fixture}, outputMode=${outputMode}`);
    logger.debug(`Working directory: ${workingDirectory}`);

    // Setup working directory
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
    logger.info("Starting local generation (Docker)...");
    const localResult = await runGeneration(testCase, "local");

    logger.info("Starting remote generation (Fiddle)...");
    const remoteResult = await runGeneration(testCase, "remote");

    // Check for generation failures
    if (!localResult.success || !remoteResult.success) {
        const errors: string[] = [];
        if (!localResult.success) {
            errors.push(`Local generation failed: ${localResult.error}`);
            logger.error(`Local generation error: ${localResult.error}`);
        }
        if (!remoteResult.success) {
            errors.push(`Remote generation failed: ${remoteResult.error}`);
            logger.error(`Remote generation error: ${remoteResult.error}`);
        }
        throw new Error(errors.join("\n"));
    }

    logger.info("Both generations completed successfully");

    // Compare results
    logger.info("Comparing local and remote outputs...");
    await compareResults(testCase, localResult, remoteResult);
}

async function compareResults(
    testCase: RemoteVsLocalTestCase,
    localResult: GenerationResultSuccess,
    remoteResult: GenerationResultSuccess
): Promise<void> {
    const logger = testCase.context.taskContext.logger;

    logger.debug(`Running diff between:\n  Remote: ${remoteResult.outputFolder}\n  Local: ${localResult.outputFolder}`);

    const diffResult = await loggingExeca(
        logger,
        "diff",
        ["-r", remoteResult.outputFolder, localResult.outputFolder],
        {
            cwd: testCase.context.workingDirectory,
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
    const { fernExecutable, workingDirectory, taskContext, githubToken, fernToken } = testCase.context;
    const logger = taskContext.logger;
    const group = generationMode === "local" ? LOCAL_GROUP_NAME : REMOTE_GROUP_NAME;
    const extraFlags = generationMode === "local" ? ["--local"] : [];

    const args = ["generate", "--group", group, "--log-level", LogLevel.Debug, ...extraFlags];
    logger.debug(`Running: ${fernExecutable} ${args.join(" ")}`);

    const startTime = Date.now();
    const result = await loggingExeca(logger, fernExecutable, args, {
        cwd: workingDirectory,
        env: {
            GITHUB_TOKEN: githubToken,
            FERN_TOKEN: fernToken
        },
        reject: false
    });
    const duration = Date.now() - startTime;

    if (result.exitCode !== 0) {
        logger.error(`${generationMode} generation failed after ${duration}ms (exit code: ${result.exitCode})`);
        logger.error(`stderr: ${result.stderr}`);
        return { success: false, error: result.stderr };
    }

    logger.info(`${generationMode} generation completed in ${duration}ms`);

    const outputDirectory = getOutputDirectory(testCase, generationMode);
    if (outputMode === "github") {
        logger.debug(`Copying GitHub output to ${outputDirectory}`);
        await copyGithubOutputToOutputDirectory(
            FERN_TEST_REPO_NAME,
            result.stdout,
            outputDirectory,
            logger
        );
    }
    return { success: true, outputFolder: outputDirectory };
}

async function copyGithubOutputToOutputDirectory(
    repository: string,
    logs: string,
    outputDirectory: string,
    logger: TaskContext["logger"]
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
    logger: TaskContext["logger"]
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
    logger: TaskContext["logger"]
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

function getOutputDirectory(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): string {
    const { generator, outputMode } = testCase;
    const { workingDirectory } = testCase.context;

    let _path = path.join(workingDirectory, "sdks");
    switch (outputMode) {
        case "github":
            _path = path.join(_path, "github");
            break;
        case "local-file-system":
            _path = path.join(_path, "local-file-system");
            break;
    }
    switch (generationMode) {
        case "local":
            _path = path.join(_path, "local");
            break;
        case "remote":
            _path = path.join(_path, "remote");
            break;
    }
    _path = path.join(_path, generator);
    return _path;
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
    logger: TaskContext["logger"]
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

function getPackageOutputConfig(testCase: RemoteVsLocalTestCase, generationMode: GenerationMode): unknown | undefined {
    const { generator, outputMode } = testCase;
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
    } else if (outputMode === "local-file-system") {
        return {
            location: "local-file-system",
            path: getOutputDirectory(testCase, generationMode)
        };
    } else {
        throw new Error(`Output mode ${outputMode} not supported`);
    }
}

function getLatestGeneratorVersion(
    generator: GeneratorName,
    logger: TaskContext["logger"]
): Promise<string> {
    logger.debug(`Getting version for ${generator}`);

    // TODO: Implement getting the latest generator version from dockerhub
    const map = {
        "fernapi/fern-typescript-sdk": "3.29.2",
        "fernapi/fern-java-sdk": "3.16.0",
        "fernapi/fern-go-sdk": "1.15.1",
        "fernapi/fern-python-sdk": "4.36.2"
    };
    const version = map[generator];
    if (version == null) {
        logger.error(`Generator ${generator} not found in version map`);
        throw new Error(`Generator ${generator} not found in map`);
    }

    logger.debug(`Using hardcoded version ${version} (TODO: fetch from Docker Hub)`);
    return Promise.resolve(version);
}
