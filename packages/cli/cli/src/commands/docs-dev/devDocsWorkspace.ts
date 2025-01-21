import { runPreviewServer } from "@fern-api/docs-preview";
import { Project } from "@fern-api/project-loader";

import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { CliContext } from "../../cli-context/CliContext";
import { validateAPIWorkspaceWithoutExiting } from "../validate/validateAPIWorkspaceAndLogIssues";
import { validateDocsWorkspaceWithoutExiting } from "../validate/validateDocsWorkspaceAndLogIssues";

export async function previewDocsWorkspace({
    loadProject,
    cliContext,
    port,
    bundlePath
}: {
    loadProject: () => Promise<Project>;
    cliContext: CliContext;
    port: number;
    bundlePath?: string;
}): Promise<void> {
    const project = await loadProject();
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        return;
    }

    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern docs dev"
    });

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        context.logger.info(`Starting server on port ${port}`);

        await runPreviewServer({
            initialProject: project,
            reloadProject: loadProject,
            validateProject: async (project) => {
                const docsWorkspace = project.docsWorkspaces;
                if (docsWorkspace == null) {
                    return;
                }
                const fernWorkspaces = await Promise.all(
                    project.apiWorkspaces.map(async (workspace) => {
                        return workspace.toFernWorkspace({ context });
                    }));
                await validateDocsWorkspaceWithoutExiting({
                    workspace: docsWorkspace,
                    context,
                    logWarnings: true,
                    logSummary: false,
                    fernWorkspaces,
                    ossWorkspaces: await filterOssWorkspaces(project)
                });
                for (const fernWorkspace of fernWorkspaces) {
                    await cliContext.runTaskForWorkspace(fernWorkspace, async (apiWorkspaceContext) => {
                        await validateAPIWorkspaceWithoutExiting({
                            workspace: fernWorkspace,
                            context: apiWorkspaceContext,
                            logWarnings: false,
                            logSummary: false
                        });
                    });
                }
            },
            context,
            port,
            bundlePath
        });
    });
}
