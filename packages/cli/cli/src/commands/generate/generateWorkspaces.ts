import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { loginOrThrow } from "../../loginOrThrow";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
}): Promise<void> {
    const token = await loginOrThrow(cliContext);

    await cliContext.runTask(async (context) => {
        await createOrganizationIfDoesNotExist({
            organization: project.config.organization,
            token,
            context,
        });
    });

    await Promise.all(
        project.workspaces.map(async (workspace) =>
            cliContext.runTaskForWorkspace(workspace, async (context) =>
                generateWorkspace({
                    workspace,
                    organization: project.config.organization,
                    context,
                    version,
                    groupName,
                    shouldLogS3Url,
                    token,
                })
            )
        )
    );
}
