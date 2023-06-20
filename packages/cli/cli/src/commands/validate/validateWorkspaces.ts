import { Project } from "@fern-api/project-loader";
import { convertOpenApiWorkspaceToFernWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { validateFernWorkspaceAndLogIssues } from "./validateFernWorkspaceAndLogIssues";

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
                if (workspace.type === "openapi") {
                    const fernWorkspace = await convertOpenApiWorkspaceToFernWorkspace(workspace, context);
                    await validateFernWorkspaceAndLogIssues(fernWorkspace, context);
                } else {
                    await validateFernWorkspaceAndLogIssues(workspace, context);
                }
            });
        })
    );
}
