import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import produce from "immer";
import semverDiff from "semver-diff";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

export function upgradeGenerators({
    generatorsConfiguration,
    context,
}: {
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    const updatedGenerators = generatorsConfiguration.generators.map((generatorConfig) => {
        const updatedInvocation = GENERATOR_INVOCATIONS[generatorConfig.name];

        if (updatedInvocation != null && isVersionHigher(generatorConfig.version, updatedInvocation.version)) {
            context.logger.info(
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

    return { generators: updatedGenerators };
}

/**
 *
 * @returns true if versionB is higher than versionA
 */
function isVersionHigher(versionA: string, versionB: string): boolean {
    return semverDiff(versionA, versionB) != null;
}
