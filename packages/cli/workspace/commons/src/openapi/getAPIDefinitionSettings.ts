import { generatorsYml } from "@fern-api/configuration";
import { DEFAULT_PARSE_OPENAPI_SETTINGS, ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { ConvertOpenAPIOptions, DEFAULT_CONVERT_OPENAPI_OPTIONS } from "@fern-api/openapi-ir-to-fern";

/**
 * Combined settings for OpenAPI/AsyncAPI parsing and conversion.
 * This represents the complete set of settings needed for processing API definitions.
 */
export interface APIDefinitionSettings extends ParseOpenAPIOptions, ConvertOpenAPIOptions {}

/**
 * Get the default settings for API definition processing.
 * This is the single source of truth for all default values.
 */
export function getAPIDefinitionSettingsDefaults(): APIDefinitionSettings {
    return {
        ...DEFAULT_PARSE_OPENAPI_SETTINGS,
        ...DEFAULT_CONVERT_OPENAPI_OPTIONS
    };
}

/**
 * Convert settings from generators.yml format to internal APIDefinitionSettings format.
 * This applies all defaults for any settings not explicitly specified.
 *
 * @param settings - The settings from generators.yml (may be undefined or partial)
 * @returns Complete APIDefinitionSettings with all defaults applied
 */
export function getAPIDefinitionSettings(settings?: generatorsYml.APIDefinitionSettings): APIDefinitionSettings {
    const defaults = getAPIDefinitionSettingsDefaults();

    return {
        disableExamples: defaults.disableExamples,
        discriminatedUnionV2: settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? defaults.discriminatedUnionV2,
        useTitlesAsName: settings?.shouldUseTitleAsName ?? defaults.useTitlesAsName,
        audiences: defaults.audiences,
        optionalAdditionalProperties:
            settings?.shouldUseOptionalAdditionalProperties ?? defaults.optionalAdditionalProperties,
        coerceEnumsToLiterals: settings?.coerceEnumsToLiterals ?? defaults.coerceEnumsToLiterals,
        respectReadonlySchemas: settings?.respectReadonlySchemas ?? defaults.respectReadonlySchemas,
        respectNullableSchemas: settings?.respectNullableSchemas ?? defaults.respectNullableSchemas,
        onlyIncludeReferencedSchemas: settings?.onlyIncludeReferencedSchemas ?? defaults.onlyIncludeReferencedSchemas,
        inlinePathParameters: settings?.inlinePathParameters ?? defaults.inlinePathParameters,
        preserveSchemaIds: defaults.preserveSchemaIds,
        objectQueryParameters: settings?.objectQueryParameters ?? defaults.objectQueryParameters,
        shouldUseUndiscriminatedUnionsWithLiterals:
            settings?.shouldUseUndiscriminatedUnionsWithLiterals ?? defaults.shouldUseUndiscriminatedUnionsWithLiterals,
        shouldUseIdiomaticRequestNames:
            settings?.shouldUseIdiomaticRequestNames ?? defaults.shouldUseIdiomaticRequestNames,
        defaultFormParameterEncoding: settings?.defaultFormParameterEncoding ?? defaults.defaultFormParameterEncoding,
        useBytesForBinaryResponse: settings?.useBytesForBinaryResponse ?? defaults.useBytesForBinaryResponse,
        respectForwardCompatibleEnums:
            settings?.respectForwardCompatibleEnums ?? defaults.respectForwardCompatibleEnums,
        inlineAllOfSchemas: settings?.inlineAllOfSchemas ?? defaults.inlineAllOfSchemas,
        resolveAliases: settings?.resolveAliases ?? defaults.resolveAliases,
        filter: settings?.filter ?? defaults.filter,
        asyncApiNaming: settings?.asyncApiMessageNaming ?? defaults.asyncApiNaming,
        exampleGeneration: settings?.exampleGeneration ?? defaults.exampleGeneration,
        additionalPropertiesDefaultsTo:
            settings?.additionalPropertiesDefaultsTo ?? defaults.additionalPropertiesDefaultsTo,
        typeDatesAsStrings: settings?.typeDatesAsStrings ?? defaults.typeDatesAsStrings,
        preserveSingleSchemaOneOf: settings?.preserveSingleSchemaOneOf ?? defaults.preserveSingleSchemaOneOf,
        groupMultiApiEnvironments: settings?.groupMultiApiEnvironments ?? defaults.groupMultiApiEnvironments,
        groupEnvironmentsByHost: settings?.groupEnvironmentsByHost ?? defaults.groupEnvironmentsByHost,
        wrapReferencesToNullableInOptional:
            settings?.wrapReferencesToNullableInOptional ?? defaults.wrapReferencesToNullableInOptional,
        coerceOptionalSchemasToNullable:
            settings?.coerceOptionalSchemasToNullable ?? defaults.coerceOptionalSchemasToNullable,

        enableUniqueErrorsPerEndpoint: defaults.enableUniqueErrorsPerEndpoint,
        detectGlobalHeaders: defaults.detectGlobalHeaders
    };
}
