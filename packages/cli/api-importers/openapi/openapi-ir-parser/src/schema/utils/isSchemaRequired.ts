import { Schema } from "@fern-api/openapi-ir";

export function isSchemaRequired(schema: Schema): boolean {
    return schema.type !== "optional" && schema.type !== "nullable";
}
