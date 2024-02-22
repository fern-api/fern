import { OpenAPIV3 } from "openapi-types";

export function getExampleAsNumber(schema: OpenAPIV3.SchemaObject): number | undefined {
    if (schema.example != null && typeof schema.example === "number") {
        return schema.example;
    }
    return undefined;
}

export function getExampleAsBoolean(schema: OpenAPIV3.SchemaObject): boolean | undefined {
    if (schema.example != null && typeof schema.example === "boolean") {
        return schema.example;
    }
    return undefined;
}

export function getExamplesString(schema: OpenAPIV3.SchemaObject): string | undefined {
    if (schema.example != null && typeof schema.example === "string") {
        return schema.example;
    }
    return undefined;
}
