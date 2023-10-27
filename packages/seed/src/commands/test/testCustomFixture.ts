import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { LogLevel } from "@fern-api/logger";
import { FERN_DIRECTORY } from "@fern-api/project-configuration";
import { GeneratorType } from "@fern-fern/seed-config/api";
import tmp from "tmp-promise";
import { ParsedDockerName } from "../../cli";
import { SeedWorkspace } from "../../loadSeedWorkspaces";
import { Semaphore } from "../../Semaphore";
import { TaskContextFactory } from "./TaskContextFactory";
import { acquireLocksAndRunTest } from "./testWorkspaceFixtures";

export async function testCustomFixture({
    pathToFixture,
    workspace,
    irVersion,
    language,
    docker,
    generatorType,
    compileCommand,
    logLevel,
    numDockers,
}: {
    pathToFixture: AbsoluteFilePath;
    workspace: SeedWorkspace;
    generatorType: GeneratorType;
    irVersion: string | undefined;
    language: GenerationLanguage | undefined;
    docker: ParsedDockerName;
    compileCommand: string | undefined;
    logLevel: LogLevel;
    numDockers: number;
}): Promise<void> {
    const lock = new Semaphore(numDockers);
    const outputDir = await tmp.dir();
    const absolutePathToOutput = AbsoluteFilePath.of(outputDir.path);
    const taskContextFactory = new TaskContextFactory(logLevel);

    const taskContext = taskContextFactory.create(`${workspace.workspaceName}:${"custom"} -`);

    const result = await acquireLocksAndRunTest({
        absolutePathToWorkspace: join(pathToFixture, RelativeFilePath.of(FERN_DIRECTORY)),
        lock,
        generatorType,
        irVersion,
        language,
        fixture: "custom",
        docker,
        compileCommand,
        customConfig: {},
        taskContext,
        outputDir: absolutePathToOutput,
    });

    if (result.type === "failure") {
        taskContext.logger.error(`Encountered error with ${result.reason}`);
    } else {
        taskContext.logger.info(`Wrote files to ${absolutePathToOutput}`);
    }
}
