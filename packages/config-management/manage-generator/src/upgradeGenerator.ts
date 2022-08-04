import { WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import { getGeneratorInvocationsByName } from "./generatorInvocations";

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
    const generatorInvocationsByName = getGeneratorInvocationsByName();
    const upgrades: GeneratorUpgradeInfo[] = [];
    const updatedGenerators = workspaceConfiguration.generators.map((generatorConfig) => {
        const updatedInvocation = generatorInvocationsByName[generatorConfig.name];
        if (updatedInvocation != null && updatedInvocation.version !== generatorConfig.version) {
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
