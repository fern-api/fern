import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
}): Promise<void> {
    const { token } = project;
    if (token == null) {
        return cliContext.failAndThrow(
            `Please run ${chalk.bold(`${cliContext.environment.cliName} login`)} to log in with GitHub.`
        );
    }

    await Promise.all(
        project.workspaces.map(async (workspace) =>
            cliContext.runTaskForWorkspace(workspace, async (context) =>
                generateWorkspace({
                    workspace,
                    organization: project.config.organization,
                    context,
                    version,
                    groupName,
                    shouldLogS3Url,
                    token,
                })
            )
        )
    );
}
