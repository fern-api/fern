import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";

export async function releaseWorkspace({
    workspace,
    organization,
    context,
    version,
}: {
    workspace: Workspace;
    organization: string;
    context: TaskContext;
    version: string;
}): Promise<void> {
    await runRemoteGenerationForWorkspace({
        workspace,
        organization,
        context,
        version,
        generatorInvocations: workspace.generatorsConfiguration.release,
    });
}
