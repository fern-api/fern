import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GeneratorName,
    GeneratorsConfigurationSchema,
    updateGeneratorGroup,
} from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

export function addGenerator({
    generatorName,
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }
    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    return updateGeneratorGroup({
        generatorsConfiguration,
        groupName,
        context,
        update: (group) => {
            if (group.generators.some((generator) => generator.name === normalizedGeneratorName)) {
                context.failAndThrow(`${generatorName} is already installed in group ${groupName}.`);
            }
            group.generators.push({
                name: normalizedGeneratorName,
                ...invocation,
            });
        },
    });
}

function normalizeGeneratorName(generatorName: string): GeneratorName | undefined {
    if (!generatorName.startsWith("fernapi/")) {
        generatorName = `fernapi/${generatorName}`;
    }
    if (isGeneratorName(generatorName)) {
        return generatorName;
    }
    return undefined;
}

function isGeneratorName(generatorName: string): generatorName is GeneratorName {
    return Object.values(GeneratorName).includes(generatorName as GeneratorName);
}
