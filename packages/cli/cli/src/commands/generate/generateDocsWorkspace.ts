import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { runRemoteGenerationForDocsWorkspace } from "@fern-api/remote-workspace-runner";
import { FernWorkspace } from "@fern-api/workspace-loader";

import { CliContext } from "../../cli-context/CliContext";
import { validateDocsWorkspaceAndLogIssues } from "../validate/validateDocsWorkspaceAndLogIssues";

export async function generateDocsWorkspace({
    project,
    cliContext,
    instance,
    preview
}: {
    project: Project;
    cliContext: CliContext;
    instance: string | undefined;
    preview: boolean;
}): Promise<void> {
    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        return;
    }

    const token = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token.type === "user") {
        await cliContext.runTask(async (context) => {
            await createOrganizationIfDoesNotExist({
                organization: project.config.organization,
                token,
                context
            });
        });
    }

    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate --docs"
    });

    await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
        let fernWorkspaces: FernWorkspace[] = [];
        if (!docsWorkspace.config.experimental?.openapiParserV3) {
            fernWorkspaces = await Promise.all(
                project.apiWorkspaces.map(async (workspace) => {
                    return workspace.toFernWorkspace(
                        { context },
                        { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false, preserveSchemaIds: true }
                    );
                })
            );
        }

        await validateDocsWorkspaceAndLogIssues({
            workspace: docsWorkspace,
            context,
            logWarnings: false,
            fernWorkspaces,
            ossWorkspaces: await filterOssWorkspaces(project),
            errorOnBrokenLinks: false
        });

        const ossWorkspaces = await filterOssWorkspaces(project);

        await runRemoteGenerationForDocsWorkspace({
            organization: project.config.organization,
            fernWorkspaces,
            ossWorkspaces,
            docsWorkspace,
            context,
            token,
            instanceUrl: instance,
            preview
        });
    });
}
