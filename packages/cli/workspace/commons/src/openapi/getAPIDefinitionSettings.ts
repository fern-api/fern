import { generatorsYml } from "@fern-api/configuration";
import { type ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { type ConvertOpenAPIOptions } from "@fern-api/openapi-ir-to-fern";

import { getOpenAPISettings, type OpenAPISettings } from "./OpenAPISettings";

/**
 * Combined settings for OpenAPI/AsyncAPI parsing and conversion.
 * This represents the complete set of settings needed for processing API definitions.
 */
export interface APIDefinitionSettings extends ParseOpenAPIOptions, ConvertOpenAPIOptions {}

/**
 * Get the default settings for API definition processing.
 * This is the single source of truth for all default values.
 * Uses the authoritative defaults from the importer packages.
 */
export function getAPIDefinitionSettingsDefaults(): APIDefinitionSettings {
    return getOpenAPISettings();
}

/**
 * Mapping table from generators.yml field names to internal OpenAPISettings field names.
 * This eliminates the need for manual field-by-field mapping.
 * Some fields map to multiple internal fields (e.g., shouldUseUndiscriminatedUnionsWithLiterals).
 *
 * Note: Only includes fields that map to OpenAPISettings. Fields like pathParameterOrder
 * that don't have corresponding OpenAPISettings properties are automatically excluded.
 */
type MappingValue = keyof OpenAPISettings | readonly (keyof OpenAPISettings)[];
type MappableFields = {
    [K in keyof generatorsYml.APIDefinitionSettings]: MappingValue;
};
const FIELD_MAPPINGS: Partial<MappableFields> = {
    shouldUseTitleAsName: "useTitlesAsName",
    shouldUseUndiscriminatedUnionsWithLiterals: ["shouldUseUndiscriminatedUnionsWithLiterals", "discriminatedUnionV2"],
    shouldUseIdiomaticRequestNames: "shouldUseIdiomaticRequestNames",
    asyncApiMessageNaming: "asyncApiNaming",
    shouldUseOptionalAdditionalProperties: "optionalAdditionalProperties",
    coerceEnumsToLiterals: "coerceEnumsToLiterals",
    objectQueryParameters: "objectQueryParameters",
    respectReadonlySchemas: "respectReadonlySchemas",
    respectNullableSchemas: "respectNullableSchemas",
    onlyIncludeReferencedSchemas: "onlyIncludeReferencedSchemas",
    inlinePathParameters: "inlinePathParameters",
    useBytesForBinaryResponse: "useBytesForBinaryResponse",
    respectForwardCompatibleEnums: "respectForwardCompatibleEnums",
    filter: "filter",
    defaultFormParameterEncoding: "defaultFormParameterEncoding",
    exampleGeneration: "exampleGeneration",
    additionalPropertiesDefaultsTo: "additionalPropertiesDefaultsTo",
    typeDatesAsStrings: "typeDatesAsStrings",
    preserveSingleSchemaOneOf: "preserveSingleSchemaOneOf",
    inlineAllOfSchemas: "inlineAllOfSchemas",
    resolveAliases: "resolveAliases",
    groupMultiApiEnvironments: "groupMultiApiEnvironments",
    groupEnvironmentsByHost: "groupEnvironmentsByHost",
    wrapReferencesToNullableInOptional: "wrapReferencesToNullableInOptional",
    coerceOptionalSchemasToNullable: "coerceOptionalSchemasToNullable",
    removeDiscriminantsFromSchemas: "removeDiscriminantsFromSchemas"
};

function setIfDefined<K extends keyof OpenAPISettings>(
    target: Partial<OpenAPISettings>,
    key: K,
    value: OpenAPISettings[K] | undefined
): void {
    if (value !== undefined) {
        target[key] = value;
    }
}

/**
 * Convert settings from generators.yml format to internal APIDefinitionSettings format.
 * This applies all defaults for any settings not explicitly specified.
 *
 * @param settings - The settings from generators.yml (may be undefined or partial)
 * @returns Complete APIDefinitionSettings with all defaults applied
 */
export function getAPIDefinitionSettings(settings?: generatorsYml.APIDefinitionSettings): APIDefinitionSettings {
    const mappedSettings: Partial<OpenAPISettings> = {};

    if (settings != null) {
        for (const [yamlKey, internalKey] of Object.entries(FIELD_MAPPINGS) as Array<
            [keyof generatorsYml.APIDefinitionSettings, MappingValue]
        >) {
            const value = settings[yamlKey];
            const targets = Array.isArray(internalKey) ? internalKey : [internalKey];
            for (const target of targets) {
                setIfDefined(
                    mappedSettings,
                    target as keyof OpenAPISettings,
                    value as unknown as OpenAPISettings[keyof OpenAPISettings]
                );
            }
        }
    }

    return getOpenAPISettings({ options: mappedSettings });
}
