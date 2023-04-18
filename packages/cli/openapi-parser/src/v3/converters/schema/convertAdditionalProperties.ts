import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertAdditionalProperties({
    additionalProperties,
    description,
}: {
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
}): Schema {
    if (typeof additionalProperties === "boolean") {
        return Schema.map({
            description,
            key: Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: undefined }),
            value: Schema.unknown(),
        });
    }
    return Schema.map({
        description,
        key: Schema.primitive({ schema: PrimitiveSchemaValue.string(), description: undefined }),
        value: convertSchema(additionalProperties),
    });
}
