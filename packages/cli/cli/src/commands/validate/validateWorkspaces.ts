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
    brokenLinks,
    errorOnBrokenLinks,
    isLocal,
    directFromOpenapi
}: {
    project: Project;
    cliContext: CliContext;
    logWarnings: boolean;
    brokenLinks: boolean;
    errorOnBrokenLinks: boolean;
    isLocal?: boolean;
    directFromOpenapi?: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace != null) {
        await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
            const excludeRules = brokenLinks || errorOnBrokenLinks ? [] : ["valid-markdown-links"];
            await validateDocsWorkspaceAndLogIssues({
                workspace: docsWorkspace,
                context,
                logWarnings,
                apiWorkspaces: project.apiWorkspaces,
                ossWorkspaces: await filterOssWorkspaces(project),
                errorOnBrokenLinks,
                excludeRules
            });
        });
    }

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (workspace.generatorsConfiguration?.groups.length === 0 && workspace.type != "fern") {
                return;
            }

            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace instanceof OSSWorkspace && directFromOpenapi) {
                    await workspace.getIntermediateRepresentation({
                        context,
                        audiences: { type: "all" },
                        enableUniqueErrorsPerEndpoint: false,
                        generateV1Examples: false,
                        logWarnings
                    });
                    return;
                }

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
