import { generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";

export async function updateGeneratorGroup({
    generatorsConfiguration,
    groupName = generatorsConfiguration[generatorsYml.DEFAULT_GROUP_GENERATORS_CONFIG_KEY],
    context,
    update
}: {
    generatorsConfiguration: generatorsYml.GeneratorsConfigurationSchema;
    groupName: string | undefined;
    context: TaskContext;
    update: (draft: generatorsYml.GeneratorGroupSchema, groupName: string) => Promise<void>;
}): Promise<generatorsYml.GeneratorsConfigurationSchema> {
    if (groupName == null) {
        return context.failAndThrow("No group specified.");
    }
    const groups = (generatorsConfiguration.groups ??= {});

    const group = groups[groupName];
    if (group == null) {
        const draftGroup = (groups[groupName] ??= { generators: [] });
        await update(draftGroup, groupName);
    } else {
        await update(group, groupName);
    }
    return generatorsConfiguration;
}
