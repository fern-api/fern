import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { validateAPIWorkspaceAndLogIssues } from "./validateAPIWorkspaceAndLogIssues";
import { validateDocsWorkspaceAndLogIssues } from "./validateDocsWorkspaceAndLogIssues";
import { validateOSSWorkspaceAndLogIssues } from "./validateOSSWorkspaceAndLogIssues";

export async function validateWorkspaces({
    project,
    cliContext,
    logWarnings
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            await validateDocsWorkspaceAndLogIssues({
                workspace: docsWorkspace,
                context,
                logWarnings,
                loadAPIWorkspace: project.loadAPIWorkspace
            });
        });
    }

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (workspace instanceof OSSWorkspace) {
                await cliContext.runTaskForWorkspace(workspace, async (context) => {
                    await validateOSSWorkspaceAndLogIssues({ workspace, context, logWarnings });
                });
            }
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context });
                await validateAPIWorkspaceAndLogIssues({ workspace: fernWorkspace, context, logWarnings });
            });
        })
    );
}
