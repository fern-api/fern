import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import { kebabCase } from "lodash-es";

import { createOrganizationIfDoesNotExist, getCurrentUser } from "@fern-api/auth";
import {
    FERN_DIRECTORY,
    PROJECT_CONFIG_FILENAME,
    fernConfigJson,
    loadProjectConfig
} from "@fern-api/configuration-loader";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath, RelativeFilePath, cwd, doesPathExist, join } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { TaskContext } from "@fern-api/task-context";

export async function createFernDirectoryAndWorkspace({
    organization,
    taskContext,
    versionOfCli
}: {
    organization: string | undefined;
    taskContext: TaskContext;
    versionOfCli: string;
}): Promise<{ absolutePathToFernDirectory: AbsoluteFilePath; organization: string }> {
    const pathToFernDirectory = join(cwd(), RelativeFilePath.of(FERN_DIRECTORY));

    if (!(await doesPathExist(pathToFernDirectory))) {
        if (organization == null) {
            const token = await askToLogin(taskContext);
            if (token.type === "user") {
                const user = await getCurrentUser({ token, context: taskContext });
                organization = kebabCase(user.username);
                const didCreateOrganization = await createOrganizationIfDoesNotExist({
                    organization,
                    token,
                    context: taskContext
                });
                if (didCreateOrganization) {
                    taskContext.logger.info(`${chalk.green(`Created organization ${chalk.bold(organization)}`)}`);
                }
            } else {
                const venus = createVenusService({ token: token.value });
                const response = await venus.organization.getMyOrganizationFromScopedToken();
                if (response.ok) {
                    organization = response.body.organizationId;
                } else {
                    taskContext.failAndThrow("Unathorized. FERN_TOKEN is invalid.");
                    // dummy return value to appease the linter. won't actually ever get run.
                    return { absolutePathToFernDirectory: AbsoluteFilePath.of("/dummy"), organization: "dummy" };
                }
            }
        }

        await mkdir(FERN_DIRECTORY);
        await writeProjectConfig({
            filepath: join(pathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)),
            organization,
            versionOfCli
        });
    } else {
        const projectConfig = await loadProjectConfig({
            directory: pathToFernDirectory,
            context: taskContext
        });
        organization = projectConfig.organization;
    }

    return {
        absolutePathToFernDirectory: pathToFernDirectory,
        organization
    };
}

async function writeProjectConfig({
    organization,
    filepath,
    versionOfCli
}: {
    organization: string;
    filepath: AbsoluteFilePath;
    versionOfCli: string;
}): Promise<void> {
    const projectConfig: fernConfigJson.ProjectConfigSchema = {
        organization,
        version: versionOfCli
    };
    await writeFile(filepath, JSON.stringify(projectConfig, undefined, 4));
}
