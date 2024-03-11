import { TaskContext } from "@fern-api/task-context";
import produce from "immer";
import { GeneratorGroupSchema } from "./schemas/GeneratorGroupSchema";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    GeneratorsConfigurationSchema
} from "./schemas/GeneratorsConfigurationSchema";

export function updateGeneratorGroup({
    generatorsConfiguration,
    groupName = generatorsConfiguration[DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
    update
}: {
    generatorsConfiguration: GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
    update: (draft: GeneratorGroupSchema, groupName: string) => void;
}): GeneratorsConfigurationSchema {
    if (groupName == null) {
        return context.failAndThrow("No group specified.");
    }

    return produce(generatorsConfiguration, (draft) => {
        const groups = (draft.groups ??= {});
        const draftGroup = (groups[groupName] ??= { generators: [] });
        update(draftGroup, groupName);
    });
}
