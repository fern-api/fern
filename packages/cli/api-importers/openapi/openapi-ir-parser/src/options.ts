export interface ParseOpenAPIOptions {
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
    /* Whether or not to only include endpoint referenced schemas */
    onlyIncludeReferencedSchemas: boolean;
}

export const DEFAULT_PARSE_OPENAPI_SETTINGS: ParseOpenAPIOptions = {
    disableExamples: false,
    discriminatedUnionV2: false,
    useTitlesAsName: true,
    audiences: undefined,
    optionalAdditionalProperties: true,
    cooerceEnumsToLiterals: true,
    respectReadonlySchemas: false,
    onlyIncludeReferencedSchemas: false
};
