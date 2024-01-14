import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { runMockServer } from "@fern-api/mock";
import { Project } from "@fern-api/project-loader";
import { APIWorkspace, convertOpenApiWorkspaceToFernWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { API_CLI_OPTION } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function mockServer({
    cliContext,
    project,
    port
}: {
    cliContext: CliContext;
    project: Project;
    port: number | undefined;
}): Promise<void> {
    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern mock"
    });

    if (project.apiWorkspaces.length !== 1 || project.apiWorkspaces[0] == null) {
        return cliContext.failAndThrow(`No API specified. Use the --${API_CLI_OPTION} option.`);
    }

    const workspace: APIWorkspace = project.apiWorkspaces[0];

    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        const fernWorkspace: FernWorkspace =
            workspace.type === "fern" ? workspace : await convertOpenApiWorkspaceToFernWorkspace(workspace, context);

        await validateAPIWorkspaceAndLogIssues({
            context,
            logWarnings: false,
            workspace: fernWorkspace
        });

        const ir = await generateIntermediateRepresentation({
            workspace: fernWorkspace,
            audiences: { type: "all" },
            generationLanguage: undefined
        });

        await runMockServer({
            context,
            ir,
            port
        });
    });
}
