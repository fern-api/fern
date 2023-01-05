import { Project } from "@fern-api/project-loader";
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
                })
            )
        )
    );
}
