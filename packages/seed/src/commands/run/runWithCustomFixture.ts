import { GeneratorGroup, GeneratorInvocation, PROJECT_CONFIG_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { FixtureConfigurations } from "../../config/api/index.js";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";
import { Semaphore } from "../../Semaphore.js";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace.js";
import { ContainerScriptRunner, LocalScriptRunner, ScriptRunner } from "../test/index.js";
import { printTestCases } from "../test/printTestCases.js";
import { TaskContextFactory } from "../test/TaskContextFactory.js";
import { ContainerTestRunner, LocalTestRunner, TestRunner } from "../test/test-runner/index.js";

export async function runWithCustomFixture({
    pathToFixture,
    workspace,
    logLevel,
    skipScripts,
    outputPath,
    inspect,
    local,
    keepContainer,
    skipAutogenerationIfManualExamplesExist
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: GeneratorWorkspace;
    logLevel: LogLevel;
    skipScripts: boolean;
    outputPath?: AbsoluteFilePath;
    inspect: boolean;
    local: boolean;
    keepContainer: boolean;
    skipAutogenerationIfManualExamplesExist?: boolean;
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
        scriptRunner = local
            ? new LocalScriptRunner(workspace, skipScripts, taskContext, logLevel)
            : new ContainerScriptRunner(workspace, skipScripts, taskContext, logLevel, undefined, 1);
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
            inspect,
            logLevel
        });
    } else {
        testRunner = new ContainerTestRunner({
            generator: workspace,
            lock,
            taskContextFactory,
            skipScripts,
            keepContainer,
            scriptRunner,
            inspect,
            parallelism: 1,
            logLevel
        });
    }

    try {
        // Read project config (organization, version, config path) from fern.config.json
        const projectConfig = await readFernProjectConfig(pathToFixture);

        // Derive workspace name from the directory path (e.g. "payments" from fern/apis/payments/)
        const workspaceName = path.basename(pathToFixture);

        const apiWorkspace = await convertGeneratorWorkspaceToFernWorkspace({
            absolutePathToAPIDefinition: pathToFixture,
            taskContext,
            fixture: "custom",
            workspaceName,
            cliVersion: projectConfig?.version,
            lenient: true
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

        const result = await testRunner.run({
            fixture: "custom",
            configuration: runFixtureConfig,
            inspect,
            absolutePathToApiDefinition: pathToFixture,
            outputDir: absolutePathToOutput,
            generatorInvocation: generatorGroup.invocation,
            organization: projectConfig?.organization,
            absolutePathToFernConfig: projectConfig?.absolutePathToFernConfig,
            lenient: true,
            skipAutogenerationIfManualExamplesExist
        });

        printTestCases([result]);

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
        await testRunner.cleanup();
    }
}

interface FernProjectConfig {
    organization?: string;
    version?: string;
    absolutePathToFernConfig: AbsoluteFilePath;
}

/**
 * Walks up the directory tree from the given path to find fern.config.json
 * and reads the project configuration (organization, version) from it.
 */
async function readFernProjectConfig(startPath: AbsoluteFilePath): Promise<FernProjectConfig | undefined> {
    let currentDir = startPath;
    // Walk up the directory tree looking for fern.config.json
    while (true) {
        const configPath = join(currentDir, RelativeFilePath.of(PROJECT_CONFIG_FILENAME));
        if (await doesPathExist(configPath)) {
            try {
                const configContents = await readFile(configPath, "utf-8");
                const config = JSON.parse(configContents) as Record<string, unknown>;
                const organization = typeof config.organization === "string" ? config.organization : undefined;
                const version = typeof config.version === "string" ? config.version : undefined;
                return {
                    organization,
                    version,
                    absolutePathToFernConfig: configPath
                };
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn(`Failed to read project config from ${configPath}: ${error}`);
                return undefined;
            }
        }
        const parentDir = AbsoluteFilePath.of(path.dirname(currentDir));
        if (parentDir === currentDir) {
            // Reached filesystem root
            return undefined;
        }
        currentDir = parentDir;
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
