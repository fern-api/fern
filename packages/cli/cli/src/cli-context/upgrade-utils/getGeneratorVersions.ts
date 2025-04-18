import {
    generatorsYml,
    getGeneratorNameOrThrow,
    getLatestGeneratorVersion,
    loadGeneratorsConfiguration
} from "@fern-api/configuration-loader";
import { Logger } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import { isVersionAhead } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

import { ReleaseType } from "@fern-fern/generators-sdk/api/resources/generators";

import { CliContext } from "../CliContext";

export interface FernGeneratorUpgradeInfo {
    generatorName: string;
    generatorGroup: string;
    apiName: string | undefined;
    isUpgradeAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
}

interface VersionDiff {
    previousVersion: string;
    latestVersion: string;
}

// This type is effectively a map of api name > group name > generator name > version diff
export type GroupedGeneratorVersions = Record<string, Record<string, VersionDiff>>;
interface SingleApiWorkspaceGeneratorVersions {
    type: "singleApi";
    versions: GroupedGeneratorVersions;
}

interface MultiApiWorkspaceGeneratorVersions {
    type: "multiApi";
    versions: Record<string, GroupedGeneratorVersions>;
}
export type GeneratorVersions = MultiApiWorkspaceGeneratorVersions | SingleApiWorkspaceGeneratorVersions;

export async function getLatestGeneratorVersions({
    cliContext,
    project: { apiWorkspaces },
    generatorFilter,
    groupFilter,
    channel,
    includeMajor
}: {
    cliContext: CliContext;
    project: Project;
    generatorFilter?: string;
    groupFilter?: string;
    channel?: ReleaseType;
    includeMajor?: boolean;
}): Promise<GeneratorVersions> {
    if (apiWorkspaces.length === 1) {
        const versions: SingleApiWorkspaceGeneratorVersions = { type: "singleApi", versions: {} };
        await processGeneratorsYml({
            cliContext,
            apiWorkspaces,
            perGeneratorAction: async (_, group, generator, context) => {
                if (versions.versions[group] == null) {
                    versions.versions[group] = {};
                }

                const normalizedGeneratorName = getGeneratorNameOrThrow(generator.name, context);

                const latestVersion = await getLatestGeneratorVersion({
                    generatorName: normalizedGeneratorName,
                    cliVersion: cliContext.environment.packageVersion,
                    currentGeneratorVersion: generator.version,
                    channel,
                    includeMajor,
                    context
                });

                if (latestVersion != null) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    versions.versions[group]![generator.name] = {
                        previousVersion: generator.version,
                        latestVersion
                    };
                }
            },
            generatorFilter,
            groupFilter
        });
        return versions;
    }

    const versions: MultiApiWorkspaceGeneratorVersions = { type: "multiApi", versions: {} };
    await processGeneratorsYml({
        cliContext,
        apiWorkspaces,
        perGeneratorAction: async (api, group, generator, context) => {
            if (api == null) {
                return;
            }

            if (versions.versions[api] == null) {
                versions.versions[api] = {};
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (versions.versions[api]![group] == null) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                versions.versions[api]![group] = {};
            }

            const normalizedGeneratorName = getGeneratorNameOrThrow(generator.name, context);
            const latestVersion = await getLatestGeneratorVersion({
                generatorName: normalizedGeneratorName,
                cliVersion: cliContext.environment.packageVersion,
                currentGeneratorVersion: generator.version,
                channel,
                includeMajor,
                context
            });

            if (latestVersion != null) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                versions.versions[api]![group]![generator.name] = {
                    previousVersion: generator.version,
                    latestVersion
                };
            }
        },
        generatorFilter,
        groupFilter
    });
    return versions;
}

async function processGeneratorsYml({
    cliContext,
    apiWorkspaces,
    perGeneratorAction,
    generatorFilter,
    groupFilter
}: {
    cliContext: CliContext;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    perGeneratorAction: (
        api: string | undefined,
        group: string,
        generator: generatorsYml.GeneratorInvocation,
        context: TaskContext
    ) => Promise<void>;
    generatorFilter?: string;
    groupFilter?: string;
}) {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // If there are no groups in the configuration, skip this workspace
                const generatorsConfiguration = await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context
                });
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    return;
                }

                for (const group of generatorsConfiguration.groups) {
                    if (groupFilter != null && group.groupName !== groupFilter) {
                        continue;
                    }
                    // Log version of generator to stdout
                    for (const generator of group.generators) {
                        if (generatorFilter != null && generator.name !== generatorFilter) {
                            continue;
                        }
                        await perGeneratorAction(workspace.workspaceName, group.groupName, generator, context);
                    }
                }
            });
        })
    );
}

export function processGeneratorGroups(
    groups: GroupedGeneratorVersions,
    maybeApiName: string | undefined,
    logger: Logger
): FernGeneratorUpgradeInfo[] {
    const upgradeInfo: FernGeneratorUpgradeInfo[] = [];
    for (const [groupName, group] of Object.entries(groups)) {
        for (const [generatorName, generatorVersions] of Object.entries(group)) {
            logger.debug(`Checking if ${generatorName} in group ${groupName} has an upgrade available...`);
            const isUpgradeAvailable = isVersionAhead(
                generatorVersions.latestVersion,
                generatorVersions.previousVersion
            );

            logger.debug(
                `Latest version: ${generatorVersions.latestVersion}. ` +
                    (isUpgradeAvailable ? "Upgrade available." : "No upgrade available.")
            );

            upgradeInfo.push({
                generatorName,
                generatorGroup: groupName,
                apiName: maybeApiName,
                isUpgradeAvailable,
                currentVersion: generatorVersions.previousVersion,
                latestVersion: generatorVersions.latestVersion
            });
        }
    }
    return upgradeInfo;
}

export async function getProjectGeneratorUpgrades({
    project,
    cliContext,
    generatorFilter,
    groupFilter,
    channel,
    includeMajor
}: {
    project: Project | undefined;
    cliContext: CliContext;
    generatorFilter?: string;
    groupFilter?: string;
    channel?: ReleaseType;
    includeMajor?: boolean;
}): Promise<FernGeneratorUpgradeInfo[]> {
    const generatorUpgrades: FernGeneratorUpgradeInfo[] = [];
    if (project != null) {
        const latestVersions = await getLatestGeneratorVersions({
            cliContext,
            project,
            generatorFilter,
            groupFilter,
            channel,
            includeMajor
        });

        if (latestVersions.type === "multiApi") {
            for (const [apiName, groups] of Object.entries(latestVersions.versions)) {
                generatorUpgrades.push(...processGeneratorGroups(groups, apiName, cliContext.logger));
            }
        } else {
            generatorUpgrades.push(...processGeneratorGroups(latestVersions.versions, undefined, cliContext.logger));
        }
    }
    return generatorUpgrades;
}
