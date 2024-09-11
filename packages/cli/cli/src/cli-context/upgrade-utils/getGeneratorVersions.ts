import { generatorsYml } from "@fern-api/configuration";
import { Logger } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import { isVersionAhead } from "@fern-api/semver-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/workspace-loader";
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
    groupFilter
}: {
    cliContext: CliContext;
    project: Project;
    generatorFilter?: string;
    groupFilter?: string;
}): Promise<GeneratorVersions> {
    if (apiWorkspaces.length === 1) {
        const versions: SingleApiWorkspaceGeneratorVersions = { type: "singleApi", versions: {} };
        await processGeneratorsYml({
            cliContext,
            apiWorkspaces,
            perGeneratorAction: (_, group, generator) => {
                let groupVersions = versions.versions[group];
                if (groupVersions == null) {
                    groupVersions = {};
                }
                groupVersions[generator.name] = {
                    previousVersion: generator.version,
                    // TODO: get versions here
                    latestVersion: "latest"
                };
            },
            generatorFilter,
            groupFilter
        });
        return versions;
    } else {
        const versions: MultiApiWorkspaceGeneratorVersions = { type: "multiApi", versions: {} };
        await processGeneratorsYml({
            cliContext,
            apiWorkspaces,
            perGeneratorAction: (api, group, generator) => {
                if (api == null) {
                    return;
                }

                let apiVersions = versions.versions[api];
                if (apiVersions == null) {
                    apiVersions = {};
                }
                let groupVersions = apiVersions[group];
                if (groupVersions == null) {
                    groupVersions = {};
                }
                groupVersions[generator.name] = {
                    previousVersion: generator.version,
                    // TODO: get versions here
                    latestVersion: "latest"
                };
            },
            generatorFilter,
            groupFilter
        });
        return versions;
    }
}

async function processGeneratorsYml({
    cliContext,
    apiWorkspaces,
    perGeneratorAction,
    generatorFilter,
    groupFilter
}: {
    cliContext: CliContext;
    apiWorkspaces: (OSSWorkspace | LazyFernWorkspace)[];
    perGeneratorAction: (api: string | undefined, group: string, generator: generatorsYml.GeneratorInvocation) => void;
    generatorFilter?: string;
    groupFilter?: string;
}) {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // If there are no groups in the configuration, skip this workspace
                const generatorsConfiguration = await generatorsYml.loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilepath,
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
                        perGeneratorAction(workspace.workspaceName, group.groupName, generator);
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
    groupFilter
}: {
    project: Project | undefined;
    cliContext: CliContext;
    generatorFilter?: string;
    groupFilter?: string;
}): Promise<FernGeneratorUpgradeInfo[]> {
    const generatorUpgrades: FernGeneratorUpgradeInfo[] = [];
    if (project != null) {
        const latestVersions = await getLatestGeneratorVersions({
            cliContext: cliContext,
            project: project,
            generatorFilter,
            groupFilter
        });

        if (latestVersions.type == "multiApi") {
            for (const [apiName, groups] of Object.entries(latestVersions.versions)) {
                generatorUpgrades.push(...processGeneratorGroups(groups, apiName, cliContext.logger));
            }
        } else {
            generatorUpgrades.push(...processGeneratorGroups(latestVersions.versions, undefined, cliContext.logger));
        }
    }
    return generatorUpgrades;
}
