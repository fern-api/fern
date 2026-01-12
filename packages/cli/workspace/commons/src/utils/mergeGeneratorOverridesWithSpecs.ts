import { generatorsYml } from "@fern-api/configuration";

/**
 * Merges generator-level overrides with spec-level overrides.
 * Generator overrides are appended after spec-level overrides for each OpenAPI spec.
 */
export function mergeGeneratorOverridesWithSpecs(
    specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined,
    generatorOverrides: string | string[] | undefined
): generatorsYml.ApiConfigurationV2SpecsSchema | undefined {
    // If no generator-level overrides, return the original specs override
    if (generatorOverrides == null) {
        return specsOverride;
    }

    // Normalize generator overrides to array
    const generatorOverridesArray = Array.isArray(generatorOverrides) ? generatorOverrides : [generatorOverrides];

    // If no specs override, we can't apply generator overrides
    // (they need to be applied to specific specs)
    if (specsOverride == null) {
        return undefined;
    }

    // Handle conjure schema case (not an array)
    if (!Array.isArray(specsOverride)) {
        // Conjure specs don't support overrides
        return specsOverride;
    }

    // Merge generator overrides into each spec
    return specsOverride.map((spec) => {
        if (generatorsYml.isOpenApiSpecSchema(spec)) {
            // Get existing overrides as array
            const existingOverrides =
                spec.overrides != null ? (Array.isArray(spec.overrides) ? spec.overrides : [spec.overrides]) : [];

            // Append generator overrides
            const mergedOverrides = [...existingOverrides, ...generatorOverridesArray];

            return {
                ...spec,
                overrides: mergedOverrides.length > 0 ? mergedOverrides : undefined
            };
        }
        // For non-OpenAPI specs, return as-is (they don't support overrides)
        return spec;
    });
}
