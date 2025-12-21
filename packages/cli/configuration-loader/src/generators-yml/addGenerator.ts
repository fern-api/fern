import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

import { GENERATOR_INVOCATIONS } from "./generatorInvocations";
import {
    addDefaultDockerOrgIfNotPresent,
    getGeneratorNameOrThrow,
    removeDefaultDockerOrgIfPresent
} from "./getGeneratorName";
import { getLatestGeneratorVersion } from "./getGeneratorVersions";
import { updateGeneratorGroup } from "./updateGeneratorGroup";

export async function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
    cliVersion
}: {
    generatorName: string;
    generatorsConfiguration: generatorsYml.GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
    cliVersion: string;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    // Normalize the generator name for lookups (adds fernapi/ if not present)
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);
    // Use shorthand name (without fernapi/) for writing to config
    const shorthandGeneratorName = removeDefaultDockerOrgIfPresent(normalizedGeneratorName);

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            // Check for duplicates using normalized name (handles both shorthand and full names in existing config)
            if (
                group.generators.some(
                    (generator) => addDefaultDockerOrgIfNotPresent(generator.name) === normalizedGeneratorName
                )
            ) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            group.generators.push({
                name: shorthandGeneratorName,
                ...invocation,
                // Fall back to the hardcoded version if a "latest" does not yet exist
                version:
                    (await getLatestGeneratorVersion({
                        cliVersion,
                        generatorName: normalizedGeneratorName,
                        context,
                        channel: undefined
                    })) ?? invocation.version
            });
        }
    });
}
