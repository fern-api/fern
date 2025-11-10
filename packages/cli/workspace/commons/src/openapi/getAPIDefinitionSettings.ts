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
 * Convert settings from generators.yml format to internal APIDefinitionSettings format.
 * This applies all defaults for any settings not explicitly specified.
 *
 * @param settings - The settings from generators.yml (may be undefined or partial)
 * @returns Complete APIDefinitionSettings with all defaults applied
 */
export function getAPIDefinitionSettings(settings?: generatorsYml.APIDefinitionSettings): APIDefinitionSettings {
    const mappedSettings: Partial<OpenAPISettings> = {
        useTitlesAsName: settings?.shouldUseTitleAsName,
        shouldUseUndiscriminatedUnionsWithLiterals: settings?.shouldUseUndiscriminatedUnionsWithLiterals,
        discriminatedUnionV2: settings?.shouldUseUndiscriminatedUnionsWithLiterals,
        shouldUseIdiomaticRequestNames: settings?.shouldUseIdiomaticRequestNames,
        optionalAdditionalProperties: settings?.shouldUseOptionalAdditionalProperties,
        coerceEnumsToLiterals: settings?.coerceEnumsToLiterals,
        objectQueryParameters: settings?.objectQueryParameters,
        respectReadonlySchemas: settings?.respectReadonlySchemas,
        respectNullableSchemas: settings?.respectNullableSchemas,
        onlyIncludeReferencedSchemas: settings?.onlyIncludeReferencedSchemas,
        inlinePathParameters: settings?.inlinePathParameters,
        asyncApiNaming: settings?.asyncApiMessageNaming,
        filter: settings?.filter,
        exampleGeneration: settings?.exampleGeneration,
        defaultFormParameterEncoding: settings?.defaultFormParameterEncoding,
        useBytesForBinaryResponse: settings?.useBytesForBinaryResponse,
        respectForwardCompatibleEnums: settings?.respectForwardCompatibleEnums,
        additionalPropertiesDefaultsTo: settings?.additionalPropertiesDefaultsTo,
        typeDatesAsStrings: settings?.typeDatesAsStrings,
        preserveSingleSchemaOneOf: settings?.preserveSingleSchemaOneOf,
        inlineAllOfSchemas: settings?.inlineAllOfSchemas,
        resolveAliases: settings?.resolveAliases,
        groupMultiApiEnvironments: settings?.groupMultiApiEnvironments,
        wrapReferencesToNullableInOptional: settings?.wrapReferencesToNullableInOptional,
        coerceOptionalSchemasToNullable: settings?.coerceOptionalSchemasToNullable,
        groupEnvironmentsByHost: settings?.groupEnvironmentsByHost
    };

    return getOpenAPISettings({ options: mappedSettings });
}
