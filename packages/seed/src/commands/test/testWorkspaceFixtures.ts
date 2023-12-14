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
    fixture: string;
}

interface TestFailure {
    type: "failure";
    reason: string | undefined;
    fixture: string;
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
    const taskContext = taskContextFactory.create(
        `${workspace.workspaceName} script runner`
    );
    for (const script of scripts ?? []) {
        const scriptFile = await tmp.file();
        await writeFile(scriptFile.path, ["cd /generated", ...script.commands].join("\n"));

        // Start script runner
        const startSeedCommand = await loggingExeca(
            taskContext.logger,
            "docker",
            [
                "run",
                "-dit",
                script.docker,
            ]
        );
        if (startSeedCommand.failed) {
            taskContext.logger.error(`Could not run script docker, container ID: ${script.docker}`);
            taskContext.logger.error(startSeedCommand.stdout);
            taskContext.logger.error(startSeedCommand.stderr);
        }

        // Add scripts to container
        const copyCommand = await loggingExeca(
            taskContext.logger,
            "docker",
            [
                "cp",
                scriptFile.path,
                `${startSeedCommand.stdout}:/generated`
            ],
            {
                doNotPipeOutput: true
            }
        );
        if (copyCommand.failed) {
            taskContext.logger.error(`Could not copy script to docker, container ID: ${script.docker}`);
            taskContext.logger.error(copyCommand.stdout);
            taskContext.logger.error(copyCommand.stderr);
        }
        runningScripts.push({...script, containerId: startSeedCommand.stdout});
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
                        outputMode: fixtureConfigInstance.outputMode ?? workspace.workspaceConfig.defaultOutputMode
                    })
                );
            }
        } else {
            testCases.push(
                acquireLocksAndRunTest({
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
                    outputMode: workspace.workspaceConfig.defaultOutputMode
                })
            );
        }
    }
    const results = await Promise.all(testCases);
    const failedFixtures = results.filter((res) => res.type === "failure").map((res) => res.fixture);
    if (failedFixtures.length === 0) {
        CONSOLE_LOGGER.info(`${results.length}/${results.length} test cases passed :white_check_mark:`);
    } else {
        CONSOLE_LOGGER.info(
            `${failedFixtures.length}/${
                results.length
            } test cases failed. The failed fixtures include ${failedFixtures.join(", ")}.`
        );
    }
}

export async function acquireLocksAndRunTest({
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
    outputMode
}: {
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
}): Promise<TestResult> {
    taskContext.logger.debug("Acquiring lock...");
    await lock.acquire();
    taskContext.logger.info("Running test...");
    const result = await testWithWriteToDisk({
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
        outputMode
    });
    taskContext.logger.debug("Releasing lock...");
    lock.release();
    return result;
}

async function testWithWriteToDisk({
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
    outputMode
}: {
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
                fixture
            };
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error("Expected fern workspace. Found OpenAPI instead!");
            return {
                type: "failure",
                reason: "Expected fern workspace. Found OpenAPI instead!",
                fixture
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

            // Add generated files to run scripts over
            const copyCommand = await loggingExeca(
                taskContext.logger,
                "docker",
                [
                    "cp",
                    outputDir,
                    `${script.containerId}:/${fixture}/generated`
                ],
                {
                    doNotPipeOutput: true
                }
            );
            if (copyCommand.failed) {
                taskContext.logger.error("Failed to run copy of scripts. See ouptut below");
                taskContext.logger.error(copyCommand.stdout);
                taskContext.logger.error(copyCommand.stderr);
                return { type: "failure", reason: "Failed to run script...", fixture };
            }
            
            const command = await loggingExeca(
                taskContext.logger,
                "docker",
                [
                    "exec",
                    script.docker,
                    "/bin/sh",
                    `cd /${fixture}/generated`,
                    "&&",
                    "/test.sh"
                ],
                {
                    doNotPipeOutput: true
                }
            );
            if (command.failed) {
                taskContext.logger.error("Failed to run script. See ouptut below");
                taskContext.logger.error(command.stdout);
                taskContext.logger.error(command.stderr);
                return { type: "failure", reason: "Failed to run script...", fixture };
            }
        }
        return { type: "success", fixture };
    } catch (err) {
        return {
            type: "failure",
            reason: (err as Error).message,
            fixture
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
