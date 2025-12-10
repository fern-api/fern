import { createOrganizationIfDoesNotExist, FernToken } from "@fern-api/auth";
import { generatorsYml } from "@fern-api/configuration-loader";
import { ContainerRunner, Values } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";
import { PREVIEW_DIRECTORY } from "../../constants";
import { checkOutputDirectory } from "./checkOutputDirectory";
import { generateWorkspace } from "./generateAPIWorkspace";

export const GenerationMode = {
    PullRequest: "pull-request"
} as const;

export type GenerationMode = Values<typeof GenerationMode>;

export type PullRequestState = "draft" | "ready";

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview,
    mode,
    prState,
    force,
    runner,
    inspect,
    lfsOverride,
    fernignorePath
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
    mode: GenerationMode | undefined;
    prState: PullRequestState | undefined;
    force: boolean;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    lfsOverride: string | undefined;
    fernignorePath: string | undefined;
}): Promise<void> {
    let token: FernToken | undefined = undefined;

    if (!useLocalDocker) {
        const currentToken = await cliContext.runTask(async (context) => {
            return askToLogin(context);
        });
        if (currentToken.type === "user") {
            await cliContext.runTask(async (context) => {
                await createOrganizationIfDoesNotExist({
                    organization: project.config.organization,
                    token: currentToken,
                    context
                });
            });
        }
        token = currentToken;
    }

    for (const workspace of project.apiWorkspaces) {
        const resolvedGroupNames = resolveGroupNamesForWorkspace(groupName, workspace.generatorsConfiguration);
        for (const generator of workspace.generatorsConfiguration?.groups
            .filter((group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName))
            .flatMap((group) => group.generators) ?? []) {
            const { shouldProceed } = await checkOutputDirectory(
                generator.absolutePathToLocalOutput,
                cliContext,
                force
            );
            if (!shouldProceed) {
                cliContext.failAndThrow("Generation cancelled");
            }
        }
    }

    await cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: "fern generate",
        properties: {
            workspaces: project.apiWorkspaces.map((workspace) => {
                const resolvedGroupNames = resolveGroupNamesForWorkspace(groupName, workspace.generatorsConfiguration);
                return {
                    name: workspace.workspaceName,
                    group: groupName,
                    generators: workspace.generatorsConfiguration?.groups
                        .filter((group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName))
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
                const absolutePathToPreview = preview
                    ? join(workspace.absoluteFilePath, RelativeFilePath.of(PREVIEW_DIRECTORY))
                    : undefined;

                if (absolutePathToPreview != null) {
                    context.logger.info(`Writing preview to ${absolutePathToPreview}`);
                }

                await generateWorkspace({
                    organization: project.config.organization,
                    workspace,
                    projectConfig: project.config,
                    context,
                    version,
                    groupName,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker,
                    absolutePathToPreview,
                    mode,
                    prState,
                    runner,
                    inspect,
                    lfsOverride,
                    fernignorePath
                });
            });
        })
    );
}

/**
 * Resolves a group name to a list of group names, handling aliases.
 * Returns null if no group name is specified (meaning all groups should be included).
 * Returns the resolved list of group names if a group name or alias is specified.
 */
function resolveGroupNamesForWorkspace(
    groupName: string | undefined,
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined
): string[] | null {
    if (groupName == null) {
        return null; // No filter - include all groups
    }

    if (generatorsConfiguration == null) {
        return [groupName]; // No configuration - just use the group name as-is
    }

    // Check if it's an alias
    const aliasGroups = generatorsConfiguration.groupAliases[groupName];
    if (aliasGroups != null) {
        return aliasGroups;
    }

    // Not an alias - return as single group
    return [groupName];
}
