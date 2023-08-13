import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, loadWorkspace } from "@fern-api/workspace-loader";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import { ParsedDockerName } from "../../cli";
import { Semaphore } from "../../Semaphore";
import { TaskContextFactory } from "./getTaskContextForTest";
import { runDockerForWorkspace } from "./runDockerForWorkspace";

export const FIXTURES = {
    EXHAUSTIVE: "exhaustive",
    BASIC_AUTH: "basic-auth",
    CUSTOM_AUTH: "custom-auth",
    ERROR_PROPERTY: "error-property",
    MULTI_URL_ENVIRONMENT: "multi-url-environment",
    NO_ENVIRONMENT: "no-environment",
    SINGLE_URL_ENVIRONMENT: "single-url-environment-default",
    // SINGLE_URL_ENVIRONMENT_NO_DEFAULT: "single-url-environment-no-default",
} as const;

export const MAX_NUM_DOCKERS_RUNNING = 3;

export async function runTests({
    irVersion,
    language,
    fixtures,
    docker,
    compileCommand,
}: {
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixtures: string[];
    docker: ParsedDockerName;
    compileCommand: string | undefined;
}): Promise<void> {
    const semaphore = new Semaphore(MAX_NUM_DOCKERS_RUNNING);
    const taskContextFactory = new TaskContextFactory();
    const testCases = [];
    for (const fixture of fixtures) {
        testCases.push(
            runTest({
                semaphore,
                irVersion,
                language,
                fixture,
                docker,
                compileCommand,
                taskContext: taskContextFactory.create(fixture),
            })
        );
    }
    await Promise.all(testCases);
    CONSOLE_LOGGER.info("All testcases completed");
}

export async function runTest({
    semaphore,
    irVersion,
    language,
    fixture,
    docker,
    compileCommand,
    taskContext,
}: {
    semaphore: Semaphore;
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixture: string;
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    taskContext: TaskContext;
}): Promise<void> {
    taskContext.logger.info("Acquiring lock...");
    await semaphore.acquire();
    taskContext.logger.info("Running test...");
    await testWithWriteToDisk({
        fixture,
        irVersion,
        language,
        docker,
        compileCommand,
        taskContext,
    });
    taskContext.logger.info("Releasing lock...");
    semaphore.release();
}

async function testWithWriteToDisk({
    fixture,
    irVersion,
    language,
    docker,
    compileCommand,
    taskContext,
}: {
    fixture: string;
    irVersion: string | undefined;
    language: GenerationLanguage;
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    taskContext: TaskContext;
}): Promise<void> {
    const absolutePathToWorkspace = AbsoluteFilePath.of(path.join(__dirname, FERN_DIRECTORY, fixture));
    const workspace = await loadWorkspace({
        absolutePathToWorkspace,
        context: taskContext,
        cliVersion: "DUMMY",
    });
    if (!workspace.didSucceed) {
        taskContext.logger.error(`Failed to load workspace for fixture ${fixture}`);
        return;
    }
    if (workspace.workspace.type === "openapi") {
        taskContext.logger.error(`Expected fixture ${fixture} to be a fern workspace. Found OpenAPI instead!`);
        return;
    }
    const ir = await getIntermediateRepresentation({
        fernWorkspace: workspace.workspace,
        taskContext,
        generationLanguage: language,
        irVersion,
    });
    taskContext.logger.info(`Generated IR for fixture ${fixture} ${typeof ir}`);
    const absolutePathToOutput = AbsoluteFilePath.of(resolve(cwd(), "seed", fixture));
    await runDockerForWorkspace({
        absolutePathToOutput,
        docker,
        workspace: workspace.workspace,
        language,
        taskContext,
        irVersion,
    });
    taskContext.logger.info(`Received compile command: ${compileCommand}`);
    if (compileCommand != null) {
        await compileGeneratedCode({
            absolutePathToOutput,
            command: compileCommand,
            context: taskContext,
            fixture,
        });
    }
}

const ALL_AUDIENCES: Audiences = { type: "all" };

async function getIntermediateRepresentation({
    fernWorkspace,
    generationLanguage,
    irVersion,
    taskContext,
}: {
    fernWorkspace: FernWorkspace;
    generationLanguage: GenerationLanguage;
    irVersion: string | undefined;
    taskContext: TaskContext;
}): Promise<unknown> {
    const ir = await generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage,
        audiences: ALL_AUDIENCES,
    });
    if (irVersion != null) {
        return await migrateIntermediateRepresentationThroughVersion({
            intermediateRepresentation: ir,
            context: taskContext,
            version: irVersion,
        });
    }
    return ir;
}

async function compileGeneratedCode({
    absolutePathToOutput,
    command,
    context,
    fixture,
}: {
    absolutePathToOutput: AbsoluteFilePath;
    command: string;
    context: TaskContext;
    fixture: string;
}): Promise<void> {
    const commands = command.split("&&");
    commands.forEach(async (command) => {
        await executeCommand({
            command,
            args: [],
            context,
            cwd: absolutePathToOutput,
            fixture,
        });
    });
}

async function executeCommand({
    command,
    args,
    context,
    cwd,
    fixture,
}: {
    command: string;
    args: string[];
    context: TaskContext;
    fixture: string;
    cwd?: AbsoluteFilePath;
}): Promise<void> {
    const childProcess: ChildProcess = spawn(command, args, { shell: true, cwd });
    return new Promise((resolve, reject) => {
        childProcess.on("close", async (code) => {
            if (code === 0) {
                context.logger.info(`'${command}' finished in fixture ${fixture}`);
                resolve();
            } else {
                reject(new Error(`Command '${command}' exited with code ${code} in fixture ${fixture}`));
            }
        });
    });
}
