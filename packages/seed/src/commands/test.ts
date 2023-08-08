import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, cwd, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorGroup } from "@fern-api/generators-configuration";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { migrateIntermediateRepresentationThroughVersion } from "@fern-api/ir-migrations";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace, loadWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import { ParsedDockerName } from "../cli";

export const FIXTURE = {
    EXHAUSTIVE: "exhaustive",
    BASIC_AUTH: "basic-auth",
    CUSTOM_AUTH: "custom-auth",
    ERROR_PROPERTY: "error-property",
} as const;

export async function runTests({
    irVersion,
    language,
    fixture,
    docker,
    compileCmd,
    taskContext,
}: {
    irVersion: string | undefined;
    language: GenerationLanguage;
    fixture: string | undefined;
    docker: ParsedDockerName;
    compileCmd: string;
    taskContext: TaskContext;
}): Promise<void> {
    const testCases = fixture != null ? [fixture] : Object.values(FIXTURE);
    for (const testCase of testCases) {
        taskContext.logger.info(`Running tests for fixture ${testCase}`);
        const absolutePathToWorkspace = AbsoluteFilePath.of(path.join(__dirname, FERN_DIRECTORY, testCase));
        const workspace = await loadWorkspace({
            absolutePathToWorkspace,
            context: taskContext,
            cliVersion: "DUMMY",
        });
        if (!workspace.didSucceed) {
            taskContext.logger.error(`Failed to load workspace for fixture ${testCase}`);
            continue;
        }
        if (workspace.workspace.type === "openapi") {
            taskContext.logger.error(`Expected fixture ${testCase} to be a fern workspace. Found OpenAPI instead!`);
            continue;
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
        taskContext.logger.info(`Receinved compile command: ${compileCmd}`);
        await compileGeneratedCode({
            absolutePathToOutput,
            command: compileCmd,
            context: taskContext,
            testCase,
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
                    publishInfo: FernFiddle.GithubPublishInfo.pypi({
                        packageName: "exhaustive",
                        registryUrl: "pypi.buildwithfern.com",
                    }),
                }),
                absolutePathToLocalOutput: absolutePathToOutput,
                language,
            },
        ],
        docs: undefined,
    };
    taskContext.logger.info(`Generator group is ${JSON.stringify(generatorGroup.generators)}`);
    await runLocalGenerationForWorkspace({
        organization: DUMMY_ORGANIZATION,
        workspace,
        generatorGroup,
        keepDocker: true,
        context: taskContext,
        irVersionOverride: irVersion,
        outputModeForSeedConfig: FernGeneratorExec.OutputMode.github({
            version: "0.0.1",
            repoUrl: "https://github.com/fern-api/seed-cli",
        }),
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
        await executeCommand(commands[0], [], context, absolutePathToOutput);
        await executeCommand(commands[1], [], context, absolutePathToOutput);
    }
}

function executeCommand(
    command: string,
    args: string[],
    context: TaskContext,
    absolutePathToOutput: AbsoluteFilePath
): Promise<void> {
    const childProcess: ChildProcess = spawn(command, args, { shell: true, cwd: absolutePathToOutput });

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
