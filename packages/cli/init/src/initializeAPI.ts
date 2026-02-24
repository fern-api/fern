import {
    APIS_DIRECTORY,
    DEFAULT_API_WORKSPACE_FOLDER_NAME,
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir } from "fs/promises";
import fs from "fs-extra";
import path from "path";

import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization.js";
import { createDefaultOpenAPIWorkspace, createFernWorkspace, createOpenAPIWorkspace } from "./createWorkspace.js";

export async function initializeAPI({
    organization,
    versionOfCli,
    openApiPath,
    useFernDefinition,
    context
}: {
    organization: string | undefined;
    versionOfCli: string;
    openApiPath: AbsoluteFilePath | undefined;
    useFernDefinition: boolean;
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

        context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
    } else if (useFernDefinition) {
        const apiName =
            directoryOfWorkspace !== absolutePathToFernDirectory ? path.basename(directoryOfWorkspace) : undefined;
        await createFernWorkspace({ directoryOfWorkspace, cliVersion: versionOfCli, context, apiName });

        context.logger.info(chalk.green("Created new fern folder"));
    } else {
        await createDefaultOpenAPIWorkspace({
            directoryOfWorkspace,
            cliVersion: versionOfCli,
            context
        });

        context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
    }
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
        let newApiDirectory = join(pathToApisDirectory, RelativeFilePath.of(`${DEFAULT_API_WORKSPACE_FOLDER_NAME}`));
        while (await doesPathExist(newApiDirectory)) {
            newApiDirectory = join(
                pathToApisDirectory,
                RelativeFilePath.of(`${DEFAULT_API_WORKSPACE_FOLDER_NAME}${++attemptCount}`)
            );
        }
        return newApiDirectory;
    }

    const inlinedApiDefinition = await hasInlinedAPIDefinitions({ absolutePathToFernDirectory });
    const inlinedOpenApiWorkspace = await hasInlinedOpenAPIWorkspace({ absolutePathToFernDirectory });
    if (inlinedApiDefinition || inlinedOpenApiWorkspace) {
        taskContext.logger.info("Creating workspaces to support multiple API Definitions.");

        const apiWorkspaceDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api")
        );
        await mkdir(apiWorkspaceDirectory, { recursive: true });

        if (inlinedApiDefinition) {
            const inlinedDefinitionDirectory: AbsoluteFilePath = join(
                absolutePathToFernDirectory,
                RelativeFilePath.of(DEFINITION_DIRECTORY)
            );
            const workspaceDefinitionDirectory: AbsoluteFilePath = join(
                apiWorkspaceDirectory,
                RelativeFilePath.of(DEFINITION_DIRECTORY)
            );
            await fs.move(inlinedDefinitionDirectory, workspaceDefinitionDirectory);
        }

        const inlinedGeneratorsYml: AbsoluteFilePath = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        if (await doesPathExist(inlinedGeneratorsYml)) {
            const workspaceGeneratorsYml: AbsoluteFilePath = join(
                apiWorkspaceDirectory,
                RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
            );
            await fs.move(inlinedGeneratorsYml, workspaceGeneratorsYml);
        }

        const inlinedOpenApiYml: AbsoluteFilePath = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of("openapi.yml")
        );
        if (await doesPathExist(inlinedOpenApiYml)) {
            const workspaceOpenApiYml: AbsoluteFilePath = join(
                apiWorkspaceDirectory,
                RelativeFilePath.of("openapi.yml")
            );
            await fs.move(inlinedOpenApiYml, workspaceOpenApiYml);
        }

        const newApiDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1")
        );
        return newApiDirectory;
    }

    // if no apis exist already, create an inlined workspace
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

async function hasInlinedOpenAPIWorkspace({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<boolean> {
    const pathToGeneratorsYml: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
    );
    return await doesPathExist(pathToGeneratorsYml);
}
