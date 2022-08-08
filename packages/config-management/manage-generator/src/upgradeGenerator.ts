import { WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import semverDiff from "semver-diff";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

export interface GeneratorUpgradeResult {
    updatedWorkspaceConfiguration: WorkspaceConfigurationSchema;
    upgrades: GeneratorUpgradeInfo[];
}

export interface GeneratorUpgradeInfo {
    name: string;
    previousVersion: string;
    upgradedVersion: string;
}

export function upgradeGeneratorsIfPresent({
    workspaceConfiguration,
}: {
    readonly workspaceConfiguration: WorkspaceConfigurationSchema;
}): GeneratorUpgradeResult {
    const upgrades: GeneratorUpgradeInfo[] = [];
    const updatedGenerators = workspaceConfiguration.generators.map((generatorConfig) => {
        const updatedInvocation = GENERATOR_INVOCATIONS[generatorConfig.name];
        if (updatedInvocation != null && versionIsHigher(generatorConfig.version, updatedInvocation.version)) {
            upgrades.push({
                name: generatorConfig.name,
                previousVersion: generatorConfig.version,
                upgradedVersion: updatedInvocation.version,
            });
            return {
                ...generatorConfig,
                version: updatedInvocation.version,
            };
        }
        return generatorConfig;
    });
    const updatedWorkspaceConfiguration = {
        ...workspaceConfiguration,
        generators: updatedGenerators,
    };
    return {
        updatedWorkspaceConfiguration,
        upgrades,
    };
}

/**
 *
 * @returns true if versionB is higher than versionA
 */
function versionIsHigher(versionA: string, versionB: string): boolean {
    return semverDiff(versionA, versionB) != null;
}
