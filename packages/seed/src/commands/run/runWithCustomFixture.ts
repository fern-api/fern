import tmp from "tmp-promise";

import { DEFINITION_DIRECTORY, GeneratorGroup, GeneratorInvocation } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import {
    AbstractAPIWorkspace,
    FernWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

import { Semaphore } from "../../Semaphore";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace";
import { workspaceShouldGenerateDynamicSnippetTests } from "../../workspaceShouldGenerateDynamicSnippetTests";
import { ScriptRunner } from "../test/ScriptRunner";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { DockerTestRunner } from "../test/test-runner";
import { writeDotMock } from "../test/test-runner/TestRunner";

export async function runWithCustomFixture({
    pathToFixture,
    workspace,
    logLevel,
    audience
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: GeneratorWorkspace;
    logLevel: LogLevel;
    audience: string | undefined;
}): Promise<void> {
    const lock = new Semaphore(1);
    const outputDir = await tmp.dir();
    const absolutePathToOutput = AbsoluteFilePath.of(outputDir.path);
    const taskContextFactory = new TaskContextFactory(logLevel);
    const customFixtureConfig = workspace.workspaceConfig.customFixtureConfig;

    const taskContext = taskContextFactory.create(
        `${workspace.workspaceName}:${"custom"} - ${customFixtureConfig?.outputFolder ?? ""}`
    );

    const dockerGeneratorRunner = new DockerTestRunner({
        generator: workspace,
        lock,
        taskContextFactory,
        skipScripts: true,
        keepDocker: true,
        scriptRunner: new ScriptRunner(workspace, false, taskContext)
    });

    const apiWorkspace = await convertGeneratorWorkspaceToFernWorkspace({
        absolutePathToAPIDefinition: pathToFixture,
        taskContext,
        fixture: "custom"
    });
    if (apiWorkspace == null) {
        taskContext.logger.error("Failed to load API definition.");
        return;
    }

    const generatorGroup = getGeneratorGroup({
        apiWorkspace,
        image: workspace.workspaceConfig.image,
        absolutePathToOutput
    });
    if (generatorGroup == null) {
        taskContext.logger.error(`Found no generators configuration for the generator ${workspace.workspaceName}`);
        return;
    }

    try {
        const fernWorkspace: FernWorkspace = await apiWorkspace.toFernWorkspace(
            { context: taskContext },
            getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorGroup.invocation)
        );

        await dockerGeneratorRunner.build();
        await dockerGeneratorRunner.runGeneratorFromGroup({
            fernWorkspace,
            absolutePathToFernDefinition: join(pathToFixture, RelativeFilePath.of(DEFINITION_DIRECTORY)),
            taskContext,
            irVersion: workspace.workspaceConfig.irVersion,
            group: generatorGroup.group,
            shouldGenerateDynamicSnippetTests: workspaceShouldGenerateDynamicSnippetTests(workspace)
        });
        await writeDotMock({
            absolutePathToDotMockDirectory: absolutePathToOutput,
            absolutePathToFernDefinition: pathToFixture
        });
        taskContext.logger.info(`Wrote files to ${absolutePathToOutput}`);
    } catch (error) {
        taskContext.logger.error(`Encountered error while running generator. ${(error as Error)?.message}`);
    }
}

function getGeneratorGroup({
    apiWorkspace,
    image,
    absolutePathToOutput
}: {
    apiWorkspace: AbstractAPIWorkspace<unknown>;
    image: string;
    absolutePathToOutput: AbsoluteFilePath;
}): { group: GeneratorGroup; invocation: GeneratorInvocation } | undefined {
    const groups = apiWorkspace.generatorsConfiguration?.groups;
    for (const group of groups ?? []) {
        for (const generator of group.generators) {
            if (generator.name === image) {
                const invocation = { ...generator, absolutePathToLocalOutput: absolutePathToOutput, version: "latest" };
                return {
                    group: {
                        ...group,
                        generators: [invocation]
                    },
                    invocation
                };
            }
        }
    }
    return undefined;
}
