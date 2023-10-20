import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath, basename} from "@fern-api/fs-utils";
import {
    APIS_DIRECTORY,
    DEFAULT_API_WORSPACE_FOLDER_NAME,
    DEFINITION_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    OPENAPI_DIRECTORY
} from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import fs from "fs-extra";
import { mkdir } from "fs/promises";
import path from "path";
import { createFernDirectoryAndWorkspace } from "./createFernDirectoryAndOrganization";
import { createFernWorkspace, createOpenAPIWorkspace } from "./createWorkspace";

export async function initializeAPI({
    organization,
    versionOfCli,
    openApiPath,
    context,
}: {
    organization: string | undefined;
    versionOfCli: string;
    openApiPath: AbsoluteFilePath | undefined;
    context: TaskContext;
}): Promise<void> {
    const { absolutePathToFernDirectory } = await createFernDirectoryAndWorkspace({
        organization,
        versionOfCli,
        taskContext: context,
    });

    const directoryOfWorkspace = await getDirectoryOfNewAPIWorkspace({
        absolutePathToFernDirectory,
        taskContext: context,
    });
    if (openApiPath != null) {
        await createOpenAPIWorkspace({ directoryOfWorkspace, openAPIFilePath: openApiPath });
    } else {
        await createFernWorkspace({ directoryOfWorkspace });
    }
    context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
}

async function getDirectoryOfNewAPIWorkspace({
    absolutePathToFernDirectory,
    taskContext,
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

    const inlinedApiCheckResult = await hasInlinedAPIDefinitions({ absolutePathToFernDirectory });
    if (inlinedApiCheckResult.type !== "none") {
        const inlinedApiDirectoryPath =
            inlinedApiCheckResult.type === "fern"
                ? inlinedApiCheckResult.fernDefDirectoryPath
                : inlinedApiCheckResult.openApiDirectoryPath;
        taskContext.logger.info("Creating workspaces to support multiple API Definitions.");

        const apiWorkspaceDirectory = join(
            absolutePathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api")
        );

        const directoryOfInlinedApiDefinition = basename(inlinedApiDirectoryPath);

        const workspaceDefinitionDirectory: AbsoluteFilePath = join(
            apiWorkspaceDirectory,
            RelativeFilePath.of(directoryOfInlinedApiDefinition)
        );
        await mkdir(apiWorkspaceDirectory, { recursive: true });
        await fs.move(inlinedApiDirectoryPath, workspaceDefinitionDirectory);

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
    absolutePathToFernDirectory,
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<boolean> {
    const pathToApisDirectory: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(APIS_DIRECTORY)
    );
    return await doesPathExist(pathToApisDirectory);
}

type InlinedAPICheckResult = NoInlinedApis | InlinedOpenAPI | InlinedFernDef;
interface NoInlinedApis {
    type: "none";
}

interface InlinedOpenAPI {
    type: "openapi";
    openApiDirectoryPath: string;
}

interface InlinedFernDef {
    type: "fern";
    fernDefDirectoryPath: string;
}

async function hasInlinedAPIDefinitions({
    absolutePathToFernDirectory,
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<InlinedAPICheckResult> {
    const pathToSingleWorkspaceDefinition: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(DEFINITION_DIRECTORY)
    );

    const pathToSingleOpenAPIWorkspace: AbsoluteFilePath = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(OPENAPI_DIRECTORY)
    );

    if (await doesPathExist(pathToSingleWorkspaceDefinition)) {
        return {
            type: "fern",
            fernDefDirectoryPath: pathToSingleWorkspaceDefinition,
        };
    }

    if (await doesPathExist(pathToSingleOpenAPIWorkspace)) {
        return {
            type: "openapi",
            openApiDirectoryPath: pathToSingleOpenAPIWorkspace,
        };
    }

    return { type: "none" };
}
