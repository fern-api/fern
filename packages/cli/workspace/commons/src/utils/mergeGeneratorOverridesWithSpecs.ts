import { generatorsYml } from "@fern-api/configuration";

/**
 * Merges generator-level overrides with spec-level overrides.
 * Generator overrides are appended after spec-level overrides for each spec that supports overrides.
 * Supports OpenAPI, AsyncAPI, and OpenRPC specs.
 */
export function mergeGeneratorOverridesWithSpecs(
    specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined,
    generatorOverrides: string | string[] | undefined,
    workspaceSpecs?: generatorsYml.ApiConfigurationV2SpecsSchema
): generatorsYml.ApiConfigurationV2SpecsSchema | undefined {
    // If no generator-level overrides, return the original specs override
    if (generatorOverrides == null) {
        return specsOverride;
    }

    // Normalize generator overrides to array
    const generatorOverridesArray = Array.isArray(generatorOverrides) ? generatorOverrides : [generatorOverrides];

    // Determine which specs to use: specsOverride if provided, otherwise workspaceSpecs
    const targetSpecs = specsOverride ?? workspaceSpecs;

    // If no specs to apply overrides to, we can't apply generator overrides
    if (targetSpecs == null) {
        return undefined;
    }

    // Handle conjure schema case (not an array)
    if (!Array.isArray(targetSpecs)) {
        // Conjure specs don't support overrides
        return targetSpecs;
    }

    // Merge generator overrides into each spec that supports overrides
    return targetSpecs.map((spec) => {
        // Handle OpenAPI specs
        if (generatorsYml.isOpenApiSpecSchema(spec)) {
            const existingOverrides =
                spec.overrides != null ? (Array.isArray(spec.overrides) ? spec.overrides : [spec.overrides]) : [];
            const mergedOverrides = [...existingOverrides, ...generatorOverridesArray];
            return {
                ...spec,
                overrides: mergedOverrides.length > 0 ? mergedOverrides : undefined
            };
        }

        // Handle AsyncAPI specs
        if (generatorsYml.isAsyncApiSpecSchema(spec)) {
            const existingOverrides =
                spec.overrides != null ? (Array.isArray(spec.overrides) ? spec.overrides : [spec.overrides]) : [];
            const mergedOverrides = [...existingOverrides, ...generatorOverridesArray];
            return {
                ...spec,
                overrides: mergedOverrides.length > 0 ? mergedOverrides : undefined
            };
        }

        // Handle OpenRPC specs
        if (generatorsYml.isOpenRpcSpecSchema(spec)) {
            const existingOverrides =
                spec.overrides != null ? (Array.isArray(spec.overrides) ? spec.overrides : [spec.overrides]) : [];
            const mergedOverrides = [...existingOverrides, ...generatorOverridesArray];
            return {
                ...spec,
                overrides: mergedOverrides.length > 0 ? mergedOverrides : undefined
            };
        }

        // For other spec types (e.g., Protobuf), return as-is (they don't support overrides)
        return spec;
    });
}
