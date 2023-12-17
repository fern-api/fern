import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { OutputMode, ScriptConfig } from "@fern-fern/seed-config/api";
import fs from "fs";
import { writeFile } from "fs/promises";
import { difference, isEqual } from "lodash-es";
import path from "path";
import tmp from "tmp-promise";
import { ParsedDockerName } from "../../cli";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { Semaphore } from "../../Semaphore";
import { runDockerForWorkspace } from "./runDockerForWorkspace";
import { TaskContextFactory } from "./TaskContextFactory";

export const FIXTURES = readDirectories(path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY));

type TestResult = TestSuccess | TestFailure;

interface TestSuccess {
    type: "success";
    id: string;
}

interface TestFailure {
    type: "failure";
    reason: string | undefined;
    id: string;
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
    numDockers
}: {
    workspace: SeedWorkspace;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    fixtures: string[];
    docker: ParsedDockerName;
    dockerCommand: string | undefined;
    scripts: ScriptConfig[] | undefined;
    logLevel: LogLevel;
    taskContextFactory: TaskContextFactory;
    numDockers: number;
}): Promise<void> {
    const lock = new Semaphore(numDockers);

    const testCases = [];
    const runningScripts: RunningScriptConfig[] = [];
    // Start running a docker container for each script instance
    for (const script of scripts ?? []) {
        // Start script runner
        const startSeedCommand = await loggingExeca(undefined, "docker", ["run", "-dit", script.docker, "/bin/bash"]);
        runningScripts.push({ ...script, containerId: startSeedCommand.stdout });
    }
    for (const fixture of fixtures) {
        const fixtureConfig = workspace.workspaceConfig.fixtures?.[fixture];
        const absolutePathToWorkspace = AbsoluteFilePath.of(
            path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY, fixture)
        );
        if (fixtureConfig != null) {
            for (const fixtureConfigInstance of fixtureConfig) {
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
                        outputFolder: fixtureConfigInstance.outputFolder
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
                    outputFolder: fixture
                })
            );
        }
    }
    const results = await Promise.all(testCases);
    const failedFixtures = results.filter((res) => res.type === "failure").map((res) => res.id);
    if (failedFixtures.length === 0) {
        CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed :white_check_mark:`);
    } else {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
        );
    }

    if (workspace.workspaceConfig.allowedFailures == null && failedFixtures.length > 0) {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}. None were supposed to fail.`
        );
        process.exit(1);
    } else if (isEqual(workspace.workspaceConfig.allowedFailures, failedFixtures)) {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}. All were expected.`
        );
    } else if (workspace.workspaceConfig.allowedFailures != null) {
        const unexpectedFixtures = difference(failedFixtures, workspace.workspaceConfig.allowedFailures);
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(
                ", "
            )}. Unexpted fixtures were .${unexpectedFixtures.join(", ")}`
        );
        process.exit(1);
    } else {
        CONSOLE_LOGGER.info("All tests passed!");
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
    outputFolder
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
        outputFolder
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
    outputFolder
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
}): Promise<TestResult> {
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
                reason: Object.entries(workspace.failures)
                    .map(([file, reason]) => `${file}: ${reason.type}`)
                    .join("\n"),
                id
            };
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error("Expected fern workspace. Found OpenAPI instead!");
            return {
                type: "failure",
                reason: "Expected fern workspace. Found OpenAPI instead!",
                id
            };
        }
        await runDockerForWorkspace({
            absolutePathToOutput: outputDir,
            docker,
            workspace: workspace.workspace,
            language,
            customConfig,
            taskContext,
            irVersion,
            outputVersion,
            outputMode,
            fixtureName: fixture
        });
        for (const script of scripts ?? []) {
            taskContext.logger.info(`Running script on ${fixture}`);
            const workDir = `${fixture}_${outputFolder}`;
            const scriptFile = await tmp.file();
            await writeFile(scriptFile.path, [`cd /${workDir}/generated`, ...script.commands].join("\n"));

            // Move scripts and generated files into the container
            const mkdirCommand = await loggingExeca(
                taskContext.logger,
                "docker",
                ["exec", script.containerId, "mkdir", `/${workDir}`],
                {
                    doNotPipeOutput: true
                }
            );
            if (mkdirCommand.failed) {
                taskContext.logger.error("Failed to mkdir for scripts. See ouptut below");
                taskContext.logger.error(mkdirCommand.stdout);
                taskContext.logger.error(mkdirCommand.stderr);
                return { type: "failure", reason: "Failed to run script...", id };
            }
            const copyScriptCommand = await loggingExeca(
                undefined,
                "docker",
                ["cp", scriptFile.path, `${script.containerId}:/${workDir}/test.sh`],
                {
                    doNotPipeOutput: true
                }
            );
            if (copyScriptCommand.failed) {
                taskContext.logger.error("Failed to copy script. See ouptut below");
                taskContext.logger.error(copyScriptCommand.stdout);
                taskContext.logger.error(copyScriptCommand.stderr);
                return { type: "failure", reason: "Failed to run script...", id };
            }
            const copyCommand = await loggingExeca(
                taskContext.logger,
                "docker",
                ["cp", `${outputDir}/.`, `${script.containerId}:/${workDir}/generated/`],
                {
                    doNotPipeOutput: true
                }
            );
            if (copyCommand.failed) {
                taskContext.logger.error("Failed to copy generated files. See ouptut below");
                taskContext.logger.error(copyCommand.stdout);
                taskContext.logger.error(copyCommand.stderr);
                return { type: "failure", reason: "Failed to run script...", id };
            }

            // Now actually run the test script
            const command = await loggingExeca(
                taskContext.logger,
                "docker",
                [
                    "exec",
                    script.containerId,
                    "/bin/bash",
                    "-c",
                    `chmod +x /${workDir}/test.sh`,
                    "&&",
                    `/${workDir}/test.sh`
                ],
                {
                    doNotPipeOutput: true
                }
            );
            if (command.failed) {
                taskContext.logger.error("Failed to run script. See ouptut below");
                taskContext.logger.error(command.stdout);
                taskContext.logger.error(command.stderr);
                return { type: "failure", reason: "Failed to run script...", id };
            }
        }
        return { type: "success", id };
    } catch (err) {
        return {
            type: "failure",
            reason: (err as Error).message,
            id
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
