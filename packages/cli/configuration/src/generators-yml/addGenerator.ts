import { TaskContext } from "@fern-api/task-context";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, GeneratorsConfigurationSchema, updateGeneratorGroup } from ".";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";
import { getGeneratorNameOrThrow } from "./getGeneratorName";
import { getLatestGeneratorVersion } from "./getGeneratorVersions";

export async function upgradeGenerator({
    generatorName,
    generatorsConfiguration,
    groupName,
    context
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

    const conf = await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            const latestVersion = await getLatestGeneratorVersion(normalizedGeneratorName, context);
            const genConfig = group.generators.find((generator) => generator.name === normalizedGeneratorName);
            if (genConfig == null) {
                return;
            }
            if (latestVersion != null) {
                group.generators = group.generators.filter((generator) => generator.name !== normalizedGeneratorName);
                group.generators.push({
                    ...genConfig,
                    name: normalizedGeneratorName,
                    version: latestVersion
                });
            }
        }
    });
    return conf;
}

export async function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return await updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: async (group) => {
            if (group.generators.some((generator) => generator.name === normalizedGeneratorName)) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            group.generators.push({
                name: normalizedGeneratorName,
                ...invocation,
                // Fall back to the hardcoded version if a "latest" does not yet exist
                version: (await getLatestGeneratorVersion(normalizedGeneratorName, context)) ?? invocation.version
            });
        }
    });
}
