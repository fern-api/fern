import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { validateAPIWorkspaceAndLogIssues } from "./validateAPIWorkspaceAndLogIssues";
import { validateDocsWorkspaceAndLogIssues } from "./validateDocsWorkspaceAndLogIssues";

export async function validateWorkspaces({
    project,
    cliContext,
    logWarnings,
    errorOnBrokenLinks
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
    errorOnBrokenLinks: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            await validateDocsWorkspaceAndLogIssues({
                workspace: docsWorkspace,
                context,
                logWarnings,
                fernWorkspaces: await Promise.all(
                    project.apiWorkspaces.map(async (workspace) => {
                        return workspace.toFernWorkspace({ context });
                    })
                ),
                ossWorkspaces: await filterOssWorkspaces(project),
                errorOnBrokenLinks
            });
        });
    }

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspace = await workspace.toFernWorkspace({ context });
                await validateAPIWorkspaceAndLogIssues({
                    workspace: fernWorkspace,
                    context,
                    logWarnings,
                    ossWorkspace: workspace instanceof OSSWorkspace ? workspace : undefined
                });
            });
        })
    );
}
