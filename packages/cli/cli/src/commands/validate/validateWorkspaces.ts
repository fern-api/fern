import { Project } from "@fern-api/project-loader";
import { convertOpenApiWorkspaceToFernWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { validateAPIWorkspaceAndLogIssues } from "./validateAPIWorkspaceAndLogIssues";
import { validateDocsWorkspaceAndLogIssues } from "./validateDocsWorkspaceAndLogIssues";

export async function validateWorkspaces({
    project,
    cliContext
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            await validateDocsWorkspaceAndLogIssues(docsWorkspace, context);
        });
    }

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    const fernWorkspace = await convertOpenApiWorkspaceToFernWorkspace(workspace, context);
                    await validateAPIWorkspaceAndLogIssues(fernWorkspace, context);
                } else {
                    await validateAPIWorkspaceAndLogIssues(workspace, context);
                }
            });
        })
    );
}
