import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    printZipUrl,
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    printZipUrl: boolean;
}): Promise<void> {
    const { token } = project;
    if (token == null) {
        cliContext.fail(`Please run ${chalk.bold("fern login")} to log in with GitHub.`);
        return;
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
                    printZipUrl,
                    token,
                })
            )
        )
    );
}
