import { GeneratorName, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import produce from "immer";
import { GENERATOR_INVOCATIONS } from "./generatorInvocations";

const DEFAULT_GROUP_NAME = "external";

export function addGenerator({
    generatorName,
    generatorsConfiguration,
    context,
}: {
    generatorName: string;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    const normalizedGeneratorName = normalizeGeneratorName(generatorName);
    if (normalizedGeneratorName == null) {
        return context.failAndThrow("Unrecognized generator: " + generatorName);
    }

    const invocation = GENERATOR_INVOCATIONS[normalizedGeneratorName];

    const group = generatorsConfiguration.groups?.[DEFAULT_GROUP_NAME];
    if (group != null && group.generators.some((generator) => generator.name === normalizedGeneratorName)) {
        context.failAndThrow(`${generatorName} is already installed in group ${DEFAULT_GROUP_NAME}.`);
    }

    return produce(generatorsConfiguration, (draft) => {
        const groups = (draft.groups ??= {});
        const draftGroup = (groups[DEFAULT_GROUP_NAME] ??= { generators: [] });
        draftGroup.generators.push({
            name: normalizedGeneratorName,
            ...invocation,
        });
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
