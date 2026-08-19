import { assertNever } from "@fern-api/core-utils";
import { NamespaceId, Schema, Schemas } from "@fern-api/openapi-ir";

export function getSchemas(namespace: string | undefined, schemas: Record<string, Schema>): Schemas {
    const rootSchemas: Record<string, Schema> = {};
    if (namespace != null) {
        return {
            rootSchemas,
            namespacedSchemas: {
                [namespace]: schemas
            }
        };
    }
    const namespacedSchemas: Record<NamespaceId, Record<string, Schema>> = {};
    for (const [id, schema] of Object.entries(schemas)) {
        switch (schema.type) {
            case "object":
            case "array":
            case "map":
            case "optional":
            case "enum":
            case "literal":
            case "reference":
            case "nullable":
            case "primitive": {
                if (schema.namespace == null) {
                    rootSchemas[id] = schema;
                    continue;
                }
                const namespace = schema.namespace;
                namespacedSchemas[namespace] ??= {};
                namespacedSchemas[namespace][id] = schema;
                continue;
            }
            case "oneOf":
            case "unknown":
                rootSchemas[id] = schema;
                continue;
            default:
                assertNever(schema);
        }
    }
    return {
        rootSchemas,
        namespacedSchemas
    };
}
