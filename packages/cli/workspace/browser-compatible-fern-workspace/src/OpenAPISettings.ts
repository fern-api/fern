export interface OpenAPISettings {
    /*
     * Whether or not to parse unique errors for OpenAPI operation. This is
     * an option that is typically enabled for docs generation.
     */
    enableUniqueErrorsPerEndpoint?: boolean;
    /*
     * Whether or not to parse discriminated unions as undiscriminated unions with literals.
     * Typically enabled for duck typed languages like Python / TypeScript.
     */
    enableDiscriminatedUnionV2?: boolean;
    /*
     * Whether or not to extract frequently used headers out of the endpoints into a
     * global header. This is primarily used for generating SDKs, but disabled for docs
     * as it allows the documentation to more closely mirror the OpenAPI spec.
     */
    detectGlobalHeaders?: boolean;
    /*
     * Whether or not to let additional property values in OpenAPI come through as
     * optional.
     */
    optionalAdditionalProperties?: boolean;
    /*
     * Whether or not to cooerce enums to undiscriminated union literals.
     */
    cooerceEnumsToLiterals?: boolean;
    /*
     * Whether or not to parse object query parameters.
     */
    objectQueryParameters?: boolean;
    /*
     * Whether or not to preserve original schema ids.
     */
    preserveSchemaIds?: boolean;
}
