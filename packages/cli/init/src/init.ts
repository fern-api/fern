import { createOrganizationIfDoesNotExist, getCurrentUser } from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import {
    APIS_DIRECTORY,
    DEFAULT_API_WORSPACE_FOLDER_NAME,
    FERN_DIRECTORY,
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { createVenusService } from "@fern-api/services";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
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

    const directoryOfWorkspace = await getDirectoryOfNewAPIWorkspace({ pathToFernDirectory });
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

async function getDirectoryOfNewAPIWorkspace({ pathToFernDirectory }: { pathToFernDirectory: AbsoluteFilePath }) {
    const pathToApisDirectory: AbsoluteFilePath = join(pathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    const apisDirectoryExists = await doesPathExist(pathToApisDirectory);

    if (apisDirectoryExists) {
        let attemptCount = 0;
        let apiWorkspaceDirectory = join(
            pathToApisDirectory,
            RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}`)
        );
        while (await doesPathExist(apiWorkspaceDirectory)) {
            apiWorkspaceDirectory = join(
                pathToApisDirectory,
                RelativeFilePath.of(`${DEFAULT_API_WORSPACE_FOLDER_NAME}${++attemptCount}`)
            );
        }
        return apiWorkspaceDirectory;
    }

    return pathToFernDirectory;

    // TODO(dsinghvi): handle the case where you go from single -> multi workspace
}
