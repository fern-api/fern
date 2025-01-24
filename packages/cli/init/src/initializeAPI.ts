import chalk from "chalk";
import fs from "fs-extra";
import { mkdir } from "fs/promises";
import path from "path";

import {
    APIS_DIRECTORY,
    DEFAULT_API_WORSPACE_FOLDER_NAME,
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { createFernWorkspace, createOpenAPIWorkspace } from "./createWorkspace";

export async function initializeAPI({
    organization,
    versionOfCli,
    openApiPath,
    context
}: {
    organization: string | undefined;
    versionOfCli: string;
    openApiPath: AbsoluteFilePath | undefined;
    context: TaskContext;
}): Promise<void> {
    const { absolutePathToFernDirectory } = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext: context
    });

    const directoryOfWorkspace = await getDirectoryOfNewAPIWorkspace({
        absolutePathToFernDirectory,
        taskContext: context
    });
    if (openApiPath != null) {
        await createOpenAPIWorkspace({
            directoryOfWorkspace,
            openAPIFilePath: openApiPath,
            cliVersion: versionOfCli,
            context
        });
    } else {
        await createFernWorkspace({ directoryOfWorkspace, cliVersion: versionOfCli, context });
    }
    context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
}

async function getDirectoryOfNewAPIWorkspace({
    absolutePathToFernDirectory,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
}) {
    const workspaces = await hasWorkspaces({ absolutePathToFernDirectory });
    if (workspaces) {
        let attemptCount = 0;
        const pathToApisDirectory: AbsoluteFilePath = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY)
        );
        let newApiDirectory = join(pathToApisDirectory, RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}`));
        while (await doesPathExist(newApiDirectory)) {
            newApiDirectory = join(
                pathToApisDirectory,
                RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}${++attemptCount}`)
            );
        }
        return newApiDirectory;
    }

    const inlinedApiDefinition = await hasInlinedAPIDefinitions({ absolutePathToFernDirectory });
    if (inlinedApiDefinition) {
        taskContext.logger.info("Creating workspaces to support multiple API Definitions.");

        const apiWorkspaceDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api")
        );

        const inlinedDefinitionDirectory: AbsoluteFilePath = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(DEFINITION_DIRECTORY)
        );
        const workspaceDefinitionDirectory: AbsoluteFilePath = join(
            apiWorkspaceDirectory,
            RelativeFilePath.of(DEFINITION_DIRECTORY)
        );
        await mkdir(apiWorkspaceDirectory, { recursive: true });
        await fs.move(inlinedDefinitionDirectory, workspaceDefinitionDirectory);

        const inlinedGeneratorsYml: AbsoluteFilePath = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        const workspaceGeneratorsYml: AbsoluteFilePath = join(
            apiWorkspaceDirectory,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        await fs.move(inlinedGeneratorsYml, workspaceGeneratorsYml);

        const newApiDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1")
        );
        await mkdir(workspaceDefinitionDirectory, { recursive: true });
        return newApiDirectory;
    }

    // if no apis exist already, create an inlined definition
    return absolutePathToFernDirectory;
}

async function hasWorkspaces({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<boolean> {
    const pathToApisDirectory: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(APIS_DIRECTORY)
    );
    return await doesPathExist(pathToApisDirectory);
}

async function hasInlinedAPIDefinitions({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<boolean> {
    const pathToSingleWorkspaceDefinition: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(DEFINITION_DIRECTORY)
    );
    return await doesPathExist(pathToSingleWorkspaceDefinition);
}
