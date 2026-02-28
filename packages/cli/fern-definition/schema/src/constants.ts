export const EXAMPLE_REFERENCE_PREFIX = "$";
export const YAML_SCHEMA_VERSION = 1;

/**
 * Separator used to create unique endpoint keys when endpoints with the same
 * SDK method name have disjoint audiences. The suffix is appended during
 * OpenAPI-to-Fern conversion and stripped during IR generation so the SDK
 * method name remains unchanged.
 */
export const AUDIENCE_SUFFIX_SEPARATOR = "__aud_";
