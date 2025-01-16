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
    /* Whether or not to cooerce enums as literals */
    cooerceEnumsToLiterals: boolean;
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

    /* The filter to apply to the OpenAPI document. */
    filter: generatorsYml.OpenApiFilterSchema | undefined;

    // For now, we include an AsyncAPI-specific option here, but this is better
    // handled with a discriminated union.
    asyncApiNaming: "v1" | "v2";

    exampleGeneration: generatorsYml.OpenApiExampleGenerationSchema | undefined;
}

export const DEFAULT_PARSE_OPENAPI_SETTINGS: ParseOpenAPIOptions = {
    disableExamples: false,
    discriminatedUnionV2: false,
    useTitlesAsName: true,
    audiences: undefined,
    optionalAdditionalProperties: true,
    cooerceEnumsToLiterals: true,
    respectReadonlySchemas: false,
    respectNullableSchemas: false,
    onlyIncludeReferencedSchemas: false,
    inlinePathParameters: false,
    preserveSchemaIds: false,
    objectQueryParameters: false,
    shouldUseUndiscriminatedUnionsWithLiterals: false,
    filter: undefined,
    asyncApiNaming: "v1",
    exampleGeneration: undefined
};

export function getParseOptions({
    options,
    overrides
}: {
    options?: ParseOpenAPIOptions;
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
        cooerceEnumsToLiterals:
            overrides?.cooerceEnumsToLiterals ??
            options?.cooerceEnumsToLiterals ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.cooerceEnumsToLiterals,
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
        objectQueryParameters:
            overrides?.objectQueryParameters ??
            options?.objectQueryParameters ??
            DEFAULT_PARSE_OPENAPI_SETTINGS.objectQueryParameters,
        filter: overrides?.filter ?? options?.filter ?? DEFAULT_PARSE_OPENAPI_SETTINGS.filter,
        asyncApiNaming:
            overrides?.asyncApiNaming ?? options?.asyncApiNaming ?? DEFAULT_PARSE_OPENAPI_SETTINGS.asyncApiNaming,
        exampleGeneration: overrides?.exampleGeneration ?? options?.exampleGeneration ?? undefined
    };
}
