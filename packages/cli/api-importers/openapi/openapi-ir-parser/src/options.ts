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
    /* Whether or not to inline allOf schemas. */
    inlineAllOfSchemas: boolean;
    /* Whether to resolve aliases. If provided, all aliases will be resolved except for the ones in the except array. */
    resolveAliases: generatorsYml.ResolveAliases;

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

    /**
     * If true, automatically group multiple APIs with matching environments into unified environments with multiple base URLs.
     * This is useful for organizations with multiple APIs deployed to the same set of environments.
     */
    groupMultiApiEnvironments: boolean;

    /**
     * If true, group servers by host into unified environments regardless of protocol.
     * This allows APIs with multiple protocols (REST, WebSocket, etc.) to share environment configuration.
     * When enabled, environment URL IDs are generated with collision resolution.
     */
    groupEnvironmentsByHost: boolean;

    wrapReferencesToNullableInOptional: boolean;
    coerceOptionalSchemasToNullable: boolean;

    /**
     * If `always`, remove discriminant properties from schemas in the IR, unless the schema is also used outside of a discriminated union.
     * If `never`, discriminant properties are preserved in the schemas.
     *
     * Defaults to `always`.
     */
    removeDiscriminantsFromSchemas: generatorsYml.RemoveDiscriminantsFromSchemas;
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
    preserveSingleSchemaOneOf: false,
    inlineAllOfSchemas: false,
    resolveAliases: false,
    groupMultiApiEnvironments: false,
    groupEnvironmentsByHost: false,
    wrapReferencesToNullableInOptional: true,
    coerceOptionalSchemasToNullable: true,
    removeDiscriminantsFromSchemas: generatorsYml.RemoveDiscriminantsFromSchemas.Always
};

function mergeOptions<T extends object>(params: {
    defaults: T;
    options?: Partial<T>;
    overrides?: Partial<T>;
    overrideOnly?: Set<keyof T>;
    undefinedIfAbsent?: Set<keyof T>;
}): T {
    const { defaults, options, overrides, overrideOnly = new Set(), undefinedIfAbsent = new Set() } = params;
    const result = {} as T;

    for (const key of Object.keys(defaults) as (keyof T)[]) {
        if (overrideOnly.has(key)) {
            result[key] = (overrides?.[key] !== undefined ? overrides[key] : defaults[key]) as T[typeof key];
        } else if (undefinedIfAbsent.has(key)) {
            result[key] = (
                overrides?.[key] !== undefined
                    ? overrides[key]
                    : options?.[key] !== undefined
                      ? options[key]
                      : undefined
            ) as T[typeof key];
        } else {
            result[key] = (overrides?.[key] ?? options?.[key] ?? defaults[key]) as T[typeof key];
        }
    }

    return result;
}

export function getParseOptions({
    options,
    overrides
}: {
    options?: Partial<ParseOpenAPIOptions>;
    overrides?: Partial<ParseOpenAPIOptions>;
}): ParseOpenAPIOptions {
    const overrideOnly = new Set<keyof ParseOpenAPIOptions>(["disableExamples", "preserveSchemaIds"]);
    const undefinedIfAbsent = new Set<keyof ParseOpenAPIOptions>(["exampleGeneration", "defaultFormParameterEncoding"]);

    return mergeOptions<ParseOpenAPIOptions>({
        defaults: DEFAULT_PARSE_OPENAPI_SETTINGS,
        options,
        overrides,
        overrideOnly,
        undefinedIfAbsent
    });
}
