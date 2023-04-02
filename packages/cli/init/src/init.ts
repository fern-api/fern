import { createOrganizationIfDoesNotExist, getCurrentUser } from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { convertOpenApi, OpenApiConvertedFernDefinition } from "@fern-api/openapi-migrator";
import {
    DEFAULT_WORSPACE_FOLDER_NAME,
    FERN_DIRECTORY,
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import { kebabCase } from "lodash-es";
import path from "path";
import { createWorkspace } from "./createWorkspace";

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
            if (token.type !== "user") {
                return context.failAndThrow("You must be logged in to initialize Fern.");
            }
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
        }

        await mkdir(FERN_DIRECTORY);
        await writeProjectConfig({
            filepath: join(pathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)),
            organization,
            versionOfCli,
        });
    }

    let fernDefinition: undefined | OpenApiConvertedFernDefinition = undefined;
    if (openApiPath != null) {
        fernDefinition = await convertOpenApi({
            openApiPath: AbsoluteFilePath.of(openApiPath),
            taskContext: context,
        });
    }
    const directoryOfWorkspace = await getDirectoryOfNewWorkspace({ pathToFernDirectory });
    await createWorkspace({ directoryOfWorkspace, fernDefinition });
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

async function getDirectoryOfNewWorkspace({ pathToFernDirectory }: { pathToFernDirectory: AbsoluteFilePath }) {
    let pathToWorkspaceDirectory: AbsoluteFilePath = join(
        pathToFernDirectory,
        RelativeFilePath.of(DEFAULT_WORSPACE_FOLDER_NAME)
    );

    let attemptCount = 0;
    while (await doesPathExist(pathToWorkspaceDirectory)) {
        pathToWorkspaceDirectory = join(
            pathToFernDirectory,
            RelativeFilePath.of(`${DEFAULT_WORSPACE_FOLDER_NAME}${++attemptCount}`)
        );
    }

    return pathToWorkspaceDirectory;
}
