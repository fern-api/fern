import { BaseGeneratorInvocationSchema, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
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
    return produce(generatorsConfiguration, (draft) => {
        if (draft.draft != null) {
            draft.draft = draft.draft.map((generatorConfig) => maybeUpgradeVersion(generatorConfig, context));
        }
        if (draft.release != null) {
            draft.release = draft.release.map((generatorConfig) => maybeUpgradeVersion(generatorConfig, context));
        }
    });
}

function maybeUpgradeVersion<T extends BaseGeneratorInvocationSchema>(generatorConfig: T, context: TaskContext): T {
    const updatedInvocation = GENERATOR_INVOCATIONS[generatorConfig.name];

    if (updatedInvocation != null) {
        if (isVersionHigher(generatorConfig.version, updatedInvocation.version)) {
            context.logger.info(
                chalk.green(
                    `Upgraded ${generatorConfig.name} from ${generatorConfig.version} to ${updatedInvocation.version}`
                )
            );
            return produce(generatorConfig, (draft) => {
                draft.version = updatedInvocation.version;
            });
        }
    } else {
        context.fail("Unknown generator: " + generatorConfig.name);
    }

    return generatorConfig;
}

/**
 *
 * @returns true if versionB is higher than versionA
 */
function isVersionHigher(versionA: string, versionB: string): boolean {
    return semverDiff(versionA, versionB) != null;
}
