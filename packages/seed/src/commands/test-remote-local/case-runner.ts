import { Logger, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
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
    const { generator, fixture, outputMode, outputFolder, context } = testCase;
    const { fernExecutable, fernRepoDirectory, workingDirectory, logger, githubToken, fernToken } = context;

    logger.info(`Running test case for generator: ${generator}, fixture: ${fixture}, output mode: ${outputMode}`);
    logger.info(`Clearing working directory: ${workingDirectory}`);
    await rm(workingDirectory, { recursive: true });
    await mkdir(workingDirectory, { recursive: true });

    const fernDirectory = path.join(workingDirectory, "fern");
    const definitionDirectory = path.join(fernDirectory, "definition");
    await mkdir(definitionDirectory, { recursive: true });

    // Write fern.config.json
    await writeFile(
        path.join(fernDirectory, FERN_CONFIG_JSON_FILENAME),
        JSON.stringify(FERN_CONFIG_JSON_CONTENT, null, 2)
    );

    // Copy fixture api definition
    await cp(
        path.join(fernRepoDirectory, "test-definitions", "fern", "apis", fixture, "definition"),
        definitionDirectory,
        { recursive: true }
    );

    const generatorVersion = await getLatestGeneratorVersion(GeneratorNameFromNickname[generator]);

    const baseConfig = {
        name: GeneratorNameFromNickname[generator],
        version: generatorVersion,
        config: await loadCustomConfig(generator, fixture)
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

    await writeGeneratorsYml(fernDirectory, localConfig, remoteConfig);

    const localResult = await runGeneration(testCase, "local");
    const remoteResult = await runGeneration(testCase, "remote");
    if (!localResult.success || !remoteResult.success) {
        // TODO: Add more detailed error messages with both errors if both failed
        throw new Error(
            `Local generation failed: ${localResult.success ? "Success" : "Failure"}\nRemote generation failed: ${remoteResult.success ? "Success" : "Failure"}`
        );
    }
    const diff = await compareResults(testCase, localResult, remoteResult);
}

async function compareResults(
    testCase: RemoteVsLocalTestCase,
    localResult: GenerationResultSuccess,
    remoteResult: GenerationResultSuccess
): Promise<void> {
    const diffResult = await loggingExeca(
        testCase.context.logger,
        "diff",
        ["-r", remoteResult.outputFolder, localResult.outputFolder],
        {
            cwd: testCase.context.workingDirectory
        }
    );
    if (diffResult.exitCode !== 0) {
        throw new Error(`Diff failed: ${diffResult.stderr}`);
    }
    testCase.context.logger.info(diffResult.stdout);
}

async function runGeneration(
    testCase: RemoteVsLocalTestCase,
    generationMode: GenerationMode
): Promise<GenerationResult> {
    const { outputMode } = testCase;
    const { fernExecutable, workingDirectory, logger, githubToken, fernToken } = testCase.context;
    const group = generationMode === "local" ? LOCAL_GROUP_NAME : REMOTE_GROUP_NAME;
    const extraFlags = generationMode === "local" ? ["--local"] : [];

    const args = ["generate", "--group", group, "--log-level", LogLevel.Debug, ...extraFlags];
    const result = await loggingExeca(logger, fernExecutable, args, {
        cwd: workingDirectory,
        env: {
            GITHUB_TOKEN: githubToken,
            FERN_TOKEN: fernToken
        }
    });
    if (result.exitCode !== 0) {
        return { success: false, error: result.stderr };
    }
    const outputDirectory = getOutputDirectory(testCase, generationMode);
    if (outputMode === "github") {
        await copyGithubOutputToOutputDirectory(
            FERN_TEST_REPO_NAME,
            result.stdout,
            getOutputDirectory(testCase, generationMode)
        );
    }
    return { success: true, outputFolder: outputDirectory };
}

async function copyGithubOutputToOutputDirectory(
    repository: string,
    logs: string,
    outputDirectory: string
): Promise<void> {
    const remoteBranch = getRemoteBranchFromLogs(logs) ?? (await getMostRecentlyCreatedBranch(repository));
    const tmpDir = await tmp.dir();
    await cloneReposiroty(repository, remoteBranch, tmpDir.path);
    await cp(tmpDir.path, outputDirectory, { recursive: true });
}

function getRemoteBranchFromLogs(logs: string): string | undefined {
    // Example log line: INFO  2025-11-15T23:49:44.180Z [api]: fernapi/fern-typescript-sdk Pushed branch: https://github.com/fern-api/lattice-sdk-javascript/tree/fern-bot/2025-11-15T23-49Z
    const branchRegex = /Pushed branch: https:\/\/github\.com\/[^\/]+\/[^\/]+\/tree\/([^\s]+)/;
    const match = logs.match(branchRegex);
    return match?.[1];
}

async function getMostRecentlyCreatedBranch(repository: string): Promise<string> {
    const result = await loggingExeca(
        { info: () => {}, debug: () => {}, error: () => {}, warn: () => {} } as Logger,
        "gh",
        ["api", `repos/${repository}/branches`, "--jq", ".[0].name"],
        { reject: false }
    );

    if (result.exitCode !== 0) {
        throw new Error(`Failed to get most recent branch: ${result.stderr}`);
    }

    return result.stdout.trim();
}

async function cloneReposiroty(repository: string, branch: string, targetDirectory: string): Promise<void> {
    const result = await loggingExeca(
        { info: () => {}, debug: () => {}, error: () => {}, warn: () => {} } as Logger,
        "git",
        ["clone", "--branch", branch, "--depth", "1", `https://github.com/${repository}.git`, targetDirectory],
        { reject: false }
    );

    if (result.exitCode !== 0) {
        throw new Error(`Failed to clone repository: ${result.stderr}`);
    }
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

function loadCustomConfig(generator: GeneratorNickname, fixture: TestFixture): Promise<unknown | undefined> {
    // TODO: Implement pulling custom config for fixtures from somewhere
    if (generator === "go-sdk") {
        return Promise.resolve({
            module: {
                path: "github.com/fern-api/test-remote-local-sdk"
            }
        });
    }
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

function getLatestGeneratorVersion(generator: GeneratorName): Promise<string> {
    // TODO: Implement getting the latest generator version from dockerhub
    const map = {
        "fernapi/fern-typescript-sdk": "3.29.2",
        "fernapi/fern-java-sdk": "3.16.0",
        "fernapi/fern-go-sdk": "1.15.1",
        "fernapi/fern-python-sdk": "4.36.2"
    };
    const version = map[generator];
    if (version == null) {
        throw new Error(`Generator ${generator} not found in map`);
    }
    return Promise.resolve(version);
}
