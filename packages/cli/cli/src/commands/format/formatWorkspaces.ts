import { Project } from "@fern-api/project-loader";
import { OSSWorkspace } from "@fern-api/workspace-loader";
import { formatWorkspace } from "@fern-api/yaml-formatter";
import { CliContext } from "../../cli-context/CliContext";

export async function formatWorkspaces({
    project,
    cliContext,
    shouldFix
}: {
    project: Project;
    cliContext: CliContext;
    shouldFix: boolean;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            if (workspace instanceof OSSWorkspace) {
                return;
            }
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                await formatWorkspace({
                    workspace: await workspace.toFernWorkspace({}),
                    context,
                    shouldFix
                });
            });
        })
    );
}
