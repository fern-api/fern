import { OpenAPIV3 } from "openapi-types";

export function getDefaultAsNumber(schema: OpenAPIV3.SchemaObject): number | undefined {
    if (schema.default != null && typeof schema.default === "number") {
        return schema.default;
    }
    return undefined;
}

export function getDefaultAsString(schema: OpenAPIV3.SchemaObject): string | undefined {
    if (schema.default != null && typeof schema.default === "string") {
        return schema.default;
    }
    return undefined;
}
