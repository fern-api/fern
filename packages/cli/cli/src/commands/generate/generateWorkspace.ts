import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";

export async function generateWorkspace({
    workspace,
    organization,
    context,
    groupName,
    version,
}: {
    workspace: Workspace;
    organization: string;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
}): Promise<void> {
    const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration.defaultGroup;
    if (groupNameOrDefault == null) {
        return context.failAndThrow(
            'No group specified. Use the --group option, or set "default-group" in generators.yml'
        );
    }

    const group = workspace.generatorsConfiguration.groups.find(
        (otherGroup) => otherGroup.groupName === groupNameOrDefault
    );
    if (group == null) {
        return context.failAndThrow(`Group '${groupNameOrDefault}' does not exist.`);
    }

    await runRemoteGenerationForWorkspace({
        workspace,
        organization,
        context,
        generatorGroup: group,
        version,
    });
}
