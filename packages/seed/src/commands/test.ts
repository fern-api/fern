import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorGroup } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, loadWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { GithubPublishInfo } from "@fern-fern/fiddle-sdk/types/api";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import { ParsedDockerName } from "../cli";

export const FIXTURE = {
    EXHAUSTIVE: "exhaustive",
    BASIC_AUTH: "basic-auth",
    CUSTOM_AUTH: "custom-auth",
    ERROR_PROPERTY: "error-property",
    MULTI_URL_ENVIRONMENT: "multi-url-environment",
    NO_ENVIRONMENT: "no-environment",
    SINGLE_URL_ENVIRONMENT: "single-url-environment-default",
    SINGLE_URL_ENVIRONMENT_NO_DEFAULT: "single-url-environment-no-default"
} as const;

export const MAX_NUM_DOCKERS_RUNNING = 4;

function createSemaphore(initialCount: number): {
    acquire: () => Promise<void>,
    release: () => void
} {
    let count = initialCount;
    const waiting: (() => void)[] = [];

    async function acquire(): Promise<void> {
        if (count > 0) {
        count--;
        } else {
        await new Promise<void>(resolve => waiting.push(resolve));
        }
    }

    function release(): void {
        count++;
        const next = waiting.shift();
        if (next) {
        next();
        }
    }
    
    return {
        acquire,
        release
    };
}
  
export async function handleConcurrentTesting({
    irVersion,
    language,
    fixture,
    docker,
    compileCmd,
    taskContext,
    update 
} : {
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixture: string | undefined;
    docker: ParsedDockerName;
    compileCmd: string;
    taskContext: TaskContext;
    update: boolean
}) : Promise<void> {
    const semaphore = createSemaphore(MAX_NUM_DOCKERS_RUNNING); // Adjust the initial count as needed
    const testCases: string[] = fixture != null ? [fixture] : Object.values(FIXTURE);
    const tasks = [];
    for (let i = 0; i < testCases.length; i++) {
        tasks.push(runTest({
            semaphore,
            irVersion,
            language,
            testCases,
            testCaseInd : i,
            docker,
            compileCmd,
            taskContext,
            update,
        }));
    }

    await Promise.all(tasks);
    taskContext.logger.info("All tasks completed");
}
  
export async function runTest({
    semaphore,
    irVersion,
    language,
    testCases,
    testCaseInd,
    docker,
    compileCmd,
    taskContext,
    update,
}: {
    semaphore: ReturnType<typeof createSemaphore>
    irVersion: string | undefined;
    language: GenerationLanguage;
    testCases: string[];
    testCaseInd: number;
    docker: ParsedDockerName;
    compileCmd: string;
    taskContext: TaskContext;
    update: boolean;
}): Promise<void>
{
    await semaphore.acquire();
    const testCase = testCases[testCaseInd];
    if(testCase !== undefined) 
    {
        if(update) 
        {
            await testWithWriteToDisk({
                testCase,
                irVersion,
                language,
                docker,
                compileCmd,
                taskContext
            });
        }
        else
        {
            await testSnapshotDiffsInCI({
                testCase, 
                irVersion,
                language,
                docker,
                compileCmd,
                taskContext
            });
        }
    }
    semaphore.release();
}

const ALL_AUDIENCES: Audiences = { type: "all" };

async function testWithWriteToDisk({
    testCase,
    irVersion,
    language,
    docker,
    compileCmd,
    taskContext
} : {
    testCase: string;
    irVersion: string | undefined;
    language: GenerationLanguage;
    docker: ParsedDockerName;
    compileCmd: string;
    taskContext: TaskContext;
}) : Promise<void>
{
    taskContext.logger.info(`Running tests for fixture ${testCase}`);
        const absolutePathToWorkspace = AbsoluteFilePath.of(path.join(__dirname, FERN_DIRECTORY, testCase));
        const workspace = await loadWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
        });
        if (!workspace.didSucceed) {
            taskContext.logger.error(`Failed to load workspace for fixture ${testCase}`);
            return;
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error(`Expected fixture ${testCase} to be a fern workspace. Found OpenAPI instead!`);
            return;
        }
        const ir = await getIntermediateRepresentation({
            fernWorkspace: workspace.workspace,
            taskContext,
            generationLanguage: language,
            irVersion,
        });
        taskContext.logger.info(`Generated IR for fixture ${testCase} ${typeof ir}`);
        const absolutePathToOutput = AbsoluteFilePath.of(resolve(cwd(), "seed", testCase));
        await runDockerForWorkspace({
            absolutePathToOutput,
            docker,
            workspace: workspace.workspace,
            language,
            taskContext,
            irVersion,
        });
        taskContext.logger.info(`Received compile command: ${compileCmd}`);
        await compileGeneratedCode({
            absolutePathToOutput,
            command: compileCmd,
            context: taskContext,
            testCase,
        });
}

async function testSnapshotDiffsInCI({
    testCase,
    irVersion,
    language,
    docker,
    compileCmd,
    taskContext
} : {
    testCase: string;
    irVersion: string | undefined;
    language: GenerationLanguage;
    docker: ParsedDockerName;
    compileCmd: string;
    taskContext: TaskContext;
}) : Promise<void>
{
    taskContext.logger.info(`Running tests for fixture ${testCase}`);
        const absolutePathToWorkspace = AbsoluteFilePath.of(path.join(__dirname, FERN_DIRECTORY, testCase));
        //absolutePathToWorkspace - functions within the npm package to reference the fern definitions
        const workspace = await loadWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
        });
        if (!workspace.didSucceed) {
            taskContext.logger.error(`Failed to load workspace for fixture ${testCase}`);
            return;
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error(`Expected fixture ${testCase} to be a fern workspace. Found OpenAPI instead!`);
            return;
        }
        const ir = await getIntermediateRepresentation({
            fernWorkspace: workspace.workspace,
            taskContext,
            generationLanguage: language,
            irVersion,
        });
        taskContext.logger.info(`Generated IR for fixture ${testCase} ${typeof ir}`);
        const absolutePathToOutput = AbsoluteFilePath.of(resolve(cwd(), "seed", testCase));
        //absolutePathToOutput - functions within the consuming folder to create a place where generated code is stored
        await runDockerForWorkspace({
            absolutePathToOutput,
            docker,
            workspace: workspace.workspace,
            language,
            taskContext,
            irVersion,
        });
        taskContext.logger.info(`Received compile command: ${compileCmd}`);
        await compileGeneratedCode({
            absolutePathToOutput,
            command: compileCmd,
            context: taskContext,
            testCase,
        });
}

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

const DUMMY_ORGANIZATION = "seed";

async function runDockerForWorkspace({
    absolutePathToOutput,
    docker,
    language,
    workspace,
    taskContext,
    irVersion,
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: GenerationLanguage;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    irVersion?: string;
}): Promise<void> {
    const publishInfo = getPublishInfo(language);

    const generatorGroup: GeneratorGroup = {
        groupName: "DUMMY",
        audiences: ALL_AUDIENCES,
        generators: [
            {
                name: docker.name,
                version: docker.version,
                config: undefined,
                outputMode: FernFiddle.remoteGen.OutputMode.github({
                    repo: `seed-${language}`,
                    owner: "fern-api",
                    publishInfo,
                }),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
            },
        ],
        docs: undefined,
    };
    await runLocalGenerationForSeed({
        organization: DUMMY_ORGANIZATION,
        workspace,
        generatorGroup,
        keepDocker: true,
        context: taskContext,
        irVersionOverride: irVersion,
    });
}

async function compileGeneratedCode({
    absolutePathToOutput,
    command,
    context,
    testCase,
}: {
    absolutePathToOutput: AbsoluteFilePath;
    command: string;
    context: TaskContext;
    testCase: string;
}): Promise<void> {
    context.logger.info("CWD", absolutePathToOutput);
    context.logger.info("fixture", testCase);
    context.logger.info(command);

    const commands = command.split("&& ");
    if (commands[0] != null && commands[1] != null) {
        await executeCommand({ 
            command: commands[0], 
            args: [], 
            context, 
            cwd: absolutePathToOutput
        });
        await executeCommand({ 
            command: commands[1], 
            args: [], 
            context, 
            cwd: absolutePathToOutput
        });
    }
}

async function executeCommand({
    command,
    args,
    context,
    cwd
} : 
{
    command: string,
    args: string[],
    context: TaskContext,
    cwd?: AbsoluteFilePath
}): Promise<void> {
    const childProcess: ChildProcess = spawn(command, args, { shell: true, cwd });

    return new Promise((resolve, reject) => {
        childProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command '${command}' exited with code ${code}`));
            }
        });
        childProcess.stdout?.on("data", (data) => {
            context.logger.info(`Output for '${command}':\n${data}`);
        });
    });
}

function getPublishInfo(language: string): GithubPublishInfo | undefined {
    switch (language) {
        case "java":
            return FernFiddle.GithubPublishInfo.maven({
                coordinate: "",
                registryUrl: "",
            });

        case "python":
            return FernFiddle.GithubPublishInfo.pypi({
                packageName: "",
                registryUrl: "",
            });
        case "typescript":
            return FernFiddle.GithubPublishInfo.npm({
                packageName: "",
                registryUrl: "",
            });
        default:
            return undefined;
    }
}
