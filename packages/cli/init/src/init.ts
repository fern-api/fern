import {
    createOrganizationIfDoesNotExist,
    FernUserToken,
    getCurrentUser,
    getOrganizationNameValidationError,
} from "@fern-api/auth";
import { AbsoluteFilePath, cwd, doesPathExist, join } from "@fern-api/fs-utils";
import {
    DEFAULT_WORSPACE_FOLDER_NAME,
    FERN_DIRECTORY,
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import inquirer, { InputQuestion } from "inquirer";
import path from "path";
import { createWorkspace } from "./createWorkspace";

export async function initialize({
    organization,
    versionOfCli,
    context,
    token,
}: {
    organization: string | undefined;
    versionOfCli: string;
    context: TaskContext;
    token: FernUserToken;
}): Promise<void> {
    const pathToFernDirectory = join(cwd(), FERN_DIRECTORY);

    if (!(await doesPathExist(pathToFernDirectory))) {
        if (organization == null) {
            await context.takeOverTerminal(async () => {
                const user = await getCurrentUser({ token });
                organization = await askForOrganization({
                    username: user.username,
                });
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const castedOrganization = organization!;

        const didCreateOrganization = await createOrganizationIfDoesNotExist({
            organization: castedOrganization,
            token,
            context,
        });
        if (didCreateOrganization) {
            context.logger.info(`${chalk.green(`Created organization ${chalk.bold(castedOrganization)}`)}`);
        }

        await mkdir(FERN_DIRECTORY);
        await writeProjectConfig({
            filepath: join(pathToFernDirectory, PROJECT_CONFIG_FILENAME),
            organization: castedOrganization,
            versionOfCli,
        });
    }

    const directoryOfWorkspace = await getDirectoryOfNewWorkspace({ pathToFernDirectory });
    await createWorkspace({ directoryOfWorkspace });
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

async function askForOrganization({ username }: { username: string }) {
    const name = "organization";
    const organizationQuestion: InputQuestion<{ [name]: string }> = {
        type: "input",
        name,
        message: "What's the name of your organization?",
        default: username,
        validate: (organization) => getOrganizationNameValidationError(organization) ?? true,
    };
    const answers = await inquirer.prompt(organizationQuestion);
    return answers[name];
}

async function getDirectoryOfNewWorkspace({ pathToFernDirectory }: { pathToFernDirectory: AbsoluteFilePath }) {
    let pathToWorkspaceDirectory: AbsoluteFilePath = join(pathToFernDirectory, DEFAULT_WORSPACE_FOLDER_NAME);

    let attemptCount = 0;
    while (await doesPathExist(pathToWorkspaceDirectory)) {
        pathToWorkspaceDirectory = join(pathToFernDirectory, `${DEFAULT_WORSPACE_FOLDER_NAME}${++attemptCount}`);
    }

    return pathToWorkspaceDirectory;
}
