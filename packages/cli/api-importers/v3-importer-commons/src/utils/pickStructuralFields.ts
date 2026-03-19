import { OpenAPIV3_1 } from "openapi-types";

const STRUCTURAL_KEYS = [
    "type",
    "format",
    "items",
    "properties",
    "additionalProperties",
    "allOf",
    "oneOf",
    "anyOf",
    "enum",
    "const",
    "nullable",
    "not",
    "required"
];

/**
 * Picks only structural/type-related fields from an OpenAPI schema object.
 * This is used when merging base property schemas into allOf overrides to
 * carry forward type information (e.g. type: array) without propagating
 * metadata fields (description, readOnly, title, etc.) from the base.
 */
export function pickStructuralFields(schema: OpenAPIV3_1.SchemaObject): Record<string, unknown> {
    const src = schema as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of STRUCTURAL_KEYS) {
        if (src[key] != null) {
            result[key] = src[key];
        }
    }
    return result;
}
