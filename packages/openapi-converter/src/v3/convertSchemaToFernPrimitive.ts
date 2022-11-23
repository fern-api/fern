import { OpenAPIV3 } from "openapi-types";

export function convertSchemaToFernPrimitiveType(schemaObject: OpenAPIV3.SchemaObject): string | undefined {
    if (schemaObject.type == null) {
        return undefined;
    } else if (schemaObject.type === "boolean") {
        return "boolean";
    } else if (schemaObject.type === "number") {
        return "double";
    } else if (schemaObject.type === "integer") {
        return "integer";
    } else if (schemaObject.type === "string") {
        return "string";
    }
    return undefined;
}
