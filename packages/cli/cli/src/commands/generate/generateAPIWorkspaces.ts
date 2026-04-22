import { createOrganizationIfDoesNotExist, FernToken } from "@fern-api/auth";
import { generatorsYml } from "@fern-api/configuration-loader";
import { ContainerRunner, Values } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { Project } from "@fern-api/project-loader";
import type { AutomationRunOptions } from "@fern-api/remote-workspace-runner";
import { CliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext.js";
import { PREVIEW_DIRECTORY } from "../../constants.js";
import { checkOutputDirectory } from "./checkOutputDirectory.js";
import { filterGenerators } from "./filterGenerators.js";
import { generateWorkspace } from "./generateAPIWorkspace.js";
import { resolvePosthogCommandLabel } from "./resolvePosthogCommandLabel.js";
import { shouldPreflightGenerator } from "./shouldPreflightGenerator.js";

export const GenerationMode = {
    PullRequest: "pull-request"
} as const;

export type GenerationMode = Values<typeof GenerationMode>;

export async function generateAPIWorkspaces({
    project,
    cliContext,
    version,
    groupName,
    generatorName,
    generatorIndex,
    shouldLogS3Url,
    keepDocker,
    useLocalDocker,
    preview,
    mode,
    force,
    runner,
    inspect,
    lfsOverride,
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    outputDir,
    noReplay,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    automation
}: {
    project: Project;
    cliContext: CliContext;
    version: string | undefined;
    groupName: string | undefined;
    generatorName: string | undefined;
    /** Index-based generator targeting (0-based). Used by `fern automations generate --generator 0`. */
    generatorIndex: number | undefined;
    shouldLogS3Url: boolean;
    useLocalDocker: boolean;
    keepDocker: boolean;
    preview: boolean;
    mode: GenerationMode | undefined;
    force: boolean;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    lfsOverride: string | undefined;
    fernignorePath: string | undefined;
    skipFernignore: boolean;
    dynamicIrOnly: boolean;
    outputDir: string | undefined;
    noReplay: boolean;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
    skipIfNoDiff?: boolean;
    /**
     * When provided, this call runs in fan-out automation mode (see {@link AutomationRunOptions}).
     */
    automation?: AutomationRunOptions;
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

    await confirmOutputDirectoriesForEligibleGenerators({
        project,
        groupName,
        generatorName,
        generatorIndex,
        automation,
        cliContext,
        force
    });

    cliContext.instrumentPostHogEvent({
        orgId: project.config.organization,
        command: resolvePosthogCommandLabel(automation),
        properties: {
            workspaces: buildPosthogWorkspaces({ project, groupName, generatorName })
        }
    });

    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const absolutePathToPreview = preview
                    ? outputDir != null
                        ? AbsoluteFilePath.of(resolve(cwd(), outputDir))
                        : join(workspace.absoluteFilePath, RelativeFilePath.of(PREVIEW_DIRECTORY))
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
                    generatorName,
                    generatorIndex,
                    shouldLogS3Url,
                    token,
                    useLocalDocker,
                    keepDocker,
                    absolutePathToPreview,
                    mode,
                    runner,
                    inspect,
                    lfsOverride,
                    fernignorePath,
                    skipFernignore,
                    dynamicIrOnly,
                    noReplay,
                    retryRateLimited,
                    requireEnvVars,
                    automationMode,
                    autoMerge,
                    skipIfNoDiff,
                    automation
                });
            });
        })
    );
}

/**
 * Walks the project's generators and prompts the user to confirm overwriting any local-file-system
 * output directories that already exist. Skips generators that wouldn't run anyway (per
 * {@link shouldPreflightGenerator}) to avoid noise when fanning out in automation mode.
 *
 * Throws via `cliContext.failAndThrow` if the user declines a prompt.
 */
async function confirmOutputDirectoriesForEligibleGenerators({
    project,
    groupName,
    generatorName,
    generatorIndex,
    automation,
    cliContext,
    force
}: {
    project: Project;
    groupName: string | undefined;
    generatorName: string | undefined;
    generatorIndex: number | undefined;
    automation: AutomationRunOptions | undefined;
    cliContext: CliContext;
    force: boolean;
}): Promise<void> {
    for (const workspace of project.apiWorkspaces) {
        const resolvedGroupNames = expandGroupFilter(groupName, workspace.generatorsConfiguration);
        const rootAutorelease = workspace.generatorsConfiguration?.rawConfiguration.autorelease;
        const groupsInScope =
            workspace.generatorsConfiguration?.groups.filter(
                (group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName)
            ) ?? [];
        for (const group of groupsInScope) {
            const filterResult = filterGenerators({
                generators: group.generators,
                generatorIndex,
                generatorName,
                groupName: group.groupName
            });
            if (!filterResult.ok) {
                continue;
            }
            for (const generator of filterResult.generators) {
                if (!shouldPreflightGenerator({ generator, rootAutorelease, automation })) {
                    continue;
                }
                const { shouldProceed } = await checkOutputDirectory(
                    generator.absolutePathToLocalOutput,
                    cliContext,
                    force
                );
                if (!shouldProceed) {
                    cliContext.failAndThrow("Generation cancelled", undefined, { code: CliError.Code.ConfigError });
                }
            }
        }
    }
}

/** Builds the `workspaces` array for the posthog event, honoring `--group` / `--generator` filters. */
function buildPosthogWorkspaces({
    project,
    groupName,
    generatorName
}: {
    project: Project;
    groupName: string | undefined;
    generatorName: string | undefined;
}) {
    return project.apiWorkspaces.map((workspace) => {
        const resolvedGroupNames = expandGroupFilter(groupName, workspace.generatorsConfiguration);
        return {
            name: workspace.workspaceName,
            group: groupName,
            generators: workspace.generatorsConfiguration?.groups
                .filter((group) => resolvedGroupNames == null || resolvedGroupNames.includes(group.groupName))
                .map((group) =>
                    group.generators
                        .filter((generator) => generatorName == null || generator.name === generatorName)
                        .map((generator) => ({
                            name: generator.name,
                            version: generator.version,
                            outputMode: generator.outputMode.type,
                            config: generator.config
                        }))
                )
        };
    });
}

/**
 * Expands the caller's `--group` filter into a set of concrete group names.
 *
 * Returns null when no filter was supplied (meaning "match every group"), an alias's target
 * list when the name is an alias, or `[groupName]` otherwise. Used only to pre-filter groups
 * for the checkOutputDirectory pre-flight and posthog telemetry — the authoritative group
 * resolution for generation lives in `resolveGroupNamesForGeneration`.
 */
function expandGroupFilter(
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
