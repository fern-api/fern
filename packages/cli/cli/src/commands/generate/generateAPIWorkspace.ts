import { FernToken } from "@fern-api/auth";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    fernConfigJson,
    GENERATORS_CONFIGURATION_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import { GROUP_CLI_OPTION } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";

export async function generateWorkspace({
    organization,
    workspace,
    projectConfig,
    context,
    groupName,
    version,
    shouldLogS3Url,
    token,
    useLocalDocker,
    keepDocker,
    absolutePathToPreview
}: {
    organization: string;
    workspace: APIWorkspace;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    useLocalDocker: boolean;
    keepDocker: boolean;
    absolutePathToPreview: AbsoluteFilePath | undefined;
}): Promise<void> {
    if (workspace.generatorsConfiguration == null) {
        context.logger.warn("This workspaces has no generators.yml");
        return;
    }

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

    await validateAPIWorkspaceAndLogIssues({
        workspace: await workspace.toFernWorkspace({ context }),
        context,
        logWarnings: false
    });

    if (useLocalDocker) {
        await runLocalGenerationForWorkspace({
            projectConfig,
            workspace,
            generatorGroup: group,
            keepDocker,
            context
        });
    } else {
        await runRemoteGenerationForAPIWorkspace({
            projectConfig,
            organization,
            workspace,
            context,
            generatorGroup: group,
            version,
            shouldLogS3Url,
            token,
            whitelabel: workspace.generatorsConfiguration.whitelabel,
            absolutePathToPreview
        });
    }
}
