import { GeneratorInvocationSchema, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { getMinimumVersionForGenerator } from "@fern-api/ir-migrations";
import { isVersionAhead } from "@fern-api/semver-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import produce from "immer";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

export function upgradeGenerators({
    generatorsConfiguration,
    context,
}: {
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    return produce(generatorsConfiguration, (draft) => {
        if (draft.groups == null) {
            return;
        }
        for (const [groupName, group] of Object.entries(draft.groups)) {
            draft.groups[groupName] = {
                ...group,
                generators: group.generators.map((generatorInvocation) =>
                    maybeUpgradeVersion(generatorInvocation, context)
                ),
            };
        }
    });
}

function maybeUpgradeVersion(
    generatorInvocation: GeneratorInvocationSchema,
    context: TaskContext
): GeneratorInvocationSchema {
    const updatedInvocation = GENERATOR_INVOCATIONS[generatorInvocation.name];

    if (updatedInvocation != null) {
        const minVersion = getMinimumVersionForGenerator({ generatorName: generatorInvocation.name });
        const newVersion =
            minVersion != null
                ? isVersionAhead(minVersion, generatorInvocation.version)
                    ? minVersion
                    : generatorInvocation.version
                : // if no min version, use the hardcoded default version
                  updatedInvocation.version;
        if (isVersionAhead(newVersion, generatorInvocation.version)) {
            context.logger.info(
                chalk.green(`Upgraded ${generatorInvocation.name} from ${generatorInvocation.version} to ${newVersion}`)
            );
            return produce(generatorInvocation, (draft) => {
                draft.version = newVersion;
            });
        }
    } else {
        return generatorInvocation;
    }

    return generatorInvocation;
}
