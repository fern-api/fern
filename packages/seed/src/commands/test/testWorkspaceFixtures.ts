import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { GeneratorType, ScriptConfig } from "@fern-fern/seed-config/api";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
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
    BEARER_TOKEN_ENVIRONMENT_VARIABLE: "bearer-token-environment-variable",
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
    scripts,
    taskContextFactory,
    numDockers
}: {
    workspace: SeedWorkspace;
    generatorType: GeneratorType;
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
                        generatorType,
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
                    outputVersion: undefined,
                    generatorType,
                    language,
                    fixture,
                    docker,
                    scripts,
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
    outputVersion,
    language,
    fixture,
    docker,
    customConfig,
    scripts,
    taskContext,
    outputDir,
    absolutePathToWorkspace
}: {
    lock: Semaphore;
    generatorType: GeneratorType;
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
        generatorType,
        scripts,
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
    outputVersion,
    language,
    docker,
    customConfig,
    scripts,
    taskContext,
    outputDir,
    absolutePathToWorkspace
}: {
    fixture: string;
    irVersion: string | undefined;
    outputVersion: string | undefined;
    language: GenerationLanguage | undefined;
    docker: ParsedDockerName;
    generatorType: GeneratorType;
    customConfig: unknown;
    scripts: ScriptConfig[] | undefined;
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
            irVersion,
            outputVersion
        });
        for (const script of scripts ?? []) {
            const scriptFile = await tmp.file();
            await writeFile(scriptFile.path, ["cd generated", ...script.commands].join("\n"));
            taskContext.logger.info(`Running script ${scriptFile.path}`);
            const command = await loggingExeca(
                taskContext.logger,
                "docker",
                [
                    "run",
                    "-v",
                    `${outputDir}:/generated`,
                    "-v",
                    `${scriptFile.path}:/test.sh`,
                    script.docker,
                    "bash",
                    "test.sh"
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
