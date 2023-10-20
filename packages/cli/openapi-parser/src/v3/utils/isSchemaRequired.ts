import { Schema } from "@fern-fern/openapi-ir-model/finalIr";

export function isSchemaRequired(schema: Schema): boolean {
    return schema.type !== "optional" && schema.type !== "nullable";
}
