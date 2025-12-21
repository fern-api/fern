import { GeneratorGroup, GeneratorInvocation } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import tmp from "tmp-promise";
import { FixtureConfigurations } from "../../config/api";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { Semaphore } from "../../Semaphore";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace";
import { LocalScriptRunner, ScriptRunner } from "../test";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { ContainerTestRunner, LocalTestRunner, TestRunner } from "../test/test-runner";

export async function runWithCustomFixture({
    pathToFixture,
    workspace,
    logLevel,
    skipScripts,
    outputPath,
    inspect,
    local,
    keepContainer
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: GeneratorWorkspace;
    logLevel: LogLevel;
    skipScripts: boolean;
    outputPath?: AbsoluteFilePath;
    inspect: boolean;
    local: boolean;
    keepContainer: boolean;
}): Promise<void> {
    const lock = new Semaphore(1);
    const absolutePathToOutput = outputPath ?? AbsoluteFilePath.of((await tmp.dir()).path);

    const taskContextFactory = new TaskContextFactory(logLevel);
    const customFixtureConfig = workspace.workspaceConfig.customFixtureConfig;

    const taskContext = taskContextFactory.create(
        `${workspace.workspaceName}:${"custom"} - ${customFixtureConfig?.outputFolder ?? ""}`
    );

    let testRunner: TestRunner;
    let scriptRunner: ScriptRunner | undefined = undefined;

    if (!skipScripts) {
        scriptRunner = new LocalScriptRunner(workspace, skipScripts, taskContext, logLevel);
    }

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

        testRunner = new LocalTestRunner({
            generator: workspace,
            lock,
            taskContextFactory,
            skipScripts,
            scriptRunner,
            keepContainer,
            inspect
        });
    } else {
        testRunner = new ContainerTestRunner({
            generator: workspace,
            lock,
            taskContextFactory,
            skipScripts,
            keepContainer,
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

        const runFixtureConfig: FixtureConfigurations = {
            ...customFixtureConfig,
            customConfig: {
                ...(customFixtureConfig?.customConfig as Record<string, unknown>),
                ...(generatorGroup.invocation.config as Record<string, unknown>)
            },
            readmeConfig: apiWorkspace.generatorsConfiguration?.rawConfiguration.readme,
            outputFolder: ""
        };
        console.log(
            `Running custom fixture for ${workspace.workspaceName} with config:`,
            JSON.stringify(runFixtureConfig, undefined, 2)
        );

        await testRunner.build();

        await testRunner.run({
            fixture: "custom",
            configuration: runFixtureConfig,
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
            await scriptRunner?.stop();
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
