import { TaskContext } from "@fern-api/task-context";
import { DEFAULT_GROUP_GENERATORS_CONFIG_KEY, GeneratorsConfigurationSchema, updateGeneratorGroup } from ".";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";
import { getGeneratorNameOrThrow } from "./getGeneratorName";
import { getLatestGeneratorVersion } from "./getGeneratorVersions";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";

export interface GeneratorInvocationOverride extends Omit<GeneratorInvocationSchema, "name" | "version"> {
    version?: string;
}

export async function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
    cliVersion,
    invocationOverride
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
    cliVersion: string;
    invocationOverride?: GeneratorInvocationOverride;
}): Promise<GeneratorsConfigurationSchema> {
    const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

    const invocation = invocationOverride ?? GENERATOR_INVOCATIONS[normalizedGeneratorName];
    const versionFallback = GENERATOR_INVOCATIONS[normalizedGeneratorName]?.version;

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
                version:
                    invocation.version ??
                    (await getLatestGeneratorVersion({
                        cliVersion,
                        generatorName: normalizedGeneratorName,
                        context,
                        channel: undefined
                    })) ??
                    versionFallback
            });
        }
    });
}
