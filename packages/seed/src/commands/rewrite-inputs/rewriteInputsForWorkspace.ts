import { APIS_DIRECTORY, FERN_DIRECTORY, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getGeneratorConfig, getIntermediateRepresentation } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { OutputMode } from "../../config/api";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import {
    DUMMY_ORGANIZATION,
    INPUTS_DIRECTORY_NAME,
    INPUT_CONFIG_FILENAME,
    INPUT_IR_FILENAME
} from "../../utils/constants";
import { convertSeedWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace";
import { getGeneratorInvocation } from "../../utils/getGeneratorInvocation";
import { ParsedDockerName, parseDockerOrThrow } from "../../utils/parseDockerOrThrow";
import { TaskContextFactory } from "../test/TaskContextFactory";

export async function rewriteInputsForWorkspace({
    workspace,
    fixtures,
    taskContextFactory
}: {
    workspace: SeedWorkspace;
    fixtures: string[];
    taskContextFactory: TaskContextFactory;
}): Promise<void> {
    for (const fixture of fixtures) {
        const fixtureConfig = workspace.workspaceConfig.fixtures?.[fixture];
        const docker = parseDockerOrThrow(workspace.workspaceConfig.docker);
        const absolutePathToFernDefinition = AbsoluteFilePath.of(
            path.join(__dirname, FERN_DIRECTORY, APIS_DIRECTORY, fixture)
        );
        const absolutePathToOutput = join(workspace.absolutePathToWorkspace, RelativeFilePath.of(fixture));
        if (fixtureConfig != null) {
            for (const fixtureConfigInstance of fixtureConfig) {
                const taskContext = taskContextFactory.create(
                    `${workspace.workspaceName}:${fixture} - ${fixtureConfigInstance.outputFolder}`
                );
                const fernWorkspace = await convertSeedWorkspaceToFernWorkspace({
                    absolutePathToWorkspace: absolutePathToFernDefinition,
                    taskContext,
                    fixture
                });
                if (fernWorkspace == null) {
                    taskContext.logger.error("Failed to load workspace.");
                    return;
                }
                writeInputs({
                    absolutePathToOutput: join(
                        absolutePathToOutput,
                        RelativeFilePath.of(fixtureConfigInstance.outputFolder)
                    ),
                    fernWorkspace,
                    taskContext,
                    docker,
                    language: workspace.workspaceConfig.language,
                    customConfig: fixtureConfigInstance.customConfig,
                    publishConfig: fixtureConfigInstance.publishConfig,
                    outputMode: fixtureConfigInstance.outputMode ?? workspace.workspaceConfig.defaultOutputMode,
                    fixtureName: fixture,
                    irVersion: workspace.workspaceConfig.irVersion,
                    publishMetadata: fixtureConfigInstance.publishMetadata,
                    workspaceName: fernWorkspace.name,
                    context: taskContext
                });
            }
        } else {
            const taskContext = taskContextFactory.create(`${workspace.workspaceName}:${fixture}`);
            const fernWorkspace = await convertSeedWorkspaceToFernWorkspace({
                absolutePathToWorkspace: absolutePathToFernDefinition,
                taskContext,
                fixture
            });
            if (fernWorkspace == null) {
                taskContext.logger.error("Failed to load workspace.");
                return;
            }
            writeInputs({
                absolutePathToOutput,
                fernWorkspace,
                taskContext,
                docker,
                language: workspace.workspaceConfig.language,
                customConfig: undefined,
                publishConfig: undefined,
                outputMode: workspace.workspaceConfig.defaultOutputMode,
                fixtureName: fixture,
                irVersion: workspace.workspaceConfig.irVersion,
                publishMetadata: undefined,
                workspaceName: fernWorkspace.name,
                context: taskContext
            });
        }
    }
}

export async function writeInputs({
    absolutePathToOutput,
    fernWorkspace,
    taskContext,
    docker,
    language,
    customConfig,
    publishConfig,
    outputMode,
    fixtureName,
    irVersion,
    publishMetadata,
    workspaceName,
    context
}: {
    absolutePathToOutput: AbsoluteFilePath;
    fernWorkspace: FernWorkspace;
    taskContext: TaskContext;
    docker: ParsedDockerName;
    language: generatorsYml.GenerationLanguage | undefined;
    customConfig: unknown;
    publishConfig: unknown;
    outputMode: OutputMode;
    fixtureName: string;
    irVersion: string;
    publishMetadata: unknown;
    workspaceName: string;
    context: TaskContext;
}): Promise<void> {
    const generatorInvocation = getGeneratorInvocation({
        absolutePathToOutput,
        docker,
        language,
        customConfig,
        publishConfig,
        outputMode: outputMode,
        fixtureName,
        irVersion,
        publishMetadata
    });
    const ir = await getIntermediateRepresentation({
        workspace: fernWorkspace,
        audiences: {
            type: "all"
        },
        context: taskContext,
        irVersionOverride: irVersion,
        generatorInvocation
    });
    const config = getGeneratorConfig({
        generatorInvocation,
        customConfig,
        workspaceName,
        outputVersion: undefined,
        organization: DUMMY_ORGANIZATION,
        absolutePathToSnippet: undefined,
        writeUnitTests: true
    }).config;
    const absolutePathToInputsDirectory = AbsoluteFilePath.of(
        join(absolutePathToOutput, RelativeFilePath.of(INPUTS_DIRECTORY_NAME))
    );
    await mkdir(absolutePathToInputsDirectory, { recursive: true });

    await writeFile(
        join(absolutePathToInputsDirectory, RelativeFilePath.of(INPUT_IR_FILENAME)),
        JSON.stringify(ir, undefined, 4)
    );
    // Update filepaths in config.json so that they
    // are compatible with the local filesystem
    const locallyCompatibleConfig: FernGeneratorExec.GeneratorConfig = {
        ...config,
        irFilepath: "./ir.json",
        output: {
            ...config.output,
            path: "../"
        }
    };
    await writeFile(
        join(absolutePathToInputsDirectory, RelativeFilePath.of(INPUT_CONFIG_FILENAME)),
        JSON.stringify(locallyCompatibleConfig, undefined, 4)
    );

    context.logger.info(`Wrote inputs to ${absolutePathToInputsDirectory}`);
}
