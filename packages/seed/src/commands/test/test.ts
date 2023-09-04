import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import { ParsedDockerName } from "../../cli";
import { Semaphore } from "../../Semaphore";
import { runDockerForWorkspace } from "./runDockerForWorkspace";
import { TaskContextFactory } from "./TaskContextFactory";

export const FIXTURES = {
    EXHAUSTIVE: "exhaustive",
    BASIC_AUTH: "basic-auth",
    CIRCULAR_REFERENCES: "circular-references",
    CUSTOM_AUTH: "custom-auth",
    ERROR_PROPERTY: "error-property",
    MULTI_URL_ENVIRONMENT: "multi-url-environment",
    NO_ENVIRONMENT: "no-environment",
    SINGLE_URL_ENVIRONMENT: "single-url-environment-default",
    SINGLE_URL_ENVIRONMENT_NO_DEFAULT: "single-url-environment-no-default",
    FILE_DOWNLOAD: "file-download",
    FILE_UPLOAD: "file-upload",
    TRACE: "trace",
    STREAMING: "streaming",
    PLAIN_TEXT: "plain-text",
    BYTES: "bytes",
} as const;

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

export async function runTests({
    irVersion,
    language,
    fixtures,
    docker,
    compileCommand,
    logLevel,
    outputDir,
    numDockers,
}: {
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixtures: string[];
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    logLevel: LogLevel;
    outputDir: string;
    numDockers: number;
}): Promise<void> {
    const lock = new Semaphore(numDockers);
    const taskContextFactory = new TaskContextFactory(logLevel);
    const testCases = [];
    for (const fixture of fixtures) {
        testCases.push(
            acquireLocksAndRunTest({
                lock,
                irVersion,
                language,
                fixture,
                docker,
                compileCommand,
                taskContext: taskContextFactory.create(fixture),
                outputDir,
            })
        );
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
    language,
    fixture,
    docker,
    compileCommand,
    taskContext,
    outputDir,
}: {
    lock: Semaphore;
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixture: string;
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    taskContext: TaskContext;
    outputDir: string;
}): Promise<TestResult> {
    taskContext.logger.debug("Acquiring lock...");
    await lock.acquire();
    taskContext.logger.info("Running test...");
    const result = await testWithWriteToDisk({
        fixture,
        irVersion,
        language,
        docker,
        compileCommand,
        taskContext,
        outputDir,
    });
    taskContext.logger.debug("Releasing lock...");
    lock.release();
    return result;
}

async function testWithWriteToDisk({
    fixture,
    irVersion,
    language,
    docker,
    compileCommand,
    taskContext,
    outputDir,
}: {
    fixture: string;
    irVersion: string | undefined;
    language: GenerationLanguage;
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    taskContext: TaskContext;
    outputDir: string;
}): Promise<TestResult> {
    try {
        const absolutePathToWorkspace = AbsoluteFilePath.of(
            path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY, fixture)
        );
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
            workspaceName: fixture,
        });
        if (!workspace.didSucceed) {
            taskContext.logger.info(`Failed to load workspace for fixture ${fixture}`);
            return {
                type: "failure",
                reason: Object.entries(workspace.failures)
                    .map(([file, reason]) => `${file}: ${reason.type}`)
                    .join("\n"),
                fixture,
            };
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error("Expected fern workspace. Found OpenAPI instead!");
            return {
                type: "failure",
                reason: "Expected fern workspace. Found OpenAPI instead!",
                fixture,
            };
        }
        const absolutePathToOutput = AbsoluteFilePath.of(resolve(cwd(), outputDir, fixture));
        await runDockerForWorkspace({
            absolutePathToOutput,
            docker,
            workspace: workspace.workspace,
            language,
            taskContext,
            irVersion,
        });
        if (compileCommand != null) {
            const commands = compileCommand.split("&&").map((command) => command.trim());
            for (const command of commands) {
                taskContext.logger.info(`Running command: ${command}`);
                const spaceDelimitedCommand = command.split(" ");
                const result = await loggingExeca(
                    taskContext.logger,
                    spaceDelimitedCommand[0] ?? command,
                    spaceDelimitedCommand.slice(1),
                    {
                        cwd: absolutePathToOutput,
                        doNotPipeOutput: true,
                    }
                );
                taskContext.logger.info(result.stdout);
                taskContext.logger.info(result.stderr);
            }
        }
        return { type: "success", fixture };
    } catch (err) {
        return {
            type: "failure",
            reason: (err as Error).message,
            fixture,
        };
    }
}
