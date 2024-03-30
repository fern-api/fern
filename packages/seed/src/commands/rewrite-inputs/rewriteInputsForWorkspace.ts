import { APIS_DIRECTORY, FERN_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getGeneratorConfig, getIntermediateRepresentation } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { writeFile } from "fs/promises";
import path from "path";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import {
    DUMMY_ORGANIZATION,
    INPUTS_DIRECTORY_NAME,
    INPUT_CONFIG_FILENAME,
    INPUT_IR_FILENAME
} from "../../utils/constants";
import { convertSeedWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace";
import { getGeneratorInvocation } from "../../utils/getGeneratorInvocation";
import { parseDockerOrThrow } from "../../utils/parseDockerOrThrow";
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
                const generatorInvocation = getGeneratorInvocation({
                    absolutePathToOutput,
                    docker: docker,
                    language: workspace.workspaceConfig.language,
                    customConfig: fixtureConfigInstance.customConfig,
                    publishConfig: fixtureConfigInstance.publishConfig,
                    outputMode: fixtureConfigInstance.outputMode ?? workspace.workspaceConfig.defaultOutputMode,
                    fixtureName: fixture,
                    irVersion: workspace.workspaceConfig.irVersion,
                    publishMetadata: fixtureConfigInstance.publishMetadata
                });
                const ir = await getIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: {
                        type: "all"
                    },
                    context: taskContext,
                    irVersionOverride: workspace.workspaceConfig.irVersion,
                    generatorInvocation
                });
                const config = getGeneratorConfig({
                    generatorInvocation,
                    customConfig: fixtureConfigInstance.customConfig,
                    workspaceName: workspace.workspaceName,
                    outputVersion: undefined,
                    organization: DUMMY_ORGANIZATION,
                    absolutePathToSnippet: undefined,
                    writeUnitTests: false
                }).config;
                await writeInputs({ absolutePathToOutput, ir, config, context: taskContext });
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
            const generatorInvocation = getGeneratorInvocation({
                absolutePathToOutput,
                docker: docker,
                language: workspace.workspaceConfig.language,
                customConfig: undefined,
                publishConfig: undefined,
                outputMode: workspace.workspaceConfig.defaultOutputMode,
                fixtureName: fixture,
                irVersion: workspace.workspaceConfig.irVersion,
                publishMetadata: undefined
            });
            const ir = await getIntermediateRepresentation({
                workspace: fernWorkspace,
                audiences: {
                    type: "all"
                },
                context: taskContext,
                irVersionOverride: workspace.workspaceConfig.irVersion,
                generatorInvocation
            });
            const config = getGeneratorConfig({
                generatorInvocation,
                customConfig: undefined,
                workspaceName: workspace.workspaceName,
                outputVersion: undefined,
                organization: DUMMY_ORGANIZATION,
                absolutePathToSnippet: undefined,
                writeUnitTests: false
            }).config;
            await writeInputs({ absolutePathToOutput, ir, config, context: taskContext });
        }
    }
}

async function writeInputs({
    absolutePathToOutput,
    ir,
    config,
    context
}: {
    absolutePathToOutput: AbsoluteFilePath;
    ir: unknown;
    config: FernGeneratorExec.GeneratorConfig;
    context: TaskContext;
}) {
    const absolutePathToInputsDirectory = AbsoluteFilePath.of(
        join(absolutePathToOutput, RelativeFilePath.of(INPUTS_DIRECTORY_NAME))
    );
    await writeFile(
        JSON.stringify(ir, undefined, 4),
        join(absolutePathToInputsDirectory, RelativeFilePath.of(INPUT_IR_FILENAME))
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
        JSON.stringify(locallyCompatibleConfig, undefined, 4),
        join(absolutePathToInputsDirectory, RelativeFilePath.of(INPUT_CONFIG_FILENAME))
    );

    context.logger.info(`Wrote inputs to ${absolutePathToInputsDirectory}`);
}
