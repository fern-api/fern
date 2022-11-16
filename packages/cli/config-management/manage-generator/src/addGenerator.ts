import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import produce from "immer";
import { getGeneratorInvocationFromSimpleName, SimpleGeneratorName } from "./getGeneratorInvocationFromSimpleName";

const DEFAULT_GROUP_NAME = "external";

export function addGenerator({
    generatorName,
    generatorsConfiguration,
    context,
}: {
    generatorName: SimpleGeneratorName;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
}): GeneratorsConfigurationSchema {
    const invocation = getGeneratorInvocationFromSimpleName({
        simpleName: generatorName,
    });

    const group = generatorsConfiguration.groups?.[DEFAULT_GROUP_NAME];
    if (group != null && group.generators.some((generator) => generator.name === invocation.name)) {
        context.failAndThrow(`${generatorName} is already installed.`);
    }

    return produce(generatorsConfiguration, (draft) => {
        const groups = (draft.groups ??= {});
        const draftGroup = (groups[DEFAULT_GROUP_NAME] ??= { generators: [] });
        draftGroup.generators.push(invocation);
    });
}
