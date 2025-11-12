import { generatorsYml, mergeSettings, parseBaseApiDefinitionSettingsSchema } from "@fern-api/configuration-loader";

/**
 * Applies generator-specific settings to API definitions.
 * Generator settings have the highest priority in the hierarchy: generator > spec > root.
 *
 * @param definitions - API definitions with root + spec merged settings
 * @param generatorInvocation - Generator invocation with optional generator-specific settings
 * @returns New API definitions with generator settings merged in
 */
export function applyGeneratorSettingsToDefinitions(
    definitions: generatorsYml.APIDefinitionLocation[],
    generatorInvocation: generatorsYml.GeneratorInvocation
): generatorsYml.APIDefinitionLocation[] {
    // If no generator settings, return definitions as-is
    if (generatorInvocation.settings == null) {
        return definitions;
    }

    // Parse generator settings from schema format
    const generatorSettings = parseBaseApiDefinitionSettingsSchema(generatorInvocation.settings);

    // Merge generator settings with each definition's settings
    // If definition has no settings, mergeSettings handles undefined base gracefully
    return definitions.map((definition) => ({
        ...definition,
        settings: mergeSettings(definition.settings ?? ({} as generatorsYml.APIDefinitionSettings), generatorSettings)
    }));
}
