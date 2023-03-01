import { FernToken } from "@fern-api/auth";
import { Project } from "@fern-api/project-loader";
import { registerApi } from "@fern-api/register";
import { CliContext } from "../../cli-context/CliContext";

export async function registerWorkspacesV2({
    project,
    cliContext,
    token,
    environment,
}: {
    project: Project;
    cliContext: CliContext;
    token: FernToken;
    environment: string | undefined;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    context.failWithoutThrowing("Cannot register OpenAPI workspace");
                } else {
                    await registerApi({
                        organization: project.config.organization,
                        environment,
                        workspace,
                        context,
                        token,
                    });
                }
            });
        })
    );
}
