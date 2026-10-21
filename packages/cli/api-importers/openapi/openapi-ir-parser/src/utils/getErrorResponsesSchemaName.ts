import { OpenAPIV3 } from "openapi-types";
import { ParseOpenAPIOptions } from "../options.js";

export const DEFAULT_ERROR_RESPONSE_TYPE_NAME = "ProblemDetails";

/**
 * Name under which the `error-responses` body schema is registered in `components.schemas`.
 */
export function getErrorResponsesSchemaName({
    schema,
    name
}: {
    schema: OpenAPIV3.SchemaObject;
    name: string | undefined;
}): string {
    return name ?? schema.title ?? DEFAULT_ERROR_RESPONSE_TYPE_NAME;
}

/**
 * Returns the `components.schemas` key of the API-wide (`api.settings`) `error-responses` body, or
 * undefined when `error-responses` is not shared across specs or cannot be resolved to a single
 * registered schema (file paths are resolved by the workspace loader before parsing; `$ref` bodies
 * point at a per-spec schema and therefore stay in the spec's namespace).
 */
export function getSharedErrorResponsesSchemaName(
    options: Pick<ParseOpenAPIOptions, "errorResponses" | "sharedErrorResponses">
): string | undefined {
    const errorResponses = options.errorResponses;
    if (!options.sharedErrorResponses || errorResponses == null) {
        return undefined;
    }
    const schema = errorResponses.schema;
    if (typeof schema === "string" || "$ref" in schema || containsReference(schema)) {
        return undefined;
    }
    return getErrorResponsesSchemaName({ schema, name: errorResponses.name });
}

/**
 * A shared body that `$ref`s other schemas would resolve them against the root package while they
 * live in each spec's namespace, so such bodies keep the per-spec behaviour.
 */
function containsReference(schema: unknown): boolean {
    if (Array.isArray(schema)) {
        return schema.some(containsReference);
    }
    if (schema != null && typeof schema === "object") {
        return Object.entries(schema).some(([key, value]) => key === "$ref" || containsReference(value));
    }
    return false;
}
