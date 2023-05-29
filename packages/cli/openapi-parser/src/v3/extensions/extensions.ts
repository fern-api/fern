import { Values } from "@fern-api/core-utils";

export const OpenAPIExtension = {
    BEARER_FORMAT: "x-bearer-format",
    /* This is an extension that several OpenAPI generators use that we support */
    ENUM_VAR_NAMES: "x-enum-varnames",
    /* This extension is a boolean that several generators use */
    INTERNAL: "x-internal",
} as const;

export type OpenAPIExtension = Values<typeof OpenAPIExtension>;
