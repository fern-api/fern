import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { validateWorkspaceAndLogIssues } from "./validateWorkspaceAndLogIssues";

export async function validateWorkspaces({
    project,
    cliContext,
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                await validateWorkspaceAndLogIssues(workspace, context);
            });
        })
    );
}
