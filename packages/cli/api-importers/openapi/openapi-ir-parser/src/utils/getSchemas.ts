import { NamespaceId, Schema, Schemas } from "@fern-api/openapi-ir";

export function getSchemas(namespace: string | undefined, schemas: Record<string, Schema>): Schemas {
    let rootSchemas: Record<string, Schema> = {};
    let namespacedSchemas: Record<NamespaceId, Record<string, Schema>> = {};
    if (namespace == null) {
        rootSchemas = schemas;
    } else {
        namespacedSchemas = {
            [namespace]: schemas
        };
    }

    return {
        rootSchemas,
        namespacedSchemas
    };
}
