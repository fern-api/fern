import { generatorsYml } from "@fern-api/configuration";

export interface ParseOpenAPIOptions {
    /* Whether or not to disable OpenAPI example generation */
    disableExamples: boolean;
    /*
     * Parses discriminated unions as undiscriminated unions with literals.
     * This is more idiomatic in Python, TypeScript (duck typed languages).
     */
    discriminatedUnionV2: boolean;
    /* Whether or not to use the schema title as a name */
    useTitlesAsName: boolean;
    /* The audiences that the OpenAPI must be filtered down into */
    audiences: string[] | undefined;
    /* Whether or not to make additional property values optional */
    optionalAdditionalProperties: boolean;
    /* Whether or not to coerce enums as literals */
    coerceEnumsToLiterals: boolean;
    /* Whether or not to respect readonly properties in schemas */
    respectReadonlySchemas: boolean;
    /* Whether or not to respect nullable properties in schemas */
    respectNullableSchemas: boolean;
    /* Whether or not to only include endpoint referenced schemas */
    onlyIncludeReferencedSchemas: boolean;
    /* Whether or not to include path parameters in the in-lined request */
    inlinePathParameters: boolean;
    /* Whether or not to preserve original schema Ids in the IR */
    preserveSchemaIds: boolean;
    /* Whether or not to parse object query parameters. */
    objectQueryParameters: boolean;
    /* Whether or not to use undiscriminated unions with literals. */
    shouldUseUndiscriminatedUnionsWithLiterals: boolean;
    /* Whether or not to use idiomatic request names for endpoints. */
    shouldUseIdiomaticRequestNames: boolean;
    /* What the default encoding should be for form data parameters. */
    defaultFormParameterEncoding: "form" | "json" | undefined;
    /* Whether or not to use the `bytes` type for binary responses. */
    useBytesForBinaryResponse: boolean;
    /* Whether or not to respect forward compatible enums in OpenAPI specifications. */
    respectForwardCompatibleEnums: boolean;

    /* The filter to apply to the OpenAPI document. */
    filter: generatorsYml.OpenApiFilterSchema | undefined;

    // For now, we include an AsyncAPI-specific option here, but this is better
    // handled with a discriminated union.
    asyncApiNaming: "v1" | "v2";

    exampleGeneration: generatorsYml.OpenApiExampleGenerationSchema | undefined;

    /**
     * Configure what `additionalProperties` should default to when not explicitly defined on a schema. Defaults to `false`.
     */
    additionalPropertiesDefaultsTo: boolean;

    /**
     * If true, convert strings with format date to strings.
     * If false, convert strings with format date to dates.
     */
    typeDatesAsStrings: boolean;

    /**
     * If true, preserve the oneOf structure when there is only one schema in the oneOf array.
     */
    preserveSingleSchemaOneOf: boolean;
}

export const DEFAULT_PARSE_OPENAPI_SETTINGS: ParseOpenAPIOptions = {
    disableExamples: false,
    discriminatedUnionV2: false,
    useTitlesAsName: true,
    audiences: undefined,
    optionalAdditionalProperties: true,
    coerceEnumsToLiterals: true,
    respectReadonlySchemas: false,
    respectNullableSchemas: false,
    onlyIncludeReferencedSchemas: false,
    inlinePathParameters: false,
    preserveSchemaIds: false,
    objectQueryParameters: false,
    shouldUseUndiscriminatedUnionsWithLiterals: false,
    shouldUseIdiomaticRequestNames: false,
    filter: undefined,
    asyncApiNaming: "v1",
    exampleGeneration: undefined,
    defaultFormParameterEncoding: "json",
    useBytesForBinaryResponse: false,
    respectForwardCompatibleEnums: false,
    additionalPropertiesDefaultsTo: false,
    typeDatesAsStrings: true,
    preserveSingleSchemaOneOf: false
};

export function getParseOptions({
    options,
    overrides
}: {
    options?: Partial<ParseOpenAPIOptions>;
    overrides?: Partial<ParseOpenAPIOptions>;
}): ParseOpenAPIOptions {
    return {
        disableExamples: overrides?.disableExamples ?? DEFAULT_PARSE_OPENAPI_SETTINGS.disableExamples,
        discriminatedUnionV2:
            overrides?.discriminatedUnionV2 ??
            options?.discriminatedUnionV2 ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.discriminatedUnionV2,
        useTitlesAsName:
            overrides?.useTitlesAsName ?? options?.useTitlesAsName ?? DEFAULT_PARSE_OPENAPI_SETTINGS.useTitlesAsName,
        audiences: overrides?.audiences ?? options?.audiences ?? DEFAULT_PARSE_OPENAPI_SETTINGS.audiences,
        optionalAdditionalProperties:
            overrides?.optionalAdditionalProperties ??
            options?.optionalAdditionalProperties ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.optionalAdditionalProperties,
        coerceEnumsToLiterals:
            overrides?.coerceEnumsToLiterals ??
            options?.coerceEnumsToLiterals ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.coerceEnumsToLiterals,
        respectReadonlySchemas:
            overrides?.respectReadonlySchemas ??
            options?.respectReadonlySchemas ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.respectReadonlySchemas,
        respectNullableSchemas:
            overrides?.respectNullableSchemas ??
            options?.respectNullableSchemas ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.respectNullableSchemas,
        onlyIncludeReferencedSchemas:
            overrides?.onlyIncludeReferencedSchemas ??
            options?.onlyIncludeReferencedSchemas ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.onlyIncludeReferencedSchemas,
        inlinePathParameters:
            overrides?.inlinePathParameters ??
            options?.inlinePathParameters ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.inlinePathParameters,
        preserveSchemaIds: overrides?.preserveSchemaIds ?? DEFAULT_PARSE_OPENAPI_SETTINGS.preserveSchemaIds,
        shouldUseUndiscriminatedUnionsWithLiterals:
            overrides?.shouldUseUndiscriminatedUnionsWithLiterals ??
            options?.shouldUseUndiscriminatedUnionsWithLiterals ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.shouldUseUndiscriminatedUnionsWithLiterals,
        shouldUseIdiomaticRequestNames:
            overrides?.shouldUseIdiomaticRequestNames ??
            options?.shouldUseIdiomaticRequestNames ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.shouldUseIdiomaticRequestNames,
        objectQueryParameters:
            overrides?.objectQueryParameters ??
            options?.objectQueryParameters ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.objectQueryParameters,
        filter: overrides?.filter ?? options?.filter ?? DEFAULT_PARSE_OPENAPI_SETTINGS.filter,
        asyncApiNaming:
            overrides?.asyncApiNaming ?? options?.asyncApiNaming ?? DEFAULT_PARSE_OPENAPI_SETTINGS.asyncApiNaming,
        useBytesForBinaryResponse:
            overrides?.useBytesForBinaryResponse ??
            options?.useBytesForBinaryResponse ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.useBytesForBinaryResponse,
        exampleGeneration: overrides?.exampleGeneration ?? options?.exampleGeneration ?? undefined,
        defaultFormParameterEncoding:
            overrides?.defaultFormParameterEncoding ?? options?.defaultFormParameterEncoding ?? undefined,
        respectForwardCompatibleEnums:
            overrides?.respectForwardCompatibleEnums ??
            options?.respectForwardCompatibleEnums ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.respectForwardCompatibleEnums,
        additionalPropertiesDefaultsTo:
            overrides?.additionalPropertiesDefaultsTo ??
            options?.additionalPropertiesDefaultsTo ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.additionalPropertiesDefaultsTo,
        typeDatesAsStrings:
            overrides?.typeDatesAsStrings ??
            options?.typeDatesAsStrings ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.typeDatesAsStrings,
        preserveSingleSchemaOneOf:
            overrides?.preserveSingleSchemaOneOf ??
            options?.preserveSingleSchemaOneOf ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.preserveSingleSchemaOneOf
    };
}
