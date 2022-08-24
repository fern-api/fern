import { GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import produce from "immer";
import { getGeneratorInvocationFromSimpleName, SimpleGeneratorName } from "./getGeneratorInvocationFromSimpleName";

export function addGenerator({
    generatorName,
    generatorsConfiguration,
    context,
}: {
    generatorName: SimpleGeneratorName;
    generatorsConfiguration: GeneratorsConfigurationSchema;
    context: TaskContext;
}): TASK_FAILURE | GeneratorsConfigurationSchema {
    const invocation = getGeneratorInvocationFromSimpleName({
        simpleName: generatorName,
    });

    if (
        generatorsConfiguration.draft != null &&
        generatorsConfiguration.draft.some((generator) => generator.name === invocation.name)
    ) {
        context.fail(`${generatorName} is already installed.`);
        return TASK_FAILURE;
    }

    return produce(generatorsConfiguration, (draft) => {
        const draftGenerators = (draft.draft ??= []);
        draftGenerators.push(invocation);
    });
}
