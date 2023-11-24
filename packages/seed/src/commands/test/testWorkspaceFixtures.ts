import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { GeneratorType } from "@fern-fern/seed-config/api";
import path from "path";
import { ParsedDockerName } from "../../cli";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { Semaphore } from "../../Semaphore";
import { runDockerForWorkspace } from "./runDockerForWorkspace";
import { TaskContextFactory } from "./TaskContextFactory";

export const FIXTURES = {
    ALIAS: "alias",
    API_WIDE_BASE_PATH: "api-wide-base-path",
    AUDIENCES: "audiences",
    AUTH_ENVIRONMENT_VARIABLES: "auth-environment-variables",
    BASIC_AUTH: "basic-auth",
    BYTES: "bytes",
    CIRCULAR_REFERENCES: "circular-references",
    CUSTOM_AUTH: "custom-auth",
    ENUM: "enum",
    ERROR_PROPERTY: "error-property",
    EXAMPLES: "examples",
    EXHAUSTIVE: "exhaustive",
    EXTENDS: "extends",
    FOLDERS: "folders",
    FILE_DOWNLOAD: "file-download",
    FILE_UPLOAD: "file-upload",
    IMDB: "imdb",
    LITERAL: "literal",
    LITERAL_HEADERS: "literal-headers",
    MULTI_URL_ENVIRONMENT: "multi-url-environment",
    NO_ENVIRONMENT: "no-environment",
    OBJECT: "object",
    OBJECTS_WITH_IMPORTS: "objects-with-imports",
    PACKAGE_YML: "package-yml",
    PLAIN_TEXT: "plain-text",
    RESPONSE_PROPERTY: "response-property",
    SINGLE_URL_ENVIRONMENT: "single-url-environment-default",
    SINGLE_URL_ENVIRONMENT_NO_DEFAULT: "single-url-environment-no-default",
    STREAMING: "streaming",
    TRACE: "trace",
    UNDISCRIMINATED_UNIONS: "undiscriminated-unions",
    UNKNOWN: "unknown",
    VARIABLES: "variables",
    RESERVED_KEYWORDS: "reserved-keywords",
    IDEMPOTENCY_HEADERS: "idempotency-headers"
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

export async function testWorkspaceFixtures({
    generatorType,
    workspace,
    irVersion,
    language,
    fixtures,
    docker,
    dockerCommand,
    compileCommand,
    logLevel,
    numDockers
}: {
    workspace: SeedWorkspace;
    generatorType: GeneratorType;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    fixtures: string[];
    docker: ParsedDockerName;
    dockerCommand: string | undefined;
    compileCommand: string | undefined;
    logLevel: LogLevel;
    numDockers: number;
}): Promise<void> {
    const lock = new Semaphore(numDockers);
    const taskContextFactory = new TaskContextFactory(logLevel);

    if (dockerCommand != null) {
        const workspaceTaskContext = taskContextFactory.create(workspace.workspaceName);
        const spaceDelimitedCommand = dockerCommand.split(" ");
        await loggingExeca(
            workspaceTaskContext.logger,
            spaceDelimitedCommand[0] ?? dockerCommand,
            spaceDelimitedCommand.slice(1),
            {
                cwd: path.dirname(path.dirname(workspace.absolutePathToWorkspace)),
                doNotPipeOutput: false
            }
        );
    }

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
                        generatorType,
                        irVersion,
                        language,
                        fixture,
                        docker,
                        compileCommand,
                        customConfig: fixtureConfigInstance.customConfig,
                        taskContext: taskContextFactory.create(
                            `${workspace.workspaceName}:${fixture} - ${fixtureConfigInstance.outputFolder}`
                        ),
                        outputDir: join(
                            workspace.absolutePathToWorkspace,
                            RelativeFilePath.of(fixture),
                            RelativeFilePath.of(fixtureConfigInstance.outputFolder)
                        )
                    })
                );
            }
        } else {
            testCases.push(
                acquireLocksAndRunTest({
                    absolutePathToWorkspace,
                    lock,
                    irVersion,
                    generatorType,
                    language,
                    fixture,
                    docker,
                    compileCommand,
                    customConfig: undefined,
                    taskContext: taskContextFactory.create(`${workspace.workspaceName}:${fixture}`),
                    outputDir: join(workspace.absolutePathToWorkspace, RelativeFilePath.of(fixture))
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
    generatorType,
    irVersion,
    language,
    fixture,
    docker,
    customConfig,
    compileCommand,
    taskContext,
    outputDir,
    absolutePathToWorkspace
}: {
    lock: Semaphore;
    generatorType: GeneratorType;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    fixture: string;
    docker: ParsedDockerName;
    customConfig: unknown;
    compileCommand: string | undefined;
    taskContext: TaskContext;
    outputDir: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<TestResult> {
    taskContext.logger.debug("Acquiring lock...");
    await lock.acquire();
    taskContext.logger.info("Running test...");
    const result = await testWithWriteToDisk({
        fixture,
        irVersion,
        language,
        docker,
        customConfig,
        generatorType,
        compileCommand,
        taskContext,
        outputDir,
        absolutePathToWorkspace
    });
    taskContext.logger.debug("Releasing lock...");
    lock.release();
    return result;
}

async function testWithWriteToDisk({
    generatorType,
    fixture,
    irVersion,
    language,
    docker,
    customConfig,
    compileCommand,
    taskContext,
    outputDir,
    absolutePathToWorkspace
}: {
    fixture: string;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    docker: ParsedDockerName;
    generatorType: GeneratorType;
    customConfig: unknown;
    compileCommand: string | undefined;
    taskContext: TaskContext;
    outputDir: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
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
            generatorType,
            customConfig,
            taskContext,
            irVersion
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
                        cwd: outputDir,
                        doNotPipeOutput: true
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
            fixture
        };
    }
}
