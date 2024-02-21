import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { convertOpenApiWorkspaceToFernWorkspace, FernWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";
import fs from "fs";
import { writeFile } from "fs/promises";
import { difference } from "lodash-es";
import path from "path";
import tmp from "tmp-promise";
import { ParsedDockerName } from "../../cli";
import { OutputMode, ScriptConfig } from "../../config/api";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { Semaphore } from "../../Semaphore";
import { Stopwatch } from "../../Stopwatch";
import { printTestCases } from "./printTestCases";
import { runDockerForWorkspace } from "./runDockerForWorkspace";
import { TaskContextFactory } from "./TaskContextFactory";

export const FIXTURES = readDirectories(path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY));

export type TestResult = TestSuccess | TestFailure;

export interface TestSuccess {
    type: "success";
    id: string;
    metrics: TestCaseMetrics;
}

export interface TestFailure {
    type: "failure";
    cause: "invalid-fixture" | "generation" | "compile";
    message?: string;
    id: string;
    metrics: TestCaseMetrics;
}

export interface TestCaseMetrics {
    /** The time it takes to generate code via the generator */
    generationTime?: string;
    /** The time it takes to verify/compile the code */
    compileTime?: string;
}

interface RunningScriptConfig extends ScriptConfig {
    containerId: string;
}

export async function testWorkspaceFixtures({
    workspace,
    irVersion,
    language,
    fixtures,
    docker,
    scripts,
    taskContextFactory,
    numDockers,
    keepDocker,
    skipScripts,
    outputFolder
}: {
    workspace: SeedWorkspace;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    fixtures: string[];
    docker: ParsedDockerName;
    scripts: ScriptConfig[] | undefined;
    logLevel: LogLevel;
    taskContextFactory: TaskContextFactory;
    numDockers: number;
    keepDocker: boolean | undefined;
    skipScripts: boolean;
    outputFolder: string | undefined;
}): Promise<boolean> {
    const lock = new Semaphore(numDockers);

    const testCases = [];
    const runningScripts: RunningScriptConfig[] = [];

    const containerIdsToShutdown: string[] = [];
    try {
        if (!skipScripts) {
            // Start running a docker container for each script instance
            for (const script of scripts ?? []) {
                // Start script runner
                const startSeedCommand = await loggingExeca(undefined, "docker", [
                    "run",
                    "-dit",
                    script.docker,
                    "/bin/sh"
                ]);
                const containerId = startSeedCommand.stdout;
                containerIdsToShutdown.push(containerId);
                runningScripts.push({ ...script, containerId });
            }
        }

        for (const fixture of fixtures) {
            const fixtureConfig = workspace.workspaceConfig.fixtures?.[fixture];
            const absolutePathToWorkspace = AbsoluteFilePath.of(
                path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY, fixture)
            );
            if (fixtureConfig != null) {
                for (const fixtureConfigInstance of fixtureConfig) {
                    if (outputFolder != null && fixtureConfigInstance.outputFolder !== outputFolder) {
                        continue;
                    }
                    testCases.push(
                        acquireLocksAndRunTest({
                            id: `${fixture}:${fixtureConfigInstance.outputFolder}`,
                            absolutePathToWorkspace,
                            lock,
                            irVersion,
                            outputVersion: fixtureConfigInstance.outputVersion,
                            language,
                            fixture,
                            docker,
                            scripts: runningScripts,
                            customConfig: fixtureConfigInstance.customConfig,
                            taskContext: taskContextFactory.create(
                                `${workspace.workspaceName}:${fixture} - ${fixtureConfigInstance.outputFolder}`
                            ),
                            outputDir: join(
                                workspace.absolutePathToWorkspace,
                                RelativeFilePath.of(fixture),
                                RelativeFilePath.of(fixtureConfigInstance.outputFolder)
                            ),
                            outputMode: fixtureConfigInstance.outputMode ?? workspace.workspaceConfig.defaultOutputMode,
                            outputFolder: fixtureConfigInstance.outputFolder,
                            keepDocker,
                            skipScripts
                        })
                    );
                }
            } else {
                testCases.push(
                    acquireLocksAndRunTest({
                        id: `${fixture}`,
                        absolutePathToWorkspace,
                        lock,
                        irVersion,
                        outputVersion: undefined,
                        language,
                        fixture,
                        docker,
                        scripts: runningScripts,
                        customConfig: undefined,
                        taskContext: taskContextFactory.create(`${workspace.workspaceName}:${fixture}`),
                        outputDir: join(workspace.absolutePathToWorkspace, RelativeFilePath.of(fixture)),
                        outputMode: workspace.workspaceConfig.defaultOutputMode,
                        outputFolder: fixture,
                        keepDocker,
                        skipScripts
                    })
                );
            }
        }
        const results = await Promise.all(testCases);

        printTestCases(results);

        const failedFixtures = results.filter((res) => res.type === "failure").map((res) => res.id);
        const unexpectedFixtures = difference(failedFixtures, workspace.workspaceConfig.allowedFailures ?? []);

        if (failedFixtures.length === 0) {
            CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed :white_check_mark:`);
        } else {
            CONSOLE_LOGGER.info(
                `${failedFixtures.length}/${
                    results.length
                } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
            );
            if (unexpectedFixtures.length > 0) {
                CONSOLE_LOGGER.info(`Unexpected fixtures include ${unexpectedFixtures.join(", ")}.`);
                return false;
            } else {
                CONSOLE_LOGGER.info(`All failures were expected.`);
            }
        }
        return true;
    } finally {
        for (const containerId of containerIdsToShutdown) {
            await loggingExeca(undefined, "docker", ["stop", containerId]);
        }
    }
}

export async function acquireLocksAndRunTest({
    id,
    lock,
    irVersion,
    outputVersion,
    language,
    fixture,
    docker,
    customConfig,
    scripts,
    taskContext,
    outputDir,
    absolutePathToWorkspace,
    outputMode,
    outputFolder,
    keepDocker,
    skipScripts
}: {
    id: string;
    lock: Semaphore;
    irVersion: string | undefined;
    outputVersion: string | undefined;
    language: GenerationLanguage | undefined;
    fixture: string;
    docker: ParsedDockerName;
    customConfig: unknown;
    scripts: RunningScriptConfig[] | undefined;
    taskContext: TaskContext;
    outputDir: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
    outputMode: OutputMode;
    outputFolder: string;
    keepDocker: boolean | undefined;
    skipScripts: boolean;
}): Promise<TestResult> {
    taskContext.logger.debug("Acquiring lock...");
    await lock.acquire();
    taskContext.logger.info("Running test...");
    const result = await testWithWriteToDisk({
        id,
        fixture,
        irVersion,
        outputVersion,
        language,
        docker,
        customConfig,
        scripts,
        taskContext,
        outputDir,
        absolutePathToWorkspace,
        outputMode,
        outputFolder,
        keepDocker,
        skipScripts
    });
    taskContext.logger.debug("Releasing lock...");
    lock.release();
    return result;
}

async function testWithWriteToDisk({
    id,
    fixture,
    irVersion,
    outputVersion,
    language,
    docker,
    customConfig,
    scripts,
    taskContext,
    outputDir,
    absolutePathToWorkspace,
    outputMode,
    outputFolder,
    keepDocker,
    skipScripts
}: {
    id: string;
    fixture: string;
    irVersion: string | undefined;
    outputVersion: string | undefined;
    language: GenerationLanguage | undefined;
    docker: ParsedDockerName;
    customConfig: unknown;
    scripts: RunningScriptConfig[] | undefined;
    taskContext: TaskContext;
    outputDir: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
    outputMode: OutputMode;
    outputFolder: string;
    keepDocker: boolean | undefined;
    skipScripts: boolean;
}): Promise<TestResult> {
    const metrics: TestCaseMetrics = {};
    try {
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
            workspaceName: fixture
        });
        if (!workspace.didSucceed) {
            taskContext.logger.info(`Failed to load workspace for fixture ${fixture}`);
            return {
                type: "failure",
                cause: "invalid-fixture",
                message: Object.entries(workspace.failures)
                    .map(([file, reason]) => `${file}: ${reason.type}`)
                    .join("\n"),
                id,
                metrics
            };
        }
        const fernWorkspace: FernWorkspace =
            workspace.workspace.type === "fern"
                ? workspace.workspace
                : await convertOpenApiWorkspaceToFernWorkspace(workspace.workspace, taskContext);

        const generationStopwatch = new Stopwatch();
        generationStopwatch.start();
        await runDockerForWorkspace({
            absolutePathToOutput: outputDir,
            docker,
            workspace: fernWorkspace,
            language,
            customConfig,
            taskContext,
            irVersion,
            outputVersion,
            outputMode,
            fixtureName: fixture,
            keepDocker
        });
        generationStopwatch.stop();
        metrics.generationTime = generationStopwatch.duration();
        if (skipScripts) {
            return { type: "success", id, metrics };
        }
    } catch (err) {
        return {
            type: "failure",
            cause: "generation",
            message: (err as Error).message,
            id,
            metrics
        };
    }
    const scriptStopwatch = new Stopwatch();
    scriptStopwatch.start();
    try {
        for (const script of scripts ?? []) {
            taskContext.logger.info(`Running script ${script.commands[0] ?? ""} on ${fixture}`);

            const workDir = `${fixture}_${outputFolder}`;
            const scriptFile = await tmp.file();
            await writeFile(scriptFile.path, [`cd /${workDir}/generated`, ...script.commands].join("\n"));

            // Move scripts and generated files into the container
            const mkdirCommand = await loggingExeca(
                taskContext.logger,
                "docker",
                ["exec", script.containerId, "mkdir", `/${workDir}`],
                {
                    doNotPipeOutput: true,
                    reject: false
                }
            );
            if (mkdirCommand.failed) {
                taskContext.logger.error("Failed to mkdir for scripts. See ouptut below");
                taskContext.logger.error(mkdirCommand.stdout);
                taskContext.logger.error(mkdirCommand.stderr);
                return { type: "failure", cause: "compile", message: mkdirCommand.stdout, id, metrics };
            }
            const copyScriptCommand = await loggingExeca(
                undefined,
                "docker",
                ["cp", scriptFile.path, `${script.containerId}:/${workDir}/test.sh`],
                {
                    doNotPipeOutput: true,
                    reject: false
                }
            );
            if (copyScriptCommand.failed) {
                taskContext.logger.error("Failed to copy script. See ouptut below");
                taskContext.logger.error(copyScriptCommand.stdout);
                taskContext.logger.error(copyScriptCommand.stderr);
                return { type: "failure", cause: "compile", message: copyScriptCommand.stdout, id, metrics };
            }
            const copyCommand = await loggingExeca(
                taskContext.logger,
                "docker",
                ["cp", `${outputDir}/.`, `${script.containerId}:/${workDir}/generated/`],
                {
                    doNotPipeOutput: true,
                    reject: false
                }
            );
            if (copyCommand.failed) {
                taskContext.logger.error("Failed to copy generated files. See ouptut below");
                taskContext.logger.error(copyCommand.stdout);
                taskContext.logger.error(copyCommand.stderr);
                return { type: "failure", cause: "compile", message: copyCommand.stdout, id, metrics };
            }

            // Now actually run the test script
            const command = await loggingExeca(
                taskContext.logger,
                "docker",
                ["exec", script.containerId, "/bin/bash", "-c", `chmod +x /${workDir}/test.sh && /${workDir}/test.sh`],
                {
                    doNotPipeOutput: true,
                    reject: false
                }
            );
            scriptStopwatch.stop();
            metrics.compileTime = scriptStopwatch.duration();
            if (command.failed) {
                taskContext.logger.error("Failed to run script. See ouptut below");
                taskContext.logger.error(command.stdout);
                taskContext.logger.error(command.stderr);
                return { type: "failure", cause: "compile", message: command.stdout, id, metrics };
            }
        }
        return { type: "success", id, metrics };
    } catch (err) {
        scriptStopwatch.stop();
        metrics.compileTime = scriptStopwatch.duration();
        return {
            type: "failure",
            cause: "compile",
            message: (err as Error).message,
            id,
            metrics
        };
    }
}

function readDirectories(filepath: string): string[] {
    const files = fs.readdirSync(filepath);
    return files
        .map((file) => path.join(filepath, file))
        .filter((fullPath) => fs.statSync(fullPath).isDirectory())
        .map((fullPath) => path.basename(fullPath));
}
