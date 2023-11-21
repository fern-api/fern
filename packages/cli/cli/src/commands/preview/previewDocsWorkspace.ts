import { runPreviewServer } from "@fern-api/docs-preview";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues";

export async function previewDocsWorkspace({
    project,
    cliContext,
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        return;
    }

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern preview --docs",
    });

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        await validateDocsWorkspaceAndLogIssues(docsWorkspace, context);

        await runPreviewServer({
            docsWorkspace,
            context,
            apiWorkspaces: project.apiWorkspaces,
        });
    });
}
