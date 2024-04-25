import { Values } from "@fern-api/core-utils";

export const OpenAPIExtension = {
    BEARER_FORMAT: "x-bearer-format",
    /* This is an extension that several OpenAPI generators use that we support */
    ENUM_VAR_NAMES: "x-enum-varnames",
    /* This extension is a boolean that several generators use */
    INTERNAL: "x-internal",
    /* This extension is used for specifying examples */
    EXAMPLES: "x-examples",
    /* This extension is used for specifying tags on schemas*/
    TAGS: "x-tags",
    /* https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/ */
    REDOCLY_CODE_SAMPLES_KEBAB: "x-code-samples",
    REDOCLY_CODE_SAMPLES_CAMEL: "x-codeSamples"
} as const;

export type OpenAPIExtension = Values<typeof OpenAPIExtension>;
