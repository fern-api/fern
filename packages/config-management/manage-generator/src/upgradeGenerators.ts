import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import chalk from "chalk";
import produce from "immer";
import semverDiff from "semver-diff";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

export declare namespace upgradeGenerators {
    export interface Return {
        updatedGeneratorsConfiguration: GeneratorsConfigurationSchema;
        didUpgrade: boolean;
    }
}

export function upgradeGenerators({
    generatorsConfiguration,
}: {
    readonly generatorsConfiguration: GeneratorsConfigurationSchema;
}): upgradeGenerators.Return {
    let didUpgrade = false;

    const updatedGenerators = generatorsConfiguration.generators.map((generatorConfig) => {
        const updatedInvocation = GENERATOR_INVOCATIONS[generatorConfig.name];
        if (updatedInvocation != null && versionIsHigher(generatorConfig.version, updatedInvocation.version)) {
            didUpgrade = true;
            console.log(
                chalk.green(
                    `Upgraded ${generatorConfig.name} from ${generatorConfig.version} to ${updatedInvocation.version}`
                )
            );
            return produce(generatorConfig, (draft) => {
                draft.version = updatedInvocation.version;
            });
        }
        return generatorConfig;
    });

    return {
        updatedGeneratorsConfiguration: { generators: updatedGenerators },
        didUpgrade,
    };
}

/**
 *
 * @returns true if versionB is higher than versionA
 */
function versionIsHigher(versionA: string, versionB: string): boolean {
    return semverDiff(versionA, versionB) != null;
}
