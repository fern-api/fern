import { createOrganizationIfDoesNotExist } from "@fern-api/auth";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    generatorsYml,
    GENERATORS_CONFIGURATION_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, FernWorkspaceMetadata } from "@fern-api/workspace-loader";
import { join } from "path";
import { CliContext } from "../../cli-context/CliContext";
import { GROUP_CLI_OPTION, PREVIEW_DIRECTORY } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";
import { generateWorkspace } from "./generateAPIWorkspace";

async function getFernWorkspace(
    sdkLanguage: generatorsYml.GenerationLanguage | undefined,
    groupName: string | undefined,
    apiWorkspace: APIWorkspace,
    context: TaskContext,
    preview: boolean
): Promise<FernWorkspaceMetadata | undefined> {
    const fernWorkspace = await apiWorkspace.toFernWorkspace({ context });
    if (fernWorkspace.generatorsConfiguration == null) {
        context.logger.warn("This workspaces has no generators.yml");
        return;
    }

    if (fernWorkspace.generatorsConfiguration.groups.length === 0) {
        context.logger.warn(`This workspaces has no groups specified in ${GENERATORS_CONFIGURATION_FILENAME}`);
        return;
    }

    const absolutePathToPreview = preview
        ? AbsoluteFilePath.of(join(fernWorkspace.absoluteFilepath, RelativeFilePath.of(PREVIEW_DIRECTORY)))
        : undefined;

    if (absolutePathToPreview != null) {
        context.logger.info(`Writing preview to ${absolutePathToPreview}`);
    }

    await validateAPIWorkspaceAndLogIssues({ workspace: fernWorkspace, context, logWarnings: false });

    const groupNameOrDefault = groupName ?? fernWorkspace.generatorsConfiguration?.defaultGroup;
    if (groupNameOrDefault == null) {
        return context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
        );
    }

    const group = fernWorkspace.generatorsConfiguration?.groups.find(
        (otherGroup) => otherGroup.groupName === groupNameOrDefault
    );
    if (group == null) {
        return context.failAndThrow(`Group '${groupNameOrDefault}' does not exist.`);
    }

    return {
        workspace: fernWorkspace,
        absolutePathToPreview,
        group
    };
}

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
}): Promise<void> {
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

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate",
        properties: {
            workspaces: project.apiWorkspaces.map((workspace) => {
                return {
                    name: workspace.workspaceName,
                    group: groupName,
                    generators: workspace.generatorsConfiguration?.groups
                        .filter((group) => (groupName == null ? true : group.groupName === groupName))
                        .map((group) => {
                            return group.generators.map((generator) => {
                                return {
                                    name: generator.name,
                                    version: generator.version,
                                    outputMode: generator.outputMode.type,
                                    config: generator.config
                                };
                            });
                        })
                };
            })
        }
    });

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const fernWorkspaceGetter: (
                    sdkLanguage: generatorsYml.GenerationLanguage | undefined
                ) => Promise<FernWorkspaceMetadata | undefined> = async (
                    sdkLanguage: generatorsYml.GenerationLanguage | undefined
                ) => getFernWorkspace(sdkLanguage, groupName, workspace, context, preview);

                await generateWorkspace({
                    organization: project.config.organization,
                    workspaceGetter: fernWorkspaceGetter,
                    projectConfig: project.config,
                    context,
                    version,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker
                });
            });
        })
    );
}
