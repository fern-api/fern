import { createOrganizationIfDoesNotExist, getCurrentUser } from "@fern-api/auth";
import {
    FERN_DIRECTORY,
    fernConfigJson,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath, cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir, readFile, writeFile } from "fs/promises";
import { kebabCase } from "lodash-es";

const GITIGNORE_ENTRIES = ["fern/**/.preview", "fern/**/.definition"];

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
                    taskContext.failAndThrow("Unauthorized. FERN_TOKEN is invalid.");
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
        await updateGitignore({ taskContext });
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

async function updateGitignore({ taskContext }: { taskContext: TaskContext }): Promise<void> {
    const gitignorePath = join(cwd(), RelativeFilePath.of(".gitignore"));

    let existingContent = "";
    if (await doesPathExist(gitignorePath)) {
        existingContent = await readFile(gitignorePath, "utf-8");
    }

    const existingLines = new Set(existingContent.split("\n").map((line) => line.trim()));
    const entriesToAdd = GITIGNORE_ENTRIES.filter((entry) => !existingLines.has(entry));

    if (entriesToAdd.length === 0) {
        return;
    }

    const newContent =
        existingContent.length > 0 && !existingContent.endsWith("\n")
            ? existingContent + "\n" + entriesToAdd.join("\n") + "\n"
            : existingContent + entriesToAdd.join("\n") + "\n";

    await writeFile(gitignorePath, newContent);
    taskContext.logger.info(chalk.green("Updated .gitignore"));
}
