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
    /* TODO: pick a better name for this flag, and maybe move it to AsyncAPI-only config */
    useImprovedMessageNaming: boolean;
}

export const DEFAULT_PARSE_OPENAPI_SETTINGS: ParseOpenAPIOptions = {
    disableExamples: false,
    discriminatedUnionV2: false,
    useTitlesAsName: true,
    useImprovedMessageNaming: false,
    audiences: undefined
};
