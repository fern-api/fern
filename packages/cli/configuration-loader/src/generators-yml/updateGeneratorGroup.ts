import { generatorsYml } from "@fern-api/configuration";
import { CliError, TaskContext } from "@fern-api/task-context";

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
        const availableGroups = Object.keys(generatorsConfiguration.groups ?? {});
        if (availableGroups.length > 0) {
            const message =
                "No group specified. Use the --group option:\n" +
                availableGroups.map((name) => ` › ${name}`).join("\n");
            return context.failAndThrow(message, undefined, { code: CliError.Code.ConfigError });
        }
        return context.failAndThrow("No group specified.", undefined, { code: CliError.Code.ConfigError });
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
