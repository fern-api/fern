import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import tmp from "tmp-promise";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { Semaphore } from "../../Semaphore";
import { ParsedDockerName } from "../../utils/parseDockerOrThrow";
import { TaskContextFactory } from "./TaskContextFactory";
import { acquireLocksAndRunTest } from "./testWorkspaceFixtures";

export async function testCustomFixture({
    pathToFixture,
    workspace,
    language,
    docker,
    logLevel,
    numDockers,
    keepDocker,
    skipScripts
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: SeedWorkspace;
    language: generatorsYml.GenerationLanguage | undefined;
    docker: ParsedDockerName;
    logLevel: LogLevel;
    numDockers: number;
    keepDocker: boolean | undefined;
    skipScripts: boolean;
}): Promise<void> {
    const lock = new Semaphore(numDockers);
    const outputDir = await tmp.dir();
    const absolutePathToOutput = AbsoluteFilePath.of(outputDir.path);
    const taskContextFactory = new TaskContextFactory(logLevel);
    const customFixtureConfig = workspace.workspaceConfig.customFixtureConfig;

    const taskContext = taskContextFactory.create(
        `${workspace.workspaceName}:${"custom"} - ${customFixtureConfig?.outputFolder ?? ""}`
    );

    const result = await acquireLocksAndRunTest({
        absolutePathToWorkspace: join(pathToFixture),
        lock,
        irVersion: workspace.workspaceConfig.irVersion,
        outputVersion: customFixtureConfig?.outputVersion,
        language,
        fixture: "custom",
        docker,
        scripts: undefined,
        customConfig: customFixtureConfig?.customConfig,
        publishConfig: customFixtureConfig?.publishConfig,
        publishMetadata: customFixtureConfig?.publishMetadata,
        selectAudiences: customFixtureConfig?.audiences,
        taskContext,
        outputDir: absolutePathToOutput,
        outputMode: customFixtureConfig?.outputMode ?? workspace.workspaceConfig.defaultOutputMode,
        outputFolder: customFixtureConfig?.outputFolder ?? "custom",
        id: "custom",
        keepDocker,
        skipScripts
    });

    if (result.type === "failure") {
        taskContext.logger.error(`Encountered error with ${result.cause}`);
    } else {
        taskContext.logger.info(`Wrote files to ${absolutePathToOutput}`);
    }
}
