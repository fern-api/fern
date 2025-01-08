import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { MockServer } from "@fern-api/mock";
import { Project } from "@fern-api/project-loader";
import { AbstractAPIWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

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
    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern mock"
    });

    if (project.apiWorkspaces.length !== 1 || project.apiWorkspaces[0] == null) {
        return cliContext.failAndThrow(`No API specified. Use the --${API_CLI_OPTION} option.`);
    }

    const workspace: AbstractAPIWorkspace<unknown> = project.apiWorkspaces[0];

    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        const fernWorkspace: FernWorkspace = await workspace.toFernWorkspace({ context });

        await validateAPIWorkspaceAndLogIssues({
            context,
            logWarnings: false,
            workspace: fernWorkspace
        });

        const ir = generateIntermediateRepresentation({
            workspace: fernWorkspace,
            audiences: { type: "all" },
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false,
            disableExamples: false,
            readme: undefined,
            version: undefined,
            packageName: undefined,
            context,
            sourceResolver: new SourceResolverImpl(context, fernWorkspace)
        });

        const mockServer = new MockServer({
            context,
            ir,
            port
        });

        await mockServer.start();
        await mockServer.keepAlive();
    });
}
