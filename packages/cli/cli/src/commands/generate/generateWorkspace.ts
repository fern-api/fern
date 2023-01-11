import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY } from "@fern-api/generators-configuration";
import { FernToken } from "@fern-api/login";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { GROUP_CLI_OPTION } from "../../constants";
import { validateWorkspaceAndLogIssues } from "../validate/validateWorkspaceAndLogIssues";

export async function generateWorkspace({
    workspace,
    organization,
    context,
    groupName,
    version,
    shouldLogS3Url,
    token,
}: {
    workspace: Workspace;
    organization: string;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<void> {
    if (workspace.generatorsConfiguration.groups.length === 0) {
        context.logger.warn(`This workspaces has no groups specified in ${GENERATORS_CONFIGURATION_FILENAME}`);
        return;
    }

    const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration.defaultGroup;
    if (groupNameOrDefault == null) {
        return context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
        );
    }

    const group = workspace.generatorsConfiguration.groups.find(
        (otherGroup) => otherGroup.groupName === groupNameOrDefault
    );
    if (group == null) {
        return context.failAndThrow(`Group '${groupNameOrDefault}' does not exist.`);
    }

    await validateWorkspaceAndLogIssues(workspace, context);

    await runRemoteGenerationForWorkspace({
        workspace,
        organization,
        context,
        generatorGroup: group,
        version,
        shouldLogS3Url,
        token,
    });
}
