import { createOrganizationIfDoesNotExist, getCurrentUser } from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import {
    APIS_DIRECTORY,
    DEFAULT_API_WORSPACE_FOLDER_NAME,
    DEFINITION_DIRECTORY,
    FERN_DIRECTORY,
    GENERATORS_CONFIGURATION_FILENAME,
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { createVenusService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import fs from "fs-extra";
import { mkdir, writeFile } from "fs/promises";
import { kebabCase } from "lodash-es";
import path from "path";
import { createFernWorkspace, createOpenAPIWorkspace } from "./createWorkspace";

export async function initialize({
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
    const pathToFernDirectory = join(cwd(), RelativeFilePath.of(FERN_DIRECTORY));

    if (!(await doesPathExist(pathToFernDirectory))) {
        if (organization == null) {
            const token = await askToLogin(context);
            if (token.type === "user") {
                const user = await getCurrentUser({ token, context });
                organization = kebabCase(user.username);
                const didCreateOrganization = await createOrganizationIfDoesNotExist({
                    organization,
                    token,
                    context,
                });
                if (didCreateOrganization) {
                    context.logger.info(`${chalk.green(`Created organization ${chalk.bold(organization)}`)}`);
                }
            } else {
                const venus = createVenusService({ token: token.value });
                const response = await venus.organization.getMyOrganizationFromScopedToken();
                if (response.ok) {
                    organization = response.body.organizationId;
                } else {
                    context.failAndThrow("Unathorized. FERN_TOKEN is invalid.");
                    return;
                }
            }
        }

        await mkdir(FERN_DIRECTORY);
        await writeProjectConfig({
            filepath: join(pathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)),
            organization,
            versionOfCli,
        });
    }

    const directoryOfWorkspace = await getDirectoryOfNewAPIWorkspace({ pathToFernDirectory, taskContext: context });
    if (openApiPath != null) {
        await createOpenAPIWorkspace({ directoryOfWorkspace, openAPIFilePath: openApiPath });
    } else {
        await createFernWorkspace({ directoryOfWorkspace });
    }
    context.logger.info(chalk.green("Created new API: ./" + path.relative(process.cwd(), directoryOfWorkspace)));
}

async function writeProjectConfig({
    organization,
    filepath,
    versionOfCli,
}: {
    organization: string;
    filepath: AbsoluteFilePath;
    versionOfCli: string;
}): Promise<void> {
    const projectConfig: ProjectConfigSchema = {
        organization,
        version: versionOfCli,
    };
    await writeFile(filepath, JSON.stringify(projectConfig, undefined, 4));
}

async function getDirectoryOfNewAPIWorkspace({
    pathToFernDirectory,
    taskContext,
}: {
    pathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
}) {
    const workspaces = await hasWorkspaces({ pathToFernDirectory });
    if (workspaces) {
        let attemptCount = 0;
        const pathToApisDirectory: AbsoluteFilePath = join(pathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
        let newApiDirectory = join(pathToApisDirectory, RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}`));
        while (await doesPathExist(newApiDirectory)) {
            newApiDirectory = join(
                pathToApisDirectory,
                RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}${++attemptCount}`)
            );
        }
        return newApiDirectory;
    }

    const inlinedApiDefinition = await hasInlinedAPIDefinitions({ pathToFernDirectory });
    if (inlinedApiDefinition) {
        taskContext.logger.info("Creating workspaces to support multiple API Definitions.");

        const apiWorkspaceDirectory = join(
            pathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api")
        );

        const inlinedDefinitionDirectory: AbsoluteFilePath = join(
            pathToFernDirectory,
            RelativeFilePath.of(DEFINITION_DIRECTORY)
        );
        const workspaceDefinitionDirectory: AbsoluteFilePath = join(
            apiWorkspaceDirectory,
            RelativeFilePath.of(DEFINITION_DIRECTORY)
        );
        await mkdir(apiWorkspaceDirectory, { recursive: true });
        await fs.move(inlinedDefinitionDirectory, workspaceDefinitionDirectory);

        const inlinedGeneratorsYml: AbsoluteFilePath = join(
            pathToFernDirectory,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        const workspaceGeneratorsYml: AbsoluteFilePath = join(
            apiWorkspaceDirectory,
            RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)
        );
        await fs.move(inlinedGeneratorsYml, workspaceGeneratorsYml);

        const newApiDirectory = join(
            pathToFernDirectory,
            RelativeFilePath.of(APIS_DIRECTORY),
            RelativeFilePath.of("api1")
        );
        await mkdir(workspaceDefinitionDirectory, { recursive: true });
        return newApiDirectory;
    }

    // if no apis exist already, create an inlined definition
    return pathToFernDirectory;
}

async function hasWorkspaces({ pathToFernDirectory }: { pathToFernDirectory: AbsoluteFilePath }): Promise<boolean> {
    const pathToApisDirectory: AbsoluteFilePath = join(pathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    return await doesPathExist(pathToApisDirectory);
}

async function hasInlinedAPIDefinitions({
    pathToFernDirectory,
}: {
    pathToFernDirectory: AbsoluteFilePath;
}): Promise<boolean> {
    const pathToSingleWorkspaceDefinition: AbsoluteFilePath = join(
        pathToFernDirectory,
        RelativeFilePath.of(DEFINITION_DIRECTORY)
    );
    return await doesPathExist(pathToSingleWorkspaceDefinition);
}
