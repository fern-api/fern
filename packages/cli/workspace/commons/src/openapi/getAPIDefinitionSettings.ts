import { generatorsYml } from "@fern-api/configuration";
import { getParseOptions, type ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { type ConvertOpenAPIOptions, getConvertOptions } from "@fern-api/openapi-ir-to-fern";

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
    const parseDefaults = getParseOptions({});
    const convertDefaults = getConvertOptions({});
    return {
        ...parseDefaults,
        ...convertDefaults
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
    const parseOptions: Partial<ParseOpenAPIOptions> = {
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

    const convertOptions: Partial<ConvertOpenAPIOptions> = {
        objectQueryParameters: settings?.objectQueryParameters,
        respectReadonlySchemas: settings?.respectReadonlySchemas,
        respectNullableSchemas: settings?.respectNullableSchemas,
        onlyIncludeReferencedSchemas: settings?.onlyIncludeReferencedSchemas,
        inlinePathParameters: settings?.inlinePathParameters,
        useBytesForBinaryResponse: settings?.useBytesForBinaryResponse,
        respectForwardCompatibleEnums: settings?.respectForwardCompatibleEnums,
        wrapReferencesToNullableInOptional: settings?.wrapReferencesToNullableInOptional,
        coerceOptionalSchemasToNullable: settings?.coerceOptionalSchemasToNullable,
        groupEnvironmentsByHost: settings?.groupEnvironmentsByHost
    };

    const parseResult = getParseOptions({ options: parseOptions });
    const convertResult = getConvertOptions({ options: convertOptions });

    return {
        ...parseResult,
        ...convertResult
    };
}
