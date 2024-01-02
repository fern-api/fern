import { FernToken } from "@fern-api/auth";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY } from "@fern-api/generators-configuration";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { GROUP_CLI_OPTION } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function generateWorkspace({
    workspace,
    organization,
    context,
    groupName,
    version,
    shouldLogS3Url,
    token,
    useLocalDocker,
    keepDocker
}: {
    workspace: FernWorkspace;
    organization: string;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    token?: FernToken;
    useLocalDocker: boolean;
    keepDocker: boolean;
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

    await validateAPIWorkspaceAndLogIssues({ workspace, context, logWarnings: false });

    if (useLocalDocker) {
        await runLocalGenerationForWorkspace({
            organization,
            workspace,
            generatorGroup: group,
            keepDocker,
            context
        });
    } else {
        if (!token) {
            return context.failAndThrow("Must provide token if 'useLocalDocker' is false");
        }
        await runRemoteGenerationForAPIWorkspace({
            workspace,
            organization,
            context,
            generatorGroup: group,
            version,
            shouldLogS3Url,
            token
        });
    }
}
