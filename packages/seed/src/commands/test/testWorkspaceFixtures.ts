import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY, SNIPPET_JSON_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { OutputMode, ScriptConfig } from "@fern-fern/seed-config/api";
import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { ParsedDockerName } from "../../cli";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { readSnippets } from "../../readSnippets";
import { Semaphore } from "../../Semaphore";
import { SnippetTestBuilder } from "../../SnippetTestBuilder";
import { runDockerForWorkspace } from "./runDockerForWorkspace";
import { TaskContextFactory } from "./TaskContextFactory";


export const FIXTURES = readDirectories(path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY));

interface TestCase {
    directory: string;
    scriptPrelude: string;
    extraVolumes: string[];
    cleanup: () => Promise<void>;
}

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
                        scripts,
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
                    scripts,
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
    scripts: ScriptConfig[] | undefined;
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
    scripts: ScriptConfig[] | undefined;
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
        if (scripts == null || scripts.length === 0) {
            return { type: "success", fixture };
        }
        const testCases: TestCase[] = [
            {
                directory: `${outputDir}`,
                scriptPrelude: "cd /generated",
                extraVolumes: [],
                cleanup: async () => { /* no-op */ },
            },
        ];
        if (language != null) {
            const snippets = await readSnippets({
                logger: taskContext.logger,
                snippetsFilepath: path.join(outputDir, SNIPPET_JSON_FILENAME),
            });
            if (snippets != null) {
                const snippetTestBuilder = new SnippetTestBuilder(language);
                const snippetTestDirectories = await snippetTestBuilder.buildSnippetTests(snippets);
                for (const snippetTestDirectory of snippetTestDirectories) {
                        testCases.push(
                            {
                                directory: `${snippetTestDirectory.path}`,
                                scriptPrelude: "cp -r /snippets /generated && cd /generated",
                                extraVolumes: [`${snippetTestDirectory.path}:/snippets`],
                                cleanup: snippetTestDirectory.cleanup,
                            },
                        );
                }
            }
        }
        for (const testCase of testCases) {
            const extraVolumes = testCase.extraVolumes.flatMap((extraVolume) => ["-v", extraVolume]);
            for (const script of scripts) {
                const scriptFile = await tmp.file();
                await writeFile(scriptFile.path, [testCase.scriptPrelude, ...script.commands].join("\n"));
                taskContext.logger.info(`Running script ${scriptFile.path} on directory ${testCase.directory}`);
                const command = await loggingExeca(
                    taskContext.logger,
                    "docker",
                    [
                        "run",
                        "-v",
                        `${outputDir}:/generated`,
                        "-v",
                        `${scriptFile.path}:/test.sh`,
                        ...extraVolumes,
                        script.docker,
                        "/bin/sh",
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
            await testCase.cleanup();
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
