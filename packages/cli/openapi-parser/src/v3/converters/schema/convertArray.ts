import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    item,
    description,
}: {
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
}): Schema {
    const itemSchema = item == null ? Schema.unknown() : convertSchema(item);
    return Schema.array({
        value: itemSchema,
        description,
    });
}
