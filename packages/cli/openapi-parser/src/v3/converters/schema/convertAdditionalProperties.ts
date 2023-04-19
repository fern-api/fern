import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { convertSchema } from "../convertSchemas";

export function convertAdditionalProperties({
    additionalProperties,
    description,
}: {
    additionalProperties: boolean | OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    description: string | undefined;
}): Schema {
    if (typeof additionalProperties === "boolean" || isAdditionalPropertiesEmptyDictionary(additionalProperties)) {
        return Schema.map({
            description,
            key: PrimitiveSchemaValue.string(),
            value: Schema.unknown(),
        });
    }
    return Schema.map({
        description,
        key: PrimitiveSchemaValue.string(),
        value: convertSchema(additionalProperties),
    });
}

function isAdditionalPropertiesEmptyDictionary(
    additionalProperties: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
) {
    return !isReferenceObject(additionalProperties) && Object.keys(additionalProperties).length === 0;
}
