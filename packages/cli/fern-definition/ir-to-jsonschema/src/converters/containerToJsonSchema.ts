import { JSONSchema4 } from "json-schema";

import { assertNever } from "@fern-api/core-utils";
import { ContainerType } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export function convertContainerToJsonSchema({
    container,
    context
}: {
    container: ContainerType;
    context: JsonSchemaConverterContext;
}): JSONSchema4 {
    switch (container.type) {
        case "list":
            return {
                type: "array",
                items: convertTypeReferenceToJsonSchema({ typeReference: container.list, context })
            };
        case "map":
            return {
                type: "object",
                additionalProperties: convertTypeReferenceToJsonSchema({ typeReference: container.valueType, context })
            };
        case "optional":
            return {
                oneOf: [
                    convertTypeReferenceToJsonSchema({ typeReference: container.optional, context }),
                    { type: "null" }
                ]
            };
        case "set":
            return {
                type: "array",
                items: convertTypeReferenceToJsonSchema({ typeReference: container.set, context }),
                uniqueItems: true
            };
        case "literal":
            switch (container.literal.type) {
                case "string":
                    return {
                        const: container.literal.string
                    };
                case "boolean":
                    return {
                        const: container.literal.boolean
                    };
                default:
                    assertNever(container.literal);
            }
        // eslint-disable-next-line no-fallthrough
        default:
            assertNever(container);
    }
}
