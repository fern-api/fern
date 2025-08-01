import tmp from "tmp-promise";

import { GeneratorGroup, GeneratorInvocation } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

import { Semaphore } from "../../Semaphore";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { DockerTestRunner, LocalTestRunner, TestRunner } from "../test/test-runner";
import { ScriptRunner, DockerScriptRunner, LocalScriptRunner } from "../test";

export async function runWithCustomFixture({
    pathToFixture,
    workspace,
    logLevel,
    skipScripts,
    outputPath,
    inspect,
    local,
    keepDocker
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: GeneratorWorkspace;
    logLevel: LogLevel;
    skipScripts: boolean;
    outputPath?: AbsoluteFilePath;
    inspect: boolean;
    local: boolean;
    keepDocker: boolean;
}): Promise<void> {
    const lock = new Semaphore(1);
    const absolutePathToOutput = outputPath ?? AbsoluteFilePath.of((await tmp.dir()).path);

    const taskContextFactory = new TaskContextFactory(logLevel);
    const customFixtureConfig = workspace.workspaceConfig.customFixtureConfig;

    const taskContext = taskContextFactory.create(
        `${workspace.workspaceName}:${"custom"} - ${customFixtureConfig?.outputFolder ?? ""}`
    );
    console.log(
        `Running custom fixture for ${workspace.workspaceName} with config:`,
        JSON.stringify(customFixtureConfig)
    );

    let testRunner: TestRunner;
    let scriptRunner: ScriptRunner;

    if (local) {
        if (workspace.workspaceConfig.test.local == null) {
            throw new Error(
                `Generator ${workspace.workspaceName} does not have a local test configuration. Please add a 'test.local' section to your seed.yml with 'buildCommand' and 'runCommand' properties.`
            );
        }
        console.log(
            `Using local runner for ${workspace.workspaceName} with config:`,
            workspace.workspaceConfig.test.local
        );

        scriptRunner = new LocalScriptRunner(workspace, skipScripts, taskContext);

        testRunner = new LocalTestRunner({
            generator: workspace,
            lock,
            taskContextFactory,
            skipScripts,
            scriptRunner,
            keepDocker,
            inspect
        });
    } else {
        scriptRunner = new DockerScriptRunner(workspace, skipScripts, taskContext);

        testRunner = new DockerTestRunner({
            generator: workspace,
            lock,
            taskContextFactory,
            skipScripts,
            keepDocker,
            scriptRunner,
            inspect
        });
    }

    try {
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
            imageAliases: workspace.workspaceConfig.imageAliases,
            absolutePathToOutput
        });
        if (generatorGroup == null) {
            taskContext.logger.error(`Found no generators configuration for the generator ${workspace.workspaceName}`);
            return;
        }

        await testRunner.build();

        await testRunner.run({
            fixture: "custom",
            configuration: customFixtureConfig,
            inspect,
            absolutePathToApiDefinition: pathToFixture,
            outputDir: absolutePathToOutput
        });

        taskContext.logger.info(`Wrote files to ${absolutePathToOutput}`);

        taskContext.logger.info(`Successfully ran custom fixture for ${workspace.workspaceName}`);
    } catch (error) {
        taskContext.logger.error(
            `Encountered error while running generator. ${
                error instanceof Error ? (error.stack ?? error.message) : error
            }`
        );
    } finally {
        if (!skipScripts) {
            await scriptRunner.stop();
        }
    }
}

function getGeneratorGroup({
    apiWorkspace,
    image,
    imageAliases,
    absolutePathToOutput
}: {
    apiWorkspace: AbstractAPIWorkspace<unknown>;
    image: string;
    imageAliases?: string[];
    absolutePathToOutput: AbsoluteFilePath;
}): { group: GeneratorGroup; invocation: GeneratorInvocation } | undefined {
    const groups = apiWorkspace.generatorsConfiguration?.groups;
    for (const group of groups ?? []) {
        for (const generator of group.generators) {
            if (generator.name === image || (imageAliases && imageAliases.includes(generator.name))) {
                const invocation: GeneratorInvocation = {
                    ...generator,
                    absolutePathToLocalOutput: absolutePathToOutput,
                    version: "latest"
                };
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
