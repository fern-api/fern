import {
    APIS_DIRECTORY,
    DEFAULT_API_WORKSPACE_FOLDER_NAME,
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    SDK_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir } from "fs/promises";
import fs from "fs-extra";
import path from "path";

import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization.js";
import { createDefaultOpenAPIWorkspace, createFernWorkspace, createOpenAPIWorkspace } from "./createWorkspace.js";
import { initializeDocs } from "./initializeDocs.js";

export async function initializeAPI({
    organization,
    versionOfCli,
    openApiPath,
    openApiUrl,
    useFernDefinition,
    useSdkConfig,
    includeDocs,
    context
}: {
    organization: string | undefined;
    versionOfCli: string;
    openApiPath: AbsoluteFilePath | undefined;
    openApiUrl?: string;
    useFernDefinition: boolean;
    useSdkConfig: boolean;
    /** Whether to also initialize the docs. Only applies with `useSdkConfig`. */
    includeDocs: boolean;
    context: TaskContext;
}): Promise<void> {
    if (useSdkConfig && useFernDefinition) {
        context.failAndThrow(
            "Fern Definition initialization is not supported by this version of fern init. Run `fern init` to use the sample OpenAPI definition, or `fern init --openapi <path-or-url>` to use your own OpenAPI specification.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const { absolutePathToFernDirectory } = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext: context
    });

    const { directoryOfWorkspace, relocatedOpenApiPath } = await getDirectoryOfNewAPIWorkspace({
        absolutePathToFernDirectory,
        openApiPath,
        taskContext: context
    });
    const sdkName = directoryOfWorkspace === absolutePathToFernDirectory ? "api" : path.basename(directoryOfWorkspace);
    if (relocatedOpenApiPath != null || openApiUrl != null) {
        await createOpenAPIWorkspace({
            directoryOfWorkspace,
            openAPIFilePath: relocatedOpenApiPath,
            openAPIUrl: openApiUrl,
            cliVersion: versionOfCli,
            context,
            useSdkConfig,
            sdkName
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
            context,
            useSdkConfig,
            sdkName
        });

        context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
    }

    // The docs cannot read an SDK Config API, so unless only the API was asked for, give them its spec too.
    if (useSdkConfig && includeDocs) {
        await initializeDocs({
            organization,
            versionOfCli,
            taskContext: context,
            useSdkConfig,
            openApi:
                openApiUrl ?? relocatedOpenApiPath ?? join(directoryOfWorkspace, RelativeFilePath.of("openapi.yml"))
        });
    }
}

async function getDirectoryOfNewAPIWorkspace({
    absolutePathToFernDirectory,
    openApiPath,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    openApiPath: AbsoluteFilePath | undefined;
    taskContext: TaskContext;
}): Promise<{ directoryOfWorkspace: AbsoluteFilePath; relocatedOpenApiPath: AbsoluteFilePath | undefined }> {
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
        return { directoryOfWorkspace: newApiDirectory, relocatedOpenApiPath: openApiPath };
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

        let relocatedOpenApiPath = openApiPath;
        for (const filename of [
            GENERATORS_CONFIGURATION_FILENAME,
            SDK_CONFIG_FILENAME,
            "openapi.yml",
            "openapi.json"
        ]) {
            const movedFile = await moveWorkspaceFileIfPresent({
                filename,
                from: absolutePathToFernDirectory,
                to: apiWorkspaceDirectory
            });
            if (
                movedFile != null &&
                openApiPath != null &&
                path.resolve(openApiPath) === path.resolve(movedFile.from)
            ) {
                relocatedOpenApiPath = movedFile.to;
            }
        }

        const newApiDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1")
        );
        return { directoryOfWorkspace: newApiDirectory, relocatedOpenApiPath };
    }

    // if no apis exist already, create an inlined workspace
    return { directoryOfWorkspace: absolutePathToFernDirectory, relocatedOpenApiPath: openApiPath };
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
    const [hasGeneratorsConfiguration, hasSdkConfiguration] = await Promise.all([
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME))),
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(SDK_CONFIG_FILENAME)))
    ]);
    return hasGeneratorsConfiguration || hasSdkConfiguration;
}

async function moveWorkspaceFileIfPresent({
    filename,
    from,
    to
}: {
    filename: string;
    from: AbsoluteFilePath;
    to: AbsoluteFilePath;
}): Promise<{ from: AbsoluteFilePath; to: AbsoluteFilePath } | undefined> {
    const source = join(from, RelativeFilePath.of(filename));
    if (await doesPathExist(source)) {
        const destination = join(to, RelativeFilePath.of(filename));
        await fs.move(source, destination);
        return { from: source, to: destination };
    }
    return undefined;
}
