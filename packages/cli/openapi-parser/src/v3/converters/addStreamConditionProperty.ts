import { assertNever } from "@fern-api/core-utils";
import { LiteralSchemaValue } from "@fern-fern/openapi-ir-model/finalIr";
import { ObjectSchemaWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { StreamingConditionEndpoint } from "../extensions/getStreaming";

export function addStreamConditionProperty(
    schema: SchemaWithExample,
    streamCondition: StreamingConditionEndpoint,
    isStreaming: boolean
): SchemaWithExample {
    switch (schema.type) {
        case "object":
            return addStreamConditionPropertyForObject(schema, streamCondition, isStreaming);
        case "array":
            schema.value = addStreamConditionProperty(schema.value, streamCondition, isStreaming);
            return schema;
        case "optional":
            schema.value = addStreamConditionProperty(schema.value, streamCondition, isStreaming);
            return schema;
        case "nullable":
            schema.value = addStreamConditionProperty(schema.value, streamCondition, isStreaming);
            return schema;
        case "enum":
        case "primitive":
        case "map":
        case "reference": // TODO: Should we throw an error here? We can't add a stream condition property to a request that can be referened in other places.
        case "literal":
        case "oneOf":
        case "unknown":
            return schema;
        default:
            assertNever(schema);
    }
}

function addStreamConditionPropertyForObject(
    objectSchema: ObjectSchemaWithExample,
    streamCondition: StreamingConditionEndpoint,
    isStreaming: boolean
): SchemaWithExample {
    // TODO: If a property was found with the same name that isn't a boolean,
    // should we return an error or skip silently?
    for (const property of objectSchema.properties) {
        if (
            property.key === streamCondition.streamConditionProperty &&
            property.schema.type === "primitive" &&
            property.schema.schema.type === "boolean"
        ) {
            // TODO: This won't work as-is; we need to mutate
            // the objectSchema.properties in-place or return
            // a new set of properties.
            property.schema = SchemaWithExample.literal({
                description: property.schema.description,
                value: LiteralSchemaValue.boolean(isStreaming),
            });
            return {
                type: "object",
                ...objectSchema,
            };
        }
    }
    return {
        type: "object",
        ...objectSchema,
        properties: objectSchema.properties.concat([
            {
                key: streamCondition.streamConditionProperty,
                schema: SchemaWithExample.literal({
                    description: undefined,
                    value: LiteralSchemaValue.boolean(isStreaming),
                }),
                conflict: {},
                generatedName: streamCondition.streamConditionProperty,
            },
        ]),
    };
}
