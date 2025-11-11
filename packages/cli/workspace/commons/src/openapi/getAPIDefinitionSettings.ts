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
 */
const FIELD_MAPPINGS: Record<keyof generatorsYml.APIDefinitionSettings, keyof OpenAPISettings | "SPECIAL"> = {
    shouldUseTitleAsName: "useTitlesAsName",
    shouldUseUndiscriminatedUnionsWithLiterals: "SPECIAL", // Maps to both shouldUseUndiscriminatedUnionsWithLiterals and discriminatedUnionV2
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
            [keyof generatorsYml.APIDefinitionSettings, keyof OpenAPISettings | "SPECIAL"]
        >) {
            const value = settings[yamlKey];
            if (value !== undefined) {
                if (internalKey === "SPECIAL") {
                    if (yamlKey === "shouldUseUndiscriminatedUnionsWithLiterals") {
                        mappedSettings.shouldUseUndiscriminatedUnionsWithLiterals = value as boolean;
                        mappedSettings.discriminatedUnionV2 = value as boolean;
                    }
                } else {
                    mappedSettings[internalKey] = value as OpenAPISettings[typeof internalKey];
                }
            }
        }
    }

    return getOpenAPISettings({ options: mappedSettings });
}
